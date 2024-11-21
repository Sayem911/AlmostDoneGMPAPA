'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Globe, ExternalLink, Copy, CheckCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomDomainManagerProps {
  store: any;
  onUpdate: () => void;
}

export function CustomDomainManager({ store, onUpdate }: CustomDomainManagerProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toast } = useToast();
  const [domain, setDomain] = useState(store.domainSettings?.customDomain || '');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/reseller/store/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: domain.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update domain');
      }

      const { store: updatedStore, dnsVerification } = await response.json();

      if (dnsVerification?.errors) {
        setSuccess('Domain added successfully! Please configure your DNS records to complete setup.');
        toast({
          title: 'DNS Configuration Required',
          description: 'Please configure your DNS records and verify again.',
        });
      } else if (dnsVerification?.verified) {
        setSuccess('Domain added and verified successfully! Your store is now accessible via your custom domain.');
        toast({
          title: 'Success',
          description: 'Domain configured and verified successfully',
        });
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to update domain:', error);
      setError(error instanceof Error ? error.message : 'Failed to update domain');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update domain',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async () => {
    setVerifying(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/reseller/store/domain/verify', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to verify domain');
      }

      const data = await response.json();

      if (data.verified) {
        setSuccess('Domain verified successfully! Your store is now accessible via your custom domain.');
        toast({
          title: 'Success',
          description: 'Domain verified successfully',
        });
        onUpdate();
      } else {
        setError(data.errors?.[0] || 'Failed to verify domain');
        toast({
          title: 'Verification Failed',
          description: data.errors?.[0] || 'Failed to verify domain',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Domain verification error:', error);
      setError('Failed to verify domain');
      toast({
        title: 'Error',
        description: 'Failed to verify domain',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied',
      description: 'DNS record copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Default Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Your Store URL</p>
              <p className="text-sm text-muted-foreground">
                {store.domainSettings?.subdomain}.{process.env.NEXT_PUBLIC_STORE_DOMAIN || 'yourdomain.com'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://${store.domainSettings?.subdomain}.${process.env.NEXT_PUBLIC_STORE_DOMAIN || 'yourdomain.com'}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Domain Name</Label>
              <Input
                placeholder="store.example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter your custom domain without http:// or https://
              </p>
            </div>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Domain
            </Button>
          </form>

          {store.domainSettings?.customDomain && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Domain Status</p>
                  <p className="text-sm text-muted-foreground">
                    {store.domainSettings.customDomain}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={store.domainSettings.customDomainVerified ? 'default' : 'secondary'}
                  >
                    {store.domainSettings.customDomainVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  {!store.domainSettings.customDomainVerified && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={verifyDomain}
                      disabled={verifying}
                    >
                      {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify Now
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">DNS Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>A Record</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                        {store.domainSettings.dnsSettings?.aRecord}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(store.domainSettings.dnsSettings?.aRecord, 'a-record')}
                      >
                        {copied === 'a-record' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CNAME Record</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                        {store.domainSettings.dnsSettings?.cnameRecord}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(store.domainSettings.dnsSettings?.cnameRecord, 'cname-record')}
                      >
                        {copied === 'cname-record' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Add these DNS records to your domain provider to connect your custom domain.
                    DNS changes can take up to 48 hours to propagate.
                  </AlertDescription>
                </Alert>

                {store.domainSettings.customDomainVerified && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`https://${store.domainSettings.customDomain}`, '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Your Store
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}