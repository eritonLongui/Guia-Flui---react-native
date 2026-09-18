import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

type NomeSom = 'inicioEscuta' | 'fimEscuta' | 'inicioFala' | 'fimFala' | 'erro';

const FONTES: Record<NomeSom, number> = {
  inicioEscuta: require('../../assets/sounds/inicio-escuta.wav'),
  fimEscuta: require('../../assets/sounds/fim-escuta.wav'),
  inicioFala: require('../../assets/sounds/inicio-fala.wav'),
  fimFala: require('../../assets/sounds/fim-fala.wav'),
  erro: require('../../assets/sounds/erro.wav'),
};

let player: AudioPlayer | null = null;

export function pararSom(): void {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    /* já parado */
  }
  player = null;
}

export function tocarSom(nome: NomeSom): void {
  try {
    pararSom();
    player = createAudioPlayer(FONTES[nome]);
    player.volume = 0.42;
    player.play();
  } catch {
    /* som é só feedback; a conversa segue sem ele */
  }
}
