import { ReviewCard } from '@/components/ReviewCard';
import { layout, spacing } from '@/constants/theme';
import type { Avaliacao } from '@/types';
import { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = layout.paddingHorizontal;
const CARD_GAP = spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2 - spacing.xl;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

interface ReviewsCarouselProps {
  data: Avaliacao[];
}

export function ReviewsCarousel({ data }: ReviewsCarouselProps) {
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
      accessibilityLabel="Avaliações do eletroposto"
      style={styles.list}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <View style={styles.slide}>
          <ReviewCard avaliacao={item} />
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
    height: layout.reviewCardHeight,
  },
  separator: {
    width: CARD_GAP,
  },
});
