// app/device-view/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData, DevicePerformance } from "../../src/types/marketing";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { CardMetric } from "../../src/components/ui/card-metric";
import { MetricComparisonCard } from "../../src/components/ui/metric-comparison-card";
import { DollarSign, Tablet, Monitor, LineChart, Cpu } from "lucide-react";

// --- Helper Types ---

interface AggregateDeviceData {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface DeviceMetrics {
  Mobile: AggregateDeviceData;
  Desktop: AggregateDeviceData;
  Other: AggregateDeviceData;
}

// --- Main Page Component ---

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Aggregate and process device performance data
  const deviceMetrics: DeviceMetrics = useMemo(() => {
    if (!marketingData) {
      return {
        Mobile: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        },
        Desktop: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        },
        Other: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        },
      };
    }

    const initialMetrics: DeviceMetrics = {
      Mobile: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
      },
      Desktop: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
      },
      Other: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
      },
    };

    marketingData.campaigns.forEach((campaign) => {
      campaign.device_performance.forEach((devicePerf: DevicePerformance) => {
        const key = devicePerf.device as keyof DeviceMetrics;
        if (initialMetrics[key]) {
          initialMetrics[key].impressions += devicePerf.impressions;
          initialMetrics[key].clicks += devicePerf.clicks;
          initialMetrics[key].conversions += devicePerf.conversions;
          initialMetrics[key].spend += devicePerf.spend;
          initialMetrics[key].revenue += devicePerf.revenue;
        } else {
          // Fallback any unclassified device to 'Other'
          initialMetrics.Other.impressions += devicePerf.impressions;
          initialMetrics.Other.clicks += devicePerf.clicks;
          initialMetrics.Other.conversions += devicePerf.conversions;
          initialMetrics.Other.spend += devicePerf.spend;
          initialMetrics.Other.revenue += devicePerf.revenue;
        }
      });
    });

    return initialMetrics;
  }, [marketingData]);

  // Calculate Derived Metrics
  const calculateDerivedMetrics = (data: AggregateDeviceData) => {
    const ctr =
      data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const conversionRate =
      data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    const roas = data.spend > 0 ? data.revenue / data.spend : 0;
    const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
    const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;

    return { ctr, conversionRate, roas, cpc, cpa };
  };

  const mobileStats = calculateDerivedMetrics(deviceMetrics.Mobile);
  const desktopStats = calculateDerivedMetrics(deviceMetrics.Desktop);

  const totalImpressions =
    deviceMetrics.Mobile.impressions +
    deviceMetrics.Desktop.impressions +
    deviceMetrics.Other.impressions;
  const mobileTrafficShare =
    totalImpressions > 0
      ? (deviceMetrics.Mobile.impressions / totalImpressions) * 100
      : 0;
  const desktopTrafficShare =
    totalImpressions > 0
      ? (deviceMetrics.Desktop.impressions / totalImpressions) * 100
      : 0;

  if (loading)
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading Device Performance Data...</div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded max-w-lg">
            Error loading data: {error}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-800 to-teal-700 text-white py-12">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">
              Device Performance View
            </h1>
            <p className="mt-2 text-lg text-teal-200">
              In-depth comparison of mobile and desktop campaign performance.
            </p>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Top Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CardMetric
              title="Mobile Traffic Share"
              value={`${mobileTrafficShare.toFixed(1)}%`}
              icon={<Tablet className="h-5 w-5 text-indigo-400" />}
              subtitle="of total impressions"
            />
            <CardMetric
              title="Desktop Traffic Share"
              value={`${desktopTrafficShare.toFixed(1)}%`}
              icon={<Monitor className="h-5 w-5 text-teal-400" />}
              subtitle="of total impressions"
            />
            <CardMetric
              title="Total Conversions"
              value={
                deviceMetrics.Mobile.conversions +
                deviceMetrics.Desktop.conversions
              }
              icon={<Cpu className="h-5 w-5 text-yellow-400" />}
            />
            <CardMetric
              title="Total Revenue"
              value={`$${(
                deviceMetrics.Mobile.revenue + deviceMetrics.Desktop.revenue
              ).toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5 text-green-400" />}
            />
          </div>

          {/* Detailed Metric Comparison Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Mobile vs. Desktop Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. ROAS Comparison */}
              <MetricComparisonCard
                title="Return on Ad Spend (ROAS)"
                mobile={{
                  label: "Mobile",
                  value: `${mobileStats.roas.toFixed(2)}x`,
                  isHigherBetter: true,
                }}
                desktop={{
                  label: "Desktop",
                  value: `${desktopStats.roas.toFixed(2)}x`,
                  isHigherBetter: true,
                }}
              />

              {/* 2. CTR Comparison */}
              <MetricComparisonCard
                title="Click-Through Rate (CTR)"
                mobile={{
                  label: "Mobile",
                  value: `${mobileStats.ctr.toFixed(2)}%`,
                  isHigherBetter: true,
                }}
                desktop={{
                  label: "Desktop",
                  value: `${desktopStats.ctr.toFixed(2)}%`,
                  isHigherBetter: true,
                }}
              />

              {/* 3. Conversion Rate Comparison */}
              <MetricComparisonCard
                title="Conversion Rate"
                mobile={{
                  label: "Mobile",
                  value: `${mobileStats.conversionRate.toFixed(2)}%`,
                  isHigherBetter: true,
                }}
                desktop={{
                  label: "Desktop",
                  value: `${desktopStats.conversionRate.toFixed(2)}%`,
                  isHigherBetter: true,
                }}
              />

              {/* 4. CPC Comparison */}
              <MetricComparisonCard
                title="Cost Per Click (CPC)"
                mobile={{
                  label: "Mobile",
                  value: `$${mobileStats.cpc.toFixed(2)}`,
                  isHigherBetter: false,
                }}
                desktop={{
                  label: "Desktop",
                  value: `$${desktopStats.cpc.toFixed(2)}`,
                  isHigherBetter: false,
                }}
              />

              {/* 5. CPA Comparison */}
              <MetricComparisonCard
                title="Cost Per Acquisition (CPA)"
                mobile={{
                  label: "Mobile",
                  value: `$${mobileStats.cpa.toFixed(2)}`,
                  isHigherBetter: false,
                }}
                desktop={{
                  label: "Desktop",
                  value: `$${desktopStats.cpa.toFixed(2)}`,
                  isHigherBetter: false,
                }}
              />

              {/* 6. Total Revenue */}
              <MetricComparisonCard
                title="Total Revenue"
                mobile={{
                  label: "Mobile",
                  value: `$${deviceMetrics.Mobile.revenue.toLocaleString()}`,
                  isHigherBetter: true,
                }}
                desktop={{
                  label: "Desktop",
                  value: `$${deviceMetrics.Desktop.revenue.toLocaleString()}`,
                  isHigherBetter: true,
                }}
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
