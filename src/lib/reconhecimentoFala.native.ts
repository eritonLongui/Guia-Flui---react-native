import { Platform } from 'react-native';
import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

import type { OuvintesFala } from './reconhecimentoFala';

export type { OuvintesFala, ResultadoFala } from './reconhecimentoFala';

const MENSAGEM_SEM_NATIVO =
  'O microfone precisa de um build nativo novo. Rode npm run ios e abra o app de novo.';

const mensagensErro: Record<string, string> = {
  'not-allowed': 'Preciso da permissão do microfone e do reconhecimento de fala.',
  'audio-capture':
    'O simulador não capturou o microfone. No Simulator: I/O → Input → Microphone. Ou pergunte por escrito abaixo.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale de novo.',
  aborted: '',
  cancelled: '',
  network: 'Falha de rede no reconhecimento de fala.',
};

type SpeechRecognitionNative = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

let cached: SpeechRecognitionNative | null | undefined;

function carregarModulo(): SpeechRecognitionNative | null {
  if (cached !== undefined) return cached;
  try {
    const loaded = require('expo-speech-recognition') as typeof import('expo-speech-recognition');
    const modulo = loaded.ExpoSpeechRecognitionModule;
    cached = modulo && typeof modulo.start === 'function' ? modulo : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function reconhecimentoNativoDisponivel(): boolean {
  return carregarModulo() != null;
}

export async function pedirPermissaoFala(): Promise<boolean> {
  const modulo = carregarModulo();
  if (!modulo) return false;

  const microfone = await modulo.requestMicrophonePermissionsAsync();
  const fala = await modulo.requestSpeechRecognizerPermissionsAsync();
  return Boolean(microfone.granted && fala.granted);
}

function prepararSessaoAudio(modulo: SpeechRecognitionNative): void {
  if (Platform.OS !== 'ios') return;
  try {
    modulo.setCategoryIOS({
      category: 'playAndRecord',
      categoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
      mode: 'measurement',
    });
    modulo.setAudioSessionActiveIOS(true, { notifyOthersOnDeactivation: true });
  } catch {
    /* sessão já ativa */
  }
}

export function iniciarReconhecimentoFala(contextualStrings?: string[]): void {
  const modulo = carregarModulo();
  if (!modulo) return;
  try {
    prepararSessaoAudio(modulo);
    modulo.start({
      lang: 'pt-BR',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
      contextualStrings: contextualStrings?.slice(0, 12),
    });
  } catch {
    /* sessão anterior ainda encerrando */
  }
}

export function pararReconhecimentoFala(): void {
  try {
    carregarModulo()?.stop();
  } catch {
    /* já parado */
  }
}

export function abortarReconhecimentoFala(): void {
  try {
    carregarModulo()?.abort();
  } catch {
    /* já parado */
  }
}

export function assinarReconhecimentoFala(ouvintes: OuvintesFala): () => void {
  const modulo = carregarModulo();
  if (!modulo) return () => {};

  const start = modulo.addListener('start', () => {
    ouvintes.onInicio?.();
  });
  const end = modulo.addListener('end', () => {
    ouvintes.onFim?.();
  });
  const result = modulo.addListener('result', (event: ExpoSpeechRecognitionResultEvent) => {
    const transcricao = event.results[0]?.transcript?.trim() ?? '';
    ouvintes.onResultado?.({ transcricao, final: event.isFinal });
  });
  const error = modulo.addListener('error', (event: ExpoSpeechRecognitionErrorEvent) => {
    const mensagem = mensagensErro[event.error] ?? event.message ?? 'Erro no reconhecimento de fala.';
    if (!mensagem) return;
    ouvintes.onErro?.(mensagem);
  });

  return () => {
    start.remove();
    end.remove();
    result.remove();
    error.remove();
  };
}

export { MENSAGEM_SEM_NATIVO };
