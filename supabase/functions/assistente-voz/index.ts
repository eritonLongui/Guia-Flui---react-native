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
  estado?: string;
  endereco?: string;
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

interface StationRow {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  nota: number | string;
  aberto_agora: boolean;
  conectores: EstacaoContexto['conectores'] | string;
  carregadores_disponiveis: number;
  carregadores_total: number;
  tem_comida: boolean;
  tem_banheiro: boolean;
  tem_estacionamento: boolean;
  nivel_compatibilidade: string;
  tempo_fila_minutos: number;
  tempo_carga_minutos: number;
  horario_funcionamento: string;
}

const CAMPOS_ESTACAO =
  'id, nome, endereco, cidade, estado, nota, aberto_agora, conectores, carregadores_disponiveis, carregadores_total, tem_comida, tem_banheiro, tem_estacionamento, nivel_compatibilidade, tempo_fila_minutos, tempo_carga_minutos, horario_funcionamento, pontuacao_recomendacao';

const MAX_ESTACOES_CONTEXTO = 16;

const STOPWORDS = new Set([
  'a',
  'as',
  'o',
  'os',
  'um',
  'uma',
  'uns',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'pra',
  'para',
  'por',
  'com',
  'sem',
  'me',
  'meu',
  'minha',
  'tem',
  'temos',
  'quero',
  'queria',
  'pode',
  'podem',
  'quais',
  'qual',
  'onde',
  'aqui',
  'ali',
  'perto',
  'proximo',
  'próximo',
  'cidade',
  'bairro',
  'eletroposto',
  'eletropostos',
  'carregador',
  'carregadores',
  'recarga',
  'ponto',
  'pontos',
  'estação',
  'estações',
]);

/** Apelidos falados → cidade ou estado do catálogo. Chaves longas primeiro. */
const APELIDOS_LUGAR: { chaves: string[]; cidade?: string; estado?: string }[] = [
  { chaves: ['rio de janeiro', 'cidade do rio', 'carioca'], cidade: 'Rio de Janeiro' },
  { chaves: ['sao paulo', 'são paulo', 'sampa'], cidade: 'São Paulo' },
  { chaves: ['belo horizonte', 'bh'], cidade: 'Belo Horizonte' },
  { chaves: ['porto alegre', 'poa'], cidade: 'Porto Alegre' },
  { chaves: ['brasilia', 'brasília'], cidade: 'Brasília' },
  { chaves: ['campinas'], cidade: 'Campinas' },
  { chaves: ['curitiba'], cidade: 'Curitiba' },
  { chaves: ['rj'], estado: 'RJ' },
  { chaves: ['sp'], estado: 'SP' },
  { chaves: ['mg'], estado: 'MG' },
  { chaves: ['pr'], estado: 'PR' },
  { chaves: ['rs'], estado: 'RS' },
  { chaves: ['df'], estado: 'DF' },
];

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function sanitizarIlike(termo: string): string {
  return termo.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseConectores(raw: StationRow['conectores']): EstacaoContexto['conectores'] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as EstacaoContexto['conectores'];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function compactarLinha(row: StationRow): EstacaoContexto {
  return {
    id: row.id,
    nome: row.nome,
    cidade: row.cidade,
    estado: row.estado,
    endereco: row.endereco,
    nota: Number(row.nota),
    abertoAgora: row.aberto_agora,
    conectores: parseConectores(row.conectores),
    carregadoresDisponiveis: row.carregadores_disponiveis,
    carregadoresTotal: row.carregadores_total,
    temComida: row.tem_comida,
    temBanheiro: row.tem_banheiro,
    temEstacionamento: row.tem_estacionamento,
    nivelCompatibilidade: row.nivel_compatibilidade,
    tempoFilaMinutos: row.tempo_fila_minutos,
    tempoCargaMinutos: row.tempo_carga_minutos,
    horarioFuncionamento: row.horario_funcionamento,
  };
}

function unirEstacoes(listas: EstacaoContexto[][]): EstacaoContexto[] {
  const porId = new Map<string, EstacaoContexto>();
  for (const lista of listas) {
    for (const estacao of lista) {
      if (!estacao.id || porId.has(estacao.id)) continue;
      porId.set(estacao.id, estacao);
    }
  }
  return [...porId.values()].slice(0, MAX_ESTACOES_CONTEXTO);
}

function detectarLugar(
  pergunta: string,
  cidades: string[],
): { cidade?: string; estado?: string } {
  const normalizada = ` ${semAcento(pergunta)} `;
  for (const apelido of APELIDOS_LUGAR) {
    if (apelido.chaves.some((chave) => normalizada.includes(` ${semAcento(chave)} `))) {
      return { cidade: apelido.cidade, estado: apelido.estado };
    }
  }
  if (/\brio\b/.test(normalizada) && !normalizada.includes('rio grande')) {
    return { cidade: 'Rio de Janeiro' };
  }
  const cidadeCatalogo = cidades.find((cidade) => {
    const chave = semAcento(cidade);
    return chave.length >= 4 && normalizada.includes(` ${chave} `);
  });
  return cidadeCatalogo ? { cidade: cidadeCatalogo } : {};
}

function termosBusca(pergunta: string): string[] {
  return semAcento(pergunta)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token))
    .slice(0, 4);
}

