import type { Avaliacao, Eletroposto, Favorito, Localizacao, Usuario, Veiculo } from '@/types';

export interface EletropostoRepository {
  listar(): Promise<Eletroposto[]>;
  buscarPorId(id: string): Promise<Eletroposto | null>;
  listarProximos(limite: number): Promise<Eletroposto[]>;
  listarRecomendados(limite: number): Promise<Eletroposto[]>;
  buscar(termo: string): Promise<Eletroposto[]>;
}

export interface UsuarioRepository {
  obterAtual(): Promise<Usuario | null>;
  obterLocalizacaoAtual(): Promise<Localizacao>;
  atualizarPerfil(input: { nome: string }): Promise<Usuario>;
}

export interface VeiculoRepository {
  listarPorUsuario(usuarioId: string): Promise<Veiculo[]>;
  obterAtivo(usuarioId: string): Promise<Veiculo | null>;
  salvar(veiculo: Veiculo): Promise<Veiculo>;
}

export interface NovaAvaliacaoInput {
  eletropostoId: string;
  usuarioId: string;
  nomeUsuario: string;
  nota: number;
  comentario: string;
}

export interface AtualizarAvaliacaoInput {
  nota: number;
  comentario: string;
}

export interface AvaliacaoRepository {
  listarPorEletroposto(eletropostoId: string, limite?: number): Promise<Avaliacao[]>;
  listarPorUsuario(usuarioId: string, limite?: number): Promise<Avaliacao[]>;
  obterDoUsuario(eletropostoId: string, usuarioId: string): Promise<Avaliacao | null>;
  criar(input: NovaAvaliacaoInput): Promise<Avaliacao>;
  atualizar(id: string, input: AtualizarAvaliacaoInput): Promise<Avaliacao>;
}

export interface FavoritoRepository {
  listarPorUsuario(usuarioId: string): Promise<Favorito[]>;
  adicionar(usuarioId: string, eletropostoId: string): Promise<Favorito>;
  remover(usuarioId: string, eletropostoId: string): Promise<void>;
  verificar(usuarioId: string, eletropostoId: string): Promise<boolean>;
}
