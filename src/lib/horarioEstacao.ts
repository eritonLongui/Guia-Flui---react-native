/** Arredonda HH:MM para a hora mais próxima (minutos ≥ 30 sobem). */
function arredondarParaHora(hora: number, minuto: number): number {
  let arredondada = minuto >= 30 ? hora + 1 : hora;
  if (arredondada >= 24) arredondada = 0;
  return arredondada;
}

function parsearHorario(valor: string): { hora: number; minuto: number } | null {
  const match = valor.trim().match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;
  const hora = Number(match[1]);
  const minuto = match[2] != null ? Number(match[2]) : 0;
  if (hora > 23 || minuto > 59) return null;
  return { hora, minuto };
}

const FALLBACK_HORARIO = '—';

/**
 * Um único período, horas inteiras, sem zero à esquerda: `10-12h`.
 * Aceita strings tipo `09:00–11:00` ou `09:30–11:20`.
 * Sem dado válido, devolve `—`.
 */
export function formatarHorarioMenorMovimento(valor: string | null | undefined): string {
  if (valor == null) return FALLBACK_HORARIO;
  const unico = String(valor).split(/\s+e\s+/i)[0]?.trim() ?? '';
  if (!unico) return FALLBACK_HORARIO;

  const partes = unico.split(/\s*[–—-]\s*/);
  if (partes.length < 2) return FALLBACK_HORARIO;

  const inicioParsed = parsearHorario(partes[0]);
  const fimParsed = parsearHorario(partes[1]);
  if (!inicioParsed || !fimParsed) return FALLBACK_HORARIO;

  const inicio = arredondarParaHora(inicioParsed.hora, inicioParsed.minuto);
  let fim = arredondarParaHora(fimParsed.hora, fimParsed.minuto);
  if (fim <= inicio) fim = (inicio + 1) % 24;

  return `${inicio}-${fim}h`;
}
