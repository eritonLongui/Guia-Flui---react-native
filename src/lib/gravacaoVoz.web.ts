import { RecordingPresets, type RecordingOptions } from 'expo-audio';

export interface AudioGravado {
  base64: string;
  mimeType: string;
}

export const MAX_DURACAO_GRAVACAO_MS = 15_000;
export const MIN_DURACAO_GRAVACAO_MS = 400;

/** Mantido só para o hook poder chamar useAudioRecorder sem ramificar por plataforma. */
export const PRESET_VOZ: RecordingOptions = RecordingPresets.HIGH_QUALITY;

/** `File.base64()` não existe na web, então o assistente falado fica fora dali. */
export const microfoneDisponivel = false;

export async function pedirPermissaoMicrofone(): Promise<boolean> {
  return false;
}

export async function prepararSessaoGravacao(): Promise<void> {}

export async function encerrarSessaoGravacao(): Promise<void> {}

export function descartarAudio(_uri: string | null): void {}

export async function lerAudioGravado(_uri: string | null): Promise<AudioGravado> {
  throw new Error('O assistente de voz só funciona no app.');
}
