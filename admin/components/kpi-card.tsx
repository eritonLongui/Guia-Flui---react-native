import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
        <p
          className={cn(
            'font-heading mt-2 text-2xl font-semibold',
            tone === 'success' && 'text-accent',
            tone === 'warning' && 'text-warning',
            tone === 'danger' && 'text-danger',
          )}
        >
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
