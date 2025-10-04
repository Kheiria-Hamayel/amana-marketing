"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
import {
  MarketingData,
  Campaign,
  DemographicBreakdown,
} from "../../src/types/marketing";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import { BarChart } from "../../src/components/ui/bar-chart";
import { Table } from "../../src/components/ui/table";
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Target,
  Activity,
} from "lucide-react";

// Utility function to calculate metrics for a specific gender
const calculateGenderMetrics = (
  campaigns: Campaign[],
  gender: "Male" | "Female"
) => {
  return campaigns.reduce(
    (acc, campaign) => {
      campaign.demographic_breakdown.forEach(
        (breakdown: DemographicBreakdown) => {
          if (breakdown.gender.toLowerCase() === gender.toLowerCase()) {
            acc.totalClicks += breakdown.performance.clicks;
            acc.totalSpend +=
              campaign.spend * (breakdown.percentage_of_audience / 100);
            acc.totalRevenue +=
              campaign.revenue * (breakdown.percentage_of_audience / 100);
          }
        }
      );
      return acc;
    },
    { totalClicks: 0, totalSpend: 0, totalRevenue: 0 }
  );
};

// Utility function to aggregate data by Age Group
const aggregateByAgeGroup = (campaigns: Campaign[]) => {
  const ageGroupData: {
    [key: string]: {
      spend: number;
      revenue: number;
      clicks: number;
      conversions: number;
      impressions: number;
    };
  } = {};

  campaigns.forEach((campaign) => {
    campaign.demographic_breakdown.forEach((breakdown) => {
      const group = breakdown.age_group;
      if (!ageGroupData[group]) {
        ageGroupData[group] = {
          spend: 0,
          revenue: 0,
          clicks: 0,
          conversions: 0,
          impressions: 0,
        };
      }

      // Estimate spend/revenue contribution by percentage of audience
      const contributionFactor = breakdown.percentage_of_audience / 100;
      ageGroupData[group].spend += campaign.spend * contributionFactor;
      ageGroupData[group].revenue += campaign.revenue * contributionFactor;

      // Use direct performance data for other metrics
      ageGroupData[group].clicks += breakdown.performance.clicks;
      ageGroupData[group].conversions += breakdown.performance.conversions;
      ageGroupData[group].impressions += breakdown.performance.impressions;
    });
  });

  return ageGroupData;
};

// Utility function to create combined demographic performance table data
const createDemographicTableData = (
  campaigns: Campaign[],
  gender: "Male" | "Female"
) => {
  const breakdownMap: { [ageGroup: string]: { [key: string]: number } } = {};

  campaigns.forEach((campaign) => {
    campaign.demographic_breakdown.forEach((breakdown) => {
      if (breakdown.gender.toLowerCase() === gender.toLowerCase()) {
        const ageGroup = breakdown.age_group;
        if (!breakdownMap[ageGroup]) {
          breakdownMap[ageGroup] = {
            impressions: 0,
            clicks: 0,
            conversions: 0,
          };
        }
        breakdownMap[ageGroup].impressions += breakdown.performance.impressions;
        breakdownMap[ageGroup].clicks += breakdown.performance.clicks;
        breakdownMap[ageGroup].conversions += breakdown.performance.conversions;
      }
    });
  });

  // Convert map to array with calculated CTR and Conversion Rate
  return Object.entries(breakdownMap).map(([age_group, data]) => {
    const ctr =
      data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const conversion_rate =
      data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;

    return {
      age_group,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      ctr: ctr,
      conversion_rate: conversion_rate,
    };
  });
};

