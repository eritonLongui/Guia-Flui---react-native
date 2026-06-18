import { colors, layout } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import type { ComponentProps, ReactNode } from 'react';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

const { padding: TAB_BAR_PADDING, iconGap: TAB_ICON_GAP, iconSize: TAB_SIZE, activeBorderWidth } =
  layout.floatingTabBar;

function TabBarSurface({ children, style }: { children: ReactNode; style: ViewStyle }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={85} tint="systemChromeMaterialDark" style={style}>
        {children}
      </BlurView>
    );
  }

  return <View style={[style, styles.blurFallback]}>{children}</View>;
}

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + layout.floatingTabBar.bottomOffset;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom, left: layout.floatingTabBar.horizontalInset, right: layout.floatingTabBar.horizontalInset },
      ]}>
      <View style={styles.shadow}>
        <TabBarSurface style={styles.blur}>
          <View style={styles.inner}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              const iconColor = isFocused ? colors.accent : colors.textMuted;

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [pressed && styles.tabPressed]}>
                  <View
                    style={[
                      styles.tabButton,
                      isFocused && styles.tabButtonActive,
                      index > 0 && { marginLeft: TAB_ICON_GAP },
                    ]}>
                    {options.tabBarIcon?.({
                      focused: isFocused,
                      color: iconColor,
                      size: 22,
                    })}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </TabBarSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'center',
  },
  shadow: {
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blur: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'transparent',
  },
  blurFallback: {
    backgroundColor: 'rgba(30, 30, 31, 0.92)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TAB_BAR_PADDING,
    paddingHorizontal: TAB_BAR_PADDING + 4,
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabButton: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: activeBorderWidth,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    borderColor: colors.accentBorder,
  },
});
