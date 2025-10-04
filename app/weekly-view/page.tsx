// app/weekly-view/page.tsx

"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
// Assuming the types are Campaign and WeeklyPerformance are defined in src/types/marketing.ts
import {
  MarketingData,
  Campaign,
  WeeklyPerformance,
} from "../../src/types/marketing";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
// Import the updated Line Chart component
import {
  LineChart,
  ChartSeries,
  ChartDataPoint,
} from "../../src/components/ui/line-chart";
import { BarChart3 } from "lucide-react";

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading marketing data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Memoized data transformation to aggregate weekly_performance from all campaigns
  const weeklyChartData: ChartDataPoint[] = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    // Map to aggregate revenue and spend by week_start date
    const aggregatedDataMap = new Map<
      string,
      { revenue: number; spend: number; week_start: string }
    >();

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.weekly_performance.forEach((week: WeeklyPerformance) => {
        const weekKey = week.week_start;

        const existing = aggregatedDataMap.get(weekKey) || {
          revenue: 0,
          spend: 0,
          week_start: weekKey,
        };

        aggregatedDataMap.set(weekKey, {
          revenue: existing.revenue + week.revenue,
          spend: existing.spend + week.spend,
          week_start: weekKey,
        });
      });
    });

    // Convert map values to ChartDataPoint array and sort by date
    const chartData: ChartDataPoint[] = Array.from(aggregatedDataMap.values())
      .map((data) => ({
        label: data.week_start, // Use week_start as the label (for sorting and XAxis)
        revenue: data.revenue,
        spend: data.spend,
      }))
      .sort((a, b) => (new Date(a.label) > new Date(b.label) ? 1 : -1)); // Sort by date

    return chartData;
  }, [marketingData?.campaigns]);

  // Define the series configuration for the Line Chart
  const chartSeries: ChartSeries[] = [
    { key: "revenue", label: "Revenue", color: "#10B981" }, // Emerald Green
    { key: "spend", label: "Spend", color: "#EF4444" }, // Red
  ];

  // Value formatter for currency
  const currencyFormatter = (value: number): string =>
    `$${Math.round(value).toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded mb-4 max-w-lg mx-auto text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-3xl md:text-5xl font-bold">
                  Weekly Performance View
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {marketingData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" /> Revenue and
                Spend Trend
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <LineChart
                  title="Weekly Revenue vs. Spend"
                  data={weeklyChartData}
                  series={chartSeries}
                  formatValue={currencyFormatter}
                />
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
