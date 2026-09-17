import type { ComponentProps } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchField({ className, ...props }: ComponentProps<'input'>) {
  return (
    <label className="flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-[16px] border border-border bg-surface px-4 focus-within:shadow-[0_0_0_2px_var(--accent-border)]">
      <Search aria-hidden={true} className="size-5 shrink-0 text-muted" />
      <input
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted',
          className,
        )}
        {...props}
      />
    </label>
  );
}
