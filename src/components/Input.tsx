import { cn } from '@/lib/cn';
import { Search } from 'lucide-react-native';
import { TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  icon?: boolean;
  className?: string;
}

export function Input({ icon = false, className, placeholder, ...props }: InputProps) {
  return (
    <View
      className={cn(
        'h-[52px] flex-row items-center rounded-input border border-border bg-surface px-4',
        className,
      )}>
      {icon && <Search size={20} color={colors.textMuted} style={{ marginRight: 8 }} />}
      <TextInput
        className="flex-1 font-inter text-base text-text-primary"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}
