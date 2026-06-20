import { GradientFill } from '@/components/GradientFill';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VehicleCard } from '@/components/VehicleCard';
import { APP_NAME } from '@/constants/app';
import { APP_LOGO } from '@/constants/assets';
import { colors, spacing } from '@/constants/theme';
import { useMockMode } from '@/providers/MockModeProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { usuarioRepository } from '@/repositories/mockRepositories';
import type { Usuario } from '@/types';
import { Image } from 'expo-image';
import {
  ChevronRight,
  Database,
  Info,
  Settings,
  Shield,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

function MenuItem({ icon, label, onPress, trailing }: MenuItemProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between border-b border-border py-4"
      onPress={onPress}
      disabled={!onPress && !trailing}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress && !trailing }}>
      <View className="flex-row items-center gap-3" aria-hidden={true}>
        {icon}
        <Text className="font-poppins text-base text-text-primary">{label}</Text>
      </View>
      {trailing ?? (onPress ? <ChevronRight aria-hidden={true} size={20} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const { isMockMode, toggleMockMode, carregando: carregandoMock } = useMockMode();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    usuarioRepository.obterAtual().then((u) => {
      if (!mounted) return;
      setUsuario(u);
      setCarregando(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const carregandoTela = carregando || carregandoVeiculo || carregandoMock;

  return (
    <ScreenContainer scroll>
      {carregandoTela ? (
        <View
          className="min-h-[50%] flex-1 items-center justify-center py-24"
          accessibilityRole="progressbar"
          accessibilityLabel="Carregando">
          <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
        </View>
      ) : (
        <>
          <View className="items-center pt-6">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-elevated overflow-hidden">
              <Image source={require('../../../assets/images/foto-perfil.png')} className="h-full w-full" contentFit="cover" />
            </View>
            <Text style={styles.userName} className="text-xl uppercase text-text-primary">
              {usuario?.nome}
            </Text>
            <Text className="mt-1 font-poppins text-sm text-text-muted">{usuario?.email}</Text>
          </View>

          {veiculo && (
            <View className="mt-6">
              <VehicleCard veiculo={veiculo} />
            </View>
          )}

          <GradientFill variant="card" rounded style={{ marginTop: 32 }}>
            <View className="px-4">
            <MenuItem
              icon={<Settings size={20} color={colors.textSecondary} />}
              label="Configurações"
              onPress={() => Alert.alert('Configurações', 'Em breve.')}
            />
            <MenuItem
              icon={<Database size={20} color={colors.textSecondary} />}
              label="Modo Mockado"
              trailing={
                <Switch
                  accessibilityLabel="Modo mockado"
                  accessibilityHint="Alterna entre dados simulados e dados reais"
                  value={isMockMode}
                  onValueChange={toggleMockMode}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              }
            />
            <MenuItem
              icon={<Info size={20} color={colors.textSecondary} />}
              label="Sobre"
              onPress={() => Alert.alert(APP_NAME, `${APP_NAME} v1.0 — MVP Enterprise Challenge`)}
            />
            <MenuItem
              icon={<Shield size={20} color={colors.textSecondary} />}
              label="Privacidade"
              onPress={() => Alert.alert('Privacidade', 'Política de privacidade em breve.')}
            />
            </View>
          </GradientFill>

          <View style={styles.brandFooter} accessible accessibilityRole="image" accessibilityLabel={`Logotipo ${APP_NAME}`}>
            <Image source={APP_LOGO} style={styles.brandLogo} contentFit="contain" />
            <Text className="mt-3 font-poppins text-sm text-text-muted">{APP_NAME} · v1.0.0</Text>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  userName: {
    fontFamily: 'LexendGiga_600SemiBold',
    letterSpacing: 2,
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
});
