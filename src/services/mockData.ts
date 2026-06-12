import { Eletroposto, Veiculo } from '../models/types';

// Mock de eletropostos no Brasil (Seção 23 e 10 do PDA)
export const MOCK_ELETROPOSTOS: Eletroposto[] = [
  {
    id: 'post-1',
    nome: 'Flui Hub Solar - Pinheiros',
    endereco: 'Av. Brigadeiro Faria Lima, 1000 - Pinheiros, São Paulo - SP',
    coordenadas: {
      latitude: -23.5616,
      longitude: -46.6913,
    },
    cidade: 'São Paulo',
    estado: 'SP',
    tipo: 'rápido',
    conectores: [
      { tipo: 'CCS2', potenciaKw: 150, quantidade: 4, disponiveis: 3 },
      { tipo: 'Tipo 2', potenciaKw: 22, quantidade: 2, disponiveis: 2 },
    ],
    potenciaTotalKw: 644,
    seguranca: {
      notaGeral: 4.8,
      iluminacao: true,
      movimentacao: true,
      vigilancia: true,
      estacionamentoPrivado: true,
    },
    conveniencias: {
      comida: true,
      banheiro: true,
      acessibilidade: true,
      wiFi: true,
    },
    filaMediaMinutos: 5,
    tempoMedioCargaMinutos: 25,
    precoPorKwh: 1.95,
    horarioFuncionamento: '24h',
    notaGeralPonderada: 4.7,
    avaliacoes: [],
    fotos: [],
    status: 'ativo',
  },
  {
    id: 'post-2',
    nome: 'Eletroposto Rodovia dos Bandeirantes KM 125',
    endereco: 'Rodovia dos Bandeirantes, KM 125 - Santa Bárbara d\'Oeste - SP',
    coordenadas: {
      latitude: -22.7562,
      longitude: -47.4148,
    },
    cidade: 'Santa Bárbara d\'Oeste',
    estado: 'SP',
    tipo: 'rápido',
    conectores: [
      { tipo: 'CCS2', potenciaKw: 350, quantidade: 2, disponiveis: 1 },
      { tipo: 'CHAdeMO', potenciaKw: 50, quantidade: 1, disponiveis: 0 },
    ],
    potenciaTotalKw: 750,
    seguranca: {
      notaGeral: 4.2,
      iluminacao: true,
      movimentacao: false,
      vigilancia: true,
      estacionamentoPrivado: false,
    },
    conveniencias: {
      comida: true,
      banheiro: true,
      acessibilidade: true,
      wiFi: false,
    },
    filaMediaMinutos: 15,
    tempoMedioCargaMinutos: 35,
    precoPorKwh: 2.20,
    horarioFuncionamento: '06:00 - 22:00',
    notaGeralPonderada: 4.1,
    avaliacoes: [],
    fotos: [],
    status: 'ativo',
  }
];

// Mock de veículos para testes (Seção 13.4 e 26)
export const MOCK_VEICULOS: Veiculo[] = [
  {
    id: 'car-1',
    usuarioId: 'user-1',
    marca: 'BYD',
    modelo: 'Dolphin',
    ano: 2023,
    bateriaCapacidadeKwh: 44.9,
    autonomiaKm: 291,
    conectores: ['CCS2', 'Tipo 2'],
    potenciaMaximaKwd: 60,
  },
  {
    id: 'car-2',
    usuarioId: 'user-1',
    marca: 'Volvo',
    modelo: 'XC40 Recharge',
    ano: 2022,
    bateriaCapacidadeKwh: 78,
    autonomiaKm: 418,
    conectores: ['CCS2', 'Tipo 2'],
    potenciaMaximaKwd: 150,
  }
];
