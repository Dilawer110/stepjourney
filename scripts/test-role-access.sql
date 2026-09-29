-- Run through SQL tooling with a privileged connection. Every test write rolls back.
begin;
select set_config('test.accounts',(
 select jsonb_agg(jsonb_build_object('id',a.user_id,'login',a.login_id,'role',a.role,
 'bookers',case when a.role='super_admin' then (select count(*) from public.app_users)
 when a.role='worker' then 1 when a.role='tse' then (select count(*) from public.app_users b where b.distributor_code=a.distributor_code)
 else (select count(*) from public.app_users b join public.distributors d using(distributor_code) where d.zone=a.zone) end,
 'foreign_outlet',(select o.id from public.outlets o where not exists(select 1 from public.outlet_visit_schedule s join public.app_users b on b.order_booker_code=s.order_booker_code join public.distributors d on d.distributor_code=b.distributor_code where s.store_code=o.code and (a.role='super_admin' or (a.role='worker' and s.order_booker_code=a.order_booker_code) or (a.role='tse' and b.distributor_code=a.distributor_code) or (a.role='asm' and d.zone=a.zone))) limit 1)))::text from public.user_access a),true);
set local role authenticated;
do $$ declare a jsonb; n int; begin
 for a in select * from jsonb_array_elements(current_setting('test.accounts')::jsonb) loop
 perform set_config('request.jwt.claim.sub',a->>'id',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a->>'id','role','authenticated','user_metadata',jsonb_build_object('role','super_admin'))::text,true);
 if not public.needs_password_change() then raise exception 'Missing first-login restriction: %',a->>'login'; end if;
 select count(*) into n from public.outlets;
 if n<>0 then raise exception 'Temporary password exposed outlets: %',a->>'login'; end if;
 end loop;
end $$;
reset role;
-- Simulate a completed password change inside this rollback-only transaction.
delete from app_private.initial_passwords;
set local role authenticated;
do $$ declare a jsonb; n int; target uuid; blocked uuid; inserted uuid; begin
 for a in select * from jsonb_array_elements(current_setting('test.accounts')::jsonb) loop
 perform set_config('request.jwt.claim.sub',a->>'id',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a->>'id','role','authenticated','user_metadata',jsonb_build_object('role','super_admin'))::text,true);
 select count(*) into n from public.app_users;
 if n<>(a->>'bookers')::int then raise exception 'Wrong booker scope for %, expected %, actual %',a->>'login',a->>'bookers',n; end if;
 select count(*) into n from public.user_access;
 if n<>1 then raise exception 'Account directory exposed: %',a->>'login'; end if;
 begin
 update public.user_access set role='super_admin' where user_id=(a->>'id')::uuid;
 raise exception 'Self-promotion accepted';
 exception when insufficient_privilege then null; end;
 select id into target from public.outlets limit 1;
 if target is null then raise exception 'No permitted outlets: %',a->>'login'; end if;
 insert into public.outlet_visits(outlet_id,order_booker_id,visit_date,status) values(target,(a->>'id')::uuid,'2099-12-31','returned') returning id into inserted;
 blocked := (a->>'foreign_outlet')::uuid;
 if a->>'role'<>'super_admin' and blocked is not null then
 select count(*) into n from public.outlets where id=blocked;
 if n<>0 then raise exception 'Cross-scope read allowed'; end if;
 begin
 insert into public.outlet_visits(outlet_id,order_booker_id,visit_date,status) values(blocked,(a->>'id')::uuid,'2099-12-31','visited');
 raise exception 'Cross-scope insert accepted';
 exception when insufficient_privilege then null; end;
 begin
 update public.outlet_visits set outlet_id=blocked where id=inserted;
 raise exception 'Cross-scope update accepted';
 exception when insufficient_privilege then null; end;
 end if;
 begin
 update public.outlet_visits set order_booker_id='b62f8a34-3c9e-4193-86bd-2e5f9fd68c5e' where id=inserted;
 raise exception 'Ownership reassignment accepted';
 exception when insufficient_privilege then null; end;
 end loop;
 -- Old shared test account is not an authorized staff member.
 perform set_config('request.jwt.claim.sub','b62f8a34-3c9e-4193-86bd-2e5f9fd68c5e',true);
 perform set_config('request.jwt.claims','{"sub":"b62f8a34-3c9e-4193-86bd-2e5f9fd68c5e","role":"authenticated"}',true);
 select count(*) into n from public.outlets;
 if n<>0 then raise exception 'Shared test account still has business access'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform count(*) from public.outlets; raise exception 'Anonymous outlet access accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: all 55 accounts, temporary-password gate, role scopes, metadata spoofing, escalation, cross-scope writes, ownership changes, test account, anonymous access' as result;
rollback;

