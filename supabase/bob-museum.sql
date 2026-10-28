-- B.o.B. only. User explicitly chose: no login; everyone with the app link may manage exhibits.
-- No existing WRC table, points function or permission is changed.
begin;
create table if not exists public.wrc_bob_assets (
  id uuid primary key,
  path text not null unique,
  mime text not null check (mime in ('image/jpeg','image/png','image/webp')),
  bytes bigint not null check (bytes between 1 and 15728640),
  state text not null default 'pending' check (state in ('pending','current','cleanup')),
  created_at timestamptz not null default now()
);
create table if not exists public.wrc_bob_exhibits (
  id uuid primary key,
  exhibit_number bigint generated always as identity unique,
  player text not null check(player in ('Thorsten','Basti','Fabi','Marian')),
  title text not null check(length(btrim(title)) between 1 and 120),
  photo_path text not null unique references public.wrc_bob_assets(path),
  photo_date date check(photo_date between date '1000-01-01' and date '9999-12-31'),
  comment text not null default '' check(length(comment)<=1000),
  dedication text not null default '' check(length(dedication)<=300),
  revision integer not null default 1 check(revision>0),
  deleting boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wrc_bob_newest on public.wrc_bob_exhibits(created_at desc,id);
create table if not exists public.wrc_bob_operations(id uuid primary key,result jsonb not null,created_at timestamptz not null default now());
alter table public.wrc_bob_assets enable row level security;
alter table public.wrc_bob_exhibits enable row level security;
alter table public.wrc_bob_operations enable row level security;
revoke all on public.wrc_bob_assets, public.wrc_bob_exhibits, public.wrc_bob_operations from public,anon,authenticated;
revoke all on sequence public.wrc_bob_exhibits_exhibit_number_seq from public,anon,authenticated;
grant select on public.wrc_bob_exhibits to anon,authenticated;
drop policy if exists bob_read on public.wrc_bob_exhibits;
create policy bob_read on public.wrc_bob_exhibits for select to anon,authenticated using(not deleting);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wrc-bob-originals','wrc-bob-originals',true,15728640,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.wrc_bob_reserve(p_id uuid,p_mime text,p_bytes bigint) returns text
language plpgsql security definer set search_path='' as $$
declare a public.wrc_bob_assets; suffix text;
begin
  suffix:=case p_mime when 'image/jpeg' then '.jpg' when 'image/png' then '.png' when 'image/webp' then '.webp' else null end;
  if p_id is null or suffix is null or p_bytes is null or p_bytes not between 1 and 15728640 then raise exception 'BOB_INVALID_FILE'; end if;
  insert into public.wrc_bob_assets(id,path,mime,bytes) values(p_id,p_id::text||suffix,p_mime,p_bytes) on conflict(id) do nothing;
  select * into a from public.wrc_bob_assets where id=p_id for update;
  if a.state<>'pending' or a.mime<>p_mime or a.bytes<>p_bytes then raise exception 'BOB_UPLOAD_EXPIRED'; end if;
  return a.path;
end $$;
create or replace function public.wrc_bob_upload_allowed(p_path text) returns boolean
language plpgsql security definer set search_path='' as $$
declare a public.wrc_bob_assets;
begin
  select * into a from public.wrc_bob_assets where path=p_path for update;
  return found and a.state='pending' and a.created_at>now()-interval '24 hours';
end $$;
create or replace function public.wrc_bob_remove_allowed(p_path text) returns boolean
language plpgsql security definer set search_path='' as $$
declare a public.wrc_bob_assets;
begin
  select * into a from public.wrc_bob_assets where path=p_path for update;
  return found and a.state='cleanup' and not exists(select 1 from public.wrc_bob_exhibits where photo_path=p_path and not deleting);
end $$;
-- Restrictive guards also protect B.o.B. if unrelated old buckets have broad permissive policies.
drop policy if exists bob_storage_insert_guard on storage.objects;
create policy bob_storage_insert_guard on storage.objects as restrictive for insert to public
with check(bucket_id<>'wrc-bob-originals' or public.wrc_bob_upload_allowed(name));
drop policy if exists bob_storage_update_guard on storage.objects;
create policy bob_storage_update_guard on storage.objects as restrictive for update to public
using(bucket_id<>'wrc-bob-originals') with check(bucket_id<>'wrc-bob-originals');
drop policy if exists bob_storage_delete_guard on storage.objects;
create policy bob_storage_delete_guard on storage.objects as restrictive for delete to public
using(bucket_id<>'wrc-bob-originals' or public.wrc_bob_remove_allowed(name));
drop policy if exists bob_storage_upload on storage.objects;
create policy bob_storage_upload on storage.objects for insert to anon,authenticated with check(bucket_id='wrc-bob-originals');
drop policy if exists bob_storage_read on storage.objects;
create policy bob_storage_read on storage.objects for select to anon,authenticated using(bucket_id='wrc-bob-originals');
drop policy if exists bob_storage_delete on storage.objects;
create policy bob_storage_delete on storage.objects for delete to anon,authenticated using(bucket_id='wrc-bob-originals');

create or replace function public.wrc_bob_save(p_request uuid,p_id uuid,p_revision integer,p_photo_path text,p_player text,p_title text,p_photo_date date,p_comment text,p_dedication text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous public.wrc_bob_exhibits; saved public.wrc_bob_exhibits; a public.wrc_bob_assets; receipt jsonb;
begin
  if p_request is null or p_id is null or p_revision is null or p_revision<0 then raise exception 'BOB_INVALID_INPUT'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request::text,0));
  select result into receipt from public.wrc_bob_operations where id=p_request;
  if found then return receipt; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text,1));
  select * into previous from public.wrc_bob_exhibits where id=p_id for update;
  if (found and (previous.deleting or previous.revision<>p_revision)) or (not found and p_revision<>0) then raise exception 'BOB_CONFLICT'; end if;
  select * into a from public.wrc_bob_assets where path=p_photo_path for update;
  if not found or a.state='cleanup' or (a.state='current' and previous.photo_path is distinct from p_photo_path) then raise exception 'BOB_INVALID_PHOTO'; end if;
  if not exists(select 1 from storage.objects where bucket_id='wrc-bob-originals' and name=p_photo_path
    and (metadata->>'size')::bigint=a.bytes and metadata->>'mimetype'=a.mime) then raise exception 'BOB_UPLOAD_INCOMPLETE'; end if;
  if previous.id is null then
    insert into public.wrc_bob_exhibits(id,player,title,photo_path,photo_date,comment,dedication)
    values(p_id,p_player,btrim(p_title),p_photo_path,p_photo_date,btrim(coalesce(p_comment,'')),btrim(coalesce(p_dedication,''))) returning * into saved;
  else
    update public.wrc_bob_exhibits set player=p_player,title=btrim(p_title),photo_path=p_photo_path,photo_date=p_photo_date,
      comment=btrim(coalesce(p_comment,'')),dedication=btrim(coalesce(p_dedication,'')),revision=revision+1,updated_at=now()
    where id=p_id returning * into saved;
    if previous.photo_path<>p_photo_path then update public.wrc_bob_assets set state='cleanup' where path=previous.photo_path; end if;
  end if;
  update public.wrc_bob_assets set state='current' where path=p_photo_path;
  receipt:=jsonb_build_object('id',saved.id,'exhibit_number',saved.exhibit_number,'revision',saved.revision);
  insert into public.wrc_bob_operations(id,result) values(p_request,receipt);
  return receipt;
