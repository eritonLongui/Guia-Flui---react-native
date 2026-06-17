import { cn } from '@/lib/cn';
import { ScreenEdgeFades } from '@/components/ScreenEdgeFades';
import { colors, layout } from '@/constants/theme';
import { ScrollView, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  noPadding?: boolean;
  className?: string;
}

export function ScreenContainer({
  children,
  scroll = false,
  noPadding = false,
  className,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      className={cn('flex-1 bg-background', !noPadding && 'px-6', className)}
      style={{ paddingTop: insets.top }}
      {...props}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1 bg-background"
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingHorizontal: noPadding ? 0 : layout.paddingHorizontal,
            paddingBottom: insets.bottom + layout.floatingTabBar.scrollPadding,
          }}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        <ScreenEdgeFades />
      </View>
    );
  }

  return content;
}
