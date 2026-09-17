import { eletropostoRepository } from '@/repositories';
import type { Eletroposto } from '@/types';

export async function hidratarEletropostosPorIds(ids: string[]): Promise<Map<string, Eletroposto>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (unicos.length === 0) return new Map();

  const todos = await eletropostoRepository.listar();
  const desejados = new Set(unicos);
  const mapa = new Map<string, Eletroposto>();
  for (const ep of todos) {
    if (desejados.has(ep.id)) mapa.set(ep.id, ep);
  }
  return mapa;
}
