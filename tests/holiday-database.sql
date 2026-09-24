-- Run after the migration in the SQL editor. All test writes are temporary and rolled back.
begin;
create temporary table holiday_rpc_test (like public.wrc_holiday_events including all);
do $$
declare definition text; d text; p text; slot integer; r record; total integer;
begin
  if has_table_privilege('anon','public.wrc_holiday_events','INSERT') or has_table_privilege('anon','public.wrc_holiday_events','UPDATE') or has_table_privilege('anon','public.wrc_holiday_events','DELETE') then raise exception 'Direct writes allowed'; end if;
  if not (select relrowsecurity from pg_class where oid='public.wrc_holiday_events'::regclass) then raise exception 'RLS missing'; end if;
  foreach d in array array['2026-04-05','2026-10-31','2026-12-06','2026-12-24','2026-12-31'] loop
    definition:=pg_get_functiondef('public.claim_wrc_holiday(text,text,integer,integer)'::regprocedure);
    definition:=replace(definition,'public.claim_wrc_holiday','pg_temp.holiday_test_claim');
    definition:=replace(definition,'public.wrc_holiday_events','pg_temp.holiday_rpc_test');
    definition:=replace(definition,'(current_timestamp at time zone ''Europe/Berlin'')::date',quote_literal(d)||'::date');
    execute definition;
    foreach p in array array['Thorsten','Fabi','Marian','Basti'] loop
      slot:=case p when 'Thorsten' then 2 when 'Fabi' then 3 when 'Marian' then 0 else 1 end;
      select * into r from pg_temp.holiday_test_claim(public.wrc_holiday_on(d::date),p,case when d='2026-10-31' then 1 else null end,case when d='2026-04-05' then slot else null end);
      if r.points<>(case when d in ('2026-04-05','2026-12-24') then 5 else 0 end) then raise exception 'Wrong reward'; end if;
      perform pg_temp.holiday_test_claim(public.wrc_holiday_on(d::date),p,case when d='2026-10-31' then 0 else null end,case when d='2026-04-05' then slot else null end);
      if d='2026-10-31' and (select result from holiday_rpc_test where event_type='halloween' and player=p)<>r.result then raise exception 'Result changed'; end if;
      if d='2026-04-05' then
        begin perform pg_temp.holiday_test_claim('easter',p,null,(slot+1)%4); raise exception 'Wrong egg accepted';
        exception when raise_exception then if sqlerrm<>'Nicht dein Ei' then raise; end if; end;
      end if;
    end loop;
  end loop;
  select sum(points) into total from holiday_rpc_test;
  if total<>40 or (select count(*) from holiday_rpc_test)<>20 then raise exception 'Unexpected ledger totals'; end if;
end $$;
select 'PASS: real RPC, isolated ledger, five events, four players, duplicate prevention, correct eggs, stable outcomes, exact points, RLS' as verification;
rollback;
