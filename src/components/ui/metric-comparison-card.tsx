// src/components/ui/metric-comparison-card.tsx
import React from "react";
import { Tablet, Monitor } from "lucide-react";

interface ComparisonValue {
  label: string;
  value: string | number;
  isHigherBetter: boolean;
  color?: string; // e.g., 'text-blue-400'
}

export interface MetricComparisonCardProps {
  title: string;
  mobile: ComparisonValue;
  desktop: ComparisonValue;
}

const getIcon = (label: string) => {
  if (label.toLowerCase().includes("mobile")) {
    return <Tablet className="h-5 w-5 text-indigo-400" />;
  }
  return <Monitor className="h-5 w-5 text-teal-400" />;
};

export const MetricComparisonCard: React.FC<MetricComparisonCardProps> = ({
  title,
  mobile,
  desktop,
}) => {
  const formatValue = (value: string | number) =>
    typeof value === "number"
      ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : value;

  const getWinnerColor = (
    valA: number,
    valB: number,
    isHigherBetter: boolean
  ) => {
    if (valA === valB) return "text-yellow-400";
    if (isHigherBetter) {
      return valA > valB ? "text-green-400" : "text-red-400";
    } else {
      return valA < valB ? "text-green-400" : "text-red-400";
    }
  };

  const mobileValue =
    parseFloat(String(mobile.value).replace(/[^\d.]/g, "")) || 0;
  const desktopValue =
    parseFloat(String(desktop.value).replace(/[^\d.]/g, "")) || 0;

  const mobileColor = getWinnerColor(
    mobileValue,
    desktopValue,
    mobile.isHigherBetter
  );
  const desktopColor = getWinnerColor(
    desktopValue,
    mobileValue,
    desktop.isHigherBetter
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
        {/* Mobile Metric */}
        <div className="flex flex-col border-r border-gray-700 pr-4">
          <div className="flex items-center text-gray-400 mb-2">
            {getIcon(mobile.label)}
            <span className="ml-2 text-sm font-medium uppercase tracking-wider">
              {mobile.label}
            </span>
          </div>
          <p className={`text-3xl font-bold ${mobileColor}`}>
            {formatValue(mobile.value)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {mobile.isHigherBetter ? "Higher is better" : "Lower is better"}
          </p>
        </div>

        {/* Desktop Metric */}
        <div className="flex flex-col">
          <div className="flex items-center text-gray-400 mb-2">
            {getIcon(desktop.label)}
            <span className="ml-2 text-sm font-medium uppercase tracking-wider">
              {desktop.label}
            </span>
          </div>
          <p className={`text-3xl font-bold ${desktopColor}`}>
            {formatValue(desktop.value)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {desktop.isHigherBetter ? "Higher is better" : "Lower is better"}
          </p>
        </div>
      </div>
    </div>
  );
};
