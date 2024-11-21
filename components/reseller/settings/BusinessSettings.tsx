'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface BusinessSettingsProps {
  store: any;
  onUpdate: (settings: any) => Promise<void>;
}

export function BusinessSettings({ store, onUpdate }: BusinessSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description,
    businessAddress: store.businessAddress || {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate({
        name: formData.name,
        description: formData.description,
        businessAddress: formData.businessAddress
      });

      toast({
        title: 'Success',
        description: 'Business settings updated successfully',
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
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({
                ...formData,
                name: e.target.value
              })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({
                ...formData,
                description: e.target.value
              })}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.businessAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  businessAddress: {
                    ...formData.businessAddress,
                    street: e.target.value
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.businessAddress.city}
                onChange={(e) => setFormData({
                  ...formData,
                  businessAddress: {
                    ...formData.businessAddress,
                    city: e.target.value
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.businessAddress.state}
                onChange={(e) => setFormData({
                  ...formData,
                  businessAddress: {
                    ...formData.businessAddress,
                    state: e.target.value
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.businessAddress.country}
                onChange={(e) => setFormData({
                  ...formData,
                  businessAddress: {
                    ...formData.businessAddress,
                    country: e.target.value
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.businessAddress.postalCode}
                onChange={(e) => setFormData({
                  ...formData,
                  businessAddress: {
                    ...formData.businessAddress,
                    postalCode: e.target.value
                  }
                })}
              />
            </div>
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