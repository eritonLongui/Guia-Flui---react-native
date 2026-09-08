import { GradientBackground } from '@/components/GradientFill';
import { ScreenEdgeFades } from '@/components/ScreenEdgeFades';
import { layout } from '@/constants/theme';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  /** Scroll + KeyboardAvoidingView — use em telas com campos de texto. */
  keyboard?: boolean;
  /** Centraliza o conteúdo na vertical quando há espaço sobrando. */
  center?: boolean;
  /** Fica fixo no topo (fora do scroll), ex.: botão voltar. */
  header?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function ScreenContainer({
  children,
  scroll = false,
  keyboard = false,
  center = false,
  header,
  noPadding = false,
  className,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const shouldScroll = scroll || keyboard;
  const padH = noPadding ? 0 : layout.paddingHorizontal;

  if (shouldScroll) {
    const body = (
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: 'transparent' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboard ? 'on-drag' : 'none'}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: center ? 'center' : undefined,
          paddingTop: header ? 8 : insets.top,
          paddingHorizontal: padH,
          paddingBottom: insets.bottom + (keyboard ? 32 : layout.floatingTabBar.scrollPadding),
        }}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );

    const column = (
      <View style={{ flex: 1 }}>
        {header ? (
          <View style={{ paddingTop: insets.top, paddingHorizontal: padH }}>{header}</View>
        ) : null}
        {body}
      </View>
    );

    return (
      <View className="flex-1">
        <GradientBackground />
        {keyboard ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {column}
          </KeyboardAvoidingView>
        ) : (
          column
        )}
        <ScreenEdgeFades />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <GradientBackground />
      <View
        className={cn('flex-1', !noPadding && 'px-6', className)}
        style={{ paddingTop: insets.top }}
        {...props}>
        {header}
        {children}
      </View>
      <ScreenEdgeFades />
    </View>
  );
}
