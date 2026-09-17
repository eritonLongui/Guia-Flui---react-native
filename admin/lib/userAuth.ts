export function isBanned(bannedUntil: string | null | undefined) {
  if (!bannedUntil) return false;
  const time = new Date(bannedUntil).getTime();
  return Number.isFinite(time) && time > Date.now();
}
