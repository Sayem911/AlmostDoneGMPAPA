'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Bell, Mail, Package, AlertTriangle } from 'lucide-react';

interface NotificationSettingsProps {
  store: any;
  onUpdate: (settings: any) => Promise<void>;
}

export function NotificationSettings({ store, onUpdate }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: store.settings.notifications.email,
    orderUpdates: store.settings.notifications.orderUpdates,
    lowStock: store.settings.notifications.lowStock,
    promotions: store.settings.notifications.promotions
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate({
        notifications
      });

      toast({
        title: 'Success',
        description: 'Notification settings updated successfully',
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
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label>Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                email: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <Label>Order Updates</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified about new orders and status changes
              </p>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                orderUpdates: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <Label>Low Stock Alerts</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive alerts when product stock is running low
              </p>
            </div>
            <Switch
              checked={notifications.lowStock}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                lowStock: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label>Promotional Updates</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified about new features and promotions
              </p>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                promotions: checked
              })}
            />
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