interface Mensagem {
  papel: 'usuario' | 'assistente';
  texto: string;
}

interface AudioEntrada {
  base64?: string;
  mimeType?: string;
}

interface Corpo {
  mensagens?: Mensagem[];
  audio?: AudioEntrada | null;
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

const MODELO_TRANSCRICAO = 'gpt-4o-mini-transcribe';
const MAX_BYTES_AUDIO = 5 * 1024 * 1024;

const extensoesAudio: Record<string, string> = {
  'audio/m4a': 'm4a',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
};

function decodificarBase64(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

/**
 * Transcreve a fala do usuário. Os nomes das estações do contexto vão no `prompt`
 * porque a transcrição erra nomes próprios sem essa dica.
 */
async function transcrever(
  audio: AudioEntrada,
  estacoes: EstacaoContexto[],
  openaiKey: string,
): Promise<string> {
  const base64 = audio.base64 ?? '';
  if (!base64) {
    throw new Error('Não recebi o áudio. Tente de novo.');
  }
  // Base64 ocupa ~4 bytes por cada 3 bytes de áudio.
  if ((base64.length * 3) / 4 > MAX_BYTES_AUDIO) {
    throw new Error('A gravação ficou longa demais. Fale por até 15 segundos.');
  }

  const mimeType = audio.mimeType || 'audio/m4a';
  const extensao = extensoesAudio[mimeType] ?? 'm4a';

  let bytes: Uint8Array;
  try {
    bytes = decodificarBase64(base64);
  } catch {
    throw new Error('Não recebi o áudio. Tente de novo.');
  }

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType }), `fala.${extensao}`);
  form.append('model', MODELO_TRANSCRICAO);
  form.append('language', 'pt');
  form.append('response_format', 'json');

  const nomes = estacoes.map((e) => e.nome).filter(Boolean).slice(0, 12);
  const dicas = [
    'Transcreva exatamente a fala em português do Brasil, palavra por palavra.',
    'Ignore só ruído de fundo. Não invente cumprimento se a pessoa não cumprimentou.',
    nomes.length > 0 ? `Se citar um eletroposto, nomes possíveis: ${nomes.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  form.append('prompt', dicas);

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiKey}` },
    body: form,
  });

  if (!res.ok) {
    console.error('openai_transcricao_error', res.status, await res.text());
    throw new Error('Não consegui entender o áudio. Tente de novo.');
  }

  const payload = (await res.json()) as { text?: string };
  return (payload.text ?? '').trim();
}

function bytesParaBase64(bytes: Uint8Array): string {
  const pedaco = 0x8000;
  let binario = '';
  for (let i = 0; i < bytes.length; i += pedaco) {
    binario += String.fromCharCode(...bytes.subarray(i, i + pedaco));
  }
  return btoa(binario);
}

/** Tira reticências e travessões que a síntese transforma em pausa longa. */
function aliviarPausas(texto: string): string {
  return texto
    .replace(/\.{2,}/g, '.')
    .replace(/[—–]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Voz falada em português do Brasil. Se a síntese falhar, o app cai na voz do aparelho.
 */
async function sintetizarFala(texto: string, openaiKey: string): Promise<string | null> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      input: texto,
      instructions:
        'Fale em português do Brasil, voz feminina, natural e clara, como uma assistente prestativa. Sem pausa dramática e sem tom de GPS.',
      response_format: 'mp3',
      speed: 1.12,
    }),
  });

  if (!res.ok) {
    console.error('openai_tts_error', res.status, await res.text());
    return null;
  }

  return bytesParaBase64(new Uint8Array(await res.arrayBuffer()));
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function idsValidos(estacoes: EstacaoContexto[]): Set<string> {
  return new Set(estacoes.map((e) => e.id).filter(Boolean));
}

type ClienteSupabase = ReturnType<typeof createClient>;

