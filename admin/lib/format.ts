const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTime.format(date);
}

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function labelCompatibilidade(nivel: string) {
  if (nivel === 'compativel') return 'Compatível';
  if (nivel === 'parcial') return 'Parcial';
  if (nivel === 'incompativel') return 'Incompatível';
  return nivel;
}

export function labelSeguranca(nivel: string) {
  if (nivel === 'seguro') return 'Seguro';
  if (nivel === 'moderado') return 'Moderado';
  if (nivel === 'atencao') return 'Atenção';
  return nivel;
}

export function newStationId() {
  return `ep-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
}
