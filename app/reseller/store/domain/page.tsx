'use client';

import { CustomDomainManager } from '@/components/reseller/store/CustomDomainManager';
import { useResellerStore } from '@/hooks/use-reseller-store';
import { Loader2 } from 'lucide-react';

export default function StoreDomainPage() {
  const { store, loading, error, updateStore } = useResellerStore();

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Domain Settings</h1>
        <p className="text-muted-foreground">
          Manage your store's domain and DNS settings
        </p>
      </div>

      <CustomDomainManager store={store} onUpdate={updateStore} />
    </div>
  );
}