async function consultarCatalogo(
  supabase: ClienteSupabase,
  pergunta: string,
  idsProximos: string[],
): Promise<EstacaoContexto[]> {
  const { data: locais, error: erroLocais } = await supabase
    .from('stations')
    .select('cidade, estado');
  if (erroLocais) {
    console.error('catalogo_locais_error', erroLocais.message);
  }
  const cidades = [...new Set((locais ?? []).map((row: { cidade?: string }) => row.cidade).filter(Boolean))] as string[];
  const lugar = detectarLugar(pergunta, cidades);

  let consulta = supabase.from('stations').select(CAMPOS_ESTACAO).limit(12);

  if (lugar.cidade) {
    consulta = consulta.ilike('cidade', lugar.cidade);
  } else if (lugar.estado) {
    consulta = consulta.eq('estado', lugar.estado);
  } else {
    const termos = termosBusca(pergunta).map(sanitizarIlike).filter(Boolean);
    if (termos.length > 0) {
      const filtros = termos.flatMap((termo) => [
        `nome.ilike.%${termo}%`,
        `endereco.ilike.%${termo}%`,
        `cidade.ilike.%${termo}%`,
      ]);
      consulta = consulta.or(filtros.join(','));
    } else if (idsProximos.length > 0) {
      consulta = consulta.in('id', idsProximos.slice(0, 12));
    } else {
      consulta = consulta.order('pontuacao_recomendacao', { ascending: false });
    }
  }

  const { data, error } = await consulta;
  if (error) {
    console.error('catalogo_stations_error', error.message);
    return [];
  }
  return ((data ?? []) as StationRow[]).map(compactarLinha);
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

  const proximas = Array.isArray(corpo.estacoes) ? corpo.estacoes.slice(0, 8) : [];
  const historico = Array.isArray(corpo.mensagens) ? corpo.mensagens.slice(-8) : [];

  // Com áudio, a fala vira o último turno do usuário. Sem áudio, o app mandou texto digitado.
  let transcricao = '';
  if (corpo.audio?.base64) {
    try {
    transcricao = await transcrever(corpo.audio, proximas, openaiKey);
    } catch (cause) {
      const mensagem = cause instanceof Error ? cause.message : 'Não consegui entender o áudio.';
      return json(400, { erro: mensagem });
    }
    if (!transcricao) {
      return json(400, { erro: 'Não ouvi nada. Pode falar de novo.' });
    }
    historico.push({ papel: 'usuario', texto: transcricao });
  }

  const ultima = historico.filter((m) => m.papel === 'usuario').at(-1)?.texto?.trim();
  if (!ultima) {
    return json(400, { erro: 'Não entendi o que você disse.' });
  }

  const catalogo = await consultarCatalogo(
    supabase,
    ultima,
    proximas.map((e) => e.id).filter(Boolean),
  );
  const estacoes = unirEstacoes([catalogo, proximas]);
  const validos = idsValidos(estacoes);
  const system = [
    'Você é a Guia, assistente de voz feminina do app Guia Flui, em português do Brasil.',
    'Use o seu conhecimento da OpenAI para falar de recarga, carro elétrico, híbrido, autonomia, conectores, custo, incentivo, história e mercado no Brasil. Responda nesses temas. Não diga que não sabe. Se um número for incerto, diga que é aproximado e complete com o que puder afirmar.',
    'Responda com clareza para voz alta. Em recarga, carro ou Brasil em geral, use até 4 frases curtas. Em eletroposto específico do app, até 2 frases. Sem reticências, travessões, markdown ou URLs.',
    'Não cumprimente (boa tarde, oi) a menos que ela tenha cumprimentado agora.',
    'Perguntas fora do tema (futebol, notícia, hora, eleição, política geral): em uma frase diga que não acompanha isso e ofereça ajuda com recarga, carro elétrico ou eletroposto. Não invente placar.',
    'Eletropostos do app: nome, endereço, distância e ID só do JSON do catálogo. Nunca invente posto. Para cidade, bairro ou região, use o catálogo. Não diga que não temos ponto se o catálogo listar.',
    'Use as estações próximas do mapa só quando ela falar de perto, aqui, agora ou perto de mim.',
    'Se o catálogo e as próximas vierem vazios para o local pedido, diga que ainda não temos pontos cadastrados lá e complete com recarga ou mercado em geral se couber.',
    'Se o usuário escolher um ponto para ir, chame abrir_rota com o id. Se quiser só ver no mapa, destacar_ponto. Se pedir ficha, abrir_detalhe. Em pergunta geral de recarga, carro ou Brasil, não chame ferramenta.',
    `Estações do catálogo consultadas agora:\n${JSON.stringify(catalogo)}`,
    `Estações próximas no mapa do usuário:\n${JSON.stringify(proximas)}`,
    corpo.veiculo
      ? `Veículo do usuário (use nas respostas de recarga e autonomia):\n${JSON.stringify(corpo.veiculo)}`
      : 'Veículo do usuário: não informado. Se a pergunta depender do modelo, peça em uma frase ou responda no geral.',
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
      model: 'gpt-4o',
      temperature: 0.4,
      max_tokens: 320,
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
      texto = 'Posso falar de recarga, carro elétrico ou eletropostos. O que você precisa?';
    }
  }

  const audioBase64 = await sintetizarFala(aliviarPausas(texto), openaiKey);

  return json(200, { transcricao, texto, acoes, audioBase64 });
});
