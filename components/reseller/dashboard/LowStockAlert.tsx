'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import Link from 'next/link';

interface LowStockProduct {
  id: string;
  title: string;
  variant: string;
  stockQuantity: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alert</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <Alert key={`${product.id}-${product.variant}`}>
              <Package className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{product.title}</span>
                  <span className="text-muted-foreground"> - {product.variant}</span>
                  <p className="text-sm text-muted-foreground">
                    Only {product.stockQuantity} units remaining
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/reseller/products/${product.id}`}>
                    Manage Stock
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}