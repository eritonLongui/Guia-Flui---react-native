import { FloatingTabBar } from '@/components/FloatingTabBar';
import { GradientBackground } from '@/components/GradientFill';
import { useAuth } from '@/providers/AuthProvider';
import { useMockMode } from '@/providers/MockModeProvider';
import { Redirect, Tabs } from 'expo-router';
import { Heart, Home, Map, User } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabsLayout() {
  const { session, carregando } = useAuth();
  const { isMockMode, carregando: carregandoMock } = useMockMode();

  if (!carregando && !carregandoMock && !session && !isMockMode) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <GradientBackground />
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          lazy: true,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 0,
          },
          sceneStyle: {
            backgroundColor: 'transparent',
          },
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarAccessibilityLabel: 'Explorar mapa',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarAccessibilityLabel: 'Favoritos',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
    </View>
  );
}
