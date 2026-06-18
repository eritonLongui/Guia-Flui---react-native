import { formatarDistancia } from '@/lib/formatadores';
import type { Eletroposto, NivelCompatibilidade } from '@/types';
import { AccessibilityInfo, type Insets } from 'react-native';

export const HIT_SLOP_PADRAO: Insets = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};

const labelsCompatibilidade: Record<NivelCompatibilidade, string> = {
  compativel: 'Compatível',
  parcial: 'Compatibilidade parcial',
  incompativel: 'Incompatível',
};

export function criarRotuloCompatibilidade(nivel: NivelCompatibilidade): string {
  return labelsCompatibilidade[nivel];
}

export function criarRotuloAvaliacao(nota: number, quantidadeAvaliacoes?: number): string {
  const base = `Avaliação ${nota.toFixed(1)} de 5`;
  if (quantidadeAvaliacoes === undefined) return base;
  return `${base}, ${quantidadeAvaliacoes} avaliações`;
}

export function criarRotuloEletroposto(eletroposto: Eletroposto): string {
  const partes = [
    eletroposto.nome,
    criarRotuloCompatibilidade(eletroposto.nivelCompatibilidade),
  ];

  if (eletroposto.distanciaKm !== undefined) {
    partes.push(formatarDistancia(eletroposto.distanciaKm));
  }

  partes.push(`fila ${eletroposto.tempoFilaMinutos} minutos`);
  partes.push(`carga ${eletroposto.tempoCargaMinutos} minutos`);

  if (eletroposto.conectores.length > 0) {
    const conectores = eletroposto.conectores.map((c) => c.tipo).join(', ');
    partes.push(`conectores ${conectores}`);
  }

  if (eletroposto.abertoAgora) {
    partes.push('aberto agora');
  }

  return partes.join(', ');
}

export function criarRotuloVeiculo(marca: string, modelo: string, autonomiaKm: number): string {
  return `Meu carro, ${marca} ${modelo}, autonomia ${autonomiaKm} quilômetros`;
}

export async function anunciarMensagem(mensagem: string): Promise<void> {
  const ativo = await AccessibilityInfo.isScreenReaderEnabled();
  if (!ativo) return;
  AccessibilityInfo.announceForAccessibility(mensagem);
}
