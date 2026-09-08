import { SlideToStart } from '@/components/SlideToStart';
import { Title } from '@/components/Title';
import { APP_NAME } from '@/constants/app';
import { APP_LOGO, WELCOME_HERO_IMAGE } from '@/constants/assets';
import { colors, spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Image
        source={{ uri: WELCOME_HERO_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
        accessibilityIgnoresInvertColors
      />

      <LinearGradient
        colors={['rgba(19,19,19,0.55)', 'transparent', 'rgba(19,19,19,0.92)', colors.backgroundEnd]}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(19,19,19,0.55)', 'transparent', 'rgba(19,19,19,0.92)', colors.backgroundEnd]}
        locations={[0, 0.28, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}>
        <Image
          source={APP_LOGO}
          style={[styles.logo, styles.logoWhite]}
          contentFit="contain"
          accessibilityLabel={APP_NAME}
        />

        <View style={styles.bottom}>
          <View style={styles.copy}>
            <Title size="hero" style={styles.title}>
              Entre no fluxo da recarga
            </Title>
            <Text className="mt-3 font-poppins text-base text-text-secondary">
              Encontre eletropostos, compare avaliações e planeje sua rota com confiança.
            </Text>
          </View>

          <SlideToStart
            label="Iniciar"
            onComplete={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  logo: {
    width: 148,
    height: 40,
    alignSelf: 'flex-start',
  },
  logoWhite: {
    tintColor: '#FFFFFF',
  },
  bottom: {
    gap: spacing.xxl,
  },
  copy: {
    maxWidth: 340,
  },
  title: {
    lineHeight: 40,
  },
});
