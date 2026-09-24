-- Additive migration. No fitness/game tables or existing policies are changed.
begin;
create function public.wrc_member_birthday(member_name text, birthday_year integer)
returns date language sql immutable strict set search_path = public as $$
  select case member_name
    when 'Fabi' then make_date(birthday_year, 9, 25)
    when 'Marian' then make_date(birthday_year, 10, 9)
    when 'Basti' then make_date(birthday_year, 2, 21)
    when 'Thorsten' then make_date(birthday_year, 5, 20)
    else null end;
$$;
create table public.wrc_birthday_gifts (
  recipient text not null check (recipient in ('Thorsten','Marian','Basti','Fabi')),
  giver text not null check (giver in ('Thorsten','Marian','Basti','Fabi')),
  birthday_year integer not null check (birthday_year >= 2026),
  gift_date date not null,
  points smallint not null default 5 check (points = 5),
  created_at timestamptz not null default now(),
  primary key (recipient, birthday_year, giver),
  check (recipient <> giver),
  check (gift_date = public.wrc_member_birthday(recipient, birthday_year)),
  check (gift_date >= date '2026-09-24')
);
create table public.wrc_birthday_shows (
  player text not null check (player in ('Thorsten','Marian','Basti','Fabi')),
  birthday_year integer not null check (birthday_year >= 2026),
  seen_at timestamptz not null default now(),
  primary key (player, birthday_year),
  check (public.wrc_member_birthday(player, birthday_year) >= date '2026-09-24')
);
alter table public.wrc_birthday_gifts enable row level security;
alter table public.wrc_birthday_shows enable row level security;
-- Same chosen-player trust model as the existing WRC; no new authentication.
-- Anonymous clients cannot edit/delete receipts or grant arbitrary point values.
revoke all on public.wrc_birthday_gifts, public.wrc_birthday_shows from anon, authenticated;
grant select, insert on public.wrc_birthday_gifts, public.wrc_birthday_shows to anon, authenticated;
create policy birthday_gifts_read on public.wrc_birthday_gifts for select to anon, authenticated using (true);
create policy birthday_gifts_today on public.wrc_birthday_gifts for insert to anon, authenticated
  with check (gift_date = (current_timestamp at time zone 'Europe/Berlin')::date);
create policy birthday_shows_read on public.wrc_birthday_shows for select to anon, authenticated using (true);
create policy birthday_shows_due on public.wrc_birthday_shows for insert to anon, authenticated
  with check (public.wrc_member_birthday(player, birthday_year) <= (current_timestamp at time zone 'Europe/Berlin')::date);
commit;
