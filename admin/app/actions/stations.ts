'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { newStationId } from '@/lib/format';
import type { Conector, NivelCompatibilidade, NivelSeguranca, StationInput } from '@/lib/types';

export type ActionState = { error?: string; saved?: boolean } | undefined;

function parseBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true' || value === '1';
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseConectores(raw: FormDataEntryValue | null): Conector[] {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw) as Conector[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.tipo === 'string')
      .map((item) => ({
        tipo: item.tipo.trim() || 'CCS2',
        potenciaKw: Number(item.potenciaKw) || 0,
        quantidade: Number(item.quantidade) || 1,
      }));
  } catch {
    return [];
  }
}

function stationFromForm(formData: FormData, existingId?: string): StationInput {
  const nivelCompatibilidade = String(formData.get('nivel_compatibilidade') ?? 'compativel') as NivelCompatibilidade;
  const nivelSeguranca = String(formData.get('nivel_seguranca') ?? 'moderado') as NivelSeguranca;
  const fromForm = String(formData.get('id') ?? '').trim();

  return {
    id: existingId ?? (fromForm || newStationId()),
    nome: String(formData.get('nome') ?? '').trim(),
    endereco: String(formData.get('endereco') ?? '').trim(),
    cidade: String(formData.get('cidade') ?? '').trim(),
    estado: String(formData.get('estado') ?? '').trim().toUpperCase(),
    latitude: parseNumber(formData.get('latitude')),
    longitude: parseNumber(formData.get('longitude')),
    pontuacao_seguranca: parseNumber(formData.get('pontuacao_seguranca')),
    descricao_seguranca: String(formData.get('descricao_seguranca') ?? '').trim(),
    tempo_fila_minutos: parseNumber(formData.get('tempo_fila_minutos')),
    tempo_carga_minutos: parseNumber(formData.get('tempo_carga_minutos')),
    pontuacao_compatibilidade: parseNumber(formData.get('pontuacao_compatibilidade')),
    pontuacao_recomendacao: parseNumber(formData.get('pontuacao_recomendacao')),
    nivel_compatibilidade: ['compativel', 'parcial', 'incompativel'].includes(nivelCompatibilidade)
      ? nivelCompatibilidade
      : 'compativel',
    nivel_seguranca: ['seguro', 'moderado', 'atencao'].includes(nivelSeguranca) ? nivelSeguranca : 'moderado',
    tem_comida: parseBoolean(formData.get('tem_comida')),
    tem_banheiro: parseBoolean(formData.get('tem_banheiro')),
    tem_estacionamento: parseBoolean(formData.get('tem_estacionamento')),
    aberto_agora: parseBoolean(formData.get('aberto_agora')),
    horario_funcionamento: String(formData.get('horario_funcionamento') ?? '').trim(),
    horario_menor_movimento: String(formData.get('horario_menor_movimento') ?? '').trim(),
    carregadores_disponiveis: parseNumber(formData.get('carregadores_disponiveis')),
    carregadores_total: parseNumber(formData.get('carregadores_total')),
    conectores: parseConectores(formData.get('conectores')),
    imagem_url: String(formData.get('imagem_url') ?? '').trim(),
  };
}

function validateStation(input: StationInput) {
  if (!input.nome) return 'Informe o nome do eletroposto.';
  if (!input.endereco || !input.cidade || !input.estado) return 'Informe endereço, cidade e estado.';
  if (!input.horario_funcionamento || !input.horario_menor_movimento) return 'Informe os horários.';
  if (!input.descricao_seguranca) return 'Informe a descrição de segurança.';
  if (input.carregadores_disponiveis > input.carregadores_total) {
    return 'Carregadores disponíveis não podem passar do total.';
  }
  return null;
}

export async function createStation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const input = stationFromForm(formData);
  const error = validateStation(input);
  if (error) return { error };

  const { error: insertError } = await supabase.from('stations').insert({
    id: input.id,
    nome: input.nome,
    endereco: input.endereco,
    cidade: input.cidade,
    estado: input.estado,
    latitude: input.latitude,
    longitude: input.longitude,
    pontuacao_seguranca: input.pontuacao_seguranca,
    descricao_seguranca: input.descricao_seguranca,
    tempo_fila_minutos: input.tempo_fila_minutos,
    tempo_carga_minutos: input.tempo_carga_minutos,
    pontuacao_compatibilidade: input.pontuacao_compatibilidade,
    pontuacao_recomendacao: input.pontuacao_recomendacao,
    nivel_compatibilidade: input.nivel_compatibilidade,
    nivel_seguranca: input.nivel_seguranca,
    tem_comida: input.tem_comida,
    tem_banheiro: input.tem_banheiro,
    tem_estacionamento: input.tem_estacionamento,
    aberto_agora: input.aberto_agora,
    horario_funcionamento: input.horario_funcionamento,
    horario_menor_movimento: input.horario_menor_movimento,
    carregadores_disponiveis: input.carregadores_disponiveis,
    carregadores_total: input.carregadores_total,
    conectores: input.conectores,
    imagem_url: input.imagem_url,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/');
  revalidatePath('/eletropostos');
  redirect(`/eletropostos/${input.id}`);
}

export async function updateStation(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const input = stationFromForm(formData, id);
  const error = validateStation(input);
  if (error) return { error };

  const { error: updateError } = await supabase
    .from('stations')
    .update({
      nome: input.nome,
      endereco: input.endereco,
      cidade: input.cidade,
      estado: input.estado,
      latitude: input.latitude,
      longitude: input.longitude,
      pontuacao_seguranca: input.pontuacao_seguranca,
      descricao_seguranca: input.descricao_seguranca,
      tempo_fila_minutos: input.tempo_fila_minutos,
      tempo_carga_minutos: input.tempo_carga_minutos,
      pontuacao_compatibilidade: input.pontuacao_compatibilidade,
      pontuacao_recomendacao: input.pontuacao_recomendacao,
      nivel_compatibilidade: input.nivel_compatibilidade,
      nivel_seguranca: input.nivel_seguranca,
      tem_comida: input.tem_comida,
      tem_banheiro: input.tem_banheiro,
      tem_estacionamento: input.tem_estacionamento,
      aberto_agora: input.aberto_agora,
      horario_funcionamento: input.horario_funcionamento,
      horario_menor_movimento: input.horario_menor_movimento,
      carregadores_disponiveis: input.carregadores_disponiveis,
      carregadores_total: input.carregadores_total,
      conectores: input.conectores,
      imagem_url: input.imagem_url,
    })
    .eq('id', id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/');
  revalidatePath('/eletropostos');
  revalidatePath(`/eletropostos/${id}`);
  return { saved: true };
}

export async function deleteStation(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('stations').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath('/');
  revalidatePath('/eletropostos');
  revalidatePath('/avaliacoes');
  redirect('/eletropostos');
}
