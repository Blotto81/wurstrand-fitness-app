-- Apply in Supabase SQL editor BEFORE deploying the matching frontend.
create table if not exists public.wrc_team_milestones (
  month text primary key,
  type text not null check (type in ('steps','bike','squats','pushups')),
  target numeric not null check (target > 0),
  created_at timestamptz not null default now(),
  reached_at timestamptz
);
alter table public.wrc_team_milestones enable row level security;
revoke all on public.wrc_team_milestones from anon, authenticated;
-- Client totals are supplied by the existing dashboard; this is not a trusted
-- server-side verification of activity entries. Restrict execution to app roles.
create or replace function public.wrc_team_milestone(p_month text,p_totals jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  g public.wrc_team_milestones%rowtype;
  candidate record;
  days_left integer;
  elapsed integer;
  today date := (now() at time zone 'Europe/Berlin')::date;
begin
  if p_month is distinct from to_char(today,'YYYY-MM') then return null; end if;
  perform pg_advisory_xact_lock(hashtext('wrc-team-milestone:'||p_month));
  select * into g from public.wrc_team_milestones where month=p_month;
  if found then
    if coalesce((p_totals->>g.type)::numeric,0) < g.target then
      if g.reached_at is not null then
        update public.wrc_team_milestones set reached_at=null where month=p_month returning * into g;
      end if;
      return to_jsonb(g);
    end if;
    if g.reached_at is null then
      update public.wrc_team_milestones set reached_at=now() where month=p_month returning * into g;
      return to_jsonb(g);
    end if;
    if now() < g.reached_at + interval '24 hours' then return to_jsonb(g); end if;
  end if;
  elapsed := extract(day from today);
  days_left := greatest(1,extract(day from (date_trunc('month',today)+interval '1 month - 1 day'))::integer-elapsed+1);
  select c.type,c.target into candidate from (
    select distinct on (v.type) v.type,v.target,coalesce((p_totals->>v.type)::numeric,0) as current
    from (values ('steps',10000),('steps',25000),('steps',50000),('steps',100000),('steps',250000),('steps',500000),('steps',1000000),('steps',2500000),('bike',25),('bike',50),('bike',100),('bike',250),('bike',500),('bike',1000),('bike',2500),('squats',100),('squats',250),('squats',500),('squats',1000),('squats',2500),('squats',5000),('squats',10000),('pushups',50),('pushups',100),('pushups',250),('pushups',500),('pushups',1000),('pushups',2500),('pushups',5000)) v(type,target)
    where v.target > coalesce((p_totals->>v.type)::numeric,0) and coalesce((p_totals->>v.type)::numeric,0)>0
    order by v.type,v.target
  ) c
  order by ((c.target-c.current)/greatest(c.current/elapsed,0.0001) > days_left), abs((c.target-c.current)/greatest(c.current/elapsed,0.0001)-least(3,days_left)), c.type
  limit 1;
  if not found then return null; end if;
  insert into public.wrc_team_milestones(month,type,target) values(p_month,candidate.type,candidate.target)
  on conflict(month) do update set type=excluded.type,target=excluded.target,created_at=now(),reached_at=null
  returning * into g;
  return to_jsonb(g);
end $$;
revoke all on function public.wrc_team_milestone(text,jsonb) from public;
grant execute on function public.wrc_team_milestone(text,jsonb) to anon,authenticated;
