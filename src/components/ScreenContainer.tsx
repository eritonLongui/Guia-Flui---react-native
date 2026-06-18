import { cn } from '@/lib/cn';
import { GradientBackground } from '@/components/GradientFill';
import { ScreenEdgeFades } from '@/components/ScreenEdgeFades';
import { layout } from '@/constants/theme';
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
      className={cn('flex-1', !noPadding && 'px-6', className)}
      style={{ paddingTop: insets.top }}
      {...props}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <View className="flex-1">
        <GradientBackground />
        <ScrollView
          className="flex-1"
          style={{ backgroundColor: 'transparent' }}
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

  return (
    <View className="flex-1">
      <GradientBackground />
      {content}
      <ScreenEdgeFades />
    </View>
  );
}
