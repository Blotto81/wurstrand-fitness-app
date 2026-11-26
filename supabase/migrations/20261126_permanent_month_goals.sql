create table if not exists public.wrc_month_goals (month date primary key, target integer not null check(target>0));
alter table public.wrc_month_goals enable row level security;
revoke all on public.wrc_month_goals from anon,authenticated;
insert into public.wrc_month_goals values ('2026-02-01',650),('2026-03-01',1600),('2026-04-01',1600),('2026-05-01',1700),('2026-06-01',1725),('2026-07-01',1750),('2026-08-01',1775),('2026-09-01',1800),('2026-10-01',1825),('2026-11-01',1850),('2026-12-01',1875) on conflict do nothing;
create or replace function public.wrc_month_goals_current() returns jsonb language plpgsql security definer set search_path='' as $$
declare m date; current_m date:=date_trunc('month',now() at time zone 'Europe/Berlin')::date; rate numeric; target_points integer;
begin
perform pg_advisory_xact_lock(hashtext('wrc-month-goals'));
for m in select generate_series('2027-01-01'::date,current_m,interval '1 month')::date loop
if not exists(select 1 from public.wrc_month_goals g where g.month=m) then
with cleaned as (select date,person,max(coalesce(steps,0)) steps,max(coalesce(bike,0))::numeric bike,max(coalesce(squats,0)) squats,max(coalesce(pushups,0)) pushups,bool_or(coalesce(exercise,false)) exercise from public.entries where date >= (m-interval '3 months')::date::text and date<m::text and person in ('Thorsten','Basti','Fabi','Marian') group by date,person),
scored as (select round(steps::numeric/1000,1)+round(bike,1)+round(squats::numeric/5,1)+round(pushups::numeric/3,1)+case when exercise then 5 else 0 end+case when (steps>=3000)::int+(bike>=3)::int+(round(squats::numeric/5,1)>=3 or round(pushups::numeric/3,1)>=3)::int+exercise::int>=3 then 4 else 0 end points from cleaned)
select coalesce(sum(points),0)/(m-(m-interval '3 months')::date) into rate from scored;
target_points:=greatest(25,round(rate*((m+interval '1 month')::date-m)*1.03/25)::int*25);
if rate=0 then select g.target into target_points from public.wrc_month_goals g where g.month<m order by g.month desc limit 1; end if;
insert into public.wrc_month_goals values(m,coalesce(target_points,1875)) on conflict do nothing;
end if;
end loop;
return (select jsonb_object_agg(to_char(g.month,'YYYY-MM'),g.target order by g.month) from public.wrc_month_goals g);
end $$;
revoke all on function public.wrc_month_goals_current() from public;
grant execute on function public.wrc_month_goals_current() to anon,authenticated;