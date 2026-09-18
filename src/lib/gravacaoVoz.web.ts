import { RecordingPresets, type RecordingOptions } from 'expo-audio';

export interface AudioGravado {
  base64: string;
  mimeType: string;
}

export const MAX_DURACAO_GRAVACAO_MS = 10_000;
export const MIN_DURACAO_GRAVACAO_MS = 280;

/** Mantido só para o hook poder chamar useAudioRecorder sem ramificar por plataforma. */
export const PRESET_VOZ: RecordingOptions = RecordingPresets.HIGH_QUALITY;

/** `File.base64()` não existe na web, então o assistente falado fica fora dali. */
export const microfoneDisponivel = false;

export async function pedirPermissaoMicrofone(): Promise<boolean> {
  return false;
}

export async function prepararSessaoGravacao(): Promise<void> {}

export async function encerrarSessaoGravacao(): Promise<void> {}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function descartarAudio(_uri: string | null): void {}

export function tamanhoArquivo(_uri: string | null): number {
  return 0;
}

export async function esperarArquivoComDados(_uri: string | null): Promise<number> {
  return 0;
}

export async function aguardarUriNova(
  _obterUri: () => string | null,
  _uriAnterior: string | null,
): Promise<string | null> {
  return null;
}

export async function isolarAudio(uri: string | null): Promise<string | null> {
  return uri;
}

export async function lerAudioGravado(_uri: string | null): Promise<AudioGravado> {
  throw new Error('O assistente de voz só funciona no app.');
}
