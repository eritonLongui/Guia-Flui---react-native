-- Imagens de eletroposto no painel admin (upload via Storage).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'station-images',
  'station-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "station_images_public_read" on storage.objects;
drop policy if exists "station_images_admin_insert" on storage.objects;
drop policy if exists "station_images_admin_update" on storage.objects;
drop policy if exists "station_images_admin_delete" on storage.objects;

create policy "station_images_public_read"
  on storage.objects for select
  using (bucket_id = 'station-images');

create policy "station_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'station-images' and public.is_admin());

create policy "station_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'station-images' and public.is_admin())
  with check (bucket_id = 'station-images' and public.is_admin());

create policy "station_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'station-images' and public.is_admin());
