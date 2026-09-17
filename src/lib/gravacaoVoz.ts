import {
  AudioQuality,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type RecordingOptions,
} from 'expo-audio';
import { File } from 'expo-file-system';

export interface AudioGravado {
  base64: string;
  mimeType: string;
}

/** Corta a gravação sozinho; evita mandar áudio gigante se o usuário esquecer o mic ligado. */
export const MAX_DURACAO_GRAVACAO_MS = 15_000;
/** Abaixo disso é toque acidental, não fala. */
export const MIN_DURACAO_GRAVACAO_MS = 400;

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
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    sampleRate: 16000,
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
  await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
}

/** Sem isso o iOS mantém a rota de gravação e a resposta falada sai baixa. */
export async function encerrarSessaoGravacao(): Promise<void> {
  try {
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  } catch {
    /* sessão já liberada */
  }
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

export async function lerAudioGravado(uri: string | null): Promise<AudioGravado> {
  if (!uri) {
    throw new Error('Não consegui salvar o áudio. Tente de novo.');
  }

  const arquivo = new File(uri);
  if (!arquivo.exists) {
    throw new Error('Não consegui salvar o áudio. Tente de novo.');
  }
  if (arquivo.size > MAX_BYTES_AUDIO) {
    arquivo.delete();
    throw new Error('A gravação ficou longa demais. Fale por até 15 segundos.');
  }

  try {
    return { base64: await arquivo.base64(), mimeType: 'audio/m4a' };
  } finally {
    try {
      arquivo.delete();
    } catch {
      /* o sistema limpa o cache depois */
    }
  }
}
