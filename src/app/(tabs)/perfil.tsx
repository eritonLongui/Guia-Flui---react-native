import { Avatar } from '@/components/Avatar';
import { GradientFill } from '@/components/GradientFill';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { SettingsRow } from '@/components/SettingsRow';
import { VehicleCard } from '@/components/VehicleCard';
import { APP_NAME } from '@/constants/app';
import { APP_LOGO } from '@/constants/assets';
import { colors, layout, spacing } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { usuarioRepository } from '@/repositories';
import type { Usuario } from '@/types';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Info, LogOut, Settings, Shield, UserRound } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const { usuario: usuarioAuth, signOut, session } = useAuth();
  const { isMockMode } = useMockMode();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      usuarioRepository.obterAtual().then((u) => {
        if (!mounted) return;
        setUsuario(u ?? usuarioAuth);
        setCarregando(false);
      });
      return () => {
        mounted = false;
      };
    }, [usuarioAuth, isMockMode]),
  );

  const carregandoTela = carregando || carregandoVeiculo;

  const sair = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setSaindo(true);
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert(
              APP_NAME,
              error instanceof Error ? error.message : 'Não foi possível sair.',
            );
            setSaindo(false);
          }
        },
      },
    ]);
  };

  if (carregandoTela) {
    return (
      <View
        style={styles.screen}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando">
        <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + layout.floatingTabBar.scrollPadding },
        ]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.scrollInner}>
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <Avatar nome={usuario?.nome} size={72} />
            <Text style={styles.userName} numberOfLines={1}>
              {usuario?.nome}
            </Text>
            {usuario?.email ? (
              <Text style={styles.email} numberOfLines={1}>
                {usuario.email}
              </Text>
            ) : null}
          </View>

          {veiculo ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar carro"
                accessibilityHint="Abre os dados do veículo"
                onPress={() => router.push('/perfil/veiculo')}>
                <VehicleCard veiculo={veiculo} />
              </Pressable>
            ) : (
              <GradientFill variant="card" rounded={layout.cardRadius}>
                <Pressable
                  style={styles.emptyCar}
                  accessibilityRole="button"
                  accessibilityLabel="Cadastrar carro"
                  onPress={() => router.push('/perfil/veiculo')}>
                  <Text style={styles.emptyCarText}>Cadastrar meu carro</Text>
                </Pressable>
              </GradientFill>
            )}

            <GradientFill variant="card" rounded={layout.cardRadius} style={styles.menuCard}>
              <View style={styles.menuInner}>
                <SettingsRow
                  icon={<UserRound size={20} color={colors.textSecondary} />}
                  label="Editar perfil"
                  onPress={() => router.push('/perfil/editar')}
                />
                <SettingsRow
                  icon={<Settings size={20} color={colors.textSecondary} />}
                  label="Configurações"
                  onPress={() => router.push('/perfil/configuracoes')}
                />
                <SettingsRow
                  icon={<Info size={20} color={colors.textSecondary} />}
                  label="Sobre"
                  onPress={() => router.push('/perfil/sobre')}
                />
                <SettingsRow
                  icon={<Shield size={20} color={colors.textSecondary} />}
                  label="Privacidade"
                  last={!session}
                  onPress={() => router.push('/perfil/privacidade')}
                />
                {session ? (
                  <SettingsRow
                    last
                    destructive
                    icon={<LogOut size={20} color={colors.danger} />}
                    label={saindo ? 'Saindo...' : 'Sair'}
                    onPress={saindo ? undefined : sair}
                  />
                ) : null}
              </View>
            </GradientFill>

            <View
              style={styles.brandFooter}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`Logotipo ${APP_NAME}`}>
              <Image source={APP_LOGO} style={styles.brandLogo} contentFit="contain" />
              <Text style={styles.brandMeta}>{APP_NAME} · v1.0.0</Text>
            </View>
        </Animated.View>
      </ScrollView>
      <ScreenTopFade />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  scroll: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.paddingHorizontal,
  },
  scrollInner: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  userName: {
    marginTop: 14,
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.3,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  email: {
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textMuted,
  },
  emptyCar: {
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyCarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  menuCard: {
    marginTop: spacing.xxl,
  },
  menuInner: {
    paddingHorizontal: 16,
  },
  brandFooter: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  brandLogo: {
    width: 160,
    height: 48,
  },
  brandMeta: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
});
