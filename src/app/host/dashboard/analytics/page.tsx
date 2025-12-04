"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hostDashboardApi } from "@/lib/api/host-dashboard-api";
import type { HostDashboard } from "@/types/host-dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Home,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<HostDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await hostDashboardApi.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214B3F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { revenueStats, bookingStats, homestayStats } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Track your business performance</p>
            </div>
            <Link
              href="/host/dashboard"
              className="text-sm text-[#214B3F] hover:underline flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-[#214B3F] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`${revenueStats.currency} ${revenueStats.totalRevenue.toLocaleString()}`}
            change={revenueStats.growthPercentage}
            icon={<DollarSign className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="This Month"
            value={`${revenueStats.currency} ${revenueStats.revenueThisMonth.toLocaleString()}`}
            subtitle={`Last: ${revenueStats.revenueLastMonth.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Total Bookings"
            value={bookingStats.totalBookings.toString()}
            subtitle={`${bookingStats.bookingsThisMonth} this month`}
            icon={<Calendar className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Avg Booking Value"
            value={`${revenueStats.currency} ${revenueStats.averageBookingValue.toFixed(0)}`}
            icon={<Users className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(revenueStats.revenueThisMonth / Math.max(revenueStats.revenueThisMonth, revenueStats.revenueLastMonth)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {revenueStats.currency} {revenueStats.revenueThisMonth.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Month</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(revenueStats.revenueLastMonth / Math.max(revenueStats.revenueThisMonth, revenueStats.revenueLastMonth)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {revenueStats.currency} {revenueStats.revenueLastMonth.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Growth</span>
                  <div className="flex items-center gap-2">
                    {revenueStats.growthPercentage >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        revenueStats.growthPercentage >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(revenueStats.growthPercentage).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-4">
              <StatusBar
                label="Confirmed"
                value={bookingStats.confirmedBookings}
                total={bookingStats.totalBookings}
                color="bg-green-500"
              />
              <StatusBar
                label="Pending"
                value={bookingStats.pendingBookings}
                total={bookingStats.totalBookings}
                color="bg-yellow-500"
              />
              <StatusBar
                label="Cancelled"
                value={bookingStats.cancelledBookings}
                total={bookingStats.totalBookings}
                color="bg-red-500"
              />
            </div>
          </div>
        </div>

        {/* Property Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {homestayStats.map((homestay) => (
                  <tr key={homestay.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{homestay.name}</div>
                      <div className="text-sm text-gray-500">{homestay.totalRooms} rooms</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{homestay.totalBookings}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {revenueStats.currency} {homestay.totalRevenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#214B3F] h-2 rounded-full"
                            style={{ width: `${Math.min(100, homestay.occupancyRate)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {homestay.occupancyRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {homestay.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{homestay.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({homestay.reviews})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No reviews</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "green" | "blue" | "purple" | "orange";
}

function MetricCard({ title, value, change, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function StatusBar({ label, value, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
