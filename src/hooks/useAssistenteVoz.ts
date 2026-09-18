import { perguntarAssistenteVoz, type AcaoAssistente, type MensagemAssistente } from '@/lib/assistenteVoz';
import {
  encerrarSessaoGravacao,
  microfoneDisponivel,
  pedirPermissaoMicrofone,
  prepararSessaoGravacao,
  type AudioGravado,
} from '@/lib/gravacaoVoz';
import {
  TAXA_PCM_HZ,
  float32ParaInt16,
  juntarPcm,
  maximoAmostrasPcm,
  minimoAmostrasPcm,
  pcmParaAudioWav,
  volumeDePcm16,
} from '@/lib/pcmVoz';
import { falar, pararFala } from '@/lib/vozAssistente';
import { pararSom, tocarSom } from '@/lib/sonsAssistente';
import type { Eletroposto, Veiculo } from '@/types';
import { useAudioStream } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoAssistente = 'idle' | 'ouvindo' | 'pausado' | 'pensando' | 'falando' | 'erro';

interface UseAssistenteVozParams {
  eletropostos: Eletroposto[];
  veiculo: Veiculo | null;
  onAcoes: (acoes: AcaoAssistente[]) => void;
}

/**
 * Play começa a capturar PCM do microfone; pause empacota WAV e envia.
 */
