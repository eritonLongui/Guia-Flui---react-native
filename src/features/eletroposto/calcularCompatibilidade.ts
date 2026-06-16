import type { Veiculo } from '@/types';
import type { NivelCompatibilidade } from '@/types';

export function calcularCompatibilidade(
  veiculo: Veiculo,
  conectoresEstacao: { tipo: string }[],
): { nivel: NivelCompatibilidade; pontuacao: number } {
  const tiposEstacao = conectoresEstacao.map((c) => c.tipo);
  const compativeis = veiculo.tiposConector.filter((t) => tiposEstacao.includes(t));

  if (compativeis.length === 0) {
    return { nivel: 'incompativel', pontuacao: 0 };
  }

  const temCcs = compativeis.some((t) => t.includes('CCS'));
  const temTipo2 = compativeis.some((t) => t.includes('Tipo 2'));

  if (temCcs) {
    return { nivel: 'compativel', pontuacao: 95 };
  }

  if (temTipo2) {
    return { nivel: 'parcial', pontuacao: 70 };
  }

  return { nivel: 'parcial', pontuacao: 50 };
}
