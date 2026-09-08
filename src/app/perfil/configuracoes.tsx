import { GradientFill } from '@/components/GradientFill';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsScreen } from '@/components/SettingsScreen';
import { colors, layout } from '@/constants/theme';
import { useNotificationPrefs } from '@/lib/notificationPrefs';
import { useMockMode } from '@/providers/MockModeProvider';
import { Bell, Database, Sparkles } from 'lucide-react-native';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function ConfiguracoesScreen() {
  const { isMockMode, toggleMockMode } = useMockMode();
  const { prefs, atualizar } = useNotificationPrefs();

  return (
    <SettingsScreen title="Configurações">
      <GradientFill variant="card" rounded={layout.cardRadius}>
        <View style={styles.group}>
          <SettingsRow
            last
            icon={<Database size={20} color={colors.textSecondary} />}
            label="Modo mockado"
            trailing={
              <Switch
                accessibilityLabel="Modo mockado"
                accessibilityHint="Alterna entre dados simulados e dados reais"
                accessibilityState={{ checked: isMockMode }}
                value={isMockMode}
                onValueChange={toggleMockMode}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
        </View>
      </GradientFill>
      <Text style={styles.hint}>
        Com o modo mockado ligado, a home e o mapa usam dados de demonstração neste aparelho.
      </Text>

      <GradientFill variant="card" rounded={layout.cardRadius} style={styles.block}>
        <View style={styles.group}>
          <SettingsRow
            icon={<Bell size={20} color={colors.textSecondary} />}
            label="Alertas de recarga"
            trailing={
              <Switch
                accessibilityLabel="Alertas de recarga"
                accessibilityState={{ checked: prefs.alertasRecarga }}
                value={prefs.alertasRecarga}
                onValueChange={(value) => atualizar({ alertasRecarga: value })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <SettingsRow
            last
            icon={<Sparkles size={20} color={colors.textSecondary} />}
            label="Novidades"
            trailing={
              <Switch
                accessibilityLabel="Novidades"
                accessibilityState={{ checked: prefs.novidades }}
                value={prefs.novidades}
                onValueChange={(value) => atualizar({ novidades: value })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            }
          />
        </View>
      </GradientFill>
      <Text style={styles.hint}>
        Preferências de notificação ficam neste aparelho. O envio de push ainda não está ativo.
      </Text>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingHorizontal: 16,
  },
  block: {
    marginTop: 28,
  },
  hint: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
