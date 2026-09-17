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
        <p className="font-title text-[12px] text-muted">{label}</p>
        <p
          className={cn(
            'mt-2 text-2xl font-bold tracking-wide',
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
