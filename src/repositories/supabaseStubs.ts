import type {
  Avaliacao,
  Eletroposto,
  Favorito,
  Localizacao,
  Rota,
  Usuario,
  Veiculo,
} from '@/types';
import type {
  AvaliacaoRepository,
  EletropostoRepository,
  FavoritoRepository,
  RotaRepository,
  UsuarioRepository,
  VeiculoRepository,
} from '@/repositories/interfaces';

function naoConfigurado(): never {
  throw new Error('Supabase não configurado');
}

/** Stubs para futura integração Supabase — sem implementação no MVP */
export class SupabaseEletropostoRepository implements EletropostoRepository {
  listar(): Promise<Eletroposto[]> {
    return Promise.reject(naoConfigurado());
  }
  buscarPorId(_id: string): Promise<Eletroposto | null> {
    return Promise.reject(naoConfigurado());
  }
  listarProximos(_limite: number): Promise<Eletroposto[]> {
    return Promise.reject(naoConfigurado());
  }
  listarRecomendados(_limite: number): Promise<Eletroposto[]> {
    return Promise.reject(naoConfigurado());
  }
  buscar(_termo: string): Promise<Eletroposto[]> {
    return Promise.reject(naoConfigurado());
  }
}

export class SupabaseUsuarioRepository implements UsuarioRepository {
  obterAtual(): Promise<Usuario> {
    return Promise.reject(naoConfigurado());
  }
  obterLocalizacaoAtual(): Promise<Localizacao> {
    return Promise.reject(naoConfigurado());
  }
}

export class SupabaseVeiculoRepository implements VeiculoRepository {
  listarPorUsuario(_usuarioId: string): Promise<Veiculo[]> {
    return Promise.reject(naoConfigurado());
  }
  obterAtivo(_usuarioId: string): Promise<Veiculo | null> {
    return Promise.reject(naoConfigurado());
  }
}

export class SupabaseAvaliacaoRepository implements AvaliacaoRepository {
  listarPorEletroposto(_eletropostoId: string, _limite?: number): Promise<Avaliacao[]> {
    return Promise.reject(naoConfigurado());
  }
}

export class SupabaseFavoritoRepository implements FavoritoRepository {
  listarPorUsuario(_usuarioId: string): Promise<Favorito[]> {
    return Promise.reject(naoConfigurado());
  }
  adicionar(_usuarioId: string, _eletropostoId: string): Promise<Favorito> {
    return Promise.reject(naoConfigurado());
  }
  remover(_usuarioId: string, _eletropostoId: string): Promise<void> {
    return Promise.reject(naoConfigurado());
  }
  verificar(_usuarioId: string, _eletropostoId: string): Promise<boolean> {
    return Promise.reject(naoConfigurado());
  }
}

export class SupabaseRotaRepository implements RotaRepository {
  obterUltima(_usuarioId: string): Promise<Rota | null> {
    return Promise.reject(naoConfigurado());
  }
}
