import { GradientBackground } from '@/components/GradientFill';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function AuthLayout() {
  const { session, carregando } = useAuth();

  if (!carregando && session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <GradientBackground />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
    </View>
  );
}
