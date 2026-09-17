'use client';

import type { ReactElement, ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const tooltipStyle = {
  background: 'rgba(30, 30, 31, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  color: '#fff',
  fontSize: 12,
};

const barCursor = { fill: 'rgba(255, 255, 255, 0.04)' };
const areaCursor = { stroke: 'rgba(255, 255, 255, 0.16)', strokeWidth: 1 };

export function OverviewCharts({
  users,
  reviews,
  cities,
}: {
  users: { semana: string; ativos: number; cadastros: number }[];
  reviews: { semana: string; quantidade: number }[];
  cities: { rotulo: string; quantidade: number }[];
}) {
  return (
    <div className="grid gap-4">
      <ChartCard
        title="Usuários ativos"
        description="Uso do app semana a semana."
        info={
          <>
            <p>
              <strong className="font-medium text-foreground">Ativos</strong> são as pessoas que
              entraram no app naquela semana. Cada pessoa conta só uma vez.
            </p>
            <p className="mt-2">
              <strong className="font-medium text-foreground">Cadastros</strong> são as contas novas
              criadas naquela semana.
            </p>
          </>
        }
        height="h-72"
      >
        <AreaChart data={users}>
          <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="semana" stroke="#909090" fontSize={12} />
          <YAxis stroke="#909090" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={areaCursor} />
          <Legend />
          <Area
            type="monotone"
            dataKey="ativos"
            name="Ativos"
            stroke="#31fe50"
            fill="#31fe50"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="cadastros"
            name="Cadastros"
            stroke="#5ac8fa"
            fill="#5ac8fa"
            fillOpacity={0.12}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Avaliações" description="Volume publicado por semana.">
          <BarChart data={reviews}>
            <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="semana" stroke="#909090" fontSize={12} />
            <YAxis stroke="#909090" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={barCursor} />
            <Bar dataKey="quantidade" name="Avaliações" fill="#31fe50" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Rede por cidade" description="As 5 cidades com mais eletropostos.">
          <BarChart data={cities} layout="vertical" margin={{ left: 8, right: 40 }}>
            <CartesianGrid stroke="#4a4a4a" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="#909090" fontSize={12} allowDecimals={false} />
            <YAxis type="category" dataKey="rotulo" stroke="#909090" fontSize={12} width={118} />
            <Tooltip contentStyle={tooltipStyle} cursor={barCursor} />
            <Bar
              dataKey="quantidade"
              name="Eletropostos"
              fill="#5ac8fa"
              radius={[0, 6, 6, 0]}
              label={{ position: 'right', fill: '#c7c7c7', fontSize: 12 }}
            />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  info,
  children,
  className,
  height = 'h-56',
}: {
  title: string;
  description?: string;
  info?: ReactNode;
  children: ReactElement;
  className?: string;
  height?: string;
}) {
  return (
    <div className={`surface-card p-5 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <h2 className="font-title text-sm">{title}</h2>
        {info ? <HelpTip label={`O que significa ${title}`}>{info}</HelpTip> : null}
      </div>
      {description ? <p className="mt-1 mb-4 text-xs text-muted">{description}</p> : <div className="mb-4" />}
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HelpTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="flex size-6 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-foreground"
      >
        <CircleHelp className="size-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute top-full left-0 z-20 mt-2 w-72 rounded-[12px] border border-border bg-elevated p-3 text-left text-xs leading-5 text-secondary opacity-0 shadow-2xl group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
