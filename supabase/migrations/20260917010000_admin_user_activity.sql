-- Atividade de login para o admin (MAU/WAU). Só o painel chama esta função.

create or replace function public.admin_user_activity()
returns table (user_id uuid, occurred_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  return query
    select u.id, u.last_sign_in_at
    from auth.users u
    where u.deleted_at is null
      and u.last_sign_in_at is not null
    union all
    select s.user_id, coalesce(s.refreshed_at at time zone 'utc', s.updated_at, s.created_at)
    from auth.sessions s;
end;
$$;

revoke all on function public.admin_user_activity() from public;
grant execute on function public.admin_user_activity() to authenticated;
