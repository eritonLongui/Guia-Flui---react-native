import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockModeContextType {
  isMockMode: boolean;
  toggleMockMode: () => void;
}

const MockModeContext = createContext<MockModeContextType | undefined>(undefined);

export const MockModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMockMode, setIsMockMode] = useState<boolean>(true); // Ativo por padrão no MVP

  useEffect(() => {
    // Carregar preferência salva
    AsyncStorage.getItem('isMockMode').then((val) => {
      if (val !== null) {
        setIsMockMode(val === 'true');
      }
    });
  }, []);

  const toggleMockMode = () => {
    const newVal = !isMockMode;
    setIsMockMode(newVal);
    AsyncStorage.setItem('isMockMode', String(newVal));
  };

  return (
    <MockModeContext.Provider value={{ isMockMode, toggleMockMode }}>
      {children}
    </MockModeContext.Provider>
  );
};

export const useMockMode = () => {
  const context = useContext(MockModeContext);
  if (!context) {
    throw new Error('useMockMode deve ser usado dentro de um MockModeProvider');
  }
  return context;
};
