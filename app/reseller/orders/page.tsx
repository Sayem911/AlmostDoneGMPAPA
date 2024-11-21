'use client';

import { OrderList } from '@/components/reseller/orders/OrderList';

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage and process your customer orders
        </p>
      </div>

      <OrderList />
    </div>
  );
}