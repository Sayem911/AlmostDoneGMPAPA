'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseResellerStoreReturn {
  store: any;
  loading: boolean;
  error: string | null;
  updateStore: (data: any) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  updateTheme: (theme: any) => Promise<void>;
}

export function useResellerStore(): UseResellerStoreReturn {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await fetch('/api/reseller/store');
      if (!response.ok) throw new Error('Failed to fetch store');
      const data = await response.json();
      setStore(data);
    } catch (error) {
      console.error('Failed to fetch store:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch store');
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (data: any) => {
    try {
      const response = await fetch('/api/reseller/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update store');
      }

      const updatedStore = await response.json();
      setStore(updatedStore);

      toast({
        title: 'Success',
        description: 'Store updated successfully',
      });
    } catch (error) {
      console.error('Failed to update store:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update store',
        variant: 'destructive',
      });
    }
  };

  const updateSettings = async (settings: any) => {
    try {
      const response = await fetch('/api/reseller/store/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update settings');
      }

      const updatedStore = await response.json();
      setStore(updatedStore);

      toast({
        title: 'Success',
        description: 'Store settings updated successfully',
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  const updateTheme = async (theme: any) => {
    try {
      const response = await fetch('/api/reseller/store/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update theme');
      }

      const updatedStore = await response.json();
      setStore(updatedStore);

      toast({
        title: 'Success',
        description: 'Store theme updated successfully',
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update theme',
        variant: 'destructive',
      });
    }
  };

  return {
    store,
    loading,
    error,
    updateStore,
    updateSettings,
    updateTheme,
  };
}