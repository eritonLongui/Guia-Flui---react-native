import {
  avaliacoesMock,
  eletropostosMock,
  favoritosMock,
  rotaMock,
  usuarioMock,
  veiculosMock,
} from '@/data/mock';
import type {
  AvaliacaoRepository,
  EletropostoRepository,
  FavoritoRepository,
  RotaRepository,
  UsuarioRepository,
  VeiculoRepository,
} from '@/repositories/interfaces';
import type { Avaliacao, Eletroposto, Favorito, Rota, Usuario, Veiculo } from '@/types';

let favoritosStore = [...favoritosMock];

export class MockEletropostoRepository implements EletropostoRepository {
  async listar(): Promise<Eletroposto[]> {
    return [...eletropostosMock];
  }

  async buscarPorId(id: string): Promise<Eletroposto | null> {
    return eletropostosMock.find((e) => e.id === id) ?? null;
  }

  async listarProximos(limite: number): Promise<Eletroposto[]> {
    return [...eletropostosMock]
      .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0))
      .slice(0, limite);
  }

  async listarRecomendados(limite: number): Promise<Eletroposto[]> {
    return [...eletropostosMock]
      .sort((a, b) => b.pontuacaoRecomendacao - a.pontuacaoRecomendacao)
      .slice(0, limite);
  }

  async buscar(termo: string): Promise<Eletroposto[]> {
    const t = termo.toLowerCase().trim();
    if (!t) return this.listar();
    return eletropostosMock.filter(
      (e) =>
        e.nome.toLowerCase().includes(t) ||
        e.endereco.toLowerCase().includes(t) ||
        e.cidade.toLowerCase().includes(t),
    );
  }
}

export class MockUsuarioRepository implements UsuarioRepository {
  async obterAtual(): Promise<Usuario> {
    return usuarioMock;
  }
}

export class MockVeiculoRepository implements VeiculoRepository {
  async listarPorUsuario(usuarioId: string): Promise<Veiculo[]> {
    return veiculosMock.filter((v) => v.usuarioId === usuarioId);
  }

  async obterAtivo(usuarioId: string): Promise<Veiculo | null> {
    return veiculosMock.find((v) => v.usuarioId === usuarioId && v.ativo) ?? null;
  }
}

export class MockAvaliacaoRepository implements AvaliacaoRepository {
  async listarPorEletroposto(eletropostoId: string, limite = 3): Promise<Avaliacao[]> {
    const especificas = avaliacoesMock.filter((a) => a.eletropostoId === eletropostoId);
    if (especificas.length > 0) return especificas.slice(0, limite);

    return avaliacoesMock.slice(0, limite).map((a) => ({ ...a, eletropostoId }));
  }
}

export class MockFavoritoRepository implements FavoritoRepository {
  async listarPorUsuario(usuarioId: string): Promise<Favorito[]> {
    return favoritosStore.filter((f) => f.usuarioId === usuarioId);
  }

  async adicionar(usuarioId: string, eletropostoId: string): Promise<Favorito> {
    const existente = favoritosStore.find(
      (f) => f.usuarioId === usuarioId && f.eletropostoId === eletropostoId,
    );
    if (existente) return existente;

    const novo: Favorito = {
      id: `fav-${Date.now()}`,
      usuarioId,
      eletropostoId,
    };
    favoritosStore.push(novo);
    return novo;
  }

  async remover(usuarioId: string, eletropostoId: string): Promise<void> {
    favoritosStore = favoritosStore.filter(
      (f) => !(f.usuarioId === usuarioId && f.eletropostoId === eletropostoId),
    );
  }

  async verificar(usuarioId: string, eletropostoId: string): Promise<boolean> {
    return favoritosStore.some(
      (f) => f.usuarioId === usuarioId && f.eletropostoId === eletropostoId,
    );
  }
}

export class MockRotaRepository implements RotaRepository {
  async obterUltima(usuarioId: string): Promise<Rota | null> {
    return rotaMock.usuarioId === usuarioId ? rotaMock : null;
  }
}

export const eletropostoRepository = new MockEletropostoRepository();
export const usuarioRepository = new MockUsuarioRepository();
export const veiculoRepository = new MockVeiculoRepository();
export const avaliacaoRepository = new MockAvaliacaoRepository();
export const favoritoRepository = new MockFavoritoRepository();
export const rotaRepository = new MockRotaRepository();
