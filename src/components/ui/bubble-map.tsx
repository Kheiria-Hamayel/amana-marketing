// "use client";
// import { useState, useMemo } from "react";
// import { RegionalPerformance } from "../../types/marketing";

// interface BubbleMapProps {
//   data: RegionalPerformance[];
//   className?: string;
//   height?: number;
//   metric?: "revenue" | "spend" | "conversions";
// }

// interface BubbleData {
//   region: string;
//   country: string;
//   value: number;
//   revenue: number;
//   spend: number;
//   conversions: number;
//   roas: number;
//   x: number;
//   y: number;
// }

// export function BubbleMap({
//   data,
//   className = "",
//   height = 400,
//   metric = "revenue",
// }: BubbleMapProps) {
//   const [selectedMetric, setSelectedMetric] = useState<
//     "revenue" | "spend" | "conversions"
//   >(metric);
//   const [hoveredBubble, setHoveredBubble] = useState<BubbleData | null>(null);

//   // Generate bubble data with simulated positions (since we don't have exact coordinates)
//   const bubbleData = useMemo((): BubbleData[] => {
//     if (!data || data.length === 0) return [];

//     // Group by region to avoid duplicates
//     const regionMap = new Map();
//     data.forEach((item) => {
//       const key = `${item.region}-${item.country}`;
//       if (!regionMap.has(key)) {
//         regionMap.set(key, {
//           region: item.region,
//           country: item.country,
//           revenue: 0,
//           spend: 0,
//           conversions: 0,
//           roas: 0,
//           count: 0,
//         });
//       }
//       const existing = regionMap.get(key);
//       existing.revenue += item.revenue;
//       existing.spend += item.spend;
//       existing.conversions += item.conversions;
//       existing.roas += item.roas;
//       existing.count += 1;
//     });

//     // Calculate averages and assign positions
//     const regions = Array.from(regionMap.values()).map((item, index) => {
//       const avgRoas = item.roas / item.count;

//       // Simulate geographic distribution based on region name
//       // This creates a pseudo-random but consistent positioning
//       const regionHash = item.region
//         .split("")
//         .reduce((a: number, b: string) => {
//           a = (a << 5) - a + b.charCodeAt(0);
//           return a & a;
//         }, 0);

//       const x = 50 + (Math.abs(regionHash) % 70); // 20-90% of width
//       const y = 30 + (Math.abs(regionHash * 7) % 60); // 20-80% of height

//       return {
//         region: item.region,
//         country: item.country,
//         value:
//           selectedMetric === "revenue"
//             ? item.revenue
//             : selectedMetric === "spend"
//             ? item.spend
//             : item.conversions,
//         revenue: item.revenue,
//         spend: item.spend,
//         conversions: item.conversions,
//         roas: avgRoas,
//         x,
//         y,
//       };
//     });

//     return regions;
//   }, [data, selectedMetric]);

//   if (!data || data.length === 0) {
//     return (
//       <div
//         className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
//       >
//         <h3 className="text-lg font-semibold text-white mb-4">
//           Regional Performance Map
//         </h3>
//         <div className="flex items-center justify-center h-48 text-gray-400">
//           No regional data available
//         </div>
//       </div>
//     );
//   }

//   // Calculate min and max values for bubble sizing
//   const values = bubbleData.map((item) => item.value);
//   const minValue = Math.min(...values);
//   const maxValue = Math.max(...values);

//   // Bubble size range (in pixels)
//   const minSize = 20;
//   const maxSize = 80;

//   const getBubbleSize = (value: number) => {
//     if (maxValue === minValue) return (minSize + maxSize) / 2;
//     return (
//       minSize +
//       ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize)
//     );
//   };

//   const getBubbleColor = (roas: number) => {
//     if (roas >= 5) return "#10B981"; // High ROAS - green
//     if (roas >= 2) return "#3B82F6"; // Good ROAS - blue
//     if (roas >= 1) return "#F59E0B"; // Break-even - yellow
//     return "#EF4444"; // Low ROAS - red
//   };

//   const formatValue = (value: number) => {
//     if (selectedMetric === "revenue" || selectedMetric === "spend") {
//       return `$${value.toLocaleString()}`;
//     }
//     return value.toLocaleString();
//   };

//   const metricLabels = {
//     revenue: "Revenue",
//     spend: "Spend",
//     conversions: "Conversions",
//   };

//   return (
//     <div
//       className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
//     >
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//         <h3 className="text-lg font-semibold text-white">
//           Regional Performance Map
//         </h3>

