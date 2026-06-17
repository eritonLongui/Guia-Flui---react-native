import type { Avaliacao, Eletroposto, Favorito, Localizacao, Rota, Usuario, Veiculo } from '@/types';

export interface EletropostoRepository {
  listar(): Promise<Eletroposto[]>;
  buscarPorId(id: string): Promise<Eletroposto | null>;
  listarProximos(limite: number): Promise<Eletroposto[]>;
  listarRecomendados(limite: number): Promise<Eletroposto[]>;
  buscar(termo: string): Promise<Eletroposto[]>;
}

export interface UsuarioRepository {
  obterAtual(): Promise<Usuario>;
  obterLocalizacaoAtual(): Promise<Localizacao>;
}

export interface VeiculoRepository {
  listarPorUsuario(usuarioId: string): Promise<Veiculo[]>;
  obterAtivo(usuarioId: string): Promise<Veiculo | null>;
}

export interface AvaliacaoRepository {
  listarPorEletroposto(eletropostoId: string, limite?: number): Promise<Avaliacao[]>;
}

export interface FavoritoRepository {
  listarPorUsuario(usuarioId: string): Promise<Favorito[]>;
  adicionar(usuarioId: string, eletropostoId: string): Promise<Favorito>;
  remover(usuarioId: string, eletropostoId: string): Promise<void>;
  verificar(usuarioId: string, eletropostoId: string): Promise<boolean>;
}

export interface RotaRepository {
  obterUltima(usuarioId: string): Promise<Rota | null>;
}
