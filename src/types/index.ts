export type NivelCompatibilidade = 'compativel' | 'parcial' | 'incompativel';
export type NivelSeguranca = 'seguro' | 'moderado' | 'atencao';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  reputacao: number;
  criadoEm: string;
}

export interface Localizacao {
  endereco: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export interface Veiculo {
  id: string;
  usuarioId: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidadeBateria: number;
  autonomiaKm: number;
  tiposConector: string[];
  potenciaMaximaCarregamento: number;
  ativo: boolean;
}

export interface Conector {
  tipo: string;
  potenciaKw: number;
  quantidade: number;
}

export interface Eletroposto {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  nota: number;
  quantidadeAvaliacoes: number;
  pontuacaoSeguranca: number;
  descricaoSeguranca: string;
  tempoFilaMinutos: number;
  tempoCargaMinutos: number;
  pontuacaoCompatibilidade: number;
  pontuacaoRecomendacao: number;
  nivelCompatibilidade: NivelCompatibilidade;
  nivelSeguranca: NivelSeguranca;
  temComida: boolean;
  temBanheiro: boolean;
  temEstacionamento: boolean;
  abertoAgora: boolean;
  horarioFuncionamento: string;
  /** Faixas em que o ponto costuma ter menos movimento (simulado). */
  horarioMenorMovimento: string;
  carregadoresDisponiveis: number;
  carregadoresTotal: number;
  conectores: Conector[];
  imagemUrl: string;
  distanciaKm?: number;
}

export interface Avaliacao {
  id: string;
  eletropostoId: string;
  usuarioId: string;
  nomeUsuario: string;
  nota: number;
  comentario: string;
  criadoEm: string;
}

export interface Favorito {
  id: string;
  usuarioId: string;
  eletropostoId: string;
}

export interface EletropostoComDistancia extends Eletroposto {
  distanciaKm: number;
}
