import { Title } from '@/components/Title';
import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-card bg-surface">
        <Zap size={40} color={colors.textPrimary} />
      </View>
      <Title size="hero">Rota</Title>
      <Text className="mt-2 font-poppins text-sm text-text-muted">
        Recarga inteligente para seu EV
      </Text>
    </View>
  );
}
