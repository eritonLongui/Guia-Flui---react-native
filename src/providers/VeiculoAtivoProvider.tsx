import { usuarioRepository, veiculoRepository } from '@/repositories/mockRepositories';
import type { Veiculo } from '@/types';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface VeiculoAtivoContextData {
  veiculo: Veiculo | null;
  carregando: boolean;
}

const VeiculoAtivoContext = createContext<VeiculoAtivoContextData>({
  veiculo: null,
  carregando: true,
});

export function VeiculoAtivoProvider({ children }: { children: ReactNode }) {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    usuarioRepository.obterAtual().then((usuario) =>
      veiculoRepository.obterAtivo(usuario.id).then((v) => {
        if (!mounted) return;
        setVeiculo(v);
        setCarregando(false);
      }),
    );

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <VeiculoAtivoContext.Provider value={{ veiculo, carregando }}>
      {children}
    </VeiculoAtivoContext.Provider>
  );
}

export function useVeiculoAtivo() {
  return useContext(VeiculoAtivoContext);
}
