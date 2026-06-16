import { ScreenContainer } from '@/components/ScreenContainer';
import { VehicleCard } from '@/components/VehicleCard';
import { colors } from '@/constants/theme';
import { useMockMode } from '@/providers/MockModeProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { usuarioRepository } from '@/repositories/mockRepositories';
import type { Usuario } from '@/types';
import {
  ChevronRight,
  Database,
  Info,
  Settings,
  Shield,
  User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, View } from 'react-native';

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
      disabled={!onPress && !trailing}>
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="font-inter text-base text-text-primary">{label}</Text>
      </View>
      {trailing ?? (onPress ? <ChevronRight size={20} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { veiculo, carregando: carregandoVeiculo } = useVeiculoAtivo();
  const { isMockMode, toggleMockMode, carregando: carregandoMock } = useMockMode();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    usuarioRepository.obterAtual().then((u) => {
      setUsuario(u);
      setCarregando(false);
    });
  }, []);

  if (carregando || carregandoVeiculo || carregandoMock) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View className="items-center pt-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surface">
          <User size={36} color={colors.accent} />
        </View>
        <Text className="font-poppins text-xl text-text-primary">{usuario?.nome}</Text>
        <Text className="mt-1 font-inter text-sm text-text-muted">{usuario?.email}</Text>
      </View>

      {veiculo && (
        <View className="mt-6">
          <VehicleCard veiculo={veiculo} />
        </View>
      )}

      <View className="mt-8 rounded-card border border-border bg-surface px-4">
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
          onPress={() => Alert.alert('Rota', 'Rota v1.0 — MVP Enterprise Challenge')}
        />
        <MenuItem
          icon={<Shield size={20} color={colors.textSecondary} />}
          label="Privacidade"
          onPress={() => Alert.alert('Privacidade', 'Política de privacidade em breve.')}
        />
      </View>
    </ScreenContainer>
  );
}
