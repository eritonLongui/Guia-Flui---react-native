import {
  aplicarFiltrosExplorar,
  contarFiltrosAtivos,
  filtrarPorBusca,
  FILTROS_INICIAIS,
  type FiltrosExplorar,
} from '@/features/explorar/filtros';
import { anunciarMensagem } from '@/lib/a11y';
import { useLocalizacao } from '@/providers/LocalizacaoProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { eletropostoRepository } from '@/repositories';
import type { Eletroposto } from '@/types';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ExplorarQueryValue {
  busca: string;
  setBusca: (busca: string) => void;
  filtros: FiltrosExplorar;
  setFiltros: (filtros: FiltrosExplorar) => void;
  eletropostos: Eletroposto[];
  filtrados: Eletroposto[];
  filtrosAtivos: number;
}

const ExplorarQueryContext = createContext<ExplorarQueryValue | null>(null);

export function ExplorarQueryProvider({ children }: { children: ReactNode }) {
  const { isMockMode } = useMockMode();
  const { veiculo } = useVeiculoAtivo();
  const { localizacao } = useLocalizacao();

  const [eletropostos, setEletropostos] = useState<Eletroposto[]>([]);
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useState<FiltrosExplorar>(FILTROS_INICIAIS);

  const origemKey = localizacao
    ? `${localizacao.latitude.toFixed(5)},${localizacao.longitude.toFixed(5)}`
    : 'pending';

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(async () => {
      try {
        const dados = await eletropostoRepository.listar();
        if (!mounted) return;
        setEletropostos(dados);
      } catch {
        if (!mounted) return;
        setEletropostos([]);
        anunciarMensagem('Não foi possível carregar eletropostos');
      }
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isMockMode, origemKey]);

  const filtrados = useMemo(
    () => aplicarFiltrosExplorar(filtrarPorBusca(eletropostos, busca), filtros, veiculo),
    [eletropostos, busca, filtros, veiculo],
  );

  const filtrosAnteriores = useRef(filtros);
  const buscaAnterior = useRef(busca);
  useEffect(() => {
    const mudouFiltro = filtrosAnteriores.current !== filtros;
    const mudouBusca = buscaAnterior.current !== busca;
    filtrosAnteriores.current = filtros;
    buscaAnterior.current = busca;
    if (!mudouFiltro && !mudouBusca) return;
    if (!mudouFiltro && !busca.trim()) return;
    anunciarMensagem(
      `${filtrados.length} ${filtrados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`,
    );
  }, [filtros, busca, filtrados.length]);

  const filtrosAtivos = contarFiltrosAtivos(filtros);

  const value = useMemo(
    () => ({
      busca,
      setBusca,
      filtros,
      setFiltros,
      eletropostos,
      filtrados,
      filtrosAtivos,
    }),
    [busca, filtros, eletropostos, filtrados, filtrosAtivos],
  );

  return (
    <ExplorarQueryContext.Provider value={value}>{children}</ExplorarQueryContext.Provider>
  );
}

export function useExplorarQuery() {
  const ctx = useContext(ExplorarQueryContext);
  if (!ctx) {
    throw new Error('useExplorarQuery deve ser usado dentro de ExplorarQueryProvider');
  }
  return ctx;
}
