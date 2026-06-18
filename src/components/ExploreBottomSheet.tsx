import { StationCard } from '@/components/StationCard';
import { Title } from '@/components/Title';
import { GradientFill } from '@/components/GradientFill';
import { colors, layout, spacing } from '@/constants/theme';
import type { Eletroposto } from '@/types';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ExploreBottomSheetProps {
  eletropostos: Eletroposto[];
  onSelect: (eletroposto: Eletroposto) => void;
  /** Limite superior — bottom sheet não sobe acima da busca. */
  topInset: number;
}

export function ExploreBottomSheet({ eletropostos, onSelect, topInset }: ExploreBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '62%'], []);
  const [montado, setMontado] = useState(false);
  const listaPaddingBottom =
    layout.floatingTabBar.height + layout.floatingTabBar.bottomOffset + 24;

  useEffect(() => {
    setMontado(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Eletroposto }) => (
      <View className="mb-3 px-6">
        <StationCard eletroposto={item} onPress={() => onSelect(item)} />
      </View>
    ),
    [onSelect],
  );

  const renderBackground = useCallback(
    () => <GradientFill variant="background" style={StyleSheet.absoluteFill} />,
    [],
  );

  if (!montado) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      topInset={topInset}
      bottomInset={0}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      enablePanDownToClose={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title size="sm" className="text-center">
            {eletropostos.length} resultados encontrados
          </Title>
        </View>
        <BottomSheetFlatList
          data={eletropostos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={{
            paddingBottom: listaPaddingBottom,
          }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  list: {
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: layout.paddingHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
