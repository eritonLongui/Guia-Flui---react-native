import { APP_NAME } from '@/constants/app';
import { SettingsScreen } from '@/components/SettingsScreen';
import { colors } from '@/constants/theme';
import { StyleSheet, Text } from 'react-native';

export default function PrivacidadeScreen() {
  return (
    <SettingsScreen title="Privacidade">
      <Text style={styles.body}>
        O {APP_NAME} usa os dados da sua conta (nome e email) para identificar avaliações e
        favoritos. A localização serve para mostrar eletropostos perto de você e traçar rotas.
      </Text>
      <Text style={styles.body}>
        Avaliações que você publica ficam visíveis para outras pessoas no app. Não vendemos seus
        dados e não usamos a localização para anúncios.
      </Text>
      <Text style={styles.body}>
        Preferências de notificação e o modo mockado ficam só neste aparelho. Você pode sair da
        conta a qualquer momento na tela de perfil.
      </Text>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
