'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Zap, Star, ShoppingCart } from 'lucide-react';

interface ProductPreviewProps {
  product: any;
  layout: {
    fieldOrder: string[];
    showDescription: boolean;
    showGuide: boolean;
    showRegion: boolean;
    showImportantNote: boolean;
  };
  customContent: {
    customDescription?: string;
    customGuide?: string;
    customImportantNote?: string;
  };
  markup: number;
}

export function ProductPreview({ product, layout, customContent, markup }: ProductPreviewProps) {
  const renderField = (field: string) => {
    switch (field) {
      case 'title':
        return (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            {product.region && layout.showRegion && (
              <p className="text-muted-foreground">{product.region}</p>
            )}
          </div>
        );

      case 'description':
        return layout.showDescription && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">
              {customContent.customDescription || product.description}
            </p>
          </div>
        );

      case 'variants':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Package</h2>
            <div className="space-y-2">
              {product.subProducts.map((variant: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{variant.name}</p>
                    {variant.stockQuantity !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {variant.stockQuantity} in stock
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(variant.price * (1 + markup/100), 'USD')}
                    </p>
                    {variant.originalPrice > variant.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatCurrency(variant.originalPrice, 'USD')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'guide':
        return layout.showGuide && customContent.customGuide && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">How to Use</h2>
            <div className="prose dark:prose-invert max-w-none">
              {customContent.customGuide}
            </div>
          </div>
        );

      case 'importantNote':
        return layout.showImportantNote && customContent.customImportantNote && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-medium mb-2">Important Note</h3>
            <p className="text-sm">{customContent.customImportantNote}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="relative">
          <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {product.instantDelivery && (
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              )}
              {product.popularity === 'FEATURED' && (
                <Badge className="bg-yellow-500">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {layout.fieldOrder.map((field) => (
              <div key={field}>{renderField(field)}</div>
            ))}

            <Button className="w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}