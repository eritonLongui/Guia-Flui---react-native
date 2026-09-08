import { ConnectorCard } from '@/components/ConnectorCard';
import { layout, spacing } from '@/constants/theme';
import type { Conector } from '@/types';
import { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PADDING = layout.paddingHorizontal;
const CARD_GAP = spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2 - spacing.xl;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CARD_HEIGHT = 118;

interface ConnectorsCarouselProps {
  data: Conector[];
}

export function ConnectorsCarousel({ data }: ConnectorsCarouselProps) {
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
      keyExtractor={(item) => item.tipo}
      accessibilityLabel="Conectores disponíveis"
      style={styles.list}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <View style={styles.slide}>
          <ConnectorCard conector={item} />
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
    height: CARD_HEIGHT,
  },
  separator: {
    width: CARD_GAP,
  },
});
