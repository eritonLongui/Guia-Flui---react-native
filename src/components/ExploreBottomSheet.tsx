import { StationCard } from '@/components/StationCard';
import { colors } from '@/constants/theme';
import type { Eletroposto } from '@/types';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

interface ExploreBottomSheetProps {
  eletropostos: Eletroposto[];
  onSelect: (eletroposto: Eletroposto) => void;
}

export function ExploreBottomSheet({ eletropostos, onSelect }: ExploreBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '60%'], []);

  const renderItem = useCallback(
    ({ item }: { item: Eletroposto }) => (
      <View className="mb-3 px-6">
        <StationCard eletroposto={item} onPress={() => onSelect(item)} />
      </View>
    ),
    [onSelect],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      enablePanDownToClose={false}>
      <View className="px-6 pb-2">
        <Text className="font-poppins text-base text-text-primary">
          {eletropostos.length} resultados encontrados
        </Text>
      </View>
      <BottomSheetFlatList
        data={eletropostos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </BottomSheet>
  );
}
