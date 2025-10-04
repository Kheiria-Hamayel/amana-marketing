interface CardMetricProps {
  title: string;
  value: string | number;
  className?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string; // Add this new prop
}

export function CardMetric({
  title,
  value,
  className = "",
  icon,
  trend,
  subtitle, // Add this new prop
}: CardMetricProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {subtitle && ( // Add subtitle display
            <div className="text-sm text-gray-400 mt-1">{subtitle}</div>
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            <span className="mr-1">{trend.isPositive ? "↗" : "↘"}</span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
