import { cn } from '@/lib/cn';
import { colors, layout, typography } from '@/constants/theme';
import { Search } from 'lucide-react-native';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

const INPUT_HEIGHT = layout.searchHeight;
const FONT_SIZE = typography.body;

interface InputProps extends TextInputProps {
  icon?: boolean;
  className?: string;
}

export function Input({
  icon = false,
  className,
  placeholder,
  style,
  accessibilityLabel,
  ...props
}: InputProps) {
  return (
    <View style={styles.container} className={cn(className)}>
      {icon && (
        <Search
          size={20}
          color={colors.textMuted}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        cursorColor={colors.textPrimary}
        selectionColor={colors.textSecondary}
        accessibilityRole={icon ? 'search' : 'text'}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: INPUT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceEnd,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
    ...Platform.select({
      ios: {
        // Não definir height/lineHeight iguais ao container — empurra o texto para baixo no iOS.
        lineHeight: FONT_SIZE + 4,
      },
      android: {
        height: INPUT_HEIGHT,
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
    }),
  },
});
