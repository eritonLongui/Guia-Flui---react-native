export const TOPICOS_AVALIACAO = [
  'Tempo de fila',
  'Conectores',
  'Limpeza',
  'Segurança',
  'Atendimento',
  'Localização',
] as const;

export type TopicoAvaliacao = (typeof TOPICOS_AVALIACAO)[number];
export type NotasPorTopico = Partial<Record<TopicoAvaliacao, number>>;

const PREFIX_RE = /^\[notas:([^\]]+)\]\s*/;

export function parseAvaliacaoComentario(comentario: string): {
  notas: NotasPorTopico;
  texto: string;
} {
  const match = comentario.match(PREFIX_RE);
  if (!match) {
    return { notas: {}, texto: comentario };
  }

  const notas: NotasPorTopico = {};
  for (const parte of match[1].split('|')) {
    const [nome, valorRaw] = parte.split('=');
    const topico = nome?.trim() as TopicoAvaliacao | undefined;
    const valor = Number(valorRaw);
    if (topico && (TOPICOS_AVALIACAO as readonly string[]).includes(topico) && valor >= 1 && valor <= 5) {
      notas[topico] = valor;
    }
  }

  return {
    notas,
    texto: comentario.slice(match[0].length).trim(),
  };
}

export function montarComentarioComNotas(texto: string, notas: NotasPorTopico): string {
  const partes = TOPICOS_AVALIACAO.filter((topico) => (notas[topico] ?? 0) >= 1).map(
    (topico) => `${topico}=${notas[topico]}`,
  );
  const corpo = texto.trim();
  if (partes.length === 0) return corpo;
  const prefixo = `[notas:${partes.join('|')}]`;
  return corpo ? `${prefixo} ${corpo}` : prefixo;
}

export function mediaNotas(notas: NotasPorTopico): number {
  const valores = TOPICOS_AVALIACAO.map((topico) => notas[topico] ?? 0).filter((n) => n >= 1);
  if (valores.length === 0) return 0;
  return Math.round((valores.reduce((acc, n) => acc + n, 0) / valores.length) * 10) / 10;
}

export function formatarResumoNotas(notas: NotasPorTopico): string {
  return TOPICOS_AVALIACAO.filter((topico) => (notas[topico] ?? 0) >= 1)
    .map((topico) => `${topico} ${notas[topico]}/5`)
    .join(' · ');
}
