'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Package } from 'lucide-react';

interface TopProduct {
  title: string;
  totalSales: number;
  revenue: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.totalSales} units sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatCurrency(product.revenue, 'USD')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}