end $$;
create or replace function public.wrc_bob_delete(p_id uuid,p_revision integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare e public.wrc_bob_exhibits;
begin
  select * into e from public.wrc_bob_exhibits where id=p_id for update;
  if not found then return true; end if;
  if e.deleting then return true; end if;
  if e.revision is distinct from p_revision then raise exception 'BOB_CONFLICT'; end if;
  update public.wrc_bob_exhibits set deleting=true,updated_at=now() where id=p_id;
  update public.wrc_bob_assets set state='cleanup' where path=e.photo_path;
  return true;
end $$;
create or replace function public.wrc_bob_cleanup_candidates() returns table(path text)
language plpgsql security definer set search_path='' as $$
begin
  update public.wrc_bob_assets set state='cleanup' where state='pending' and created_at<now()-interval '24 hours';
  return query select a.path from public.wrc_bob_assets a where a.state='cleanup' order by a.created_at limit 50;
end $$;
create or replace function public.wrc_bob_cleanup_done(p_path text) returns boolean
language plpgsql security definer set search_path='' as $$
declare a public.wrc_bob_assets;
begin
  select * into a from public.wrc_bob_assets where path=p_path for update;
  if not found then return true; end if;
  if a.state<>'cleanup' or exists(select 1 from storage.objects where bucket_id='wrc-bob-originals' and name=p_path)
    or exists(select 1 from public.wrc_bob_exhibits where photo_path=p_path and not deleting) then return false; end if;
  delete from public.wrc_bob_exhibits where photo_path=p_path and deleting;
  delete from public.wrc_bob_assets where path=p_path;
  return true;
end $$;
-- No direct table or sequence writes. All changes pass validated, versioned RPCs.
revoke all on function public.wrc_bob_reserve(uuid,text,bigint),public.wrc_bob_upload_allowed(text),public.wrc_bob_remove_allowed(text),public.wrc_bob_save(uuid,uuid,integer,text,text,text,date,text,text),public.wrc_bob_delete(uuid,integer),public.wrc_bob_cleanup_candidates(),public.wrc_bob_cleanup_done(text) from public;
grant execute on function public.wrc_bob_reserve(uuid,text,bigint),public.wrc_bob_upload_allowed(text),public.wrc_bob_remove_allowed(text),public.wrc_bob_save(uuid,uuid,integer,text,text,text,date,text,text),public.wrc_bob_delete(uuid,integer),public.wrc_bob_cleanup_candidates(),public.wrc_bob_cleanup_done(text) to anon,authenticated;
commit;
