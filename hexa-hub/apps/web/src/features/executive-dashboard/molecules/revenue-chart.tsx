/**
 * Executive Dashboard Revenue Chart Molecule
 * Premium Recharts-based revenue visualization
 */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { formatCurrency } from "../utils/formatters";
import { chartConfig } from "../config/dashboard-config";
import type { RevenueChartData } from "../types/dashboard-types";

interface RevenueChartProps {
  timeRange?: "today" | "week" | "month" | "quarter" | "year";
}

// Static demo fallback so the chart renders deterministically (no impure
// Math.random / Date.now calls during render, which React 19's purity rule
// forbids). Real data replaces this when metrics are available.
const DEMO_REVENUE: RevenueChartData[] = [
  { date: "Jan", paid: 12000, pending: 3000, total: 15000 },
  { date: "Feb", paid: 15000, pending: 2500, total: 17500 },
  { date: "Mar", paid: 18000, pending: 4000, total: 22000 },
  { date: "Apr", paid: 22000, pending: 3500, total: 25500 },
  { date: "May", paid: 25000, pending: 2000, total: 27000 },
  { date: "Jun", paid: 28000, pending: 1500, total: 29500 },
  { date: "Jul", paid: 30000, pending: 1000, total: 31000 },
];

interface TooltipEntry {
  color?: string;
  name?: string;
  value?: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
        <p className="text-sm font-medium text-white/80 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2 mt-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1">
              <p className="text-xs text-white/60">{entry.name}</p>
              <p className="text-sm font-medium text-white">
                {formatCurrency(Number(entry.value ?? 0))}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

interface LegendPayloadItem {
  color?: string;
  value?: string | number;
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  const items = (payload ?? []).map((entry) => ({
    color: String(entry.color ?? "transparent"),
    value: String(entry.value ?? ""),
  }));

  return (
    <div className="flex items-center gap-4 text-xs text-white/60 mt-4">
      {items.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export const RevenueChart = ({ timeRange: _timeRange = "month" }: RevenueChartProps) => {
  const { isLoading } = useDashboardMetrics();

  const chartData = useMemo<RevenueChartData[]>(() => {
    // Revenue chart uses the static demo dataset. Live per-point revenue
    // history is not part of DashboardMetrics (which exposes a RevenueSummary
    // aggregate, not a time series), so the demo series stands in here.
    return DEMO_REVENUE;
  }, [isLoading]);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(value, "USD", { maximumFractionDigits: 0 })
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend content={<CustomLegend />} />
            <Line
              type="monotone"
              dataKey="paid"
              name="Paid"
              stroke={chartConfig.revenue.line.stroke}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke={chartConfig.revenue.line.stroke}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={chartConfig.revenue.line.stroke}
              strokeWidth={2}
              strokeOpacity={0.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
