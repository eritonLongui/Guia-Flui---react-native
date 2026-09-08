import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Title } from '@/components/Title';
import { APP_NAME } from '@/constants/app';
import { APP_SPLASH_ICON } from '@/constants/assets';
import { colors, spacing } from '@/constants/theme';
import { anunciarMensagem } from '@/lib/a11y';
import { flags } from '@/lib/flags';
import { useAuth } from '@/providers/AuthProvider';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

function mensagemAuth(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Não foi possível entrar.';
  if (/invalid login/i.test(raw)) return 'Email ou senha inválidos.';
  if (/email not confirmed/i.test(raw)) {
    return flags.requireEmailConfirmation
      ? 'Confirme seu email antes de entrar.'
      : 'Esta conta foi criada com confirmação de email ligada. Confirme o email ou crie uma conta nova.';
  }
  return raw;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const voltar = () => {
    router.dismissTo('/(auth)/welcome');
  };

  const entrar = async () => {
    if (!email.trim() || !senha) {
      const mensagem = 'Preencha email e senha.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
      return;
    }

    setEnviando(true);
    try {
      await signIn(email, senha);
      router.replace('/(tabs)');
    } catch (error) {
      const mensagem = mensagemAuth(error);
      anunciarMensagem(mensagem);
      Alert.alert('Não foi possível entrar', mensagem);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScreenContainer keyboard center header={<BackButton onPress={voltar} />}>
      <View style={styles.header}>
        <Image
          source={APP_SPLASH_ICON}
          style={styles.mark}
          contentFit="contain"
          accessibilityLabel={`Logo ${APP_NAME}`}
        />
        <Title size="xl" className="text-center">
          Bem-vindo de volta
        </Title>
        <Text className="mt-3 text-center font-poppins text-base text-text-secondary">
          Entre com seu email e senha para continuar.
        </Text>
      </View>

      <View style={styles.fields}>
        <View>
          <Text aria-hidden={true} className="mb-2 font-poppins text-sm text-text-muted">
            Email
          </Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            keyboardType="email-address"
            placeholder="exemplo@email.com"
            accessibilityLabel="Email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View>
          <Text aria-hidden={true} className="mb-2 font-poppins text-sm text-text-muted">
            Senha
          </Text>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            passwordRules=""
            placeholder="••••••••"
            accessibilityLabel="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>
      </View>

      <Button
        label={enviando ? 'Entrando...' : 'Entrar'}
        disabled={enviando}
        onPress={entrar}
      />

      <Pressable
        className="mt-8 items-center py-3"
        accessibilityRole="button"
        accessibilityLabel="Criar conta"
        onPress={() => router.push('/(auth)/cadastro')}>
        <Text className="font-poppins text-base text-text-secondary">
          Não tem conta?{' '}
          <Text style={{ color: colors.accent }} className="font-poppins-bold">
            Criar conta
          </Text>
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  mark: {
    width: 88,
    height: 88,
    marginBottom: spacing.lg,
  },
  fields: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
});
