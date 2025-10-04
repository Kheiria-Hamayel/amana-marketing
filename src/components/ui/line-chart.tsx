// src/components/ui/line-chart.tsx (Updated with Recharts)

import React from "react";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Type Definitions (Same as before) ---

export interface ChartDataPoint {
  label: string;
  [key: string]: string | number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface LineChartProps {
  title: string;
  data: ChartDataPoint[];
  series: ChartSeries[];
  formatValue?: (value: number) => string;
  className?: string;
}

// --- Custom Tooltip Component ---

const CustomTooltip: React.FC<any> = ({
  active,
  payload,
  label,
  formatValue,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700/90 p-3 border border-gray-600 rounded-lg shadow-xl text-sm text-white">
        <p className="font-semibold mb-1 text-gray-300">
          Week: {String(label).substring(5, 10)}
        </p>
        {payload.map((item: any) => (
          <p
            key={item.dataKey}
            style={{ color: item.color }}
            className="font-medium"
          >
            {item.name}: {formatValue(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- LineChart Component ---

export const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  series,
  formatValue = (v) => v.toLocaleString(),
  className = "",
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-700 ${className}`}
      >
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex justify-center items-center h-64 text-gray-500">
          No data available for this chart.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RLineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis
              dataKey="label"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={{ stroke: "#4B5563" }}
              tickFormatter={(value) => String(value).substring(5, 10)} // Show only MM-DD
            />

            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={{ stroke: "#4B5563" }}
              tickFormatter={(value) => formatValue(value)} // Use the provided formatter
            />

            <Tooltip
              content={<CustomTooltip formatValue={formatValue} />}
              wrapperStyle={{ outline: "none" }}
            />

            <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />

            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                name={s.label}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
