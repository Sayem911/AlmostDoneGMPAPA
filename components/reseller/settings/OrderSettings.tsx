'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface OrderSettingsProps {
  store: any;
  onUpdate: (settings: any) => Promise<void>;
}

export function OrderSettings({ store, onUpdate }: OrderSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    defaultMarkup: store.settings.defaultMarkup,
    minimumMarkup: store.settings.minimumMarkup,
    maximumMarkup: store.settings.maximumMarkup,
    autoFulfillment: store.settings.autoFulfillment,
    lowBalanceAlert: store.settings.lowBalanceAlert
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate(formData);

      toast({
        title: 'Success',
        description: 'Order settings updated successfully',
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pricing Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
              <Input
                id="defaultMarkup"
                type="number"
                min="0"
                step="0.1"
                value={formData.defaultMarkup}
                onChange={(e) => setFormData({
                  ...formData,
                  defaultMarkup: parseFloat(e.target.value)
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumMarkup">Minimum Markup (%)</Label>
              <Input
                id="minimumMarkup"
                type="number"
                min="0"
                step="0.1"
                value={formData.minimumMarkup}
                onChange={(e) => setFormData({
                  ...formData,
                  minimumMarkup: parseFloat(e.target.value)
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumMarkup">Maximum Markup (%)</Label>
              <Input
                id="maximumMarkup"
                type="number"
                min="0"
                step="0.1"
                value={formData.maximumMarkup}
                onChange={(e) => setFormData({
                  ...formData,
                  maximumMarkup: parseFloat(e.target.value)
                })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Order Fulfillment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically process orders when payment is received
              </p>
            </div>
            <Switch
              checked={formData.autoFulfillment}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                autoFulfillment: checked
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowBalanceAlert">Low Balance Alert ($)</Label>
            <Input
              id="lowBalanceAlert"
              type="number"
              min="0"
              step="0.01"
              value={formData.lowBalanceAlert}
              onChange={(e) => setFormData({
                ...formData,
                lowBalanceAlert: parseFloat(e.target.value)
              })}
              required
            />
            <p className="text-sm text-muted-foreground">
              Get notified when your balance falls below this amount
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}