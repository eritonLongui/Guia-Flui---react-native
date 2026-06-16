import {
  favoritoRepository,
  usuarioRepository,
} from '@/repositories/mockRepositories';
import type { Eletroposto } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

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
  const [favoritos, setFavoritos] = useState<Eletroposto[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string>('');

  const recarregar = useCallback(async () => {
    const usuario = await usuarioRepository.obterAtual();
    setUsuarioId(usuario.id);
    const favs = await favoritoRepository.listarPorUsuario(usuario.id);
    const idsSet = new Set(favs.map((f) => f.eletropostoId));
    setIds(idsSet);

    const { eletropostoRepository } = await import('@/repositories/mockRepositories');
    const todos = await eletropostoRepository.listar();
    setFavoritos(todos.filter((e) => idsSet.has(e.id)));
    setCarregando(false);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const alternarFavorito = useCallback(
    async (eletropostoId: string) => {
      if (!usuarioId) return;
      const jaEh = ids.has(eletropostoId);
      if (jaEh) {
        await favoritoRepository.remover(usuarioId, eletropostoId);
      } else {
        await favoritoRepository.adicionar(usuarioId, eletropostoId);
      }
      await recarregar();
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
