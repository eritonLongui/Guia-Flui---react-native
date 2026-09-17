import { GradientBackground } from '@/components/GradientFill';
import { ScreenEdgeFades } from '@/components/ScreenEdgeFades';
import { layout } from '@/constants/theme';
import { cn } from '@/lib/cn';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function useAlturaTeclado(ativo: boolean): number {
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    if (!ativo) {
      setAltura(0);
      return;
    }

    const mostrar = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const esconder = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(mostrar, (event) => {
      setAltura(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(esconder, () => setAltura(0));

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [ativo]);

  return altura;
}

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
  const alturaTeclado = useAlturaTeclado(keyboard);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!keyboard || center || alturaTeclado === 0) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [alturaTeclado, keyboard, center]);

  if (shouldScroll) {
    const body = (
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        style={{ backgroundColor: 'transparent' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboard ? 'on-drag' : 'none'}
        automaticallyAdjustKeyboardInsets={keyboard}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: center ? 'center' : undefined,
          paddingTop: header ? 8 : insets.top,
          paddingHorizontal: padH,
          paddingBottom:
            insets.bottom +
            (keyboard
              ? 24 + (Platform.OS === 'android' ? alturaTeclado : 32)
              : layout.floatingTabBar.scrollPadding),
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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={header ? insets.top : 0}>
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
