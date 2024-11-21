'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/components/reseller/settings/NotificationSettings';
import { BusinessSettings } from '@/components/reseller/settings/BusinessSettings';
import { SecuritySettings } from '@/components/reseller/settings/SecuritySettings';
import { OrderSettings } from '@/components/reseller/settings/OrderSettings';
import { PaymentSettings } from '@/components/reseller/settings/PaymentSettings';
import { useResellerStore } from '@/hooks/use-reseller-store';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { store, loading, error, updateSettings } = useResellerStore();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load store settings</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and preferences
          </p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <BusinessSettings store={store} onUpdate={updateSettings} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderSettings store={store} onUpdate={updateSettings} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettings store={store} onUpdate={updateSettings} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings store={store} onUpdate={updateSettings} />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}