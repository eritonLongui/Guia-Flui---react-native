import {
  AudioQuality,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type RecordingOptions,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';

export interface AudioGravado {
  base64: string;
  mimeType: string;
}

/** Corta a gravação sozinho; evita mandar áudio gigante se o usuário esquecer o mic ligado. */
export const MAX_DURACAO_GRAVACAO_MS = 10_000;
/** Abaixo disso é toque acidental, não fala. "Boa tarde" cabe nisto. */
export const MIN_DURACAO_GRAVACAO_MS = 280;

const MAX_BYTES_AUDIO = 5 * 1024 * 1024;

/**
 * Derivado de HIGH_QUALITY (mpeg4/aac nos dois sistemas) e não de LOW_QUALITY,
 * que gera `.3gp`/amr_nb no Android — formato que a transcrição da OpenAI recusa.
 * 16 kHz mono é o suficiente para fala e mantém o base64 pequeno.
 */
export const PRESET_VOZ: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 32000,
  // Necessário para o detector de silêncio ler o nível do microfone.
  isMeteringEnabled: true,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    sampleRate: 16000,
    audioSource: 'voice_communication',
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    sampleRate: 16000,
    audioQuality: AudioQuality.MEDIUM,
  },
};

export const microfoneDisponivel = true;

export async function pedirPermissaoMicrofone(): Promise<boolean> {
  const atual = await getRecordingPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const pedido = await requestRecordingPermissionsAsync();
  return pedido.granted;
}

export async function prepararSessaoGravacao(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
  });
}

/** Sem isso o iOS mantém a rota de gravação e a resposta falada sai baixa. */
export async function encerrarSessaoGravacao(): Promise<void> {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  } catch {
    /* sessão já liberada */
  }
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function tamanhoArquivo(uri: string | null): number {
  if (!uri) return 0;
  try {
    return new File(uri).size ?? 0;
  } catch {
    return 0;
  }
}

/** AAC vazio fica só no cabeçalho; espera o tamanho estabilizar depois do stop. */
export async function esperarArquivoComDados(uri: string | null): Promise<number> {
  if (!uri) return 0;
  let anterior = -1;
  let tamanho = 0;
  for (let i = 0; i < 12; i += 1) {
    tamanho = tamanhoArquivo(uri);
    if (tamanho > 800 && tamanho === anterior) return tamanho;
    anterior = tamanho;
    await esperar(60);
  }
  return tamanho;
}

export function descartarAudio(uri: string | null): void {
  if (!uri) return;
  try {
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  } catch {
    /* o sistema limpa o cache depois */
  }
}

/**
 * Depois do `prepare`/`record`, o `uri` às vezes ainda está vazio.
 * Capturamos este caminho e lemos só ele no `stop()` — não o uri velho do gravador.
 */
export async function aguardarUriNova(
  obterUri: () => string | null,
  _uriAnterior: string | null,
): Promise<string | null> {
  for (let i = 0; i < 15; i += 1) {
    const uri = obterUri();
    if (uri) return uri;
    await esperar(40);
  }
  return obterUri();
}

/**
 * Copia o m4a para um arquivo só deste turno, sem apagar o original —
 * o gravador ainda pode estar fechando o arquivo.
 */
export async function isolarAudio(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  const origem = new File(uri);
  const destino = new File(Paths.cache, `fala-${Date.now()}-${Math.floor(Math.random() * 1e6)}.m4a`);
  try {
    await origem.copy(destino, { overwrite: true });
    return destino.uri;
  } catch {
    return uri;
  }
}

export async function lerAudioGravado(uri: string | null): Promise<AudioGravado> {
  if (!uri) {
    throw new Error('Não consegui salvar o áudio. Tente de novo.');
  }

  const arquivo = new File(uri);
  try {
    const base64 = await arquivo.base64();
    if (!base64) {
      throw new Error('Não consegui salvar o áudio. Tente de novo.');
    }
    if (arquivo.size > MAX_BYTES_AUDIO) {
      throw new Error('A gravação ficou longa demais. Fale por até 10 segundos.');
    }
    return { base64, mimeType: 'audio/m4a' };
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('longa demais')) throw cause;
    throw new Error('Não consegui salvar o áudio. Tente de novo.');
  } finally {
    try {
      if (arquivo.exists) arquivo.delete();
    } catch {
      /* o sistema limpa o cache depois */
    }
  }
}
