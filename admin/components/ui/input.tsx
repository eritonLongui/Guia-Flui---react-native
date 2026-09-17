import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'control placeholder:text-muted disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
