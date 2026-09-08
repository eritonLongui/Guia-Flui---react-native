import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid gap-1.5', className)} {...props} />;
}
