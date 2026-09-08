import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SettingsScreen } from '@/components/SettingsScreen';
import { APP_NAME } from '@/constants/app';
import { colors } from '@/constants/theme';
import { anunciarMensagem } from '@/lib/a11y';
import { useAuth } from '@/providers/AuthProvider';
import { usuarioRepository } from '@/repositories';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function EditarPerfilScreen() {
  const { usuario, recarregarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (usuario?.nome) setNome(usuario.nome);
  }, [usuario?.nome]);

  const salvar = async () => {
    if (!nome.trim()) {
      const mensagem = 'Informe um nome.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
      return;
    }
    setSalvando(true);
    try {
      await usuarioRepository.atualizarPerfil({ nome });
      await recarregarUsuario();
      router.back();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível salvar o perfil.';
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SettingsScreen
      title="Editar perfil"
      footer={
        <Button
          label={salvando ? 'Salvando...' : 'Salvar'}
          disabled={salvando}
          onPress={salvar}
        />
      }>
      <View style={styles.field}>
        <Text aria-hidden={true} style={styles.label}>
          Nome
        </Text>
        <Input
          autoCorrect={false}
          placeholder="Seu nome"
          accessibilityLabel="Nome"
          value={nome}
          onChangeText={setNome}
        />
      </View>
      <View style={styles.field}>
        <Text aria-hidden={true} style={styles.label}>
          Email
        </Text>
        <Input
          editable={false}
          value={usuario?.email ?? ''}
          accessibilityLabel="Email, somente leitura"
        />
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
