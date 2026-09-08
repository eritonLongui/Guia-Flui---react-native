'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function deleteReview(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/');
  revalidatePath('/avaliacoes');
  revalidatePath('/eletropostos');
}
