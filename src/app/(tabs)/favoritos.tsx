import { ScreenContainer } from '@/components/ScreenContainer';
import { StationCard } from '@/components/StationCard';
import { Title } from '@/components/Title';
import { colors } from '@/constants/theme';
import { useFavoritos } from '@/providers/FavoritosProvider';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

export default function FavoritosScreen() {
  const { favoritos, carregando } = useFavoritos();

  return (
    <ScreenContainer scroll>
      {carregando ? (
        <View
          className="min-h-[50%] flex-1 items-center justify-center py-24"
          accessibilityRole="progressbar"
          accessibilityLabel="Carregando">
          <ActivityIndicator accessible={false} color={colors.textPrimary} />
        </View>
      ) : (
        <>
          <Title size="xl" className="pt-4">
            Favoritos
          </Title>

          {favoritos.length === 0 ? (
            <View className="mt-24 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Heart size={32} color={colors.textMuted} />
              </View>
              <Text className="font-poppins text-base text-text-secondary">Nenhum favorito salvo.</Text>
              <Text className="mt-2 text-center font-poppins text-sm text-text-muted">
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
        </>
      )}
    </ScreenContainer>
  );
}
