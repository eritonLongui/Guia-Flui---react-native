-- Papel de admin no dashboard web (Next.js) + políticas de escrita/leitura.

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "stations_insert_admin" on public.stations;
drop policy if exists "stations_update_admin" on public.stations;
drop policy if exists "stations_delete_admin" on public.stations;
drop policy if exists "reviews_delete_admin" on public.reviews;
drop policy if exists "vehicles_select_admin" on public.vehicles;
drop policy if exists "favorites_select_admin" on public.favorites;

create policy "stations_insert_admin"
  on public.stations for insert
  to authenticated
  with check (public.is_admin());

create policy "stations_update_admin"
  on public.stations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "stations_delete_admin"
  on public.stations for delete
  to authenticated
  using (public.is_admin());

create policy "reviews_delete_admin"
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

create policy "vehicles_select_admin"
  on public.vehicles for select
  to authenticated
  using (public.is_admin());

create policy "favorites_select_admin"
  on public.favorites for select
  to authenticated
  using (public.is_admin());
