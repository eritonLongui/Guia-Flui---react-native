-- Admin promove, rebaixa ou exclui contas (sem agir na própria).

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;

  if p_role not in ('user', 'admin') then
    raise exception 'Papel inválido.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Você não pode alterar o próprio papel.';
  end if;

  if p_role = 'user' and (
    select count(*) from public.profiles where role = 'admin' and id <> p_user_id
  ) = 0 then
    raise exception 'Precisa ficar pelo menos um administrador.';
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id;

  if not found then
    raise exception 'Usuário não encontrado.';
  end if;
end;
$$;

create or replace function public.admin_delete_user(p_user_id uuid)
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
    raise exception 'Você não pode excluir a própria conta.';
  end if;

  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'Tire o acesso de administrador antes de excluir.';
  end if;

  delete from public.reviews where user_id = p_user_id;
  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
