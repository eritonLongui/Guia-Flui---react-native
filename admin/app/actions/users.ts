'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

export async function setUserBlocked(id: string, blocked: boolean) {
  const { supabase, user } = await requireAdmin();
  if (user.id === id) {
    throw new Error('Você não pode bloquear a própria conta.');
  }

  const { error } = await supabase.rpc('admin_set_user_blocked', {
    p_user_id: id,
    p_blocked: blocked,
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/usuarios');
  revalidatePath(`/usuarios/${id}`);
}

export async function setUserRole(id: string, role: 'user' | 'admin') {
  const { supabase, user } = await requireAdmin();
  if (user.id === id) {
    throw new Error('Você não pode alterar o próprio papel.');
  }

  const { error } = await supabase.rpc('admin_set_user_role', {
    p_user_id: id,
    p_role: role,
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/usuarios');
  revalidatePath(`/usuarios/${id}`);
}

export async function deleteUser(id: string) {
  const { supabase, user } = await requireAdmin();
  if (user.id === id) {
    throw new Error('Você não pode excluir a própria conta.');
  }

  const { error } = await supabase.rpc('admin_delete_user', {
    p_user_id: id,
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/usuarios');
  redirect('/usuarios');
}
