import { AuthProvider } from '@/providers/AuthProvider';
import { ExplorarQueryProvider } from '@/providers/ExplorarQueryProvider';
import { FavoritosProvider } from '@/providers/FavoritosProvider';
import { LocalizacaoProvider } from '@/providers/LocalizacaoProvider';
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
          <AuthProvider>
            <LocalizacaoProvider>
              <VeiculoAtivoProvider>
                <FavoritosProvider>
                  <ExplorarQueryProvider>
                    <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
                  </ExplorarQueryProvider>
                </FavoritosProvider>
              </VeiculoAtivoProvider>
            </LocalizacaoProvider>
          </AuthProvider>
        </MockModeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
