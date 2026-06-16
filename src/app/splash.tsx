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
        <Zap size={40} color={colors.accent} fill={colors.accent} />
      </View>
      <Text className="font-poppins text-4xl text-text-primary">Rota</Text>
      <Text className="mt-2 font-inter text-sm text-text-muted">
        Recarga inteligente para seu EV
      </Text>
    </View>
  );
}
