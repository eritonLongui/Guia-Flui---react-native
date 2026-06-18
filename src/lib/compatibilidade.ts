import type { NivelCompatibilidade } from '@/types';

export function obterExplicacaoCompatibilidade(
  nivel: NivelCompatibilidade,
  pontuacao: number,
  conectoresPosto: { tipo: string }[],
  conectoresVeiculo: string[] = [],
): string {
  const tiposPosto = conectoresPosto.map((c) => c.tipo).join(', ');
  const tiposVeiculo = conectoresVeiculo.length > 0 ? conectoresVeiculo.join(', ') : 'seu veículo';

  switch (nivel) {
    case 'compativel':
      return `Seu carro combina com os conectores deste posto (${tiposPosto}). Recarga rápida disponível.`;
    case 'parcial':
      if (pontuacao >= 70) {
        return 'O posto oferece Tipo 2 AC, que funciona com seu carro, mas a recarga é mais lenta que em um conector CCS2 de alta potência.';
      }
      return `Há conector utilizável (${tiposPosto}), porém com adaptador ou potência reduzida. Vale confirmar antes de ir.`;
    case 'incompativel':
      return `Nenhum conector deste posto (${tiposPosto}) é compatível com o plug do seu veículo (${tiposVeiculo}).`;
  }
}
