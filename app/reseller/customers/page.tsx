'use client';

import { CustomerList } from '@/components/reseller/customers/CustomerList';

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage and track your customer base
        </p>
      </div>

      <CustomerList />
    </div>
  );
}