-- Restore the explicit outlet/booker/day mapping from supabase_master_data.sql.
-- This is shared planning data, readable by signed-in users like the existing
-- master data. Filtering is not a substitute for tenant authorization.
create table public.outlet_visit_schedule (
  store_code text not null references public.outlets(code),
  pjp_code text not null,
  day text not null check (day in ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  order_booker_code text not null references public.app_users(order_booker_code),
  primary key (store_code,pjp_code,day,order_booker_code)
);
create index outlet_visit_schedule_filter_idx
  on public.outlet_visit_schedule(day,order_booker_code,pjp_code,store_code);
alter table public.outlet_visit_schedule enable row level security;
revoke all on public.outlet_visit_schedule from anon, authenticated;
grant select on public.outlet_visit_schedule to authenticated;
create policy "Signed in users read planning assignments"
  on public.outlet_visit_schedule for select to authenticated using (true);

