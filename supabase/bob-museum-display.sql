-- Additive display-only extension. Does not rewrite exhibits or touch storage.
begin;
alter table public.wrc_bob_exhibits
  add column if not exists frame_style text not null default 'auto' check(frame_style in ('auto','baroque','rococo','renaissance','antique')),
  add column if not exists crop_x double precision not null default 0.5 check(crop_x between 0 and 1),
  add column if not exists crop_y double precision not null default 0.5 check(crop_y between 0 and 1),
  add column if not exists crop_zoom double precision not null default 1 check(crop_zoom between 1 and 3);

-- Keep the original save RPC for already-open clients. Both versions share the same receipt,
-- revision check and transaction; a lost response cannot reset a later display adjustment.
create or replace function public.wrc_bob_save_display(
  p_request uuid,p_id uuid,p_revision integer,p_photo_path text,p_player text,p_title text,
  p_photo_date date,p_comment text,p_dedication text,
  p_frame_style text,p_crop_x double precision,p_crop_y double precision,p_crop_zoom double precision
) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt jsonb;
begin
  if p_request is null or p_id is null then raise exception 'BOB_INVALID_INPUT'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request::text,0));
  select result into receipt from public.wrc_bob_operations where id=p_request;
  if found then return receipt; end if;
  if p_frame_style is null or p_frame_style not in ('baroque','rococo','renaissance','antique')
    or p_crop_x is null or not(p_crop_x between 0 and 1)
    or p_crop_y is null or not(p_crop_y between 0 and 1)
    or p_crop_zoom is null or not(p_crop_zoom between 1 and 3) then raise exception 'BOB_INVALID_DISPLAY'; end if;
  receipt:=public.wrc_bob_save(p_request,p_id,p_revision,p_photo_path,p_player,p_title,p_photo_date,p_comment,p_dedication);
  update public.wrc_bob_exhibits set frame_style=p_frame_style,crop_x=p_crop_x,crop_y=p_crop_y,crop_zoom=p_crop_zoom where id=p_id;
  return receipt;
end $$;
revoke all on function public.wrc_bob_save_display(uuid,uuid,integer,text,text,text,date,text,text,text,double precision,double precision,double precision) from public;
grant execute on function public.wrc_bob_save_display(uuid,uuid,integer,text,text,text,date,text,text,text,double precision,double precision,double precision) to anon,authenticated;
commit;
