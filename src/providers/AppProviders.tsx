import { FavoritosProvider } from '@/providers/FavoritosProvider';
import { MockModeProvider } from '@/providers/MockModeProvider';
import { VeiculoAtivoProvider } from '@/providers/VeiculoAtivoProvider';
import { colors } from '@/constants/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <MockModeProvider>
          <VeiculoAtivoProvider>
            <FavoritosProvider>
              <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
            </FavoritosProvider>
          </VeiculoAtivoProvider>
        </MockModeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
