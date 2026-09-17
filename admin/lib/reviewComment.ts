const PREFIX_RE = /^\[notas:([^\]]+)\]\s*/;

export function textoAvaliacao(comentario: string) {
  const match = comentario.match(PREFIX_RE);
  if (!match) return comentario.trim() || 'Sem comentário';
  const texto = comentario.slice(match[0].length).trim();
  return texto || 'Sem comentário';
}
