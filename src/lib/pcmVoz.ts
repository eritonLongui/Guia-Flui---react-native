import type { AudioGravado } from '@/lib/gravacaoVoz';
import { volumeDeNivelDb } from '@/lib/detectorSilencio';
import { File, Paths } from 'expo-file-system';

export const TAXA_PCM_HZ = 16_000;
/** ~350 ms na taxa real do buffer (iOS costuma entregar 48 kHz). */
export const MIN_SEGUNDOS_PCM = 0.35;
export const MAX_SEGUNDOS_PCM = 10;

export function minimoAmostrasPcm(sampleRate: number): number {
  return Math.round(sampleRate * MIN_SEGUNDOS_PCM);
}

export function maximoAmostrasPcm(sampleRate: number): number {
  return sampleRate * MAX_SEGUNDOS_PCM;
}

export const MIN_AMOSTRAS_PCM = minimoAmostrasPcm(TAXA_PCM_HZ);
export const MAX_AMOSTRAS_PCM = maximoAmostrasPcm(TAXA_PCM_HZ);

export function float32ParaInt16(data: ArrayBuffer): Int16Array {
  const fonte = new Float32Array(data.slice(0));
  const saida = new Int16Array(fonte.length);
  for (let i = 0; i < fonte.length; i += 1) {
    const amostra = Math.max(-1, Math.min(1, fonte[i] ?? 0));
    saida[i] = amostra < 0 ? Math.round(amostra * 0x8000) : Math.round(amostra * 0x7fff);
  }
  return saida;
}

export function juntarPcm(partes: Int16Array[]): Int16Array {
  let total = 0;
  for (const parte of partes) total += parte.length;
  const saida = new Int16Array(total);
  let offset = 0;
  for (const parte of partes) {
    saida.set(parte, offset);
    offset += parte.length;
  }
  return saida;
}

export function volumeDePcm16(amostras: Int16Array): number {
  if (amostras.length === 0) return 0;
  let acc = 0;
  for (let i = 0; i < amostras.length; i += 1) {
    const n = (amostras[i] ?? 0) / 32768;
    acc += n * n;
  }
  const rms = Math.sqrt(acc / amostras.length);
  const db = 20 * Math.log10(Math.max(rms, 1e-8));
  return volumeDeNivelDb(db);
}

function montarWav(pcm: Int16Array, sampleRate: number): Uint8Array {
  const dataSize = pcm.byteLength;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);
  const ascii = (offset: number, texto: string) => {
    for (let i = 0; i < texto.length; i += 1) bytes[offset + i] = texto.charCodeAt(i);
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, dataSize, true);
  bytes.set(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength), 44);
  return bytes;
}

export async function pcmParaAudioWav(pcm: Int16Array, sampleRate: number): Promise<AudioGravado> {
  const wav = montarWav(pcm, sampleRate);
  const arquivo = new File(Paths.cache, `fala-${Date.now()}.wav`);
  arquivo.create({ overwrite: true });
  arquivo.write(wav);
  try {
    const base64 = await arquivo.base64();
    if (!base64) {
      throw new Error('Não consegui salvar o áudio. Tente de novo.');
    }
    return { base64, mimeType: 'audio/wav' };
  } finally {
    try {
      if (arquivo.exists) arquivo.delete();
    } catch {
      /* o cache limpa depois */
    }
  }
}
