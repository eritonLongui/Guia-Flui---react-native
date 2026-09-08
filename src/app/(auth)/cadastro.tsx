import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Title } from '@/components/Title';
import { APP_NAME } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';
import { anunciarMensagem } from '@/lib/a11y';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

function mensagemAuth(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Não foi possível criar a conta.';
  if (/already registered/i.test(raw)) return 'Este email já está cadastrado.';
  if (/password/i.test(raw) && /least/i.test(raw)) return 'A senha precisa ter pelo menos 6 caracteres.';
  return raw;
}

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const voltar = () => {
    router.dismissTo('/(auth)/login');
  };

  const cadastrar = async () => {
    if (!nome.trim() || !email.trim() || !senha) {
      const mensagem = 'Preencha nome, email e senha.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
      return;
    }
    if (senha.length < 6) {
      const mensagem = 'A senha precisa ter pelo menos 6 caracteres.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
      return;
    }

    setEnviando(true);
    try {
      const resultado = await signUp(nome, email, senha);
      if (resultado === 'confirm_email') {
        const mensagem =
          'Enviamos um link de confirmação. Depois disso, volte aqui para entrar.';
        anunciarMensagem(mensagem);
        Alert.alert('Confirme seu email', mensagem, [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }
      router.replace('/(tabs)');
    } catch (error) {
      const mensagem = mensagemAuth(error);
      anunciarMensagem(mensagem);
      Alert.alert('Não foi possível cadastrar', mensagem);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScreenContainer keyboard center header={<BackButton onPress={voltar} />}>
      <View style={styles.header}>
        <Title size="xl" className="text-center">
          Criar conta
        </Title>
        <Text className="mt-3 text-center font-poppins text-base text-text-secondary">
          Cadastro simples com email e senha para avaliar eletropostos.
        </Text>
      </View>

      <View style={styles.fields}>
        <View>
          <Text aria-hidden={true} className="mb-2 font-poppins text-sm text-text-muted">
            Nome
          </Text>
          <Input
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            autoCorrect={false}
            placeholder="Seu nome"
            accessibilityLabel="Nome"
            value={nome}
            onChangeText={setNome}
          />
        </View>
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
            placeholder="voce@email.com"
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
            placeholder="Mínimo 6 caracteres"
            accessibilityLabel="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>
      </View>

      <Button
        label={enviando ? 'Criando...' : 'Criar conta'}
        disabled={enviando}
        onPress={cadastrar}
      />

      <Pressable
        className="mt-8 items-center py-3"
        accessibilityRole="button"
        accessibilityLabel="Já tenho conta"
        onPress={voltar}>
        <Text className="font-poppins text-base text-text-secondary">
          Já tem conta?{' '}
          <Text style={{ color: colors.accent }} className="font-poppins-bold">
            Entrar
          </Text>
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  fields: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
});
