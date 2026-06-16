import { FavoritosProvider } from '@/providers/FavoritosProvider';
import { MockModeProvider } from '@/providers/MockModeProvider';
import { VeiculoAtivoProvider } from '@/providers/VeiculoAtivoProvider';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MockModeProvider>
        <VeiculoAtivoProvider>
          <FavoritosProvider>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </FavoritosProvider>
        </VeiculoAtivoProvider>
      </MockModeProvider>
    </GestureHandlerRootView>
  );
}
