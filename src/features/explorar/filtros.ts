import { detectarLugar, semAcento } from '@/lib/lugarEstacao';
import type { Eletroposto, NivelCompatibilidade, Veiculo } from '@/types';

export interface FiltrosExplorar {
  apenasCompativeis: boolean;
  abertoAgora: boolean;
  distanciaMaxKm: number | null;
  potenciaMinKw: number | null;
  conectores: string[];
  temBanheiro: boolean;
  temComida: boolean;
  temEstacionamento: boolean;
}

export const FILTROS_INICIAIS: FiltrosExplorar = {
  apenasCompativeis: false,
  abertoAgora: false,
  distanciaMaxKm: null,
  potenciaMinKw: null,
  conectores: [],
  temBanheiro: false,
  temComida: false,
  temEstacionamento: false,
};

export const DISTANCIAS_KM = [5, 10, 20, 50] as const;
export const POTENCIAS_MIN_KW = [50, 150] as const;
export const CONECTORES_FILTRO = ['CCS2', 'Tipo 2', 'CHAdeMO'] as const;

const ORDEM_COMPAT: Record<NivelCompatibilidade, number> = {
  compativel: 2,
  parcial: 1,
  incompativel: 0,
};

export function contarFiltrosAtivos(filtros: FiltrosExplorar): number {
  let total = 0;
  if (filtros.apenasCompativeis) total += 1;
  if (filtros.abertoAgora) total += 1;
  if (filtros.distanciaMaxKm != null) total += 1;
  if (filtros.potenciaMinKw != null) total += 1;
  if (filtros.conectores.length > 0) total += 1;
  if (filtros.temBanheiro) total += 1;
  if (filtros.temComida) total += 1;
  if (filtros.temEstacionamento) total += 1;
  return total;
}

export function aplicarFiltrosExplorar(
  eletropostos: Eletroposto[],
  filtros: FiltrosExplorar,
  veiculo: Veiculo | null,
): Eletroposto[] {
  return eletropostos.filter((ep) => {
    if (filtros.abertoAgora && !ep.abertoAgora) return false;

    if (filtros.distanciaMaxKm != null) {
      if (ep.distanciaKm == null || ep.distanciaKm > filtros.distanciaMaxKm) return false;
    }

    if (filtros.potenciaMinKw != null) {
      const maxKw = Math.max(0, ...ep.conectores.map((c) => c.potenciaKw));
      if (maxKw < filtros.potenciaMinKw) return false;
    }

    if (filtros.conectores.length > 0) {
      const tipos = ep.conectores.map((c) => c.tipo);
      const temAlgum = filtros.conectores.some((tipo) => tipos.includes(tipo));
      if (!temAlgum) return false;
    }

    if (filtros.temBanheiro && !ep.temBanheiro) return false;
    if (filtros.temComida && !ep.temComida) return false;
    if (filtros.temEstacionamento && !ep.temEstacionamento) return false;

    if (filtros.apenasCompativeis) {
      if (!veiculo) return false;
      const overlap = ep.conectores.some((c) => veiculo.tiposConector.includes(c.tipo));
      if (!overlap && ORDEM_COMPAT[ep.nivelCompatibilidade] < 1) return false;
      if (ep.nivelCompatibilidade === 'incompativel') return false;
    }

    return true;
  });
}

export function filtrarPorBusca(eletropostos: Eletroposto[], busca: string): Eletroposto[] {
  const termo = busca.trim();
  if (!termo) return eletropostos;

  const cidades = [...new Set(eletropostos.map((ep) => ep.cidade).filter(Boolean))];
  const lugar = detectarLugar(termo, cidades);
  const n = semAcento(termo);

  return eletropostos.filter((ep) => {
    if (lugar.cidade && semAcento(ep.cidade) === semAcento(lugar.cidade)) return true;
    if (lugar.estado && ep.estado.toUpperCase() === lugar.estado) return true;
    return (
      semAcento(ep.nome).includes(n) ||
      semAcento(ep.endereco).includes(n) ||
      semAcento(ep.cidade).includes(n) ||
      semAcento(ep.estado).includes(n)
    );
  });
}
