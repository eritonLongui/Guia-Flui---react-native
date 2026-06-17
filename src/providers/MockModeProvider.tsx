import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = '@rota/mock_mode';

interface MockModeContextData {
  isMockMode: boolean;
  toggleMockMode: () => void;
  carregando: boolean;
}

const MockModeContext = createContext<MockModeContextData>({
  isMockMode: true,
  toggleMockMode: () => {},
  carregando: true,
});

export function MockModeProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(true);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!mounted) return;
      if (value !== null) setIsMockMode(value === 'true');
      setCarregando(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleMockMode = useCallback(() => {
    setIsMockMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <MockModeContext.Provider value={{ isMockMode, toggleMockMode, carregando }}>
      {children}
    </MockModeContext.Provider>
  );
}

export function useMockMode() {
  return useContext(MockModeContext);
}
