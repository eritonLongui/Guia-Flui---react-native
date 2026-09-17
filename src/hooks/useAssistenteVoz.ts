import { perguntarAssistenteVoz, type AcaoAssistente, type MensagemAssistente } from '@/lib/assistenteVoz';
import {
  MAX_DURACAO_GRAVACAO_MS,
  MIN_DURACAO_GRAVACAO_MS,
  PRESET_VOZ,
  descartarAudio,
  encerrarSessaoGravacao,
  lerAudioGravado,
  microfoneDisponivel,
  pedirPermissaoMicrofone,
  prepararSessaoGravacao,
  type AudioGravado,
} from '@/lib/gravacaoVoz';
import type { Eletroposto, Veiculo } from '@/types';
import { useAudioRecorder } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoAssistente = 'idle' | 'gravando' | 'pensando' | 'falando' | 'erro';

interface UseAssistenteVozParams {
  eletropostos: Eletroposto[];
  veiculo: Veiculo | null;
  onAcoes: (acoes: AcaoAssistente[]) => void;
}

export function useAssistenteVoz({ eletropostos, veiculo, onAcoes }: UseAssistenteVozParams) {
  const gravador = useAudioRecorder(PRESET_VOZ);

  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState<EstadoAssistente>('idle');
  const [transcricao, setTranscricao] = useState('');
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const eletropostosRef = useRef(eletropostos);
  eletropostosRef.current = eletropostos;
  const veiculoRef = useRef(veiculo);
  veiculoRef.current = veiculo;
  const onAcoesRef = useRef(onAcoes);
  onAcoesRef.current = onAcoes;

  const historicoRef = useRef<MensagemAssistente[]>([]);
  const processandoRef = useRef(false);
  const gravandoRef = useRef(false);
  /** Cobre a janela assíncrona entre pedir a permissão e o gravador realmente ligar. */
  const iniciandoRef = useRef(false);
  /** Invalida turnos antigos: quem voltar com turno diferente do atual é descartado. */
  const turnoRef = useRef(0);
  const abertoRef = useRef(false);
  const cortePorTempoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limparCorte = useCallback(() => {
    if (cortePorTempoRef.current) {
      clearTimeout(cortePorTempoRef.current);
      cortePorTempoRef.current = null;
    }
  }, []);

  const descartarGravacao = useCallback(async () => {
    limparCorte();
    if (!gravandoRef.current) return;
    gravandoRef.current = false;
    try {
      await gravador.stop();
      descartarAudio(gravador.uri);
    } catch {
      /* gravador já parado */
    }
    await encerrarSessaoGravacao();
  }, [gravador, limparCorte]);

  const fechar = useCallback(() => {
    turnoRef.current += 1;
    processandoRef.current = false;
    abertoRef.current = false;
    Speech.stop();
    void descartarGravacao();
    historicoRef.current = [];
    setAberto(false);
    setEstado('idle');
    setTranscricao('');
    setResposta('');
    setErro(null);
  }, [descartarGravacao]);

  const enviarTurno = useCallback(
    async (entrada: { texto?: string; audio?: AudioGravado }) => {
      if (processandoRef.current || !abertoRef.current) return;

      processandoRef.current = true;
      const turno = turnoRef.current + 1;
      turnoRef.current = turno;
      Speech.stop();
      setErro(null);
      setEstado('pensando');

      const textoUsuario = entrada.texto?.trim() ?? '';
      if (textoUsuario) {
        setTranscricao(textoUsuario);
        historicoRef.current = [...historicoRef.current, { papel: 'usuario', texto: textoUsuario }];
      }

      try {
        const resultado = await perguntarAssistenteVoz({
          mensagens: historicoRef.current,
          eletropostos: eletropostosRef.current,
          veiculo: veiculoRef.current,
          audio: entrada.audio ?? null,
        });

        if (turno !== turnoRef.current || !abertoRef.current) return;

        // Com áudio, só aqui sabemos o que o usuário disse — o servidor transcreveu.
        if (resultado.transcricao) {
          setTranscricao(resultado.transcricao);
          historicoRef.current = [
            ...historicoRef.current,
            { papel: 'usuario', texto: resultado.transcricao },
          ];
        }

        historicoRef.current = [
          ...historicoRef.current,
          { papel: 'assistente', texto: resultado.texto },
        ];
        setResposta(resultado.texto);
        setEstado('falando');

        await new Promise<void>((resolve) => {
          Speech.speak(resultado.texto, {
            language: 'pt-BR',
            onDone: resolve,
            onStopped: resolve,
            onError: () => resolve(),
          });
        });

        if (turno !== turnoRef.current || !abertoRef.current) return;

        if (resultado.acoes.length > 0) {
          onAcoesRef.current(resultado.acoes);
          historicoRef.current = [];
          abertoRef.current = false;
          setAberto(false);
          setEstado('idle');
          setTranscricao('');
          setResposta('');
          setErro(null);
          return;
        }
        setEstado('idle');
      } catch (cause) {
        if (turno !== turnoRef.current || !abertoRef.current) return;
        const mensagem = cause instanceof Error ? cause.message : 'Não consegui responder agora.';
        setErro(mensagem);
        setEstado('erro');
      } finally {
        if (turno === turnoRef.current) {
          processandoRef.current = false;
        }
      }
    },
    [],
  );

  const pararEEnviar = useCallback(async () => {
    if (!gravandoRef.current) return;
    limparCorte();
    gravandoRef.current = false;

    let duracaoMs = 0;
    try {
      duracaoMs = gravador.getStatus().durationMillis;
      await gravador.stop();
    } catch {
      await encerrarSessaoGravacao();
      if (!abertoRef.current) return;
      setErro('Não consegui finalizar a gravação. Tente de novo.');
      setEstado('erro');
      return;
    }

    const uri = gravador.uri;
    await encerrarSessaoGravacao();
    if (!abertoRef.current) return;

    if (duracaoMs < MIN_DURACAO_GRAVACAO_MS) {
      descartarAudio(uri);
      setEstado('idle');
      return;
    }

    setEstado('pensando');
    try {
      const audio = await lerAudioGravado(uri);
      await enviarTurno({ audio });
    } catch (cause) {
      if (!abertoRef.current) return;
      setErro(cause instanceof Error ? cause.message : 'Não consegui enviar o áudio.');
      setEstado('erro');
    }
  }, [enviarTurno, gravador, limparCorte]);

  const comecarAGravar = useCallback(async () => {
    if (gravandoRef.current || iniciandoRef.current || processandoRef.current) return;
    iniciandoRef.current = true;
    setErro(null);
    setTranscricao('');
    setResposta('');

    try {
      if (!microfoneDisponivel) {
        setErro('O assistente de voz só funciona no app. Pergunte por escrito abaixo.');
        setEstado('erro');
        return;
      }

      const permitido = await pedirPermissaoMicrofone();
      if (!permitido) {
        setErro('Preciso da permissão do microfone para ouvir você.');
        setEstado('erro');
        return;
      }

      if (!abertoRef.current) return;

      Speech.stop();
      try {
        await prepararSessaoGravacao();
        await gravador.prepareToRecordAsync();
        gravador.record();
      } catch {
        await encerrarSessaoGravacao();
        setErro('Não consegui abrir o microfone. Tente de novo.');
        setEstado('erro');
        return;
      }

      gravandoRef.current = true;
      setEstado('gravando');

      limparCorte();
      cortePorTempoRef.current = setTimeout(() => {
        void pararEEnviar();
      }, MAX_DURACAO_GRAVACAO_MS);
    } finally {
      iniciandoRef.current = false;
    }
  }, [gravador, limparCorte, pararEEnviar]);

  const abrir = useCallback(async () => {
    abertoRef.current = true;
    setAberto(true);
    await comecarAGravar();
  }, [comecarAGravar]);

  const enviarTexto = useCallback(
    (textoDigitado: string) => {
      const texto = textoDigitado.trim();
      if (!texto) return;
      void descartarGravacao().then(() => enviarTurno({ texto }));
    },
    [descartarGravacao, enviarTurno],
  );

  // Usa refs, não `estado`: toque duplo rápido chegaria aqui com o state ainda velho.
  const tocarMicrofone = useCallback(async () => {
    if (!abertoRef.current) {
      await abrir();
      return;
    }
    if (iniciandoRef.current) return;
    if (gravandoRef.current) {
      await pararEEnviar();
      return;
    }
    if (processandoRef.current) {
      fechar();
      return;
    }
    await comecarAGravar();
  }, [abrir, comecarAGravar, fechar, pararEEnviar]);

  useEffect(
    () => () => {
      limparCorte();
      Speech.stop();
    },
    [limparCorte],
  );

  return {
    aberto,
    estado,
    transcricao,
    resposta,
    erro,
    abrir,
    fechar,
    tocarMicrofone,
    enviarTexto,
  };
}
