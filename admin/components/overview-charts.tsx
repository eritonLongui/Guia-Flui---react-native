'use client';

import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const tooltipStyle = {
  background: '#1e1e1f',
  border: '1px solid #4a4a4a',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
};

export function OverviewCharts({
  notes,
  cities,
  safety,
}: {
  notes: { nota: string; quantidade: number }[];
  cities: { cidade: string; quantidade: number }[];
  safety: { nivel: string; quantidade: number }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard title="Notas das avaliações">
        <BarChart data={notes}>
          <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nota" stroke="#8a8a8a" fontSize={12} />
          <YAxis stroke="#8a8a8a" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="quantidade" fill="#31fe50" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
      <ChartCard title="Estações por cidade">
        <BarChart data={cities}>
          <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="cidade" stroke="#8a8a8a" fontSize={12} />
          <YAxis stroke="#8a8a8a" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="quantidade" fill="#5ac8fa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
      <ChartCard title="Nível de segurança">
        <BarChart data={safety}>
          <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nivel" stroke="#8a8a8a" fontSize={12} />
          <YAxis stroke="#8a8a8a" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="quantidade" fill="#ffb800" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-heading mb-4 text-sm font-semibold">{title}</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
