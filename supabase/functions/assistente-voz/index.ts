import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIPOS_ACAO = ['destacar_ponto', 'abrir_rota', 'abrir_detalhe'] as const;
type TipoAcao = (typeof TIPOS_ACAO)[number];

interface EstacaoContexto {
  id: string;
  nome: string;
  cidade?: string;
  distanciaKm?: number;
  nota?: number;
  abertoAgora?: boolean;
  conectores?: { tipo: string; potenciaKw: number; quantidade: number }[];
  carregadoresDisponiveis?: number;
  carregadoresTotal?: number;
  temComida?: boolean;
  temBanheiro?: boolean;
  temEstacionamento?: boolean;
  nivelCompatibilidade?: string;
  tempoFilaMinutos?: number;
  tempoCargaMinutos?: number;
  horarioFuncionamento?: string;
}

interface Mensagem {
  papel: 'usuario' | 'assistente';
  texto: string;
}

interface Corpo {
  mensagens?: Mensagem[];
  estacoes?: EstacaoContexto[];
  veiculo?: {
    marca?: string;
    modelo?: string;
    autonomiaKm?: number;
    tiposConector?: string[];
    potenciaMaximaCarregamento?: number;
  } | null;
}

const ferramentas = [
  {
    type: 'function',
    function: {
      name: 'destacar_ponto',
      description:
        'Destaca um eletroposto no mapa e mostra o cartão resumido. Use quando o usuário quiser ver um ponto específico sem sair do mapa.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID do eletroposto' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'abrir_rota',
      description:
        'Abre a tela Seguir Rota até o eletroposto. Use quando o usuário escolher ir até um ponto, seguir rota, navegar ou traçar o caminho.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID do eletroposto' } },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'abrir_detalhe',
      description:
        'Abre a ficha completa do eletroposto. Use quando o usuário pedir mais detalhes, avaliações ou informações do ponto.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string', description: 'ID do eletroposto' } },
        required: ['id'],
      },
    },
  },
];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function idsValidos(estacoes: EstacaoContexto[]): Set<string> {
  return new Set(estacoes.map((e) => e.id).filter(Boolean));
}

function parseAcao(name: string, argsRaw: string, validos: Set<string>): { tipo: TipoAcao; id: string } | null {
  if (!(TIPOS_ACAO as readonly string[]).includes(name)) return null;
  let id = '';
  try {
    const parsed = JSON.parse(argsRaw || '{}') as { id?: string };
    id = typeof parsed.id === 'string' ? parsed.id.trim() : '';
  } catch {
    return null;
  }
  if (!id || !validos.has(id)) return null;
  return { tipo: name as TipoAcao, id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json(405, { erro: 'Método não permitido' });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json(401, { erro: 'Faça login para usar o assistente de voz.' });
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json(503, { erro: 'Assistente indisponível no momento.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnon) {
    return json(500, { erro: 'Configuração do servidor incompleta.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return json(401, { erro: 'Faça login para usar o assistente de voz.' });
  }

  let corpo: Corpo;
  try {
    corpo = (await req.json()) as Corpo;
  } catch {
    return json(400, { erro: 'Pedido inválido.' });
  }

  const estacoes = Array.isArray(corpo.estacoes) ? corpo.estacoes.slice(0, 15) : [];
  const historico = Array.isArray(corpo.mensagens) ? corpo.mensagens.slice(-8) : [];
  const ultima = historico.filter((m) => m.papel === 'usuario').at(-1)?.texto?.trim();
  if (!ultima) {
    return json(400, { erro: 'Não entendi o que você disse.' });
  }

  const validos = idsValidos(estacoes);
  const system = [
    'Você é o Guia, assistente de voz do app Guia Flui, em português do Brasil.',
    'Ajude motoristas de carro elétrico com eletropostos próximos e recarga em geral (conectores, kW, tempo, fila, segurança, conveniências).',
    'Responda em texto curto, falável em voz alta: no máximo 3 frases. Sem markdown, listas longas ou URLs.',
    'Só fale de estações que estão no contexto JSON. Nunca invente nome, distância ou ID.',
    'Se o usuário escolher um ponto para ir, chame abrir_rota com o id. Se quiser só ver no mapa, destacar_ponto. Se pedir ficha, abrir_detalhe.',
    'Se não houver estações no contexto, explique e fale só de recarga em geral.',
    `Estações próximas:\n${JSON.stringify(estacoes)}`,
    corpo.veiculo ? `Veículo do usuário:\n${JSON.stringify(corpo.veiculo)}` : 'Veículo do usuário: não informado.',
  ].join('\n\n');

  const messages = [
    { role: 'system', content: system },
    ...historico.map((m) => ({
      role: m.papel === 'assistente' ? ('assistant' as const) : ('user' as const),
      content: m.texto,
    })),
  ];

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages,
      tools: ferramentas,
      tool_choice: 'auto',
    }),
  });

  if (!openaiRes.ok) {
    const detalhe = await openaiRes.text();
    console.error('openai_error', openaiRes.status, detalhe);
    return json(502, { erro: 'Não consegui responder agora. Tente de novo.' });
  }

  const completion = (await openaiRes.json()) as {
    choices?: {
      message?: {
        content?: string | null;
        tool_calls?: { function?: { name?: string; arguments?: string } }[];
      };
    }[];
  };

  const message = completion.choices?.[0]?.message;
  const acoes = (message?.tool_calls ?? [])
    .map((call) => parseAcao(call.function?.name ?? '', call.function?.arguments ?? '{}', validos))
    .filter((acao): acao is { tipo: TipoAcao; id: string } => acao != null);

  let texto = (message?.content ?? '').trim();
  if (!texto) {
    const primeira = acoes[0];
    const estacao = primeira ? estacoes.find((e) => e.id === primeira.id) : undefined;
    if (primeira?.tipo === 'abrir_rota' && estacao) {
      texto = `Beleza. Vou abrir a rota até ${estacao.nome}.`;
    } else if (primeira?.tipo === 'abrir_detalhe' && estacao) {
      texto = `Abrindo os detalhes de ${estacao.nome}.`;
    } else if (primeira?.tipo === 'destacar_ponto' && estacao) {
      texto = `Marquei ${estacao.nome} no mapa.`;
    } else {
      texto = 'Posso falar dos pontos próximos ou de recarga. O que você precisa?';
    }
  }

  return json(200, { texto, acoes });
});
