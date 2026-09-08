import {
  avaliacoesMock,
  eletropostosMock,
  favoritosMock,
  localizacaoUsuarioMock,
  usuarioMock,
  veiculosMock,
} from '@/data/mock';
import type {
  AtualizarAvaliacaoInput,
  AvaliacaoRepository,
  EletropostoRepository,
  FavoritoRepository,
  NovaAvaliacaoInput,
  UsuarioRepository,
  VeiculoRepository,
} from '@/repositories/interfaces';
import type { Avaliacao, Eletroposto, Favorito, Localizacao, Usuario, Veiculo } from '@/types';
import { calcularDistanciaKm } from '@/lib/formatadores';

let favoritosStore = [...favoritosMock];
let avaliacoesStore = [...avaliacoesMock];
let veiculosStore = veiculosMock.map((v) => ({ ...v }));
let usuarioStore: Usuario = { ...usuarioMock };

function comDistanciaDoUsuario(eletropostos: Eletroposto[]): Eletroposto[] {
  const { latitude, longitude } = localizacaoUsuarioMock;
  return eletropostos
    .map((ep) => ({
      ...ep,
      distanciaKm: Math.round(calcularDistanciaKm(latitude, longitude, ep.latitude, ep.longitude) * 10) / 10,
    }))
    .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
}

export class MockEletropostoRepository implements EletropostoRepository {
  async listar(): Promise<Eletroposto[]> {
    return comDistanciaDoUsuario([...eletropostosMock]);
  }

  async buscarPorId(id: string): Promise<Eletroposto | null> {
    const ep = eletropostosMock.find((e) => e.id === id) ?? null;
    if (!ep) return null;
    return comDistanciaDoUsuario([ep])[0];
  }

  async listarProximos(limite: number): Promise<Eletroposto[]> {
    return comDistanciaDoUsuario([...eletropostosMock]).slice(0, limite);
  }

  async listarRecomendados(limite: number): Promise<Eletroposto[]> {
    return [...eletropostosMock]
      .sort((a, b) => b.pontuacaoRecomendacao - a.pontuacaoRecomendacao)
      .slice(0, limite);
  }

  async buscar(termo: string): Promise<Eletroposto[]> {
    const t = termo.toLowerCase().trim();
    if (!t) return this.listar();
    return comDistanciaDoUsuario(
      eletropostosMock.filter(
        (e) =>
          e.nome.toLowerCase().includes(t) ||
          e.endereco.toLowerCase().includes(t) ||
          e.cidade.toLowerCase().includes(t),
      ),
    );
  }
}

export class MockUsuarioRepository implements UsuarioRepository {
  async obterAtual(): Promise<Usuario | null> {
    return { ...usuarioStore };
  }

  async obterLocalizacaoAtual(): Promise<Localizacao> {
    return localizacaoUsuarioMock;
  }

  async atualizarPerfil(input: { nome: string }): Promise<Usuario> {
    const nome = input.nome.trim();
    if (!nome) throw new Error('Informe um nome.');
    usuarioStore = { ...usuarioStore, nome };
    return { ...usuarioStore };
  }
}

export class MockVeiculoRepository implements VeiculoRepository {
  async listarPorUsuario(usuarioId: string): Promise<Veiculo[]> {
    return veiculosStore.filter((v) => v.usuarioId === usuarioId).map((v) => ({ ...v }));
  }

  async obterAtivo(usuarioId: string): Promise<Veiculo | null> {
    const ativo = veiculosStore.find((v) => v.usuarioId === usuarioId && v.ativo) ?? null;
    return ativo ? { ...ativo } : null;
  }

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    const salvo: Veiculo = { ...veiculo, ativo: true };
    const index = veiculosStore.findIndex((v) => v.id === salvo.id);
    if (index >= 0) {
      veiculosStore = veiculosStore.map((v, i) =>
        i === index ? salvo : { ...v, ativo: v.usuarioId === salvo.usuarioId ? false : v.ativo },
      );
    } else {
      veiculosStore = [
        ...veiculosStore.map((v) =>
          v.usuarioId === salvo.usuarioId ? { ...v, ativo: false } : v,
        ),
        salvo,
      ];
    }
    return { ...salvo };
  }
}

export class MockAvaliacaoRepository implements AvaliacaoRepository {
  async listarPorEletroposto(eletropostoId: string, limite = 20): Promise<Avaliacao[]> {
    return avaliacoesStore
      .filter((a) => a.eletropostoId === eletropostoId)
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
      .slice(0, limite);
  }

  async obterDoUsuario(eletropostoId: string, usuarioId: string): Promise<Avaliacao | null> {
    return (
      avaliacoesStore.find((a) => a.eletropostoId === eletropostoId && a.usuarioId === usuarioId) ??
      null
    );
  }

  async criar(input: NovaAvaliacaoInput): Promise<Avaliacao> {
    const existente = await this.obterDoUsuario(input.eletropostoId, input.usuarioId);
    if (existente) {
      return this.atualizar(existente.id, { nota: input.nota, comentario: input.comentario });
    }

    const nova: Avaliacao = {
      id: `av-${Date.now()}`,
      eletropostoId: input.eletropostoId,
      usuarioId: input.usuarioId,
      nomeUsuario: input.nomeUsuario,
      nota: input.nota,
      comentario: input.comentario,
      criadoEm: new Date().toISOString(),
    };
    avaliacoesStore = [nova, ...avaliacoesStore];
    return nova;
  }

  async atualizar(id: string, input: AtualizarAvaliacaoInput): Promise<Avaliacao> {
    const atual = avaliacoesStore.find((a) => a.id === id);
    if (!atual) {
      throw new Error('Avaliação não encontrada');
    }

    const atualizada: Avaliacao = {
      ...atual,
      nota: input.nota,
      comentario: input.comentario,
    };
    avaliacoesStore = avaliacoesStore.map((a) => (a.id === id ? atualizada : a));
    return atualizada;
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

export const eletropostoRepository = new MockEletropostoRepository();
export const usuarioRepository = new MockUsuarioRepository();
export const veiculoRepository = new MockVeiculoRepository();
export const avaliacaoRepository = new MockAvaliacaoRepository();
export const favoritoRepository = new MockFavoritoRepository();
