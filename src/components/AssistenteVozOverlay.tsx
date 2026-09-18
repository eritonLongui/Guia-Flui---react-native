import { AssistenteVozAvatar } from '@/components/AssistenteVozAvatar';
import { Button } from '@/components/Button';
import { GradientFill } from '@/components/GradientFill';
import { colors, layout, spacing } from '@/constants/theme';
import type { EstadoAssistente } from '@/hooks/useAssistenteVoz';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AssistenteVozOverlayProps {
  visible: boolean;
  estado: EstadoAssistente;
  erro: string | null;
  volume: number;
  onClose: () => void;
  onPlayPause: () => void;
}

function rotuloEstado(estado: EstadoAssistente): string {
  if (estado === 'ouvindo') return 'Ouvindo…';
  if (estado === 'pausado') return 'Toque em Falar para começar';
  if (estado === 'pensando') return 'Pensando…';
  if (estado === 'falando') return 'Falando…';
  if (estado === 'erro') return 'Algo deu errado';
  return 'Assistente de voz';
}

function rotuloPlayPause(estado: EstadoAssistente): { label: string; hint: string } {
  if (estado === 'ouvindo') {
    return { label: 'Pausar', hint: 'Para de gravar e envia o que você falou' };
  }
  if (estado === 'falando' || estado === 'pensando') {
    return { label: 'Aguarde', hint: 'Espere a resposta terminar para falar de novo' };
  }
  return { label: 'Falar', hint: 'Começa a ouvir você' };
}

export function AssistenteVozOverlay({
  visible,
  estado,
  erro,
  volume,
  onClose,
  onPlayPause,
}: AssistenteVozOverlayProps) {
  const insets = useSafeAreaInsets();
  const tabBarTop =
    insets.bottom + layout.floatingTabBar.bottomOffset + layout.floatingTabBar.height;
  const ocupado = estado === 'pensando' || estado === 'falando';
  const playPause = rotuloPlayPause(estado);

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
          accessibilityLabel="Encerrar conversa"
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
              accessibilityLabel="Encerrar"
              accessibilityHint="Encerra a conversa por voz"
              hitSlop={HIT_SLOP_PADRAO}
              onPress={onClose}
              style={styles.closeButton}>
              <X aria-hidden={true} size={18} color={colors.textMuted} />
            </Pressable>

            <Text style={styles.kicker}>Assistente de Voz</Text>
            <Text style={styles.status} accessibilityLiveRegion="polite">
              {rotuloEstado(estado)}
            </Text>

            {erro ? <Text style={styles.error}>{erro}</Text> : null}

            <View style={styles.avatarHit}>
              <AssistenteVozAvatar estado={estado} volume={volume} />
            </View>

            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Volume do microfone"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(volume * 100) }}
              style={styles.barras}>
              {[0.08, 0.22, 0.4, 0.6, 0.78].map((limiar, i) => (
                <View
                  key={limiar}
                  style={[
                    styles.barra,
                    { height: 10 + i * 5 },
                    estado === 'ouvindo' && volume >= limiar ? styles.barraLigada : styles.barraApagada,
                  ]}
                />
              ))}
            </View>

            <View style={styles.playPauseWrap}>
              <Button
                variant="accent"
                label={playPause.label}
                disabled={ocupado}
                accessibilityHint={playPause.hint}
                onPress={onPlayPause}
                className="w-full"
              />
            </View>
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
    alignItems: 'center',
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
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.accent,
    textAlign: 'center',
  },
  status: {
    marginTop: 8,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  error: {
    marginTop: spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  avatarHit: {
    marginVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barras: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    height: 32,
    marginBottom: spacing.xxl,
  },
  barra: {
    width: 7,
    borderRadius: 4,
  },
  barraLigada: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  barraApagada: {
    backgroundColor: colors.accent,
    opacity: 0.18,
  },
  playPauseWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
