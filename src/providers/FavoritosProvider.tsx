import { anunciarMensagem } from '@/lib/a11y';
import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { eletropostoRepository, favoritoRepository, usuarioRepository } from '@/repositories';
import type { Eletroposto } from '@/types';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface FavoritosContextData {
  favoritos: Eletroposto[];
  carregando: boolean;
  alternarFavorito: (eletropostoId: string) => Promise<void>;
  ehFavorito: (eletropostoId: string) => boolean;
  recarregar: () => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextData>({
  favoritos: [],
  carregando: true,
  alternarFavorito: async () => {},
  ehFavorito: () => false,
  recarregar: async () => {},
});

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { session, carregando: carregandoAuth } = useAuth();
  const { isMockMode } = useMockMode();
  const [favoritos, setFavoritos] = useState<Eletroposto[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string>('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const recarregar = useCallback(async () => {
    try {
      const usuario = await usuarioRepository.obterAtual();
      if (!mountedRef.current) return;

      if (!usuario) {
        setUsuarioId('');
        setIds(new Set());
        setFavoritos([]);
        setCarregando(false);
        return;
      }

      setUsuarioId(usuario.id);
      const favs = await favoritoRepository.listarPorUsuario(usuario.id);
      if (!mountedRef.current) return;
      const idsSet = new Set(favs.map((f) => f.eletropostoId));
      setIds(idsSet);

      const todos = await eletropostoRepository.listar();
      if (!mountedRef.current) return;
      setFavoritos(todos.filter((e) => idsSet.has(e.id)));
    } catch {
      if (!mountedRef.current) return;
      setFavoritos([]);
    } finally {
      if (mountedRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (carregandoAuth) return;
    recarregar();
  }, [carregandoAuth, session?.user.id, isMockMode, recarregar]);

  const alternarFavorito = useCallback(
    async (eletropostoId: string) => {
      if (!usuarioId) return;
      const jaEh = ids.has(eletropostoId);
      try {
        if (jaEh) {
          await favoritoRepository.remover(usuarioId, eletropostoId);
          anunciarMensagem('Removido dos favoritos');
        } else {
          await favoritoRepository.adicionar(usuarioId, eletropostoId);
          anunciarMensagem('Adicionado aos favoritos');
        }
        await recarregar();
      } catch {
        anunciarMensagem('Não foi possível atualizar os favoritos');
      }
    },
    [usuarioId, ids, recarregar],
  );

  const ehFavorito = useCallback((eletropostoId: string) => ids.has(eletropostoId), [ids]);

  return (
    <FavoritosContext.Provider
      value={{ favoritos, carregando, alternarFavorito, ehFavorito, recarregar }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  return useContext(FavoritosContext);
}
