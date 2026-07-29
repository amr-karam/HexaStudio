'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LabelList,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { cn } from '@/components/ui/cn';
import { Spinner } from '@/components/ui/spinner';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const COLORS = {
  gold: '#D4A843',
  goldLight: '#D4A84340',
  emerald: '#34d399',
  emeraldLight: '#34d39920',
  red: '#f87171',
  redLight: '#f8717120',
  darkRed: '#991b1b',
  blue: '#60a5fa',
  blueLight: '#60a5fa20',
  violet: '#a78bfa',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  neutral: '#666666',
  border: '#1F1F1F',
  surface: '#141414',
  background: '#050505',
  textMuted: '#666666',
  textSecondary: '#888888',
};

// ─── Common Chart Container ─────────────────────────────────────────────────

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

function ChartContainer({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data available',
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'p-6 bg-[#141414] border border-[#1F1F1F] rounded-2xl relative overflow-hidden',
        className,
      )}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/20 to-transparent" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-serif font-light text-white">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-[#666] font-light mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[250px]">
          <Spinner size="lg" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[250px] text-center">
          <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <p className="text-sm text-[#555] font-light">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  valueFormatter?: (value: number) => string;
  currency?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
  currency = '$',
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {label && (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#666] mb-1.5 font-medium">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[#999] font-light">{entry.name}</span>
          </div>
          <span className="text-xs text-white font-mono tabular-nums">
            {valueFormatter
              ? valueFormatter(entry.value)
              : `${currency}${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 1. RevenueTrendChart ───────────────────────────────────────────────────

export interface RevenueTrendDataPoint {
  month: string;
  revenue: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendDataPoint[];
  isLoading?: boolean;
  className?: string;
}

export function RevenueTrendChart({
  data,
  isLoading = false,
  className,
}: RevenueTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    revenue: Math.round(d.revenue),
  }));

  return (
    <ChartContainer
      title="Revenue Trend"
      subtitle="Last 12 months"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      emptyMessage="No revenue data available"
      className={className}
    >
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border}
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: COLORS.textMuted,
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
            }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
            }
          />
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v: number) =>
                  `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                }
              />
            }
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={COLORS.gold}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: COLORS.gold,
              stroke: COLORS.background,
              strokeWidth: 2,
            }}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ─── 2. PipelineFunnelChart ─────────────────────────────────────────────────

export interface PipelineStageData {
  stage: string;
  count: number;
  color?: string;
}

interface PipelineFunnelChartProps {
  data: PipelineStageData[];
  conversionRates?: Array<{ from: string; to: string; rate: number }>;
  isLoading?: boolean;
  className?: string;
}

const PIPELINE_COLORS = [
  '#60a5fa', // blue — New
  '#818cf8', // indigo
  '#a78bfa', // violet
  '#c084fc', // purple
  '#fbbf24', // amber
  '#f59e0b', // orange
  '#D4A843', // gold — Qualified
  '#34d399', // emerald — Won
];

export function PipelineFunnelChart({
  data,
  conversionRates,
  isLoading = false,
  className,
}: PipelineFunnelChartProps) {
  const chartData = data
    .map((d, i) => ({
      ...d,
      color: d.color ?? PIPELINE_COLORS[i % PIPELINE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartContainer
      title="Pipeline Funnel"
      subtitle="Leads by CRM stage"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      emptyMessage="No pipeline data available"
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border}
            strokeOpacity={0.5}
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.textMuted, fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="stage"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.textSecondary, fontSize: 10, fontWeight: 300 }}
            width={100}
          />
          <Tooltip
            content={<CustomTooltip valueFormatter={(v: number) => `${v} leads`} />}
          />
          <Bar dataKey="count" name="Leads" radius={[0, 6, 6, 0]} barSize={22}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{
                fill: COLORS.textSecondary,
                fontSize: 10,
                fontWeight: 300,
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Conversion rates between stages */}
      {conversionRates && conversionRates.length > 0 && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1F1F1F]/50 flex-wrap">
          {conversionRates.map((cr, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#555]">{cr.from} → {cr.to}</span>
              <span className="text-[10px] text-[#D4A843] font-medium">{cr.rate}%</span>
            </div>
          ))}
        </div>
      )}
    </ChartContainer>
  );
}

// ─── 3. ProjectProgressGauge ────────────────────────────────────────────────

export interface ProjectProgressData {
  projectName: string;
  progress: number; // 0-100
  status?: string;
}

interface ProjectProgressGaugeProps {
  data: ProjectProgressData[];
  isLoading?: boolean;
  className?: string;
}

