import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { pararSom } from '@/lib/sonsAssistente';
import * as Speech from 'expo-speech';

/**
 * Reproduz a resposta do assistente.
 *
 * Prefere o MP3 gerado no servidor (`gpt-4o-mini-tts`, voz coral em pt-BR).
 * Se o áudio não vier, cai na voz pt-BR mais natural que o aparelho tiver.
 */

const IDIOMA = 'pt-BR';

const PESO_IDENTIFICADOR: [string, number][] = [
  ['luciana', 6],
  ['fernanda', 6],
  ['maria', 5],
  ['female', 4],
  ['femin', 4],
  ['premium', 3],
  ['enhanced', 3],
  ['siri', 2],
  ['compact', 1],
];

let vozCache: string | null | undefined;
let playerAtual: AudioPlayer | null = null;

function ehPortuguesBrasil(voz: Speech.Voice): boolean {
  return (voz.language ?? '').toLowerCase().replace('_', '-').startsWith('pt-br');
}

function pontuar(voz: Speech.Voice): number {
  const id = voz.identifier.toLowerCase();
  const nome = (voz.name ?? '').toLowerCase();
  const porId = PESO_IDENTIFICADOR.find(([marca]) => id.includes(marca) || nome.includes(marca))?.[1] ?? 2;
  const porQualidade = voz.quality === Speech.VoiceQuality.Enhanced ? 2 : 0;
  return porId + porQualidade;
}

async function escolherVozBrasileira(): Promise<string | null> {
  if (vozCache !== undefined) return vozCache;

  try {
    const brasileiras = (await Speech.getAvailableVoicesAsync()).filter(ehPortuguesBrasil);
    if (brasileiras.length === 0) {
      vozCache = null;
      return vozCache;
    }
    const melhor = brasileiras.reduce((atual, voz) =>
      pontuar(voz) > pontuar(atual) ? voz : atual,
    );
    vozCache = melhor.identifier;
  } catch {
    vozCache = null;
  }

  return vozCache;
}

function base64ParaBytes(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

function soltarPlayer(): void {
  if (!playerAtual) return;
  try {
    playerAtual.pause();
    playerAtual.remove();
  } catch {
    /* já solto */
  }
  playerAtual = null;
}

async function prepararSessaoPlayback(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  });
}

export async function pararFala(): Promise<void> {
  soltarPlayer();
  try {
    await Speech.stop();
  } catch {
    /* nada sendo falado */
  }
}

async function falarComSistema(texto: string): Promise<void> {
  await prepararSessaoPlayback();
  const voice = await escolherVozBrasileira();
  return new Promise<void>((resolve) => {
    Speech.speak(texto, {
      language: IDIOMA,
      ...(voice ? { voice } : {}),
      pitch: 1.04,
      rate: 1.05,
      useApplicationAudioSession: true,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

function timeoutPlaybackMs(duracaoSegundos: number): number {
  return Math.max(4_000, Math.round(duracaoSegundos * 1000) + 1_500);
}

async function reproduzirMp3(base64: string): Promise<void> {
  const arquivo = new File(Paths.cache, 'guia-resposta.mp3');
  arquivo.create({ overwrite: true });
  arquivo.write(base64ParaBytes(base64));

  await prepararSessaoPlayback();
  pararSom();

  soltarPlayer();
  const player = createAudioPlayer(arquivo.uri, { updateInterval: 80 });
  player.volume = 1;
  playerAtual = player;

  await new Promise<void>((resolve) => {
    let resolvido = false;
    let comecou = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const terminar = () => {
      if (resolvido) return;
      resolvido = true;
      if (timer) clearTimeout(timer);
      sub.remove();
      resolve();
    };
    const armarTimeout = (duracaoSegundos: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(terminar, timeoutPlaybackMs(duracaoSegundos));
    };
    const tocar = (duracaoSegundos: number) => {
      if (comecou || resolvido) return;
      comecou = true;
      player.volume = 1;
      player.play();
      armarTimeout(duracaoSegundos > 0 ? duracaoSegundos : 8);
    };
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.isLoaded) return;
      if (!comecou) tocar(status.duration);
      if (comecou && status.didJustFinish) terminar();
    });
    if (player.isLoaded) tocar(player.duration);
    if (!comecou) armarTimeout(8);
  });

  soltarPlayer();
  try {
    arquivo.delete();
  } catch {
    /* o cache limpa depois */
  }
}

export async function falar(params: { texto: string; audioBase64?: string | null }): Promise<void> {
  if (params.audioBase64) {
    try {
      await reproduzirMp3(params.audioBase64);
      return;
    } catch {
      /* cai na voz do sistema */
    }
  }
  await falarComSistema(params.texto);
}
