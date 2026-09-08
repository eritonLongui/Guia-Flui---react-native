import { GradientBackground } from '@/components/GradientFill';
import { APP_NAME } from '@/constants/app';
import { APP_SPLASH_ICON } from '@/constants/assets';
import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const { session, carregando } = useAuth();
  const { isMockMode, carregando: carregandoMock } = useMockMode();

  useEffect(() => {
    if (carregando || carregandoMock) return;

    const timer = setTimeout(() => {
      if (session || isMockMode) {
        router.replace('/(tabs)');
        return;
      }
      router.replace('/(auth)/welcome');
    }, 1600);

    return () => clearTimeout(timer);
  }, [carregando, carregandoMock, session, isMockMode]);

  return (
    <View className="flex-1 items-center justify-center">
      <GradientBackground />
      <Image
        source={APP_SPLASH_ICON}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel={`Logo ${APP_NAME}`}
      />
      <Text className="mt-6 font-poppins text-sm text-text-muted">
        Recarga inteligente para seu EV
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 140,
    height: 140,
  },
});
