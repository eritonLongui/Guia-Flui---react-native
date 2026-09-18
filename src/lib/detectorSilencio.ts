/**
 * Separa fala de barulho a partir do envelope de volume (dBFS a cada 50 ms).
 *
 * Não basta ser alto: fala perto do microfone tem pulso de sílaba (sobe e
 * desce várias vezes). TV na sala, ventilador e fundo contínuo são mais
 * estáveis — dinâmica baixa, poucos ataques — e entram no piso de ruído.
 */

export type EstadoDeteccao = 'calibrando' | 'aguardando' | 'falando' | 'enviar' | 'sem-fala';

const CALIBRAGEM_MS = 400;
const JANELA_MS = 600;
const SILENCIO_PARA_ENVIAR_MS = 700;
const ESPERA_MAXIMA_FALA_MS = 5000;
const ENVIO_SEM_MEDIDOR_MS = 2500;
const EMA_PISO = 0.1;
const NIVEL_MEDIDOR_MORTO_DB = -150;
const NIVEL_MINIMO_VISIVEL_DB = -60;
const NIVEL_MAXIMO_VISIVEL_DB = -8;
const LIMIAR_PADRAO_DB = -50;

export const INTERVALO_ANALISE_MS = 50;

const AMOSTRAS_JANELA = Math.round(JANELA_MS / INTERVALO_ANALISE_MS);

function percentil(valores: number[], p: number): number {
  if (valores.length === 0) return LIMIAR_PADRAO_DB;
  const ordenados = [...valores].sort((a, b) => a - b);
  const i = Math.min(ordenados.length - 1, Math.max(0, Math.floor((ordenados.length - 1) * p)));
  return ordenados[i] ?? LIMIAR_PADRAO_DB;
}

export function medidorMorto(nivelDb: number): boolean {
  return nivelDb <= NIVEL_MEDIDOR_MORTO_DB;
}

export function volumeDeNivelDb(nivelDb: number): number {
  if (medidorMorto(nivelDb)) return 0;
  const t =
    (nivelDb - NIVEL_MINIMO_VISIVEL_DB) / (NIVEL_MAXIMO_VISIVEL_DB - NIVEL_MINIMO_VISIVEL_DB);
  return Math.min(1, Math.max(0, t));
}

/**
 * Pontua o quanto a janela parece fala (pulso de sílaba) e não fundo.
 * TV/ventilador: pouca dinâmica e quase nenhum ataque. Fala: sobe e desce.
 */
export function pontuarFala(janela: number[], pisoDb: number): { pontos: number; pareceFala: boolean } {
  if (janela.length < 8) return { pontos: 0, pareceFala: false };

  const ordenados = [...janela].sort((a, b) => a - b);
  const p10 = ordenados[Math.floor((ordenados.length - 1) * 0.1)] ?? pisoDb;
  const p50 = ordenados[Math.floor((ordenados.length - 1) * 0.5)] ?? pisoDb;
  const p90 = ordenados[Math.floor((ordenados.length - 1) * 0.9)] ?? pisoDb;
  const max = ordenados[ordenados.length - 1] ?? pisoDb;
  const dinamicaDb = p90 - p10;
  const cristaDb = max - p50;

  let ataques = 0;
  let quedas = 0;
  for (let i = 1; i < janela.length; i += 1) {
    const delta = (janela[i] ?? 0) - (janela[i - 1] ?? 0);
    if (delta >= 5) ataques += 1;
    if (delta <= -5) quedas += 1;
  }

  let pontos = 0;
  if (max > pisoDb + 7) pontos += 1;
  if (dinamicaDb >= 11) pontos += 2;
  else if (dinamicaDb >= 8) pontos += 1;
  if (cristaDb >= 7) pontos += 1;
  if (ataques >= 2 && quedas >= 1) pontos += 2;
  else if (ataques >= 1 && quedas >= 1) pontos += 1;

  // Alto e chato: vazamento contínuo (TV, rua, ar-condicionado).
  if (p50 > pisoDb + 5 && dinamicaDb < 7) pontos -= 2;
  if (ataques === 0) pontos -= 1;

  const pulsoSilaba = ataques >= 2 && quedas >= 1;
  const pareceFala = pontos >= 3 && pulsoSilaba && max > pisoDb + 7;
  return { pontos, pareceFala };
}

export function criarDetectorSilencio() {
  let inicioMs = 0;
  let janela: number[] = [];
  let pisoDb = LIMIAR_PADRAO_DB;
  let calibrado = false;
  let falaConfirmada = false;
  let ultimoFalaMs = 0;
  let amostrasVivas = 0;
  let amostrasMortas = 0;

  return function analisar(nivelDb: number, agoraMs: number): EstadoDeteccao {
    if (inicioMs === 0) inicioMs = agoraMs;
    const decorrido = agoraMs - inicioMs;

    if (medidorMorto(nivelDb)) {
      amostrasMortas += 1;
    } else {
      amostrasVivas += 1;
      janela.push(nivelDb);
      if (janela.length > AMOSTRAS_JANELA) janela.shift();
    }

    if (decorrido < CALIBRAGEM_MS) return 'calibrando';

    if (!calibrado) {
      calibrado = true;
      pisoDb = janela.length >= 4 ? percentil(janela, 0.4) : LIMIAR_PADRAO_DB;
    }

    if (amostrasVivas < 2 && amostrasMortas >= 4) {
      return decorrido >= ENVIO_SEM_MEDIDOR_MS ? 'enviar' : 'aguardando';
    }

    const { pareceFala } = pontuarFala(janela, pisoDb);

    if (pareceFala) {
      falaConfirmada = true;
      ultimoFalaMs = agoraMs;
      return 'falando';
    }

    if (!falaConfirmada) {
      pisoDb = pisoDb * (1 - EMA_PISO) + nivelDb * EMA_PISO;
      return decorrido > ESPERA_MAXIMA_FALA_MS ? 'sem-fala' : 'aguardando';
    }

    const acimaDoPiso = !medidorMorto(nivelDb) && nivelDb > pisoDb + 6;
    if (!acimaDoPiso) {
      pisoDb = pisoDb * (1 - EMA_PISO) + nivelDb * EMA_PISO;
    }

    return agoraMs - ultimoFalaMs >= SILENCIO_PARA_ENVIAR_MS ? 'enviar' : 'falando';
  };
}
