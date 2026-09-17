import { GradientFill } from '@/components/GradientFill';
import { StationCard } from '@/components/StationCard';
import { Title } from '@/components/Title';
import { colors, layout, spacing } from '@/constants/theme';
import type { Eletroposto } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExploreResultsSheetProps {
  visible: boolean;
  eletropostos: Eletroposto[];
  onSelect: (eletroposto: Eletroposto) => void;
  onClose: () => void;
  /** Distância do topo da tela até o fim da barra de busca. */
  topOffset: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_TOP_RADIUS = 24;

const OPEN_SPRING = {
  damping: 28,
  stiffness: 340,
  mass: 0.72,
  overshootClamping: true,
} as const;

const CLOSE_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export function ExploreResultsSheet({
  visible,
  eletropostos,
  onSelect,
  onClose,
  topOffset,
}: ExploreResultsSheetProps) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Eletroposto>>(null);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const tabBarClearance =
    insets.bottom +
    layout.floatingTabBar.bottomOffset +
    layout.floatingTabBar.height;

  useEffect(() => {
    translateY.value = visible
      ? withSpring(0, OPEN_SPRING)
      : withTiming(SCREEN_HEIGHT, CLOSE_TIMING);
    if (!visible) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [translateY, visible]);

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 1100) {
        runOnJS(onClose)();
        return;
      }
      translateY.value = withSpring(0, OPEN_SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderItem = useCallback(
    ({ item }: { item: Eletroposto }) => (
      <View style={styles.item}>
        <StationCard eletroposto={item} onPress={() => onSelect(item)} />
      </View>
    ),
    [onSelect],
  );

  const titulo =
    eletropostos.length === 1
      ? '1 resultado encontrado'
      : `${eletropostos.length} resultados encontrados`;

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.wrap, { top: topOffset }, sheetStyle]}>
      <GradientFill variant="background" style={styles.sheet}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <Title size="sm" style={styles.title}>
              {titulo}
            </Title>
          </View>
        </GestureDetector>

        <FlatList
          ref={listRef}
          data={eletropostos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarClearance + spacing.lg }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum eletroposto com esses filtros.</Text>
          }
        />
      </GradientFill>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 46,
    elevation: 46,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: layout.paddingHorizontal,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  item: {
    marginBottom: spacing.md,
    paddingHorizontal: layout.paddingHorizontal,
  },
  empty: {
    marginTop: spacing.xxl,
    paddingHorizontal: layout.paddingHorizontal,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
