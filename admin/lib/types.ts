export type AdminRole = 'user' | 'admin';
export type NivelCompatibilidade = 'compativel' | 'parcial' | 'incompativel';
export type NivelSeguranca = 'seguro' | 'moderado' | 'atencao';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar: string | null;
  reputacao: number;
  criado_em: string;
  role: AdminRole;
}

export interface Conector {
  tipo: string;
  potenciaKw: number;
  quantidade: number;
}

export interface Station {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  nota: number;
  quantidade_avaliacoes: number;
  pontuacao_seguranca: number;
  descricao_seguranca: string;
  tempo_fila_minutos: number;
  tempo_carga_minutos: number;
  pontuacao_compatibilidade: number;
  pontuacao_recomendacao: number;
  nivel_compatibilidade: NivelCompatibilidade;
  nivel_seguranca: NivelSeguranca;
  tem_comida: boolean;
  tem_banheiro: boolean;
  tem_estacionamento: boolean;
  aberto_agora: boolean;
  horario_funcionamento: string;
  horario_menor_movimento: string;
  carregadores_disponiveis: number;
  carregadores_total: number;
  conectores: Conector[];
  imagem_url: string;
}

export interface Review {
  id: string;
  station_id: string;
  user_id: string;
  nome_usuario: string;
  nota: number;
  comentario: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidade_bateria: number;
  autonomia_km: number;
  tipos_conector: string[];
  potencia_maxima_carregamento: number;
  ativo: boolean;
}

export interface StationInput {
  id?: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  pontuacao_seguranca: number;
  descricao_seguranca: string;
  tempo_fila_minutos: number;
  tempo_carga_minutos: number;
  pontuacao_compatibilidade: number;
  pontuacao_recomendacao: number;
  nivel_compatibilidade: NivelCompatibilidade;
  nivel_seguranca: NivelSeguranca;
  tem_comida: boolean;
  tem_banheiro: boolean;
  tem_estacionamento: boolean;
  aberto_agora: boolean;
  horario_funcionamento: string;
  horario_menor_movimento: string;
  carregadores_disponiveis: number;
  carregadores_total: number;
  conectores: Conector[];
  imagem_url: string;
}
