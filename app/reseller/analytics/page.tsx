'use client';

import { useState, useEffect } from 'react';
import { AnalyticsOverview } from '@/components/reseller/analytics/AnalyticsOverview';
import { TopProducts } from '@/components/reseller/analytics/TopProducts';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/reseller/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your store's performance and growth
        </p>
      </div>

      <AnalyticsOverview data={data} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <TopProducts products={data.topProducts} />
      </div>
    </div>
  );
}