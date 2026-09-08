import { APP_NAME } from '@/constants/app';
import { SettingsScreen } from '@/components/SettingsScreen';
import { colors } from '@/constants/theme';
import { StyleSheet, Text } from 'react-native';

export default function SobreScreen() {
  return (
    <SettingsScreen title="Sobre">
      <Text style={styles.kicker}>{APP_NAME}</Text>
      <Text style={styles.body}>
        Versão 1.0.0 — MVP para encontrar eletropostos compatíveis com o seu carro, comparar
        recarga e seguir rota até o ponto.
      </Text>
      <Text style={styles.body}>
        Feito para motoristas de veículos elétricos que querem recarregar com menos fila e mais
        previsibilidade.
      </Text>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
