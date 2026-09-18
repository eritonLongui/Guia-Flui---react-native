/** Interpreta cidade/estado falados ou digitados para filtrar o catálogo. */

export const APELIDOS_LUGAR: { chaves: string[]; cidade?: string; estado?: string }[] = [
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

export function sanitizarIlike(termo: string): string {
  return termo.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function detectarLugar(
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
