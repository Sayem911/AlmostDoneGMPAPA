'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CreditCard, Eye, EyeOff } from 'lucide-react';

interface PaymentSettingsProps {
  store: any;
  onUpdate: (settings: any) => Promise<void>;
}

export function PaymentSettings({ store, onUpdate }: PaymentSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState({
    bkashUsername: store.settings?.bkash?.username || '',
    bkashPassword: store.settings?.bkash?.password || '',
    bkashAppKey: store.settings?.bkash?.appKey || '',
    bkashAppSecret: store.settings?.bkash?.appSecret || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate({
        bkash: {
          username: formData.bkashUsername,
          password: formData.bkashPassword,
          appKey: formData.bkashAppKey,
          appSecret: formData.bkashAppSecret,
        }
      });

      toast({
        title: 'Success',
        description: 'Payment settings updated successfully',
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
          <div className="flex items-center justify-between">
            <CardTitle>bKash Merchant Account</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Enter your bKash merchant account credentials to process payments from customers.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bkashUsername">bKash Username</Label>
              <Input
                id="bkashUsername"
                value={formData.bkashUsername}
                onChange={(e) => setFormData({
                  ...formData,
                  bkashUsername: e.target.value
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashPassword">bKash Password</Label>
              <Input
                id="bkashPassword"
                type={showSecrets ? "text" : "password"}
                value={formData.bkashPassword}
                onChange={(e) => setFormData({
                  ...formData,
                  bkashPassword: e.target.value
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashAppKey">App Key</Label>
              <Input
                id="bkashAppKey"
                type={showSecrets ? "text" : "password"}
                value={formData.bkashAppKey}
                onChange={(e) => setFormData({
                  ...formData,
                  bkashAppKey: e.target.value
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashAppSecret">App Secret</Label>
              <Input
                id="bkashAppSecret"
                type={showSecrets ? "text" : "password"}
                value={formData.bkashAppSecret}
                onChange={(e) => setFormData({
                  ...formData,
                  bkashAppSecret: e.target.value
                })}
                required
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