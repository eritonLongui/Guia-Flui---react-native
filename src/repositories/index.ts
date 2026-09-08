import { isMockModeEnabled } from '@/repositories/dataSource';
import type {
  AvaliacaoRepository,
  EletropostoRepository,
  FavoritoRepository,
  UsuarioRepository,
  VeiculoRepository,
} from '@/repositories/interfaces';
import * as mock from '@/repositories/mockRepositories';
import * as remote from '@/repositories/supabaseRepositories';

function eletroposto(): EletropostoRepository {
  return isMockModeEnabled() ? mock.eletropostoRepository : remote.eletropostoRepository;
}

function usuario(): UsuarioRepository {
  return isMockModeEnabled() ? mock.usuarioRepository : remote.usuarioRepository;
}

function veiculo(): VeiculoRepository {
  return isMockModeEnabled() ? mock.veiculoRepository : remote.veiculoRepository;
}

function avaliacao(): AvaliacaoRepository {
  return isMockModeEnabled() ? mock.avaliacaoRepository : remote.avaliacaoRepository;
}

function favorito(): FavoritoRepository {
  return isMockModeEnabled() ? mock.favoritoRepository : remote.favoritoRepository;
}

export const eletropostoRepository: EletropostoRepository = {
  listar: (...args) => eletroposto().listar(...args),
  buscarPorId: (...args) => eletroposto().buscarPorId(...args),
  listarProximos: (...args) => eletroposto().listarProximos(...args),
  listarRecomendados: (...args) => eletroposto().listarRecomendados(...args),
  buscar: (...args) => eletroposto().buscar(...args),
};

export const usuarioRepository: UsuarioRepository = {
  obterAtual: (...args) => usuario().obterAtual(...args),
  obterLocalizacaoAtual: (...args) => usuario().obterLocalizacaoAtual(...args),
  atualizarPerfil: (...args) => usuario().atualizarPerfil(...args),
};

export const veiculoRepository: VeiculoRepository = {
  listarPorUsuario: (...args) => veiculo().listarPorUsuario(...args),
  obterAtivo: (...args) => veiculo().obterAtivo(...args),
  salvar: (...args) => veiculo().salvar(...args),
};

export const avaliacaoRepository: AvaliacaoRepository = {
  listarPorEletroposto: (...args) => avaliacao().listarPorEletroposto(...args),
  obterDoUsuario: (...args) => avaliacao().obterDoUsuario(...args),
  criar: (...args) => avaliacao().criar(...args),
  atualizar: (...args) => avaliacao().atualizar(...args),
};

export const favoritoRepository: FavoritoRepository = {
  listarPorUsuario: (...args) => favorito().listarPorUsuario(...args),
  adicionar: (...args) => favorito().adicionar(...args),
  remover: (...args) => favorito().remover(...args),
  verificar: (...args) => favorito().verificar(...args),
};