export default function DemographicView() {
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

  // Memoized calculations for all required components
  const {
    maleMetrics,
    femaleMetrics,
    ageGroupData,
    maleTableData,
    femaleTableData,
  } = useMemo(() => {
    if (!marketingData?.campaigns)
      return {
        maleMetrics: { totalClicks: 0, totalSpend: 0, totalRevenue: 0 },
        femaleMetrics: { totalClicks: 0, totalSpend: 0, totalRevenue: 0 },
        ageGroupData: {},
        maleTableData: [],
        femaleTableData: [],
      };

    const campaigns = marketingData.campaigns;

    // Card Component Metrics
    const maleM = calculateGenderMetrics(campaigns, "Male");
    const femaleM = calculateGenderMetrics(campaigns, "Female");

    // Bar Chart Data
    const ageGroupD = aggregateByAgeGroup(campaigns);

    // Table Data
    const maleT = createDemographicTableData(campaigns, "Male");
    const femaleT = createDemographicTableData(campaigns, "Female");

    return {
      maleMetrics: maleM,
      femaleMetrics: femaleM,
      ageGroupData: ageGroupD,
      maleTableData: maleT,
      femaleTableData: femaleT,
    };
  }, [marketingData?.campaigns]);

  // Bar Chart data transformation
  const spendByAgeChartData = useMemo(() => {
    return Object.entries(ageGroupData)
      .sort(([, a], [, b]) => b.spend - a.spend)
      .map(([label, data]) => ({
        label,
        value: data.spend,
        color: "#10B981",
      }));
  }, [ageGroupData]);

  const revenueByAgeChartData = useMemo(() => {
    return Object.entries(ageGroupData)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([label, data]) => ({
        label,
        value: data.revenue,
        color: "#3B82F6",
      }));
  }, [ageGroupData]);

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
                  Demographic View
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && (
            <>
              {/* Gender Metrics Section */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Performance by Gender (Estimated)
                </h2>

                {/* Male Metrics */}
                <h3 className="text-lg font-medium text-gray-300 mb-3 mt-6 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-400" /> Male
                  Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <CardMetric
                    title="Total Clicks (Males)"
                    value={Math.round(maleMetrics.totalClicks)}
                    icon={<MousePointerClick className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend (Males)"
                    value={`$${Math.round(
                      maleMetrics.totalSpend
                    ).toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Revenue (Males)"
                    value={`$${Math.round(
                      maleMetrics.totalRevenue
                    ).toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className="text-green-400"
                  />
                </div>

                {/* Female Metrics */}
                <h3 className="text-lg font-medium text-gray-300 mb-3 mt-6 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-pink-400" /> Female
                  Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
                  <CardMetric
                    title="Total Clicks (Females)"
                    value={Math.round(femaleMetrics.totalClicks)}
                    icon={<MousePointerClick className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend (Females)"
                    value={`$${Math.round(
                      femaleMetrics.totalSpend
                    ).toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Revenue (Females)"
                    value={`$${Math.round(
                      femaleMetrics.totalRevenue
                    ).toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className="text-green-400"
                  />
                </div>
              </div>

              {/* Age Group Performance Charts */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Performance by Age Group (Estimated)
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {/* Total Spend by Age Group */}
                  <BarChart
                    title="Total Spend by Age Group"
                    data={spendByAgeChartData}
                    formatValue={(value) =>
                      `$${Math.round(value).toLocaleString()}`
                    }
                  />

                  {/* Total Revenue by Age Group */}
                  <BarChart
                    title="Total Revenue by Age Group"
                    data={revenueByAgeChartData}
                    formatValue={(value) =>
                      `$${Math.round(value).toLocaleString()}`
                    }
                  />
                </div>
              </div>

              {/* Campaign Performance Tables */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Detailed Demographic Performance
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {/* Male Age Group Performance Table */}
                  <Table
                    title="Male Performance by Age Group"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      {
                        key: "age_group",
                        header: "Age Group",
                        width: "25%",
                        sortable: true,
                        sortType: "string",
                      },
                      {
                        key: "impressions",
                        header: "Impressions",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "clicks",
                        header: "Clicks",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "conversions",
                        header: "Conversions",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "ctr",
                        header: "CTR",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                        render: (value) => (
                          <span className="text-blue-400">
                            {value.toFixed(2)}%
                          </span>
                        ),
                      },
                      {
                        key: "conversion_rate",
                        header: "Conv. Rate",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                        render: (value) => (
                          <span className="text-green-400">
                            {value.toFixed(2)}%
                          </span>
                        ),
                      },
                    ]}
                    defaultSort={{ key: "revenue", direction: "desc" }}
                    data={maleTableData}
                    emptyMessage="No male demographic data available"
                  />

                  {/* Female Age Group Performance Table */}
                  <Table
                    title="Female Performance by Age Group"
                    showIndex={true}
                    maxHeight="400px"
                    columns={[
                      {
                        key: "age_group",
                        header: "Age Group",
                        width: "25%",
                        sortable: true,
                        sortType: "string",
                      },
                      {
                        key: "impressions",
                        header: "Impressions",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "clicks",
                        header: "Clicks",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "conversions",
                        header: "Conversions",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                      },
                      {
                        key: "ctr",
                        header: "CTR",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                        render: (value) => (
                          <span className="text-blue-400">
                            {value.toFixed(2)}%
                          </span>
                        ),
                      },
                      {
                        key: "conversion_rate",
                        header: "Conv. Rate",
                        width: "15%",
                        align: "right",
                        sortable: true,
                        sortType: "number",
                        render: (value) => (
                          <span className="text-green-400">
                            {value.toFixed(2)}%
                          </span>
                        ),
                      },
                    ]}
                    defaultSort={{ key: "revenue", direction: "desc" }}
                    data={femaleTableData}
                    emptyMessage="No female demographic data available"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
