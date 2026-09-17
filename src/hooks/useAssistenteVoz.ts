import { perguntarAssistenteVoz, type AcaoAssistente, type MensagemAssistente } from '@/lib/assistenteVoz';
import {
  abortarReconhecimentoFala,
  assinarReconhecimentoFala,
  iniciarReconhecimentoFala,
  pararReconhecimentoFala,
  pedirPermissaoFala,
  reconhecimentoNativoDisponivel,
} from '@/lib/reconhecimentoFala';
import type { Eletroposto, Veiculo } from '@/types';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoAssistente = 'idle' | 'ouvindo' | 'pensando' | 'falando' | 'erro';

interface UseAssistenteVozParams {
  eletropostos: Eletroposto[];
  veiculo: Veiculo | null;
  onAcoes: (acoes: AcaoAssistente[]) => void;
}

export function useAssistenteVoz({ eletropostos, veiculo, onAcoes }: UseAssistenteVozParams) {
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
  const transcricaoRef = useRef('');
  const processandoRef = useRef(false);
  const turnoRef = useRef(0);
  const abertoRef = useRef(false);

  const encerrarFala = useCallback(() => {
    abortarReconhecimentoFala();
    Speech.stop();
  }, []);

  const fechar = useCallback(() => {
    turnoRef.current += 1;
    processandoRef.current = false;
    abertoRef.current = false;
    encerrarFala();
    historicoRef.current = [];
    transcricaoRef.current = '';
    setAberto(false);
    setEstado('idle');
    setTranscricao('');
    setResposta('');
    setErro(null);
  }, [encerrarFala]);

  const processarTurno = useCallback(async (textoUsuario: string) => {
    const texto = textoUsuario.trim();
    if (!texto || processandoRef.current || !abertoRef.current) return;

    processandoRef.current = true;
    const turno = turnoRef.current + 1;
    turnoRef.current = turno;
    pararReconhecimentoFala();
    Speech.stop();
    setErro(null);
    setTranscricao(texto);
    setEstado('pensando');

    historicoRef.current = [
      ...historicoRef.current,
      { papel: 'usuario', texto },
    ];

    try {
      const resultado = await perguntarAssistenteVoz({
        mensagens: historicoRef.current,
        eletropostos: eletropostosRef.current,
        veiculo: veiculoRef.current,
      });

      if (turno !== turnoRef.current || !abertoRef.current) return;

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
        transcricaoRef.current = '';
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
      const mensagem =
        cause instanceof Error ? cause.message : 'Não consegui responder agora.';
      setErro(mensagem);
      setEstado('erro');
    } finally {
      if (turno === turnoRef.current) {
        processandoRef.current = false;
      }
    }
  }, []);

  const comecarAOuvir = useCallback(async () => {
    setErro(null);
    setTranscricao('');
    transcricaoRef.current = '';
    if (!reconhecimentoNativoDisponivel()) {
      setErro(
        'O microfone precisa de um build nativo novo. Rode npm run ios e abra o app de novo.',
      );
      setEstado('erro');
      return;
    }
    const permitido = await pedirPermissaoFala();
    if (!permitido) {
      setErro('Preciso da permissão do microfone e do reconhecimento de fala.');
      setEstado('erro');
      return;
    }
    Speech.stop();
    setEstado('ouvindo');
    iniciarReconhecimentoFala(
      eletropostosRef.current.slice(0, 12).map((ep) => ep.nome),
    );
  }, []);

  const abrir = useCallback(async () => {
    abertoRef.current = true;
    setAberto(true);
    setResposta('');
    await comecarAOuvir();
  }, [comecarAOuvir]);

  const enviarTexto = useCallback((textoDigitado: string) => {
    void processarTurno(textoDigitado);
  }, [processarTurno]);

  const tocarMicrofone = useCallback(async () => {
    if (!abertoRef.current) {
      await abrir();
      return;
    }
    if (estado === 'ouvindo') {
      pararReconhecimentoFala();
      return;
    }
    if (estado === 'pensando' || estado === 'falando') {
      fechar();
      return;
    }
    await comecarAOuvir();
  }, [abrir, comecarAOuvir, estado, fechar]);

  useEffect(() => {
    return assinarReconhecimentoFala({
      onInicio: () => {
        if (!abertoRef.current) return;
        setEstado('ouvindo');
      },
      onResultado: ({ transcricao: texto, final }) => {
        if (!abertoRef.current) return;
        transcricaoRef.current = texto;
        setTranscricao(texto);
        if (final) {
          void processarTurno(texto);
        }
      },
      onFim: () => {
        if (!abertoRef.current || processandoRef.current) return;
        const texto = transcricaoRef.current.trim();
        if (texto) {
          void processarTurno(texto);
          return;
        }
        setEstado((atual) => (atual === 'ouvindo' ? 'idle' : atual));
      },
      onErro: (mensagem) => {
        if (!abertoRef.current || processandoRef.current) return;
        abortarReconhecimentoFala();
        setErro(mensagem);
        setEstado('idle');
      },
    });
  }, [processarTurno]);

  useEffect(() => () => encerrarFala(), [encerrarFala]);

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
