import React from "react";
import {
  TrendingUp, TrendingDown, Users, DollarSign, ShoppingBag,
  Activity, Calendar, Download, MoreHorizontal, ArrowUpRight
} from "lucide-react";

/**
 * 1. PROFESSIONAL STAT CARD
 * clean, uses subtle borders instead of heavy backgrounds, includes trend indicators.
 */
const StatCard = ({ title, value, trend, trendLabel, icon: Icon, isPositive }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span
        className={`flex items-center text-sm font-medium ${
          isPositive ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
        {trend}
      </span>
      <span className="text-sm text-gray-400">{trendLabel}</span>
    </div>
  </div>
);

/**
 * 2. DATA TABLE COMPONENT
 * Essential for any admin panel. Shows real interaction capability.
 */
const RecentOrdersTable = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
      <button className="text-sm font-medium text-[#FF5722] hover:underline">View All</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
          <tr>
            <th className="px-6 py-3">Order ID</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[1, 2, 3, 4].map((item) => (
            <tr key={item} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">#ORD-00{item}</td>
              <td className="flex items-center gap-3 px-6 py-4">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <span>John Doe</span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4">$120.50</td>
              <td className="px-6 py-4 text-right">Jan 23, 2024</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * MAIN DASHBOARD STRUCTURE
 */
const DashboardHome = () => {
  return (
    <div className="space-y-8">

      {/* 1. HEADER SECTION: Context & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
          <p className="text-sm text-gray-500">Here's what's happening with your store today.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Picker Mockup */}
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Calendar size={16} />
            <span>Jan 20 - Jan 27</span>
          </button>

          {/* Primary Action */}
          <button className="flex items-center gap-2 rounded-lg bg-[#1F263E] px-4 py-2 text-sm font-medium text-white hover:bg-[#151A2D]">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* 2. KEY METRICS GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          trend="+20.1%"
          trendLabel="vs last month"
          icon={DollarSign}
          isPositive={true}
        />
        <StatCard
          title="Active Subscribers"
          value="2,350"
          trend="+180.1%"
          trendLabel="vs last month"
          icon={Users}
          isPositive={true}
        />
        <StatCard
          title="Sales"
          value="12,234"
          trend="+19%"
          trendLabel="vs last month"
          icon={ShoppingBag}
          isPositive={true}
        />
        <StatCard
          title="Bounce Rate"
          value="42.3%"
          trend="-4.5%"
          trendLabel="vs last month"
          icon={Activity}
          isPositive={false}
        />
      </div>

      {/* 3. CHART & ACTIVITY SPLIT (2/3 + 1/3 Layout) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Main Chart Area */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Revenue Analytics</h3>
            <button className="rounded-md p-1 hover:bg-gray-100">
              <MoreHorizontal size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Chart Placeholder (This is where Recharts/Chart.js would go) */}
          <div className="relative flex h-80 w-full items-end justify-between gap-2 overflow-hidden rounded-lg bg-gray-50 px-4 pt-4">
             {/* Mocking a Bar Chart visually */}
             {[40, 70, 45, 90, 60, 80, 50, 70, 60, 95, 50, 80].map((h, i) => (
               <div
                 key={i}
                 style={{ height: `${h}%` }}
                 className="w-full rounded-t-sm bg-[#FF5722] opacity-80 transition-all hover:opacity-100"
               ></div>
             ))}
          </div>
        </div>

        {/* Side Panel: Top Products / Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">Top Products</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <ShoppingBag size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Nike Air Max</h4>
                  <p className="text-xs text-gray-500">shoes & fashion</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">$450</p>
                  <p className="text-xs text-green-600">+12%</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            View All Products <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 4. DETAILED TABLE SECTION */}
      <RecentOrdersTable />

    </div>
  );
};

export default DashboardHome;
