import { Button } from '@/components/Button';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { StationCard } from '@/components/StationCard';
import { Title } from '@/components/Title';
import { colors, layout, spacing } from '@/constants/theme';
import { useFavoritos } from '@/providers/FavoritosProvider';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FavoritosScreen() {
  const insets = useSafeAreaInsets();
  const { favoritos, carregando } = useFavoritos();
  const vazio = !carregando && favoritos.length === 0;

  if (carregando) {
    return (
      <View
        style={styles.screen}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando">
        <ActivityIndicator aria-hidden={true} color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Title size="xl" style={styles.title}>
          Favoritos
        </Title>
      </View>

      {vazio ? (
        <View
          style={[
            styles.emptyWrap,
            { paddingBottom: insets.bottom + layout.floatingTabBar.scrollPadding },
          ]}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Heart
                aria-hidden={true}
                size={28}
                color={colors.accent}
                strokeWidth={2.2}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhum favorito salvo.</Text>
            <Text style={styles.emptySubtitle}>
              Salve eletropostos para acessá-los rapidamente.
            </Text>
            <Button
              label="Encontrar Recarga"
              accessibilityHint="Abre o mapa para buscar eletropostos"
              onPress={() => router.push('/(tabs)/explorar')}
              className="mt-8 w-full"
            />
          </Animated.View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + layout.floatingTabBar.scrollPadding },
          ]}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.listInner}>
            {favoritos.map((ep) => (
              <StationCard
                key={ep.id}
                eletroposto={ep}
                onPress={() => router.push(`/eletroposto/${ep.id}`)}
              />
            ))}
          </Animated.View>
        </ScrollView>
      )}
      <ScreenTopFade />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  header: {
    paddingHorizontal: layout.paddingHorizontal,
    paddingBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  list: {
    paddingHorizontal: layout.paddingHorizontal,
  },
  listInner: {
    gap: spacing.md,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.paddingHorizontal,
  },
  empty: {
    width: '100%',
    alignItems: 'center',
  },
  emptyIcon: {
    height: 72,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: colors.chipBackground,
  },
  emptyTitle: {
    marginTop: spacing.xl,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    maxWidth: 280,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
