import { StationCard } from '@/components/StationCard';
import { layout, spacing } from '@/constants/theme';
import type { Eletroposto } from '@/types';
import { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = layout.paddingHorizontal;
const CARD_GAP = spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

interface StationCarouselProps {
  data: Eletroposto[];
  onSelect: (eletroposto: Eletroposto) => void;
}

export function StationCarousel({ data, onSelect }: StationCarouselProps) {
  const snapToOffsets = useMemo(
    () => data.map((_, index) => index * SNAP_INTERVAL),
    [data],
  );

  return (
    <FlatList
      data={data}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToOffsets={snapToOffsets}
      snapToAlignment="start"
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <View style={styles.slide}>
          <StationCard carousel eletroposto={item} onPress={() => onSelect(item)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    marginHorizontal: -H_PADDING,
  },
  content: {
    paddingHorizontal: H_PADDING,
  },
  slide: {
    width: CARD_WIDTH,
    height: layout.carouselCardHeight,
  },
  separator: {
    width: CARD_GAP,
  },
});
