import {
  obterLocalizacaoUsuario,
  subscribeLocalizacao,
  temLocalizacaoManual,
  type SugestaoEndereco,
  buscarEnderecos,
  definirLocalizacaoManual,
  usarGpsDoAparelho,
  usarLocalizacaoDemoSaoPaulo,
} from '@/lib/localizacao';
import type { Localizacao } from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface LocalizacaoContextData {
  localizacao: Localizacao | null;
  isManual: boolean;
  carregando: boolean;
  atualizar: () => Promise<void>;
  definirManual: (loc: Localizacao) => Promise<void>;
  usarGps: () => Promise<void>;
  usarDemoSaoPaulo: () => Promise<void>;
  buscar: (termo: string) => Promise<SugestaoEndereco[]>;
}

const LocalizacaoContext = createContext<LocalizacaoContextData>({
  localizacao: null,
  isManual: false,
  carregando: true,
  atualizar: async () => {},
  definirManual: async () => {},
  usarGps: async () => {},
  usarDemoSaoPaulo: async () => {},
  buscar: async () => [],
});

export function LocalizacaoProvider({ children }: { children: ReactNode }) {
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const atualizar = useCallback(async () => {
    setCarregando(true);
    try {
      const loc = await obterLocalizacaoUsuario();
      setLocalizacao(loc);
      setIsManual(temLocalizacaoManual());
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    atualizar();
    return subscribeLocalizacao(() => {
      atualizar();
    });
  }, [atualizar]);

  const value = useMemo<LocalizacaoContextData>(
    () => ({
      localizacao,
      isManual,
      carregando,
      atualizar,
      definirManual: async (loc) => {
        await definirLocalizacaoManual(loc);
      },
      usarGps: async () => {
        await usarGpsDoAparelho();
      },
      usarDemoSaoPaulo: async () => {
        await usarLocalizacaoDemoSaoPaulo();
      },
      buscar: buscarEnderecos,
    }),
    [localizacao, isManual, carregando, atualizar],
  );

  return (
    <LocalizacaoContext.Provider value={value}>{children}</LocalizacaoContext.Provider>
  );
}

export function useLocalizacao() {
  return useContext(LocalizacaoContext);
}
