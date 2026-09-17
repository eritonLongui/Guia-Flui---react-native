import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[12px] font-bold uppercase tracking-wide transition-opacity disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border',
  {
    variants: {
      variant: {
        default: 'bg-white text-background hover:opacity-90',
        secondary: 'bg-elevated text-foreground hover:opacity-90',
        ghost: 'bg-transparent text-foreground hover:bg-elevated',
        danger: 'bg-danger text-background hover:opacity-90',
        outline: 'border border-border bg-transparent text-foreground hover:bg-elevated',
      },
      size: {
        default: 'h-14 px-6 text-base',
        sm: 'h-10 px-4 text-xs',
        lg: 'h-14 px-6 text-base',
        icon: 'size-12 p-0',
        toolbar: 'size-[52px] rounded-[16px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export { buttonVariants };

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
