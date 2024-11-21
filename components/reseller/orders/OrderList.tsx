'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { OrderFilters } from './OrderFilters';
import { OrderActions } from './OrderActions';
import { ProcessOrderDialog } from './ProcessOrderDialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchWalletBalance();
  }, [status]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);

      const response = await fetch(`/api/reseller/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/reseller/wallet');
      if (!response.ok) throw new Error('Failed to fetch wallet balance');
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAllOrders = () => {
    setSelectedOrders(prev => 
      prev.length === orders.length
        ? []
        : orders.map(order => order._id)
    );
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = orders
    .filter(order => selectedOrders.includes(order._id))
    .reduce((sum, order) => sum + order.cost, 0);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <Card className="h-fit p-6">
        <OrderFilters
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />
      </Card>

      <div className="space-y-4">
        {selectedOrders.length > 0 && (
          <OrderActions
            selectedOrders={selectedOrders}
            totalCost={totalCost}
            walletBalance={walletBalance}
            onSuccess={() => {
              fetchOrders();
              fetchWalletBalance();
              setSelectedOrders([]);
            }}
          />
        )}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={toggleAllOrders}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order._id)}
                      onCheckedChange={() => toggleOrderSelection(order._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.product?.title || 'Product Unavailable'}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total, 'USD')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'completed'
                          ? 'default'
                          : order.status === 'processing'
                          ? 'secondary'
                          : 'warning'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending' && (
                      <ProcessOrderDialog
                        order={order}
                        walletBalance={walletBalance}
                        onSuccess={() => {
                          fetchOrders();
                          fetchWalletBalance();
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}