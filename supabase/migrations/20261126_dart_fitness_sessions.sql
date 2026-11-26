create table public.dart_fitness_sessions(id uuid primary key, ended_at timestamptz not null default now(), events jsonb not null check(jsonb_typeof(events)='array' and jsonb_array_length(events)<=20000));
alter table public.dart_fitness_sessions enable row level security;
grant select,insert on public.dart_fitness_sessions to anon,authenticated;
create policy dart_fitness_read on public.dart_fitness_sessions for select to anon,authenticated using(true);
create policy dart_fitness_insert on public.dart_fitness_sessions for insert to anon,authenticated with check(true);