//         <div className="flex items-center space-x-2">
//           <span className="text-sm text-gray-400">Show:</span>
//           <div className="flex bg-gray-700 rounded-lg p-1">
//             {(["revenue", "spend", "conversions"] as const).map(
//               (metricOption) => (
//                 <button
//                   key={metricOption}
//                   onClick={() => setSelectedMetric(metricOption)}
//                   className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
//                     selectedMetric === metricOption
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-300 hover:text-white hover:bg-gray-600"
//                   }`}
//                 >
//                   {metricLabels[metricOption]}
//                 </button>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Map Container */}
//       <div
//         className="relative bg-gray-900 rounded-lg border border-gray-600 overflow-hidden"
//         style={{ height: `${height}px` }}
//       >
//         {/* Background grid for map-like appearance */}
//         <div className="absolute inset-0 opacity-20">
//           {/* Horizontal lines */}
//           {[20, 40, 60, 80].map((position) => (
//             <div
//               key={`h-${position}`}
//               className="absolute w-full border-t border-gray-500"
//               style={{ top: `${position}%` }}
//             />
//           ))}
//           {/* Vertical lines */}
//           {[25, 50, 75].map((position) => (
//             <div
//               key={`v-${position}`}
//               className="absolute h-full border-l border-gray-500"
//               style={{ left: `${position}%` }}
//             />
//           ))}
//         </div>

//         {/* Bubbles */}
//         {bubbleData.map((bubble, index) => {
//           const size = getBubbleSize(bubble.value);
//           const color = getBubbleColor(bubble.roas);

//           return (
//             <div
//               key={`${bubble.region}-${bubble.country}`}
//               className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
//               style={{
//                 left: `${bubble.x}%`,
//                 top: `${bubble.y}%`,
//                 width: `${size}px`,
//                 height: `${size}px`,
//               }}
//               onMouseEnter={() => setHoveredBubble(bubble)}
//               onMouseLeave={() => setHoveredBubble(null)}
//             >
//               <div
//                 className="w-full h-full rounded-full border-2 border-white/30 shadow-lg transition-all duration-200 hover:scale-110 hover:border-white/50"
//                 style={{
//                   backgroundColor: color,
//                   opacity: hoveredBubble === bubble ? 0.9 : 0.7,
//                 }}
//               />

//               {/* Bubble label (only show for larger bubbles) */}
//               {size > 35 && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-xs font-bold text-white text-center leading-tight">
//                     {bubble.region.split(" ")[0]}
//                   </span>
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {/* Tooltip */}
//         {hoveredBubble && (
//           <div
//             className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg text-white min-w-48"
//             style={{
//               left: `${hoveredBubble.x}%`,
//               top: `${hoveredBubble.y - 10}%`,
//               transform: "translate(-50%, -100%)",
//             }}
//           >
//             <div className="text-sm font-semibold mb-2">
//               {hoveredBubble.region}, {hoveredBubble.country}
//             </div>
//             <div className="space-y-1 text-xs">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Revenue:</span>
//                 <span className="text-green-400 font-medium">
//                   ${hoveredBubble.revenue.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Spend:</span>
//                 <span className="text-yellow-400 font-medium">
//                   ${hoveredBubble.spend.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Conversions:</span>
//                 <span className="text-blue-400 font-medium">
//                   {hoveredBubble.conversions.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">ROAS:</span>
//                 <span
//                   className={`font-medium ${
//                     hoveredBubble.roas >= 2
//                       ? "text-green-400"
//                       : hoveredBubble.roas >= 1
//                       ? "text-yellow-400"
//                       : "text-red-400"
//                   }`}
//                 >
//                   {hoveredBubble.roas.toFixed(1)}x
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Current Metric:</span>
//                 <span className="text-white font-medium">
//                   {formatValue(hoveredBubble.value)}
//                 </span>
//               </div>
//             </div>

//             {/* Tooltip arrow */}
//             <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
//           </div>
//         )}
//       </div>

//       {/* Legend */}
//       <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
//         <div className="flex items-center space-x-4">
//           <div className="flex items-center space-x-2">
//             <span className="text-xs text-gray-400">Bubble Size:</span>
//             <span className="text-xs text-white font-medium">
//               {metricLabels[selectedMetric]}
//             </span>
//           </div>

//           <div className="flex items-center space-x-2">
//             <span className="text-xs text-gray-400">Color:</span>
//             <div className="flex items-center space-x-1">
//               <div className="w-3 h-3 rounded-full bg-red-500" />
//               <span className="text-xs text-gray-300">ROAS &lt; 1x</span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <div className="w-3 h-3 rounded-full bg-yellow-500" />
//               <span className="text-xs text-gray-300">ROAS 1-2x</span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <div className="w-3 h-3 rounded-full bg-blue-500" />
//               <span className="text-xs text-gray-300">ROAS 2-5x</span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <div className="w-3 h-3 rounded-full bg-green-500" />
//               <span className="text-xs text-gray-300">ROAS &gt; 5x</span>
//             </div>
//           </div>
//         </div>

