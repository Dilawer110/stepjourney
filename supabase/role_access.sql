-- StepJourney access model. Apply only after accounts are provisioned and verified.
-- user_access is authoritative; editable Auth user metadata grants no permissions.
begin;
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;
create table if not exists public.user_access (
 user_id uuid primary key references auth.users(id),
 login_id text not null unique check (login_id = lower(login_id)),
 display_name text not null,
 role text not null check (role in ('super_admin','asm','tse','worker')),
 zone text,
 distributor_code text references public.distributors(distributor_code),
 order_booker_code text references public.app_users(order_booker_code),
 active boolean not null default true,
 access_version integer not null default 1,
 check (
  (role='super_admin' and zone is null and distributor_code is null and order_booker_code is null) or
  (role='asm' and zone is not null and distributor_code is null and order_booker_code is null) or
  (role='tse' and zone is null and distributor_code is not null and order_booker_code is null) or
  (role='worker' and zone is null and distributor_code is null and order_booker_code is not null)
 )
);
create unique index if not exists one_super_admin on public.user_access(role) where role='super_admin';
alter table public.user_access enable row level security;
revoke all on public.user_access from public,anon,authenticated;
grant select on public.user_access to authenticated;
grant all on public.user_access to service_role;
create policy own_access on public.user_access for select to authenticated using (user_id=(select auth.uid()));

create table if not exists app_private.initial_passwords (
 user_id uuid primary key references auth.users(id), password_hash text not null
);
alter table app_private.initial_passwords enable row level security;
revoke all on app_private.initial_passwords from public,anon,authenticated;
-- No raw passwords are persisted in the application database.
create or replace function app_private.password_change_required() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from app_private.initial_passwords p join auth.users u on u.id=p.user_id where p.user_id=auth.uid() and p.password_hash=u.encrypted_password);
$$;
create or replace function public.needs_password_change() returns boolean language sql stable security invoker set search_path='' as $$
 select app_private.password_change_required();
$$;
revoke all on function public.needs_password_change() from public,anon;
grant execute on function public.needs_password_change() to authenticated;

-- Definer lookups are restricted to private schema and always bind to auth.uid().
create or replace function app_private.is_active() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access a where a.user_id=auth.uid() and a.active and not (select app_private.password_change_required()));
$$;
create or replace function app_private.is_super_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.user_access a where a.user_id=auth.uid() and a.active and not (select app_private.password_change_required()) and a.role='super_admin');
$$;
create or replace function app_private.allowed_bookers() returns setof text language sql stable security definer set search_path='' as $$
 select b.order_booker_code from public.user_access a
 join public.app_users b on true join public.distributors d on d.distributor_code=b.distributor_code
 where auth.uid() is not null and a.user_id=auth.uid() and a.active and not (select app_private.password_change_required()) and (
 a.role='super_admin' or (a.role='asm' and a.zone=d.zone) or
 (a.role='tse' and a.distributor_code=d.distributor_code) or
 (a.role='worker' and a.order_booker_code=b.order_booker_code));
$$;
create or replace function app_private.allowed_distributors() returns setof text language sql stable security definer set search_path='' as $$
 select distinct b.distributor_code from public.app_users b where auth.uid() is not null and b.order_booker_code in (select app_private.allowed_bookers());
$$;
create or replace function app_private.allowed_outlets() returns setof uuid language sql stable security definer set search_path='' as $$
 select o.id from public.outlets o where auth.uid() is not null and (
 (select app_private.is_super_admin()) or exists(select 1 from public.outlet_visit_schedule s where s.store_code=o.code and s.order_booker_code in (select app_private.allowed_bookers())));
$$;
revoke all on all functions in schema app_private from public,anon;
grant execute on all functions in schema app_private to authenticated;
create index if not exists schedule_booker_store_idx on public.outlet_visit_schedule(order_booker_code,store_code);
create index if not exists app_users_distributor_idx on public.app_users(distributor_code);

