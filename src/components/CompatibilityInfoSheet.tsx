import { Button } from '@/components/Button';
import { Title } from '@/components/Title';
import { colors, layout, spacing } from '@/constants/theme';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CompatibilityInfoSheetProps {
  visible: boolean;
  explicacao: string;
  onClose: () => void;
}

export function CompatibilityInfoSheet({
  visible,
  explicacao,
  onClose,
}: CompatibilityInfoSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay} accessibilityViewIsModal={visible}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
          ]}>
          <Title size="md" style={styles.title}>
            Compatibilidade
          </Title>
          <Text style={styles.body}>{explicacao}</Text>
          <Button label="Entendi" onPress={onClose} className="mt-6" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    flexGrow: 1,
  },
  sheet: {
    flexGrow: 0,
    backgroundColor: colors.backgroundEnd,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: layout.paddingHorizontal,
    paddingTop: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: colors.textPrimary,
  },
});
