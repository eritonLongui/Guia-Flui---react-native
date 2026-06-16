import { ScreenContainer } from '@/components/ScreenContainer';
import { StationCard } from '@/components/StationCard';
import { colors } from '@/constants/theme';
import { useFavoritos } from '@/providers/FavoritosProvider';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

export default function FavoritosScreen() {
  const { favoritos, carregando } = useFavoritos();

  if (carregando) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text className="pt-4 font-poppins text-2xl text-text-primary">Favoritos</Text>

      {favoritos.length === 0 ? (
        <View className="mt-24 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface">
            <Heart size={32} color={colors.textMuted} />
          </View>
          <Text className="font-inter text-base text-text-secondary">Nenhum favorito salvo.</Text>
          <Text className="mt-2 text-center font-inter text-sm text-text-muted">
            Salve eletropostos para acessá-los rapidamente.
          </Text>
        </View>
      ) : (
        <View className="mt-6 gap-3">
          {favoritos.map((ep) => (
            <StationCard
              key={ep.id}
              eletroposto={ep}
              onPress={() => router.push(`/eletroposto/${ep.id}`)}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
