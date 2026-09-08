import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { usuarioRepository, veiculoRepository } from '@/repositories';
import type { Veiculo } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface VeiculoAtivoContextData {
  veiculo: Veiculo | null;
  carregando: boolean;
  recarregar: () => Promise<void>;
}

const VeiculoAtivoContext = createContext<VeiculoAtivoContextData>({
  veiculo: null,
  carregando: true,
  recarregar: async () => {},
});

export function VeiculoAtivoProvider({ children }: { children: ReactNode }) {
  const { session, carregando: carregandoAuth } = useAuth();
  const { isMockMode } = useMockMode();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const usuario = await usuarioRepository.obterAtual();
      if (!usuario) {
        setVeiculo(null);
        return;
      }
      const ativo = await veiculoRepository.obterAtivo(usuario.id);
      setVeiculo(ativo);
    } catch {
      setVeiculo(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (carregandoAuth) return;
    recarregar();
  }, [carregandoAuth, session?.user.id, isMockMode, recarregar]);

  return (
    <VeiculoAtivoContext.Provider value={{ veiculo, carregando, recarregar }}>
      {children}
    </VeiculoAtivoContext.Provider>
  );
}

export function useVeiculoAtivo() {
  return useContext(VeiculoAtivoContext);
}
