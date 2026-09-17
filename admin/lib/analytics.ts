const weekLabel = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

function startOfWeek(date: Date) {
  const start = new Date(date);
  const weekday = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekday);
  return start;
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function weekBuckets(weeks: number) {
  const current = startOfWeek(new Date());
  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(current);
    start.setDate(current.getDate() - (weeks - 1 - index) * 7);
    return {
      key: localDateKey(start),
      semana: weekLabel.format(start),
    };
  });
}

export function countLastDays(dates: string[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return dates.filter((value) => {
    const time = new Date(value).getTime();
    return Number.isFinite(time) && time >= cutoff;
  }).length;
}

export function uniqueIdsLastDays(rows: { id: string; date: string }[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const ids = new Set<string>();
  for (const row of rows) {
    const time = new Date(row.date).getTime();
    if (Number.isFinite(time) && time >= cutoff) ids.add(row.id);
  }
  return ids.size;
}

export function usersByWeek(
  signups: string[],
  activity: { id: string; date: string }[],
  weeks = 8,
) {
  const buckets = weekBuckets(weeks).map((bucket) => ({
    ...bucket,
    ativos: 0,
    cadastros: 0,
  }));
  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  const activeByWeek = new Map<string, Set<string>>();

  for (const date of signups) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = indexByKey.get(localDateKey(startOfWeek(parsed)));
    if (index != null) buckets[index].cadastros += 1;
  }

  for (const row of activity) {
    const parsed = new Date(row.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const key = localDateKey(startOfWeek(parsed));
    if (!indexByKey.has(key)) continue;
    const set = activeByWeek.get(key) ?? new Set<string>();
    set.add(row.id);
    activeByWeek.set(key, set);
  }

  for (const [key, users] of activeByWeek) {
    const index = indexByKey.get(key);
    if (index != null) buckets[index].ativos = users.size;
  }

  return buckets.map(({ semana, ativos, cadastros }) => ({ semana, ativos, cadastros }));
}

export function countByWeek(dates: string[], weeks = 8) {
  const buckets = weekBuckets(weeks).map((bucket) => ({ ...bucket, quantidade: 0 }));
  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));

  for (const date of dates) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = indexByKey.get(localDateKey(startOfWeek(parsed)));
    if (index != null) buckets[index].quantidade += 1;
  }

  return buckets.map(({ semana, quantidade }) => ({ semana, quantidade }));
}

export function countByLabel(values: string[], limit = 8) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = value.trim() || 'Outra';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([rotulo, quantidade]) => ({ rotulo, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);
}
