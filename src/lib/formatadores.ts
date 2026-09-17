export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const raioTerraKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return raioTerraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatarTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`;
}

export function obterSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

export function formatarDataCurta(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';

  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioData = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diffDias = Math.round((inicioHoje.getTime() - inicioData.getTime()) / 86_400_000);

  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';

  const dia = data.getDate();
  const mes = MESES_CURTOS[data.getMonth()];
  if (data.getFullYear() === agora.getFullYear()) {
    return `${dia} ${mes}`;
  }
  return `${dia} ${mes} ${data.getFullYear()}`;
}
