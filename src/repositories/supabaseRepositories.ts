import { veiculosMock } from '@/data/mock';
import { obterLocalizacaoUsuario } from '@/lib/localizacao';
import {
  mapFavorite,
  mapProfile,
  mapReview,
  mapStation,
  mapVehicle,
  type FavoriteRow,
  type ProfileRow,
  type ReviewRow,
  type StationRow,
  type VehicleRow,
} from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
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

function assertOk<T>(error: { message: string } | null, data: T | null, fallbackMessage: string): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error(fallbackMessage);
  return data;
}

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function stationsComDistancia(rows: StationRow[]): Promise<Eletroposto[]> {
  const origem = await obterLocalizacaoUsuario();
  return rows
    .map((row) => mapStation(row, origem))
    .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));
}

export class SupabaseEletropostoRepository implements EletropostoRepository {
  async listar(): Promise<Eletroposto[]> {
    const { data, error } = await supabase.from('stations').select('*');
    const rows = assertOk<StationRow[]>(error, data, 'Não foi possível carregar eletropostos');
    return stationsComDistancia(rows);
  }

  async buscarPorId(id: string): Promise<Eletroposto | null> {
    const { data, error } = await supabase.from('stations').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const [mapeado] = await stationsComDistancia([data as StationRow]);
    return mapeado;
  }

  async listarProximos(limite: number): Promise<Eletroposto[]> {
    const todos = await this.listar();
    return todos.slice(0, limite);
  }

  async listarRecomendados(limite: number): Promise<Eletroposto[]> {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('pontuacao_recomendacao', { ascending: false })
      .limit(limite);
    const rows = assertOk<StationRow[]>(error, data, 'Não foi possível carregar recomendações');
    return stationsComDistancia(rows);
  }

  async buscar(termo: string): Promise<Eletroposto[]> {
    const t = termo.toLowerCase().trim();
    if (!t) return this.listar();

    const safe = t.replace(/[%_,()]/g, ' ').trim();
    if (!safe) return this.listar();

    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .or(`nome.ilike.%${safe}%,endereco.ilike.%${safe}%,cidade.ilike.%${safe}%`);
    const rows = assertOk<StationRow[]>(error, data, 'Não foi possível buscar eletropostos');
    return stationsComDistancia(rows);
  }
}

export class SupabaseUsuarioRepository implements UsuarioRepository {
  async obterAtual(): Promise<Usuario | null> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return mapProfile(data as ProfileRow);

    const nome =
      (user.user_metadata?.nome as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split('@')[0] ||
      'Motorista';

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        nome,
        email: user.email ?? '',
      })
      .select('*')
      .single();

    if (insertError) {
      return {
        id: user.id,
        nome,
        email: user.email ?? '',
        reputacao: 0,
        criadoEm: user.created_at,
      };
    }

    return mapProfile(created as ProfileRow);
  }

  async obterLocalizacaoAtual(): Promise<Localizacao> {
    return obterLocalizacaoUsuario();
  }

  async atualizarPerfil(input: { nome: string }): Promise<Usuario> {
    const nome = input.nome.trim();
    if (!nome) throw new Error('Informe um nome.');

    const atual = await this.obterAtual();
    if (!atual) throw new Error('Faça login para editar o perfil.');

    const { error: metaError } = await supabase.auth.updateUser({
      data: { nome },
    });
    if (metaError) throw new Error(metaError.message);

    const { data, error } = await supabase
      .from('profiles')
      .update({ nome })
      .eq('id', atual.id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return mapProfile(data as ProfileRow);

    return { ...atual, nome };
  }
}

export class SupabaseVeiculoRepository implements VeiculoRepository {
  async listarPorUsuario(usuarioId: string): Promise<Veiculo[]> {
    const { data, error } = await supabase.from('vehicles').select('*').eq('user_id', usuarioId);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as VehicleRow[];
    if (rows.length > 0) return rows.map(mapVehicle);
    return veiculosMock.map((v) => ({ ...v, usuarioId }));
  }

