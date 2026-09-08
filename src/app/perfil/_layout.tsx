import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function PerfilStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundEnd },
        animation: 'slide_from_right',
      }}
    />
  );
}