export function useAssistenteVoz({ eletropostos, veiculo, onAcoes }: UseAssistenteVozParams) {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState<EstadoAssistente>('idle');
  const [erro, setErro] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const eletropostosRef = useRef(eletropostos);
  eletropostosRef.current = eletropostos;
  const veiculoRef = useRef(veiculo);
  veiculoRef.current = veiculo;
  const onAcoesRef = useRef(onAcoes);
  onAcoesRef.current = onAcoes;

  const historicoRef = useRef<MensagemAssistente[]>([]);
  const processandoRef = useRef(false);
  const gravandoRef = useRef(false);
  const iniciandoRef = useRef(false);
  const turnoRef = useRef(0);
  const abertoRef = useRef(false);
  const estadoRef = useRef<EstadoAssistente>('idle');
  estadoRef.current = estado;
  const chunksRef = useRef<Int16Array[]>([]);
  const taxaRef = useRef(TAXA_PCM_HZ);
  const amostrasRef = useRef(0);
  const finalizarRef = useRef<() => Promise<void>>(async () => {});

  const { stream } = useAudioStream({
    sampleRate: TAXA_PCM_HZ,
    channels: 1,
    encoding: 'float32',
    onBuffer: (buffer) => {
      if (!gravandoRef.current) return;
      const pcm = float32ParaInt16(buffer.data);
      if (pcm.length === 0) return;
      chunksRef.current.push(pcm);
      amostrasRef.current += pcm.length;
      if (buffer.sampleRate) taxaRef.current = buffer.sampleRate;
      setVolume(volumeDePcm16(pcm));
      if (amostrasRef.current >= maximoAmostrasPcm(taxaRef.current)) {
        void finalizarRef.current();
      }
    },
  });

  const fechar = useCallback(() => {
    turnoRef.current += 1;
    processandoRef.current = false;
    abertoRef.current = false;
    gravandoRef.current = false;
    chunksRef.current = [];
    amostrasRef.current = 0;
    try {
      stream.stop();
    } catch {
      /* stream já parado */
    }
    void pararFala();
    pararSom();
    void encerrarSessaoGravacao();
    historicoRef.current = [];
    setVolume(0);
    setAberto(false);
    setEstado('idle');
    setErro(null);
  }, [stream]);

  const enviarTurno = useCallback(async (audio: AudioGravado) => {
    if (processandoRef.current || !abertoRef.current) return;

    processandoRef.current = true;
    const turno = turnoRef.current + 1;
    turnoRef.current = turno;
    setErro(null);
    setEstado('pensando');

    try {
      const resultado = await perguntarAssistenteVoz({
        mensagens: historicoRef.current,
        eletropostos: eletropostosRef.current,
        veiculo: veiculoRef.current,
        audio,
      });

      if (turno !== turnoRef.current || !abertoRef.current) return;

      if (resultado.transcricao) {
        historicoRef.current = [
          ...historicoRef.current,
          { papel: 'usuario', texto: resultado.transcricao },
        ];
      }
      historicoRef.current = [
        ...historicoRef.current,
        { papel: 'assistente', texto: resultado.texto },
      ];

      setEstado('falando');
      await falar({ texto: resultado.texto, audioBase64: resultado.audioBase64 });

      if (turno !== turnoRef.current || !abertoRef.current) return;

      if (resultado.acoes.length > 0) {
        onAcoesRef.current(resultado.acoes);
        historicoRef.current = [];
        abertoRef.current = false;
        setAberto(false);
        setEstado('idle');
        setErro(null);
        return;
      }

      processandoRef.current = false;
      setEstado('pausado');
    } catch (cause) {
      if (turno !== turnoRef.current || !abertoRef.current) return;
      setErro(cause instanceof Error ? cause.message : 'Não consegui responder agora.');
      setEstado('erro');
      tocarSom('erro');
    } finally {
      if (turno === turnoRef.current) {
        processandoRef.current = false;
      }
    }
  }, []);

  const finalizarTurno = useCallback(async () => {
    if (!gravandoRef.current) return;
    gravandoRef.current = false;
    setVolume(0);
    setEstado('pensando');

    try {
      stream.stop();
    } catch {
      /* já parado */
    }

    const pcm = juntarPcm(chunksRef.current);
    chunksRef.current = [];
    const amostras = amostrasRef.current;
    amostrasRef.current = 0;

    if (!abertoRef.current) {
      await encerrarSessaoGravacao();
      return;
    }

    if (amostras < minimoAmostrasPcm(taxaRef.current)) {
      await encerrarSessaoGravacao();
      setEstado('pausado');
      setErro('A fala ficou curta demais. Toque em play e fale de novo.');
      return;
    }

    tocarSom('fimEscuta');
    try {
      const audio = await pcmParaAudioWav(pcm, taxaRef.current);
      await encerrarSessaoGravacao();
      await enviarTurno(audio);
    } catch (cause) {
      await encerrarSessaoGravacao();
      if (!abertoRef.current) return;
      setErro(cause instanceof Error ? cause.message : 'Não consegui enviar o áudio.');
      setEstado('erro');
      tocarSom('erro');
    }
  }, [enviarTurno, stream]);

  finalizarRef.current = finalizarTurno;

  const iniciarStream = useCallback(async () => {
    try {
      stream.stop();
    } catch {
      /* ainda não tinha começado */
    }
    await prepararSessaoGravacao();
    try {
      await stream.start();
    } catch {
      try {
        stream.stop();
      } catch {
        /* retry */
      }
      await prepararSessaoGravacao();
      await stream.start();
    }
  }, [stream]);

  const ouvir = useCallback(async () => {
    if (gravandoRef.current || iniciandoRef.current || processandoRef.current) return;
    iniciandoRef.current = true;
    setErro(null);
    setVolume(0);

    try {
      if (!microfoneDisponivel) {
        setErro('O assistente de voz só funciona no app.');
        setEstado('erro');
        tocarSom('erro');
        return;
      }

      const permitido = await pedirPermissaoMicrofone();
      if (!permitido) {
        setErro('Preciso da permissão do microfone para ouvir você.');
        setEstado('erro');
        tocarSom('erro');
        return;
      }

      if (!abertoRef.current) return;

      chunksRef.current = [];
      amostrasRef.current = 0;
      taxaRef.current = TAXA_PCM_HZ;

      try {
        pararSom();
        await iniciarStream();
      } catch {
        await encerrarSessaoGravacao();
        setErro('Não consegui abrir o microfone. Tente de novo.');
        setEstado('erro');
        return;
      }

      gravandoRef.current = true;
      setEstado('ouvindo');
    } finally {
      iniciandoRef.current = false;
    }
  }, [iniciarStream]);

  const abrir = useCallback(() => {
    abertoRef.current = true;
    setAberto(true);
    setEstado('pausado');
    setErro(null);
    setVolume(0);
  }, []);

  const alternarPlayPause = useCallback(async () => {
    if (iniciandoRef.current) return;

    const atual = estadoRef.current;
    if (atual === 'pensando' || atual === 'falando') return;

    if (atual === 'ouvindo' || gravandoRef.current) {
      await finalizarTurno();
      return;
    }

    setErro(null);
    await ouvir();
  }, [finalizarTurno, ouvir]);

  const tocarMicrofone = useCallback(() => {
    if (!abertoRef.current) {
      abrir();
      return;
    }
    fechar();
  }, [abrir, fechar]);

  useEffect(
    () => () => {
      gravandoRef.current = false;
      try {
        stream.stop();
      } catch {
        /* unmount */
      }
      void pararFala();
    },
    [stream],
  );

  return {
    aberto,
    estado,
    erro,
    volume: estado === 'ouvindo' ? volume : 0,
    abrir,
    fechar,
    tocarMicrofone,
    alternarPlayPause,
  };
}
