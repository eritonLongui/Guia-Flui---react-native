import { Title } from '@/components/Title';
import { GradientBackground, GradientFill } from '@/components/GradientFill';
import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <GradientBackground />
      <GradientFill variant="card" rounded style={styles.logoCard}>
        <View style={styles.logoInner}>
          <Zap size={40} color={colors.textPrimary} />
        </View>
      </GradientFill>
      <Title size="hero">Rota</Title>
      <Text className="mt-2 font-poppins text-sm text-text-muted">
        Recarga inteligente para seu EV
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    marginBottom: 24,
  },
  logoInner: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
