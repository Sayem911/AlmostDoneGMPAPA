'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ProductPreview } from './ProductPreview';
import { ProductLayoutEditor } from './ProductLayoutEditor';

interface EditProductDialogProps {
  product: any;
  onClose: () => void;
  onUpdate: (product: any) => void;
}

export function EditProductDialog({ product, onClose, onUpdate }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    markup: product?.markup || 20,
    enabled: product?.enabled ?? true,
    customDescription: product?.customDescription || product?.description || '',
    customGuide: product?.customGuide || product?.guide || '',
    customImportantNote: product?.customImportantNote || product?.importantNote || '',
    layout: product?.layout || {
      fieldOrder: ['title', 'description', 'variants', 'guide', 'importantNote'],
      showDescription: true,
      showGuide: true,
      showRegion: true,
      showImportantNote: true
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/reseller/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      toast({
        title: 'Success',
        description: `Product ${formData.enabled ? 'enabled' : 'disabled'} successfully`,
      });

      onUpdate(updatedProduct);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product Settings</DialogTitle>
          <DialogDescription>
            Customize product details and layout for your store
          </DialogDescription>
        </DialogHeader>

        {/* Product Visibility Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50 mb-6">
          <div className="space-y-0.5">
            <Label className="text-base">Product Visibility</Label>
            <p className="text-sm text-muted-foreground">
              {formData.enabled 
                ? 'This product is visible to customers' 
                : 'This product is hidden from customers'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formData.enabled ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                enabled: checked
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="pricing" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-4">
                <div className="space-y-2">
                  <Label>Markup Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.markup}
                      onChange={(e) => setFormData({
                        ...formData,
                        markup: parseFloat(e.target.value)
                      })}
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Description</Label>
                  <Textarea
                    value={formData.customDescription}
                    onChange={(e) => setFormData({
                      ...formData,
                      customDescription: e.target.value
                    })}
                    placeholder={product.description}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom Guide</Label>
                  <Textarea
                    value={formData.customGuide}
                    onChange={(e) => setFormData({
                      ...formData,
                      customGuide: e.target.value
                    })}
                    placeholder={product.guide}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom Important Note</Label>
                  <Input
                    value={formData.customImportantNote}
                    onChange={(e) => setFormData({
                      ...formData,
                      customImportantNote: e.target.value
                    })}
                    placeholder={product.importantNote}
                  />
                </div>
              </TabsContent>

              <TabsContent value="layout">
                <ProductLayoutEditor
                  product={product}
                  layout={formData.layout}
                  onLayoutChange={(newLayout) => setFormData({
                    ...formData,
                    layout: newLayout
                  })}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <ProductPreview
                product={product}
                layout={formData.layout}
                customContent={{
                  customDescription: formData.customDescription,
                  customGuide: formData.customGuide,
                  customImportantNote: formData.customImportantNote
                }}
                markup={formData.markup}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}