function SingleGauge({ data: project }: { data: ProjectProgressData }) {
  const chartData = [{ name: 'Progress', value: project.progress, fill: COLORS.gold }];
  const remaining = [{ name: 'Remaining', value: 100 - project.progress, fill: COLORS.border }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="85%"
            outerRadius="100%"
            barSize={10}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              dataKey="value"
              fill={COLORS.gold}
              cornerRadius={10}
              background={{ fill: COLORS.border }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-xl font-serif text-white">{project.progress}%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-white font-light mt-2 text-center max-w-[100px] truncate">
        {project.projectName}
      </p>
      {project.status && (
        <span className="text-[10px] text-[#555] mt-0.5">{project.status}</span>
      )}
    </div>
  );
}

export function ProjectProgressGauge({
  data,
  isLoading = false,
  className,
}: ProjectProgressGaugeProps) {
  return (
    <ChartContainer
      title="Project Progress"
      subtitle="Completion status"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      emptyMessage="No active projects"
      className={className}
    >
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {data.slice(0, 3).map((proj, i) => (
          <SingleGauge key={i} data={proj} />
        ))}
      </div>
    </ChartContainer>
  );
}

// ─── 4. TeamUtilizationChart ────────────────────────────────────────────────

export interface TeamUtilizationData {
  employee: string;
  hours: number;
  department: string;
}

interface TeamUtilizationChartProps {
  data: TeamUtilizationData[];
  isLoading?: boolean;
  className?: string;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  Design: '#a78bfa',
  Architecture: '#60a5fa',
  Engineering: '#34d399',
  '3D Modeling': '#fbbf24',
  'Project Management': '#f87171',
  Sales: '#22d3ee',
  Administration: '#9ca3af',
};

function getDeptColor(dept: string): string {
  return DEPARTMENT_COLORS[dept] ?? COLORS.gold;
}

export function TeamUtilizationChart({
  data,
  isLoading = false,
  className,
}: TeamUtilizationChartProps) {
  const chartData = [...data].sort((a, b) => b.hours - a.hours).slice(0, 12);

  return (
    <ChartContainer
      title="Team Utilization"
      subtitle="Hours logged this week"
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      emptyMessage="No time tracking data"
      className={className}
    >
      <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 32)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.border}
            strokeOpacity={0.5}
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            domain={[0, 48]}
          />
          <YAxis
            type="category"
            dataKey="employee"
            axisLine={false}
            tickLine={false}
            tick={{ fill: COLORS.textSecondary, fontSize: 10, fontWeight: 300 }}
            width={110}
          />
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v: number) => `${v}h`}
                currency=""
              />
            }
          />
          {/* Reference line at 40h */}
          <Bar
            dataKey="hours"
            name="Hours"
            radius={[0, 4, 4, 0]}
            barSize={16}
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getDeptColor(entry.department)}
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              dataKey="hours"
              position="right"
              formatter={(v: unknown) => `${v}h`}
              style={{
                fill: COLORS.textSecondary,
                fontSize: 10,
                fontWeight: 300,
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1F1F1F]/50 flex-wrap">
        {Object.entries(DEPARTMENT_COLORS).map(([dept, color]) => (
          <div key={dept} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-[#555] font-light">{dept}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}

// ─── 5. InvoiceStatusPie ────────────────────────────────────────────────────

export interface InvoiceStatusData {
  name: string;
  value: number;
  color: string;
}

interface InvoiceStatusPieProps {
  data: InvoiceStatusData[];
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_STATUS_COLORS = {
  Paid: '#34d399',
  Unpaid: '#f87171',
  Partial: '#D4A843',
  Overdue: '#991b1b',
  Draft: '#6b7280',
  Cancelled: '#4b5563',
};

export function InvoiceStatusPie({
  data,
  isLoading = false,
  className,
}: InvoiceStatusPieProps) {
  const chartData = data.map((d) => ({
    ...d,
    color: d.color ?? DEFAULT_STATUS_COLORS[d.name as keyof typeof DEFAULT_STATUS_COLORS] ?? COLORS.textMuted,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartContainer
      title="Invoice Status"
      subtitle={`${total} total invoices`}
      isLoading={isLoading}
      isEmpty={!isLoading && data.length === 0}
      emptyMessage="No invoice data"
      className={className}
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={
              <CustomTooltip
                valueFormatter={(v: number) =>
                  total > 0
                    ? `${v} (${((v / total) * 100).toFixed(1)}%)`
                    : `${v}`
                }
                currency=""
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[10px] text-[#888] font-light">{entry.name}</span>
            <span className="text-[10px] text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}

// ─── Export All ─────────────────────────────────────────────────────────────

export {
  ChartContainer,
  CustomTooltip,
  COLORS,
  PIPELINE_COLORS,
  DEPARTMENT_COLORS,
  DEFAULT_STATUS_COLORS,
};
