-- Applied via Supabase migration retire_legacy_cir on 2026-10-01.
-- Existing schema/data was audited and exported before this operation.
-- No CASCADE: unexpected external dependencies must stop the migration.
set local lock_timeout = '5s';
set local statement_timeout = '30s';
do $$
begin
  if to_regclass('public.competitor_surveys') is not null then
    lock table public.competitor_surveys in access exclusive mode;
    if exists (select 1 from public.competitor_surveys) then
      raise exception 'Legacy CIR now contains data; export and review before deletion';
    end if;
    drop table public.competitor_surveys restrict;
  end if;
end $$;
