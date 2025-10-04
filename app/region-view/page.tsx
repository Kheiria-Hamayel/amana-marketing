"use client";
import { useState, useEffect, useMemo } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { CardMetric } from "../../src/components/ui/card-metric";
import { BubbleMap } from "../../src/components/ui/bubble-map";
import { Table } from "../../src/components/ui/table";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData, RegionalPerformance } from "../../src/types/marketing";
import {
  DollarSign,
  TrendingUp,
  MapPin,
  Users,
  Target,
  BarChart3,
} from "lucide-react";

export default function RegionView() {
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

  // Aggregate regional performance data from all campaigns
  const regionalData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const regionMap = new Map();

    marketingData.campaigns.forEach((campaign) => {
      campaign.regional_performance.forEach((region) => {
        const key = `${region.region}-${region.country}`;
        if (!regionMap.has(key)) {
          regionMap.set(key, {
            region: region.region,
            country: region.country,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
            revenue: 0,
            ctr: 0,
            conversion_rate: 0,
            cpc: 0,
            cpa: 0,
            roas: 0,
            campaignCount: 0,
          });
        }

        const existing = regionMap.get(key);
        existing.impressions += region.impressions;
        existing.clicks += region.clicks;
        existing.conversions += region.conversions;
        existing.spend += region.spend;
        existing.revenue += region.revenue;
        existing.campaignCount += 1;
      });
    });

    // Calculate averages and final metrics
    return Array.from(regionMap.values()).map((region) => ({
      ...region,
      ctr:
        region.impressions > 0 ? (region.clicks / region.impressions) * 100 : 0,
      conversion_rate:
        region.clicks > 0 ? (region.conversions / region.clicks) * 100 : 0,
      cpc: region.clicks > 0 ? region.spend / region.clicks : 0,
      cpa: region.conversions > 0 ? region.spend / region.conversions : 0,
      roas: region.spend > 0 ? region.revenue / region.spend : 0,
    }));
  }, [marketingData?.campaigns]);

  // Calculate regional metrics for cards
  const regionalMetrics = useMemo(() => {
    if (regionalData.length === 0) return null;

    const totalRevenue = regionalData.reduce(
      (sum, region) => sum + region.revenue,
      0
    );
    const totalSpend = regionalData.reduce(
      (sum, region) => sum + region.spend,
      0
    );
    const totalConversions = regionalData.reduce(
      (sum, region) => sum + region.conversions,
      0
    );

    // Find top performing region by ROAS
    const topRegion = regionalData.reduce(
      (top, region) => (region.roas > top.roas ? region : top),
      regionalData[0]
    );

    // Find region with highest revenue
    const highestRevenueRegion = regionalData.reduce(
      (top, region) => (region.revenue > top.revenue ? region : top),
      regionalData[0]
    );

    return {
      totalRevenue,
      totalSpend,
      totalConversions,
      averageROAS: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      topRegion: topRegion.region,
      topRegionROAS: topRegion.roas,
      highestRevenueRegion: highestRevenueRegion.region,
      highestRevenue: highestRevenueRegion.revenue,
      regionCount: regionalData.length,
    };
  }, [regionalData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading regional data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Regional Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && regionalMetrics && (
            <>
              {/* Regional Overview Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <CardMetric
                  title="Total Regions"
                  value={regionalMetrics.regionCount}
                  icon={<MapPin className="h-5 w-5" />}
                />

                <CardMetric
                  title="Total Revenue"
                  value={`$${regionalMetrics.totalRevenue.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />

                <CardMetric
                  title="Total Spend"
                  value={`$${regionalMetrics.totalSpend.toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />

                <CardMetric
                  title="Avg ROAS"
                  value={`${regionalMetrics.averageROAS.toFixed(1)}x`}
                  icon={<BarChart3 className="h-5 w-5" />}
                />
              </div>

              {/* Regional Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <CardMetric
                  title="Top Performing Region (ROAS)"
                  value={regionalMetrics.topRegion}
                  subtitle={`${regionalMetrics.topRegionROAS.toFixed(1)}x ROAS`}
                  icon={<Target className="h-5 w-5" />}
                />

                <CardMetric
                  title="Highest Revenue Region"
                  value={regionalMetrics.highestRevenueRegion}
                  subtitle={`$${regionalMetrics.highestRevenue.toLocaleString()}`}
                  icon={<Users className="h-5 w-5" />}
                />
              </div>

              {/* Bubble Map */}
              <div className="mb-6 sm:mb-8">
                <BubbleMap data={regionalData} height={500} metric="revenue" />
              </div>

              {/* Regional Performance Table */}
              <div className="overflow-x-auto w-full max-w-full">
                <Table
                  title={`Regional Performance Details (${regionalData.length} regions)`}
                  showIndex={true}
                  maxHeight="400px"
                  columns={[
                    {
                      key: "region",
                      header: "Region",
                      width: "20%",
                      sortable: true,
                      sortType: "string",
                      render: (value) => (
                        <div className="font-medium text-white text-sm">
                          {value}
                        </div>
                      ),
                    },
                    {
                      key: "country",
                      header: "Country",
                      width: "15%",
                      sortable: true,
                      sortType: "string",
                    },
                    {
                      key: "revenue",
                      header: "Revenue",
                      width: "15%",
                      align: "right",
                      sortable: true,
                      sortType: "number",
                      render: (value) => (
                        <span className="text-green-400 font-medium text-sm">
                          ${value.toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      key: "spend",
                      header: "Spend",
                      width: "15%",
                      align: "right",
                      sortable: true,
                      sortType: "number",
                      render: (value) => (
                        <span className="text-yellow-400 font-medium text-sm">
                          ${value.toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      key: "conversions",
                      header: "Conversions",
                      width: "12%",
                      align: "right",
                      sortable: true,
                      sortType: "number",
                      render: (value) => (
                        <span className="text-blue-400 font-medium text-sm">
                          {value.toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      key: "roas",
                      header: "ROAS",
                      width: "10%",
                      align: "right",
                      sortable: true,
                      sortType: "number",
                      render: (value) => (
                        <span
                          className={`font-medium text-sm ${
                            value >= 2
                              ? "text-green-400"
                              : value >= 1
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {value.toFixed(1)}x
                        </span>
                      ),
                    },
                    {
                      key: "ctr",
                      header: "CTR",
                      width: "8%",
                      align: "right",
                      sortable: true,
                      sortType: "number",
                      render: (value) => (
                        <span className="text-gray-300 text-sm">
                          {value.toFixed(1)}%
                        </span>
                      ),
                    },
                  ]}
                  defaultSort={{ key: "revenue", direction: "desc" }}
                  data={regionalData}
                  emptyMessage="No regional data available"
                />
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
