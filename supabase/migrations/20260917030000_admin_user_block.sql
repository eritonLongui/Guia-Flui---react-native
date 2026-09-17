-- Auth do usuário para o painel: último login e bloqueio.

create or replace function public.admin_users_auth()
returns table (
  user_id uuid,
  last_sign_in_at timestamptz,
  banned_until timestamptz
)
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
    select
      u.id,
      case
        when u.last_sign_in_at is null then sess.session_at
        when sess.session_at is null then u.last_sign_in_at
        when sess.session_at > u.last_sign_in_at then sess.session_at
        else u.last_sign_in_at
      end,
      u.banned_until
    from auth.users u
    left join lateral (
      select max(coalesce(s.refreshed_at at time zone 'utc', s.updated_at, s.created_at)) as session_at
      from auth.sessions s
      where s.user_id = u.id
    ) sess on true
    where u.deleted_at is null;
end;
$$;

create or replace function public.admin_set_user_blocked(p_user_id uuid, p_blocked boolean)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Você não pode bloquear a própria conta.';
  end if;

  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'Não é possível bloquear um administrador.';
  end if;

  if p_blocked then
    update auth.users
    set banned_until = now() + interval '100 years'
    where id = p_user_id;
    delete from auth.sessions where user_id = p_user_id;
  else
    update auth.users
    set banned_until = null
    where id = p_user_id;
  end if;
end;
$$;

revoke all on function public.admin_users_auth() from public;
revoke all on function public.admin_set_user_blocked(uuid, boolean) from public;
grant execute on function public.admin_users_auth() to authenticated;
grant execute on function public.admin_set_user_blocked(uuid, boolean) to authenticated;
