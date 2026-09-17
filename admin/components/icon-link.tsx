import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function IconLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(buttonVariants({ variant: 'secondary', size: 'toolbar' }), className)}
    >
      {children}
    </Link>
  );
}

export function IconAction({
  label,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(buttonVariants({ variant: 'secondary', size: 'toolbar' }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
