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

interface RevenueChartProps {
  timeRange?: "today" | "week" | "month" | "quarter" | "year";
}

export const RevenueChart = ({ timeRange = "month" }: RevenueChartProps) => {
  const { metrics, isLoading } = useDashboardMetrics();

  // Mock data generation for demo purposes
  const chartData = useMemo(() => {
    if (isLoading || !metrics?.revenue) {
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        paid: Math.floor(Math.random() * 10000) + 5000,
        pending: Math.floor(Math.random() * 5000) + 2000,
        total: Math.floor(Math.random() * 15000) + 7000,
      }));
    }

    // In a real implementation, this would come from the API
    return [
      { date: "Jan", paid: 12000, pending: 3000, total: 15000 },
      { date: "Feb", paid: 15000, pending: 2500, total: 17500 },
      { date: "Mar", paid: 18000, pending: 4000, total: 22000 },
      { date: "Apr", paid: 22000, pending: 3500, total: 25500 },
      { date: "May", paid: 25000, pending: 2000, total: 27000 },
      { date: "Jun", paid: 28000, pending: 1500, total: 29500 },
      { date: "Jul", paid: 30000, pending: 1000, total: 31000 },
    ];
  }, [isLoading, metrics?.revenue]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
          <p className="text-sm font-medium text-white/80 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1">
                <p className="text-xs text-white/60">{entry.name}</p>
                <p className="text-sm font-medium text-white">{formatCurrency(entry.value)}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex items-center gap-4 text-xs text-white/60 mt-4">
        {payload.map((entry: any, index: number) => (
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
  };

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
              tickFormatter={(value) => formatCurrency(value, "USD", { maximumFractionDigits: 0 })}
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
              strokeWidth={chartConfig.revenue.line.strokeWidth}
              fill={chartConfig.revenue.line.fill}
              dot={{ r: 4, stroke: chartConfig.revenue.line.stroke, strokeWidth: 2, fill: "white" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke={chartConfig.revenue.line.stroke.replace("6", "4")}
              strokeWidth={chartConfig.revenue.line.strokeWidth}
              fill={chartConfig.revenue.line.fill.replace("6", "4")}
              dot={{ r: 4, stroke: chartConfig.revenue.line.stroke.replace("6", "4"), strokeWidth: 2, fill: "white" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={chartConfig.revenue.line.stroke.replace("6", "3")}
              strokeWidth={chartConfig.revenue.line.strokeWidth - 1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-sm text-white/60">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400/60" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400/30" />
          <span>Total</span>
        </div>
      </div>
    </div>
  );
};
