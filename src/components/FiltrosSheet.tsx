import { Button } from '@/components/Button';
import { LocalizacaoPickerContent } from '@/components/LocalizacaoPickerSheet';
import { Title } from '@/components/Title';
import { colors, layout, spacing } from '@/constants/theme';
import {
  CONECTORES_FILTRO,
  FILTROS_INICIAIS,
  POTENCIAS_MIN_KW,
  type FiltrosExplorar,
} from '@/features/explorar/filtros';
import { HIT_SLOP_PADRAO } from '@/lib/a11y';
import { useLocalizacao } from '@/providers/LocalizacaoProvider';
import { ChevronRight, MapPin, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FiltrosSheetProps {
  visible: boolean;
  value: FiltrosExplorar;
  onClose: () => void;
  onApply: (filtros: FiltrosExplorar) => void;
}

type TelaFiltros = 'filtros' | 'localizacao';

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}>
      <Text aria-hidden={true} style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  last,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, last && styles.toggleRowLast]}>
      <Text aria-hidden={true} style={styles.toggleLabel}>
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accentDark }}
        thumbColor={value ? colors.accent : colors.textMuted}
      />
    </View>
  );
}

export function FiltrosSheet({ visible, value, onClose, onApply }: FiltrosSheetProps) {
  const insets = useSafeAreaInsets();
  const { localizacao, isManual } = useLocalizacao();
  const [draft, setDraft] = useState<FiltrosExplorar>(value);
  const [tela, setTela] = useState<TelaFiltros>('filtros');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setTela('filtros');
    }
  }, [visible, value]);

  const toggleConector = (tipo: string) => {
    setDraft((atual) => {
      const existe = atual.conectores.includes(tipo);
      return {
        ...atual,
        conectores: existe
          ? atual.conectores.filter((item) => item !== tipo)
          : [...atual.conectores, tipo],
      };
    });
  };

  const labelLocalizacao = localizacao
    ? [localizacao.endereco, localizacao.cidade, localizacao.estado]
        .filter(Boolean)
        .filter((parte, index, arr) => arr.indexOf(parte) === index)
        .join(' · ')
    : 'Carregando...';

  const fechar = () => {
    setTela('filtros');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        if (tela === 'localizacao') {
          setTela('filtros');
          return;
        }
        fechar();
      }}>
      <View
        accessibilityViewIsModal={visible}
        style={[
          styles.root,
          {
            // pageSheet no iOS já tem o grabber; só um respiro extra (sem insets.top inteiro).
            paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}>
        {tela === 'localizacao' ? (
          <LocalizacaoPickerContent
            onDone={() => setTela('filtros')}
            onClose={fechar}
          />
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Title size="md" style={styles.headerTitle}>
                Filtros
              </Title>
              <Pressable
                onPress={fechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                accessibilityHint="Fecha os filtros"
                hitSlop={HIT_SLOP_PADRAO}
                style={styles.headerButton}>
                <X aria-hidden={true} size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Pressable
                  style={styles.locationCard}
                  onPress={() => setTela('localizacao')}
                  accessibilityRole="button"
                  accessibilityLabel="Mudar localização"
                  accessibilityHint="Abre a busca de localização">
                  <MapPin aria-hidden={true} size={20} color={colors.accent} />
                  <Text style={styles.locationLabel}>
                    {isManual ? 'Definida manualmente' : 'GPS do aparelho'}
                  </Text>
                  <Text style={styles.locationValue}>{labelLocalizacao}</Text>
                  <View style={styles.changeRow}>
                    <Text style={styles.changeText}>Mudar localização</Text>
                    <ChevronRight aria-hidden={true} size={18} color={colors.accent} />
                  </View>
                </Pressable>
              </View>

              <View style={styles.section}>
                <View style={styles.block}>
                  <ToggleRow
                    label="Compatível com meu veículo"
                    value={draft.apenasCompativeis}
                    onValueChange={(apenasCompativeis) =>
                      setDraft((a) => ({ ...a, apenasCompativeis }))
                    }
                  />
                  <ToggleRow
                    last
                    label="Aberto agora"
                    value={draft.abertoAgora}
                    onValueChange={(abertoAgora) => setDraft((a) => ({ ...a, abertoAgora }))}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Distância máxima</Text>
                <View style={styles.distanceGrid}>
                  <View style={styles.chipsRow}>
                    <Chip
                      label="Qualquer"
                      active={draft.distanciaMaxKm == null}
                      onPress={() => setDraft((a) => ({ ...a, distanciaMaxKm: null }))}
                    />
                    <Chip
                      label="5 km"
                      active={draft.distanciaMaxKm === 5}
                      onPress={() => setDraft((a) => ({ ...a, distanciaMaxKm: 5 }))}
                    />
                    <Chip
                      label="10 km"
                      active={draft.distanciaMaxKm === 10}
                      onPress={() => setDraft((a) => ({ ...a, distanciaMaxKm: 10 }))}
                    />
                  </View>
                  <View style={styles.chipsRow}>
                    <Chip
                      label="20 km"
                      active={draft.distanciaMaxKm === 20}
                      onPress={() => setDraft((a) => ({ ...a, distanciaMaxKm: 20 }))}
                    />
                    <Chip
                      label="50 km"
                      active={draft.distanciaMaxKm === 50}
                      onPress={() => setDraft((a) => ({ ...a, distanciaMaxKm: 50 }))}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Potência mínima</Text>
                <View style={styles.chipsRow}>
                  <Chip
                    label="Qualquer"
                    active={draft.potenciaMinKw == null}
                    onPress={() => setDraft((a) => ({ ...a, potenciaMinKw: null }))}
                  />
                  {POTENCIAS_MIN_KW.map((kw) => (
                    <Chip
                      key={kw}
                      label={`≥ ${kw} kW`}
                      active={draft.potenciaMinKw === kw}
                      onPress={() => setDraft((a) => ({ ...a, potenciaMinKw: kw }))}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conectores</Text>
                <View style={styles.chipsRow}>
                  {CONECTORES_FILTRO.map((tipo) => (
                    <Chip
                      key={tipo}
                      label={tipo}
                      active={draft.conectores.includes(tipo)}
                      onPress={() => toggleConector(tipo)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conveniência</Text>
                <View style={styles.block}>
                  <ToggleRow
                    label="Banheiro"
                    value={draft.temBanheiro}
                    onValueChange={(temBanheiro) => setDraft((a) => ({ ...a, temBanheiro }))}
                  />
                  <ToggleRow
                    label="Comida"
                    value={draft.temComida}
                    onValueChange={(temComida) => setDraft((a) => ({ ...a, temComida }))}
                  />
                  <ToggleRow
                    last
                    label="Estacionamento"
                    value={draft.temEstacionamento}
                    onValueChange={(temEstacionamento) =>
                      setDraft((a) => ({ ...a, temEstacionamento }))
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.footerButtons}>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="secondary"
                    label="Limpar"
                    onPress={() => setDraft(FILTROS_INICIAIS)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Aplicar"
                    variant="primary"
                    onPress={() => {
                      onApply(draft);
                      fechar();
                    }}
                  />
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
    paddingHorizontal: layout.paddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xxl,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    width: '100%',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  distanceGrid: {
    width: '100%',
    gap: spacing.md,
  },
  locationCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  locationLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  locationValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  changeRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    width: '100%',
  },
  changeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: colors.accent,
  },
  block: {
    width: '100%',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
    paddingHorizontal: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleRowLast: {
    borderBottomWidth: 0,
  },
  toggleLabel: {
    flex: 1,
    paddingRight: spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  chipsRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.accentBorder,
    backgroundColor: 'rgba(49, 254, 80, 0.12)',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accent,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
