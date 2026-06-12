// Definições de Tipo TypeScript com base na seção 26 do PDA (Estrutura de dados sugerida)

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  localizacao?: string;
  reputacao: number; // Sistema de reputação para evitar abusos (Seção 20)
  veiculos: string[]; // Array de IDs de veículos
  favoritos: {
    eletropostos: string[]; // IDs de eletropostos salvos
    rotas: string[]; // IDs de rotas salvas
  };
  historico: string[]; // IDs de recargas realizadas / rotas percorridas
  preferencias: {
    modoEscuro: boolean;
    modoMockado: boolean; // Toggle de dados mockados (Seção 23)
    idioma: string;
  };
}

export interface Veiculo {
  id: string;
  usuarioId: string;
  marca: string;
  modelo: string;
  ano: number;
  bateriaCapacidadeKwh: number; // capacidade da bateria (Seção 17)
  autonomiaKm: number;
  conectores: string[]; // conectores compatíveis (ex: 'Tipo 2', 'CCS2', 'CHAdeMO')
  potenciaMaximaKwd: number; // potência máxima suportada
  observacoesManuais?: string;
}

export interface Eletroposto {
  id: string;
  nome: string;
  endereco: string;
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  cidade: string;
  estado: string;
  tipo: string; // 'rápido', 'semi-rápido', 'lento'
  conectores: {
    tipo: string;
    potenciaKw: number;
    quantidade: number;
    disponiveis: number;
  }[];
  potenciaTotalKw: number;
  seguranca: {
    notaGeral: number; // Escala 1-5 (Seção 19)
    iluminacao: boolean;
    movimentacao: boolean;
    vigilancia: boolean;
    estacionamentoPrivado: boolean;
  };
  conveniencias: {
    comida: boolean;
    banheiro: boolean;
    acessibilidade: boolean;
    wiFi: boolean;
  };
  filaMediaMinutos: number; // tempo médio de fila (Seção 18)
  tempoMedioCargaMinutos: number; // tempo médio de carga (Seção 17)
  precoPorKwh: number; // preço por kWh ou por sessão (Seção 14)
  horarioFuncionamento: string;
  notaGeralPonderada: number; // Nota geral ponderada (Seção 15)
  avaliacoes: string[]; // IDs de Avaliações
  fotos: string[];
  status: 'ativo' | 'manutencao' | 'inativo';
}

export interface Avaliacao {
  id: string;
  usuarioId: string;
  eletropostoId: string;
  nota: number; // Nota geral da visita
  criterios: {
    compatibilidade: number;
    seguranca: number;
    confiabilidade: number;
    tempoDeFila: number;
    velocidadeRecarga: number;
    conveniencia: number;
    limpeza: number;
    estrutura: number;
    preco: number;
    experienciaGeral: number;
  };
  comentario?: string;
  fotos?: string[];
  data: string;
  usoRecente: boolean; // Se o usuário carregou recentemente (peso maior no algoritmo)
  aprovado: boolean; // Controle de moderação (Seção 21)
  denunciado: boolean;
}

export interface Rota {
  id: string;
  usuarioId: string;
  origem: string;
  destino: string;
  paradasSugeridas: {
    eletropostoId: string;
    tempoRecargaMinutos: number;
    bateriaChegadaPorcentagem: number;
    bateriaSaidaPorcentagem: number;
  }[];
  tempoEstimadoSegundos: number;
  custoEstimadoReais: number;
  distanciaMetros: number;
  status: 'ativa' | 'concluida' | 'cancelada';
}