//         <div className="text-xs text-gray-400">
//           {bubbleData.length} regions displayed
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useMemo } from "react";
import { RegionalPerformance } from "../../types/marketing";

interface BubbleMapProps {
  data: RegionalPerformance[];
  className?: string;
  height?: number;
  metric?: "revenue" | "spend" | "conversions";
}

interface BubbleData {
  region: string;
  country: string;
  value: number;
  revenue: number;
  spend: number;
  conversions: number;
  roas: number;
  x: number;
  y: number;
}

export function BubbleMap({
  data,
  className = "",
  height = 400,
  metric = "revenue",
}: BubbleMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "revenue" | "spend" | "conversions"
  >(metric);
  const [hoveredBubble, setHoveredBubble] = useState<BubbleData | null>(null);

  // Generate bubble data with simulated positions
  const bubbleData = useMemo((): BubbleData[] => {
    if (!data || data.length === 0) return [];

    console.log("Processing regional data:", data);
    console.log("Selected metric:", selectedMetric);

    // Group by region to avoid duplicates
    const regionMap = new Map();
    data.forEach((item, index) => {
      const key = `${item.region}-${item.country}`;
      console.log(`Item ${index}:`, {
        region: item.region,
        country: item.country,
        revenue: item.revenue,
        spend: item.spend,
        conversions: item.conversions,
        roas: item.roas,
      });

      if (!regionMap.has(key)) {
        regionMap.set(key, {
          region: item.region,
          country: item.country,
          revenue: 0,
          spend: 0,
          conversions: 0,
          roas: 0,
          count: 0,
        });
      }
      const existing = regionMap.get(key);
      existing.revenue += Number(item.revenue) || 0;
      existing.spend += Number(item.spend) || 0;
      existing.conversions += Number(item.conversions) || 0;
      existing.roas += Number(item.roas) || 0;
      existing.count += 1;
    });

    console.log("Region map:", Array.from(regionMap.entries()));

    // Calculate averages and assign positions
    const regions = Array.from(regionMap.values())
      .map((item, index) => {
        // Safe ROAS calculation
        const avgRoas = item.count > 0 ? item.roas / item.count : 0;

        // Calculate value based on selected metric with proper fallbacks
        let value = 0;
        switch (selectedMetric) {
          case "revenue":
            value = item.revenue || 0;
            break;
          case "spend":
            value = item.spend || 0;
            break;
          case "conversions":
            value = item.conversions || 0;
            break;
        }

        console.log(`Region ${index} (${item.region}):`, {
          revenue: item.revenue,
          spend: item.spend,
          conversions: item.conversions,
          selectedMetric,
          calculatedValue: value,
        });

        // Simulate geographic distribution based on region name
        const regionHash = (item.region || "unknown")
          .split("")
          .reduce((a: number, b: string) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0);

        const x = 50 + (Math.abs(regionHash) % 70); // 20-90% of width
        const y = 30 + (Math.abs(regionHash * 7) % 60); // 20-80% of height

        return {
          region: item.region || "Unknown Region",
          country: item.country || "Unknown Country",
          value: value,
          revenue: item.revenue || 0,
          spend: item.spend || 0,
          conversions: item.conversions || 0,
          roas: avgRoas,
          x,
          y,
        };
      })
      .filter((item) => item.value > 0); // Only show regions with positive values

    console.log("Final bubble data:", regions);
    return regions;
  }, [data, selectedMetric]);

  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Regional Performance Map
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No regional data available
        </div>
      </div>
    );
  }

  // Calculate min and max values for bubble sizing with safe defaults
  const values = bubbleData
    .map((item) => item.value)
    .filter((val) => !isNaN(val));
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;

  console.log("Bubble sizing:", {
    minValue,
    maxValue,
    values,
    selectedMetric,
  });

  // Bubble size range (in pixels)
  const minSize = 20;
  const maxSize = 80;

  const getBubbleSize = (value: number) => {
    if (isNaN(value)) return minSize;
    if (maxValue === minValue) return (minSize + maxSize) / 2;
    return (
      minSize +
      ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize)
    );
  };

  const getBubbleColor = (roas: number) => {
    if (isNaN(roas)) return "#6B7280"; // Gray for undefined ROAS
    if (roas >= 5) return "#10B981"; // High ROAS - green
    if (roas >= 2) return "#3B82F6"; // Good ROAS - blue
    if (roas >= 1) return "#F59E0B"; // Break-even - yellow
    return "#EF4444"; // Low ROAS - red
  };

  const formatValue = (value: number) => {
    if (isNaN(value)) return "N/A";
    if (selectedMetric === "revenue" || selectedMetric === "spend") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const metricLabels = {
    revenue: "Revenue",
    spend: "Spend",
    conversions: "Conversions",
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white">
          Regional Performance Map
        </h3>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Show:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(["revenue", "spend", "conversions"] as const).map(
              (metricOption) => (
                <button
                  key={metricOption}
                  onClick={() => {
                    console.log("Changing metric to:", metricOption);
                    setSelectedMetric(metricOption);
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    selectedMetric === metricOption
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                >
                  {metricLabels[metricOption]}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div>
            <strong>Debug Information:</strong>
          </div>
          <div>
            Current metric: <span className="text-white">{selectedMetric}</span>
          </div>
          <div>
            Total regions:{" "}
            <span className="text-white">{bubbleData.length}</span>
          </div>
          <div>
            Value range:{" "}
            <span className="text-white">
              {minValue.toLocaleString()} - {maxValue.toLocaleString()}
            </span>
          </div>
          <div>Sample data:</div>
          {bubbleData.slice(0, 3).map((item, index) => (
            <div key={index} className="ml-2">
              <span className="text-white">{item.region}</span>: Revenue: $
              {item.revenue?.toLocaleString()}, Spend: $
              {item.spend?.toLocaleString()}, Conversions:{" "}
              {item.conversions?.toLocaleString()}, Current:{" "}
              {formatValue(item.value)}
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        className="relative bg-gray-900 rounded-lg border border-gray-600 overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Background grid for map-like appearance */}
        <div className="absolute inset-0 opacity-20">
          {/* Horizontal lines */}
          {[20, 40, 60, 80].map((position) => (
            <div
              key={`h-${position}`}
              className="absolute w-full border-t border-gray-500"
              style={{ top: `${position}%` }}
            />
          ))}
          {/* Vertical lines */}
          {[25, 50, 75].map((position) => (
            <div
              key={`v-${position}`}
              className="absolute h-full border-l border-gray-500"
              style={{ left: `${position}%` }}
            />
          ))}
        </div>

        {/* Bubbles */}
        {bubbleData.map((bubble, index) => {
          const size = getBubbleSize(bubble.value);
          const color = getBubbleColor(bubble.roas);

          console.log(`Bubble ${index}:`, {
            region: bubble.region,
            value: bubble.value,
            size: size,
            metric: selectedMetric,
          });

          return (
            <div
              key={`${bubble.region}-${bubble.country}-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              onMouseEnter={() => setHoveredBubble(bubble)}
              onMouseLeave={() => setHoveredBubble(null)}
            >
              <div
                className="w-full h-full rounded-full border-2 border-white/30 shadow-lg transition-all duration-200 hover:scale-110 hover:border-white/50"
                style={{
                  backgroundColor: color,
                  opacity: hoveredBubble === bubble ? 0.9 : 0.7,
                }}
              />

              {/* Bubble label (only show for larger bubbles) */}
              {size > 35 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white text-center leading-tight">
                    {bubble.region.split(" ")[0]}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredBubble && (
          <div
            className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg text-white min-w-48"
            style={{
              left: `${hoveredBubble.x}%`,
              top: `${hoveredBubble.y - 10}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-sm font-semibold mb-2">
              {hoveredBubble.region}, {hoveredBubble.country}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue:</span>
                <span className="text-green-400 font-medium">
                  ${hoveredBubble.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spend:</span>
                <span className="text-yellow-400 font-medium">
                  ${hoveredBubble.spend.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Conversions:</span>
                <span className="text-blue-400 font-medium">
                  {hoveredBubble.conversions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROAS:</span>
                <span
                  className={`font-medium ${
                    hoveredBubble.roas >= 2
                      ? "text-green-400"
                      : hoveredBubble.roas >= 1
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {isNaN(hoveredBubble.roas)
                    ? "N/A"
                    : `${hoveredBubble.roas.toFixed(1)}x`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Current Metric ({metricLabels[selectedMetric]}):
                </span>
                <span className="text-white font-medium">
                  {formatValue(hoveredBubble.value)}
                </span>
              </div>
            </div>

            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Bubble Size:</span>
            <span className="text-xs text-white font-medium">
              {metricLabels[selectedMetric]}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Color:</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-300">ROAS &lt; 1x</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-300">ROAS 1-2x</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-300">ROAS 2-5x</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-300">ROAS &gt; 5x</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {bubbleData.length} regions displayed
        </div>
      </div>
    </div>
  );
}