-- Existing permissive policies must be removed: policies are combined with OR.
do $$ declare p record; t text; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in (
 'app_users','channels','competitor_surveys','discount_slabs','distributors','orders','outlet_assets','outlet_visit_schedule','outlet_visits','outlets','pjp_routes','products','profiles','routes','sales_returns') loop
 execute format('drop policy %I on public.%I',p.policyname,p.tablename);
 end loop;
 foreach t in array array['app_users','channels','competitor_surveys','discount_slabs','distributors','orders','outlet_assets','outlet_visit_schedule','outlet_visits','outlets','pjp_routes','products','profiles','routes','sales_returns'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy scoped_bookers on public.app_users for select to authenticated using(order_booker_code in (select app_private.allowed_bookers()));
create policy scoped_distributors on public.distributors for select to authenticated using(distributor_code in (select app_private.allowed_distributors()));
create policy scoped_pjp on public.pjp_routes for select to authenticated using(order_booker_code in (select app_private.allowed_bookers()));
create policy scoped_schedule on public.outlet_visit_schedule for select to authenticated using(order_booker_code in (select app_private.allowed_bookers()));
create policy scoped_outlets on public.outlets for select to authenticated using(id in (select app_private.allowed_outlets()));
create policy own_profile on public.profiles for select to authenticated using(id=(select auth.uid()) or (select app_private.is_super_admin()));
create policy own_routes on public.routes for select to authenticated using((order_booker_id=(select auth.uid()) and (select app_private.is_active())) or (select app_private.is_super_admin()));

do $$ declare t text; owner_col text; begin
 foreach t in array array['channels','discount_slabs','products'] loop
 execute format('create policy shared_catalog on public.%I for select to authenticated using ((select app_private.is_active()))',t);
 end loop;
 foreach t in array array['orders','outlet_visits','sales_returns','competitor_surveys'] loop
 owner_col := case when t='competitor_surveys' then 'user_id' else 'order_booker_id' end;
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 execute format('create policy scoped_read on public.%I for select to authenticated using (outlet_id in (select app_private.allowed_outlets()) and ((select role from public.user_access where user_id=(select auth.uid())) <> ''worker'' or %I=(select auth.uid())))',t,owner_col);
 execute format('create policy own_insert on public.%I for insert to authenticated with check (%I=(select auth.uid()) and outlet_id in (select app_private.allowed_outlets()))',t,owner_col);
 execute format('create policy own_update on public.%I for update to authenticated using (%I=(select auth.uid()) and outlet_id in (select app_private.allowed_outlets())) with check (%I=(select auth.uid()) and outlet_id in (select app_private.allowed_outlets()))',t,owner_col,owner_col);
 execute format('create policy own_delete on public.%I for delete to authenticated using (%I=(select auth.uid()) and outlet_id in (select app_private.allowed_outlets()))',t,owner_col);
 end loop;
end $$;
grant insert,update on public.outlet_assets to authenticated;
create policy scoped_assets on public.outlet_assets for select to authenticated using(outlet_id in (select app_private.allowed_outlets()));
create policy scoped_asset_insert on public.outlet_assets for insert to authenticated with check(outlet_id in (select app_private.allowed_outlets()));
create policy scoped_asset_update on public.outlet_assets for update to authenticated using(outlet_id in (select app_private.allowed_outlets())) with check(outlet_id in (select app_private.allowed_outlets()));
-- Each signed-in person records their own visit even when multiple roles visit a shop.
alter table public.outlet_visits drop constraint outlet_visits_outlet_id_visit_date_key;
alter table public.outlet_visits add constraint outlet_visits_outlet_user_date_key unique(outlet_id,order_booker_id,visit_date);
alter table public.outlet_visits drop constraint outlet_visits_status_check;
alter table public.outlet_visits add constraint outlet_visits_status_check check(status in ('visited','billed','returned','revisit_req','not_found','closed','shifted'));
commit;

