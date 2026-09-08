import { calcularDistanciaKm } from '@/lib/formatadores';
import type {
  Avaliacao,
  Conector,
  Eletroposto,
  Favorito,
  Localizacao,
  NivelCompatibilidade,
  NivelSeguranca,
  Usuario,
  Veiculo,
} from '@/types';

export interface StationRow {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  nota: number | string;
  quantidade_avaliacoes: number;
  pontuacao_seguranca: number | string;
  descricao_seguranca: string;
  tempo_fila_minutos: number;
  tempo_carga_minutos: number;
  pontuacao_compatibilidade: number;
  pontuacao_recomendacao: number;
  nivel_compatibilidade: string;
  nivel_seguranca: string;
  tem_comida: boolean;
  tem_banheiro: boolean;
  tem_estacionamento: boolean;
  aberto_agora: boolean;
  horario_funcionamento: string;
  horario_menor_movimento: string;
  carregadores_disponiveis: number;
  carregadores_total: number;
  conectores: Conector[] | string;
  imagem_url: string;
}

export interface ReviewRow {
  id: string;
  station_id: string;
  user_id: string;
  nome_usuario: string;
  nota: number;
  comentario: string;
  criado_em: string;
}

export interface ProfileRow {
  id: string;
  nome: string;
  email: string;
  avatar: string | null;
  reputacao: number | string;
  criado_em: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  station_id: string;
}

export interface VehicleRow {
  id: string;
  user_id: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidade_bateria: number | string;
  autonomia_km: number;
  tipos_conector: string[];
  potencia_maxima_carregamento: number;
  ativo: boolean;
}

function parseConectores(value: StationRow['conectores']): Conector[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as Conector[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapStation(row: StationRow, origem?: Localizacao): Eletroposto {
  const eletroposto: Eletroposto = {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco,
    cidade: row.cidade,
    estado: row.estado,
    latitude: row.latitude,
    longitude: row.longitude,
    nota: Number(row.nota),
    quantidadeAvaliacoes: row.quantidade_avaliacoes,
    pontuacaoSeguranca: Number(row.pontuacao_seguranca),
    descricaoSeguranca: row.descricao_seguranca,
    tempoFilaMinutos: row.tempo_fila_minutos,
    tempoCargaMinutos: row.tempo_carga_minutos,
    pontuacaoCompatibilidade: row.pontuacao_compatibilidade,
    pontuacaoRecomendacao: row.pontuacao_recomendacao,
    nivelCompatibilidade: row.nivel_compatibilidade as NivelCompatibilidade,
    nivelSeguranca: row.nivel_seguranca as NivelSeguranca,
    temComida: row.tem_comida,
    temBanheiro: row.tem_banheiro,
    temEstacionamento: row.tem_estacionamento,
    abertoAgora: row.aberto_agora,
    horarioFuncionamento: row.horario_funcionamento,
    horarioMenorMovimento: row.horario_menor_movimento,
    carregadoresDisponiveis: row.carregadores_disponiveis,
    carregadoresTotal: row.carregadores_total,
    conectores: parseConectores(row.conectores),
    imagemUrl: row.imagem_url,
  };

  if (origem) {
    eletroposto.distanciaKm =
      Math.round(
        calcularDistanciaKm(origem.latitude, origem.longitude, row.latitude, row.longitude) * 10,
      ) / 10;
  }

  return eletroposto;
}

export function mapReview(row: ReviewRow): Avaliacao {
  return {
    id: row.id,
    eletropostoId: row.station_id,
    usuarioId: row.user_id,
    nomeUsuario: row.nome_usuario,
    nota: row.nota,
    comentario: row.comentario,
    criadoEm: row.criado_em,
  };
}

export function mapProfile(row: ProfileRow): Usuario {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    avatar: row.avatar ?? undefined,
    reputacao: Number(row.reputacao),
    criadoEm: row.criado_em,
  };
}

export function mapFavorite(row: FavoriteRow): Favorito {
  return {
    id: row.id,
    usuarioId: row.user_id,
    eletropostoId: row.station_id,
  };
}

export function mapVehicle(row: VehicleRow): Veiculo {
  return {
    id: row.id,
    usuarioId: row.user_id,
    marca: row.marca,
    modelo: row.modelo,
    ano: row.ano,
    capacidadeBateria: Number(row.capacidade_bateria),
    autonomiaKm: row.autonomia_km,
    tiposConector: row.tipos_conector,
    potenciaMaximaCarregamento: row.potencia_maxima_carregamento,
    ativo: row.ativo,
  };
}
