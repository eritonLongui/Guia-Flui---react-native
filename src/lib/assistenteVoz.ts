import type { AudioGravado } from '@/lib/gravacaoVoz';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Eletroposto, Veiculo } from '@/types';

export type TipoAcaoAssistente = 'destacar_ponto' | 'abrir_rota' | 'abrir_detalhe';

export interface AcaoAssistente {
  tipo: TipoAcaoAssistente;
  id: string;
}

export interface MensagemAssistente {
  papel: 'usuario' | 'assistente';
  texto: string;
}

export interface EstacaoAssistente {
  id: string;
  nome: string;
  cidade: string;
  distanciaKm?: number;
  nota: number;
  abertoAgora: boolean;
  conectores: { tipo: string; potenciaKw: number; quantidade: number }[];
  carregadoresDisponiveis: number;
  carregadoresTotal: number;
  temComida: boolean;
  temBanheiro: boolean;
  temEstacionamento: boolean;
  nivelCompatibilidade: string;
  tempoFilaMinutos: number;
  tempoCargaMinutos: number;
  horarioFuncionamento: string;
}

export interface RespostaAssistente {
  /** O que a Edge Function entendeu do áudio. Fica só no histórico, não na tela. */
  transcricao: string;
  texto: string;
  acoes: AcaoAssistente[];
  /** MP3 gerado no servidor (português do Brasil). Ausente se a síntese falhar. */
  audioBase64: string | null;
}

const MAX_ESTACOES = 8;
const MAX_MENSAGENS = 8;

export function compactarEstacao(ep: Eletroposto): EstacaoAssistente {
  return {
    id: ep.id,
    nome: ep.nome,
    cidade: ep.cidade,
    distanciaKm: ep.distanciaKm,
    nota: ep.nota,
    abertoAgora: ep.abertoAgora,
    conectores: ep.conectores.map((c) => ({
      tipo: c.tipo,
      potenciaKw: c.potenciaKw,
      quantidade: c.quantidade,
    })),
    carregadoresDisponiveis: ep.carregadoresDisponiveis,
    carregadoresTotal: ep.carregadoresTotal,
    temComida: ep.temComida,
    temBanheiro: ep.temBanheiro,
    temEstacionamento: ep.temEstacionamento,
    nivelCompatibilidade: ep.nivelCompatibilidade,
    tempoFilaMinutos: ep.tempoFilaMinutos,
    tempoCargaMinutos: ep.tempoCargaMinutos,
    horarioFuncionamento: ep.horarioFuncionamento,
  };
}

function compactarVeiculo(veiculo: Veiculo | null) {
  if (!veiculo) return null;
  return {
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    autonomiaKm: veiculo.autonomiaKm,
    tiposConector: veiculo.tiposConector,
    potenciaMaximaCarregamento: veiculo.potenciaMaximaCarregamento,
  };
}

export async function perguntarAssistenteVoz(params: {
  mensagens: MensagemAssistente[];
  eletropostos: Eletroposto[];
  veiculo: Veiculo | null;
  /** Quando presente, o servidor transcreve e usa como último turno do usuário. */
  audio?: AudioGravado | null;
}): Promise<RespostaAssistente> {
  if (!isSupabaseConfigured) {
    throw new Error('Configure o Supabase para usar o assistente.');
  }

  const { data, error } = await supabase.functions.invoke('assistente-voz', {
    body: {
      mensagens: params.mensagens.slice(-MAX_MENSAGENS),
      audio: params.audio ?? null,
      estacoes: params.eletropostos.slice(0, MAX_ESTACOES).map(compactarEstacao),
      veiculo: compactarVeiculo(params.veiculo),
    },
  });

  if (error) {
    let mensagem = error.message || 'Não consegui falar com o assistente.';
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const payload = (await response.json()) as { erro?: string };
        if (payload.erro) mensagem = payload.erro;
      } catch {
        /* mantém a mensagem genérica */
      }
    }
    throw new Error(mensagem);
  }

  const payload = data as {
    transcricao?: string;
    texto?: string;
    acoes?: AcaoAssistente[];
    audioBase64?: string | null;
    erro?: string;
  } | null;
  if (!payload || payload.erro) {
    throw new Error(payload?.erro || 'Resposta inválida do assistente.');
  }

  return {
    transcricao: payload.transcricao?.trim() ?? '',
    texto: payload.texto?.trim() || 'Posso falar de recarga, carro elétrico ou eletropostos. O que você precisa?',
    acoes: Array.isArray(payload.acoes) ? payload.acoes : [],
    audioBase64: payload.audioBase64?.trim() || null,
  };
}
