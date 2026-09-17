import { Button } from '@/components/Button';
import { GradientFill } from '@/components/GradientFill';
import { colors, layout, spacing } from '@/constants/theme';
import type { EstadoAssistente } from '@/hooks/useAssistenteVoz';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { Mic, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AssistenteVozOverlayProps {
  visible: boolean;
  estado: EstadoAssistente;
  transcricao: string;
  resposta: string;
  erro: string | null;
  onClose: () => void;
  onToggleEscuta: () => void;
  onEnviarTexto: (texto: string) => void;
}

function rotuloEstado(estado: EstadoAssistente): string {
  if (estado === 'ouvindo') return 'Ouvindo…';
  if (estado === 'pensando') return 'Pensando…';
  if (estado === 'falando') return 'Falando…';
  if (estado === 'erro') return 'Algo deu errado';
  return 'Toque no microfone para falar';
}

export function AssistenteVozOverlay({
  visible,
  estado,
  transcricao,
  resposta,
  erro,
  onClose,
  onToggleEscuta,
  onEnviarTexto,
}: AssistenteVozOverlayProps) {
  const insets = useSafeAreaInsets();
  const pulso = useSharedValue(1);
  const [rascunho, setRascunho] = useState('');

  useEffect(() => {
    if (!visible) setRascunho('');
  }, [visible]);

  useEffect(() => {
    if (estado === 'ouvindo') {
      pulso.value = withRepeat(
        withTiming(1.18, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      return;
    }
    pulso.value = withTiming(1, { duration: 180 });
  }, [estado, pulso]);

  const pulsoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulso.value }],
  }));

  const tabBarTop =
    insets.bottom + layout.floatingTabBar.bottomOffset + layout.floatingTabBar.height;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar assistente de voz"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={[styles.sheetWrap, { bottom: tabBarTop + spacing.md }]}>
          <GradientFill variant="card" rounded style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              accessibilityHint="Fecha o assistente de voz"
              hitSlop={HIT_SLOP_PADRAO}
              onPress={onClose}
              style={styles.closeButton}>
              <X aria-hidden={true} size={18} color={colors.textMuted} />
            </Pressable>

            <Text style={styles.kicker}>Guia</Text>
            <Text style={styles.status}>{rotuloEstado(estado)}</Text>

            {transcricao ? (
              <Text style={styles.transcript} accessibilityLiveRegion="polite">
                {transcricao}
              </Text>
            ) : null}

            {resposta ? (
              <Text style={styles.reply} accessibilityLiveRegion="polite">
                {resposta}
              </Text>
            ) : null}

            {erro ? <Text style={styles.error}>{erro}</Text> : null}

            <View style={styles.micRow}>
              <Animated.View style={pulsoStyle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    estado === 'ouvindo' ? 'Parar de ouvir' : 'Falar com o Guia'
                  }
                  accessibilityHint="Inicia ou interrompe o reconhecimento de voz"
                  onPress={onToggleEscuta}
                  style={[
                    styles.micButton,
                    estado === 'ouvindo' && styles.micButtonActive,
                  ]}>
                  <Mic
                    aria-hidden={true}
                    size={26}
                    color={estado === 'ouvindo' ? colors.backgroundEnd : colors.textPrimary}
                  />
                </Pressable>
              </Animated.View>
            </View>

            <TextInput
              value={rascunho}
              onChangeText={setRascunho}
              placeholder="Ou pergunte por escrito"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Perguntar por escrito"
              editable={estado !== 'pensando'}
              returnKeyType="send"
              onSubmitEditing={() => {
                const texto = rascunho.trim();
                if (!texto || estado === 'pensando') return;
                setRascunho('');
                onEnviarTexto(texto);
              }}
              style={styles.textoInput}
            />

            <Button
              variant="ghost"
              label="Fechar"
              accessibilityHint="Fecha o assistente de voz"
              onPress={onClose}
            />
          </GradientFill>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  kicker: {
    fontFamily: 'LexendGiga_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  status: {
    marginTop: 6,
    paddingRight: 28,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  transcript: {
    marginTop: spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  reply: {
    marginTop: spacing.sm,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  error: {
    marginTop: spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.danger,
  },
  micRow: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  micButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  textoInput: {
    minHeight: 48,
    marginBottom: spacing.md,
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textPrimary,
  },
});
