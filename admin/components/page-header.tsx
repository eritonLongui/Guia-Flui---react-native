import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
  plain = false,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  plain?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {backHref ? (
          <Link href={backHref} className="text-sm text-accent hover:underline">
            ← {backLabel}
          </Link>
        ) : null}
        <h1 className={cn(plain ? 'text-2xl font-bold' : 'font-title text-2xl', backHref && 'mt-2')}>
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-secondary">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
