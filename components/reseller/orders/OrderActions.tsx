'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderActionsProps {
  selectedOrders: string[];
  totalCost: number;
  walletBalance: number;
  onSuccess: () => void;
}

export function OrderActions({
  selectedOrders,
  totalCost,
  walletBalance,
  onSuccess
}: OrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleBulkProcess = async () => {
    if (walletBalance < totalCost) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reseller/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: 'process'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process orders');
      }

      toast({
        title: 'Success',
        description: 'Orders processed successfully',
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to process orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to process orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">Selected Orders: {selectedOrders.length}</p>
          <p className="text-sm text-muted-foreground">
            Total Cost: {formatCurrency(totalCost, 'USD')}
          </p>
        </div>
        <Button
          onClick={handleBulkProcess}
          disabled={loading || selectedOrders.length === 0}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Selected Orders
        </Button>
      </div>
    </div>
  );
}