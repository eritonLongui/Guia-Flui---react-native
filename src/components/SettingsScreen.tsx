import { BackButton, BackButtonSpacer } from '@/components/BackButton';
import { ScreenTopFade } from '@/components/ScreenTopFade';
import { colors, layout } from '@/constants/theme';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}

export function SettingsScreen({
  title,
  children,
  footer,
  scroll = true,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
          <BackButton />
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          <BackButtonSpacer />
        </View>

        {scroll ? (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + (footer ? 24 : 32) },
            ]}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content]}>{children}</View>
        )}

        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
      <ScreenTopFade />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundEnd,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.paddingHorizontal,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  scroll: {
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.paddingHorizontal,
  },
  footer: {
    backgroundColor: colors.backgroundEnd,
    paddingHorizontal: layout.paddingHorizontal,
    paddingTop: 12,
  },
});
