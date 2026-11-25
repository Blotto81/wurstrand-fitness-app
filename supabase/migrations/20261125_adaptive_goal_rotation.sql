CREATE OR REPLACE FUNCTION public.wrc_team_milestone(p_month text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 g public.wrc_team_goal%rowtype;
 c record;
 today date := (now() at time zone 'Europe/Berlin')::date;
 mk text := to_char(today,'YYYY-MM');
 days_left integer := (date_trunc('month',today)+interval '1 month')::date-today;
 m jsonb; a jsonb; recent jsonb; v numeric; h jsonb := public.wrc_historical_totals()->'team';
begin
 if p_month is distinct from mk then return null; end if;
 perform pg_advisory_xact_lock(hashtext('wrc-team-goal'));
 select jsonb_build_object('steps',coalesce(sum(steps) filter(where date like mk||'-%'),0),'bike',coalesce(sum(bike) filter(where date like mk||'-%'),0),'squats',coalesce(sum(squats) filter(where date like mk||'-%'),0),'pushups',coalesce(sum(pushups) filter(where date like mk||'-%'),0)),
 jsonb_build_object('steps',coalesce(sum(steps),0),'bike',coalesce(sum(bike),0),'squats',coalesce(sum(squats),0),'pushups',coalesce(sum(pushups),0)),
 jsonb_build_object('steps',coalesce(sum(steps) filter(where date >= (today-6)::text),0),'bike',coalesce(sum(bike) filter(where date >= (today-6)::text),0),'squats',coalesce(sum(squats) filter(where date >= (today-6)::text),0),'pushups',coalesce(sum(pushups) filter(where date >= (today-6)::text),0))
 into m,a,recent from (select date,person,max(coalesce(steps,0)) steps,max(coalesce(bike,0)) bike,max(coalesce(squats,0)) squats,max(coalesce(pushups,0)) pushups from public.entries where date<=today::text and person in ('Thorsten','Basti','Fabi','Marian') group by date,person) cleaned;
 a := jsonb_build_object('steps',(a->>'steps')::numeric+(h->>'steps')::numeric,'bike',(a->>'bike')::numeric+(h->>'bike')::numeric,'squats',(a->>'squats')::numeric+(h->>'squats')::numeric,'pushups',(a->>'pushups')::numeric+(h->>'pushups')::numeric);
 select * into g from public.wrc_team_goal where closed_at is null;
 if found then
   if g.scope='month' and g.month<>mk then
     update public.wrc_team_goal set closed_at=now() where id=g.id;
   else
     v := ((case when g.scope='month' then m else a end)->>g.type)::numeric;
     if v<g.target and now()>=g.created_at+interval '5 days' then
       update public.wrc_team_goal set closed_at=now() where id=g.id;
     elsif v<g.target then
       if g.reached_at is not null then update public.wrc_team_goal set reached_at=null where id=g.id returning * into g; end if;
       return to_jsonb(g)||jsonb_build_object('value',v);
     else
     if g.reached_at is null then update public.wrc_team_goal set reached_at=now() where id=g.id returning * into g; end if;
     if now()<g.reached_at+interval '6 hours' then return to_jsonb(g)||jsonb_build_object('value',v); end if;
     update public.wrc_team_goal set closed_at=now() where id=g.id;
     end if;
   end if;
 end if;
 select q.* into c from (
 select s.scope,t.type, z.val, (floor(z.val/t.step)+k.n)*t.step as target,
 ((floor(z.val/t.step)+k.n)*t.step-z.val)/greatest(z.rate,0.01) as eta
 from (values ('month'),('all')) s(scope)
 cross join (values ('steps',10000),('bike',10),('squats',50),('pushups',25)) t(type,step)
 cross join generate_series(1,20) k(n)
 cross join lateral (select ((case when s.scope='month' then m else a end)->>t.type)::numeric as val,(recent->>t.type)::numeric/7 as rate) z
 where z.rate>0 and (s.scope='all' or ((floor(z.val/t.step)+k.n)*t.step-z.val)/z.rate<=days_left)
 ) q order by (q.eta>5),abs(q.eta-3)+case when q.type=g.type then 1.5 else 0 end+case when q.scope=g.scope then 0.6 else 0 end,q.type,q.scope limit 1;
 if not found then return null; end if;
 insert into public.wrc_team_goal(scope,month,type,target) values(c.scope,mk,c.type,c.target) returning * into g;
 return to_jsonb(g)||jsonb_build_object('value',c.val);
end $function$