  async obterAtivo(usuarioId: string): Promise<Veiculo | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', usuarioId)
      .eq('ativo', true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return mapVehicle(data as VehicleRow);

    const fallback = veiculosMock.find((v) => v.ativo) ?? veiculosMock[0];
    return fallback ? { ...fallback, usuarioId } : null;
  }

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    const payload = {
      user_id: veiculo.usuarioId,
      marca: veiculo.marca.trim(),
      modelo: veiculo.modelo.trim(),
      ano: veiculo.ano,
      capacidade_bateria: veiculo.capacidadeBateria,
      autonomia_km: veiculo.autonomiaKm,
      tipos_conector: veiculo.tiposConector,
      potencia_maxima_carregamento: veiculo.potenciaMaximaCarregamento,
      ativo: true,
    };

    await supabase.from('vehicles').update({ ativo: false }).eq('user_id', veiculo.usuarioId);

    const usaIdExistente = isUuid(veiculo.id);
    const { data, error } = usaIdExistente
      ? await supabase
          .from('vehicles')
          .upsert({ id: veiculo.id, ...payload })
          .select('*')
          .single()
      : await supabase.from('vehicles').insert(payload).select('*').single();

    if (error) throw new Error(error.message);
    return mapVehicle(data as VehicleRow);
  }
}

export class SupabaseAvaliacaoRepository implements AvaliacaoRepository {
  async listarPorEletroposto(eletropostoId: string, limite = 20): Promise<Avaliacao[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', eletropostoId)
      .order('criado_em', { ascending: false })
      .limit(limite);
    const rows = assertOk<ReviewRow[]>(error, data, 'Não foi possível carregar avaliações');
    return rows.map(mapReview);
  }

  async listarPorUsuario(usuarioId: string, limite = 50): Promise<Avaliacao[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', usuarioId)
      .order('criado_em', { ascending: false })
      .limit(limite);
    const rows = assertOk<ReviewRow[]>(error, data, 'Não foi possível carregar avaliações');
    return rows.map(mapReview);
  }

  async obterDoUsuario(eletropostoId: string, usuarioId: string): Promise<Avaliacao | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', eletropostoId)
      .eq('user_id', usuarioId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapReview(data as ReviewRow) : null;
  }

  async criar(input: NovaAvaliacaoInput): Promise<Avaliacao> {
    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        {
          station_id: input.eletropostoId,
          user_id: input.usuarioId,
          nome_usuario: input.nomeUsuario,
          nota: input.nota,
          comentario: input.comentario,
        },
        { onConflict: 'user_id,station_id' },
      )
      .select('*')
      .single();
    const row = assertOk<ReviewRow>(error, data, 'Não foi possível salvar a avaliação');
    return mapReview(row);
  }

  async atualizar(id: string, input: AtualizarAvaliacaoInput): Promise<Avaliacao> {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        nota: input.nota,
        comentario: input.comentario,
      })
      .eq('id', id)
      .select('*')
      .single();
    const row = assertOk<ReviewRow>(error, data, 'Não foi possível atualizar a avaliação');
    return mapReview(row);
  }
}

export class SupabaseFavoritoRepository implements FavoritoRepository {
  async listarPorUsuario(usuarioId: string): Promise<Favorito[]> {
    const { data, error } = await supabase.from('favorites').select('*').eq('user_id', usuarioId);
    const rows = assertOk<FavoriteRow[]>(error, data, 'Não foi possível carregar favoritos');
    return rows.map(mapFavorite);
  }

  async adicionar(usuarioId: string, eletropostoId: string): Promise<Favorito> {
    const { data, error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: usuarioId, station_id: eletropostoId },
        { onConflict: 'user_id,station_id' },
      )
      .select('*')
      .single();
    const row = assertOk<FavoriteRow>(error, data, 'Não foi possível salvar o favorito');
    return mapFavorite(row);
  }

  async remover(usuarioId: string, eletropostoId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', usuarioId)
      .eq('station_id', eletropostoId);
    if (error) throw new Error(error.message);
  }

  async verificar(usuarioId: string, eletropostoId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', usuarioId)
      .eq('station_id', eletropostoId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }
}

export const eletropostoRepository = new SupabaseEletropostoRepository();
export const usuarioRepository = new SupabaseUsuarioRepository();
export const veiculoRepository = new SupabaseVeiculoRepository();
export const avaliacaoRepository = new SupabaseAvaliacaoRepository();
export const favoritoRepository = new SupabaseFavoritoRepository();
