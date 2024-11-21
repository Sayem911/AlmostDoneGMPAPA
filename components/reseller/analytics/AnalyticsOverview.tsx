'use client';

import { StatsCard } from '../dashboard/StatsCard';
import { RevenueChart } from '../dashboard/RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

interface AnalyticsOverviewProps {
  data: {
    overview: {
      currentMonth: {
        revenue: number;
        profit: number;
        orders: number;
        customers: number;
      };
      growth: {
        revenue: number;
        profit: number;
        orders: number;
        customers: number;
      };
    };
    chartData: Array<{
      date: string;
      revenue: number;
      profit: number;
      orders: number;
      customers: number;
    }>;
  };
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={data.overview.currentMonth.revenue}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: data.overview.growth.revenue,
            label: "from last month"
          }}
        />
        <StatsCard
          title="Total Profit"
          value={data.overview.currentMonth.profit}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: data.overview.growth.profit,
            label: "from last month"
          }}
        />
        <StatsCard
          title="Total Orders"
          value={data.overview.currentMonth.orders}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: data.overview.growth.orders,
            label: "from last month"
          }}
        />
        <StatsCard
          title="Total Customers"
          value={data.overview.currentMonth.customers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: data.overview.growth.customers,
            label: "from last month"
          }}
        />
      </div>

      <RevenueChart data={data.chartData} />
    </div>
  );
}