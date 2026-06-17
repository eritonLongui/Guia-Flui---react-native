import { Button } from '@/components/Button';
import { CompatibilityBadge } from '@/components/CompatibilityBadge';
import { colors } from '@/constants/theme';
import { formatarDistancia } from '@/lib/formatadores';
import type { Eletroposto } from '@/types';
import { MapPin, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface MapStationPopupProps {
  eletroposto: Eletroposto;
  onClose: () => void;
  onVerMais: () => void;
}

export function MapStationPopup({ eletroposto, onClose, onVerMais }: MapStationPopupProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        <Pressable
          accessibilityLabel="Fechar"
          hitSlop={12}
          onPress={onClose}
          style={styles.closeButton}>
          <X size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.header}>
          <CompatibilityBadge nivel={eletroposto.nivelCompatibilidade} />
          {eletroposto.distanciaKm !== undefined && (
            <View style={styles.distancia}>
              <MapPin size={15} color={colors.textSecondary} />
              <Text className="ml-1 font-poppins text-sm text-text-secondary">
                {formatarDistancia(eletroposto.distanciaKm)}
              </Text>
            </View>
          )}
        </View>

        <Text className="mt-3 font-poppins-bold text-xl tracking-title text-text-primary" numberOfLines={2}>
          {eletroposto.nome}
        </Text>
        <Text className="mt-1 font-poppins text-sm text-text-muted" numberOfLines={2}>
          {eletroposto.endereco}
        </Text>

        <View className="mt-4">
          <Button label="Ver mais" onPress={onVerMais} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: '22%',
    zIndex: 8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 28,
  },
  distancia: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
