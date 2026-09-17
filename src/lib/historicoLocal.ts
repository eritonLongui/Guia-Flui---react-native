import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@guia-flui/historico_local';
const LIMITE_PONTOS = 20;
const LIMITE_BUSCAS = 12;
const BUSCA_MINIMA = 2;

export interface HistoricoPonto {
  id: string;
  vistoEm: string;
}

export interface HistoricoBusca {
  termo: string;
  em: string;
}

export interface HistoricoLocal {
  pontos: HistoricoPonto[];
  buscas: HistoricoBusca[];
}

const VAZIO: HistoricoLocal = { pontos: [], buscas: [] };

type Listener = () => void;
const listeners = new Set<Listener>();

function avisar() {
  listeners.forEach((listener) => listener());
}

function normalizarTermo(termo: string): string {
  return termo.trim().replace(/\s+/g, ' ');
}

function chaveBusca(termo: string): string {
  return normalizarTermo(termo).toLocaleLowerCase('pt-BR');
}

async function lerBruto(): Promise<HistoricoLocal> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return VAZIO;
    const parsed = JSON.parse(raw) as Partial<HistoricoLocal>;
    return {
      pontos: Array.isArray(parsed.pontos) ? parsed.pontos.filter((p) => p?.id) : [],
      buscas: Array.isArray(parsed.buscas) ? parsed.buscas.filter((b) => b?.termo) : [],
    };
  } catch {
    return VAZIO;
  }
}

let fila: Promise<void> = Promise.resolve();

function enfileirar(mutar: (atual: HistoricoLocal) => HistoricoLocal) {
  fila = fila
    .then(async () => {
      const atual = await lerBruto();
      const next = mutar(atual);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      avisar();
    })
    .catch(() => {});
}

export function registrarPontoAberto(id: string) {
  if (!id) return;
  const vistoEm = new Date().toISOString();
  enfileirar((atual) => ({
    ...atual,
    pontos: [{ id, vistoEm }, ...atual.pontos.filter((p) => p.id !== id)].slice(0, LIMITE_PONTOS),
  }));
}

export function registrarBusca(termo: string) {
  const limpo = normalizarTermo(termo);
  if (limpo.length < BUSCA_MINIMA) return;
  const em = new Date().toISOString();
  const chave = chaveBusca(limpo);
  enfileirar((atual) => ({
    ...atual,
    buscas: [
      { termo: limpo, em },
      ...atual.buscas.filter((b) => chaveBusca(b.termo) !== chave),
    ].slice(0, LIMITE_BUSCAS),
  }));
}

export async function lerHistorico(): Promise<HistoricoLocal> {
  return lerBruto();
}

export function limparPontos() {
  enfileirar((atual) => ({ ...atual, pontos: [] }));
}

export function limparBuscas() {
  enfileirar((atual) => ({ ...atual, buscas: [] }));
}

export function useHistoricoLocal() {
  const [historico, setHistorico] = useState<HistoricoLocal>(VAZIO);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const data = await lerHistorico();
    setHistorico(data);
    setCarregando(false);
  }, []);

  useEffect(() => {
    recarregar();
    listeners.add(recarregar);
    return () => {
      listeners.delete(recarregar);
    };
  }, [recarregar]);

  return {
    pontos: historico.pontos,
    buscas: historico.buscas,
    carregando,
    recarregar,
    limparPontos,
    limparBuscas,
  };
}
