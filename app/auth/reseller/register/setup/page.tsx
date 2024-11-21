'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Store, Globe, Settings } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

export default function StoreSetup() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domainType: 'subdomain', // 'subdomain' or 'custom'
    customDomain: '',
    subdomainPrefix: '',
    settings: {
      defaultMarkup: 20,
      minimumMarkup: 10,
      maximumMarkup: 50,
      autoFulfillment: true,
      lowBalanceAlert: 100
    }
  });

  const steps = [
    { id: 'basic', title: 'Store Info', icon: Store },
    { id: 'domain', title: 'Domain Setup', icon: Globe },
    { id: 'settings', title: 'Settings', icon: Settings }
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Basic Info
        return formData.name.length >= 3;
      case 1: // Domain Setup
        if (formData.domainType === 'subdomain') {
          return formData.subdomainPrefix.length >= 3;
        } else {
          return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(formData.customDomain);
        }
      case 2: // Settings
        return (
          formData.settings.defaultMarkup >= formData.settings.minimumMarkup &&
          formData.settings.defaultMarkup <= formData.settings.maximumMarkup
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reseller/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          domain: formData.domainType === 'custom' ? formData.customDomain : `${formData.subdomainPrefix}.gmpapa.com`,
          isDomainCustom: formData.domainType === 'custom',
          settings: formData.settings
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create store');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: data.isDomainCustom 
          ? 'Store created! Please configure your domain DNS settings.'
          : 'Store created successfully! Your subdomain is ready.',
      });

      router.push(data.isDomainCustom ? '/reseller/store/domain' : '/reseller');
      router.refresh();
    } catch (error) {
      console.error('Store setup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-4xl p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Set Up Your Store</h1>
            <p className="text-muted-foreground mt-2">
              Configure your store settings and domain
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-4">
            <Progress value={((currentStep + 1) / steps.length) * 100} />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    index <= currentStep ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Gaming Store"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell customers about your store..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <RadioGroup
                  value={formData.domainType}
                  onValueChange={(value) => setFormData({ ...formData, domainType: value })}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subdomain" id="subdomain" />
                    <Label htmlFor="subdomain">Use a Subdomain (Free)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Use My Own Domain</Label>
                  </div>
                </RadioGroup>

                {formData.domainType === 'subdomain' ? (
                  <div className="space-y-2">
                    <Label>Your Store URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="mystore"
                        value={formData.subdomainPrefix}
                        onChange={(e) => setFormData({
                          ...formData,
                          subdomainPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        })}
                        className="flex-1"
                      />
                      <span className="flex items-center text-muted-foreground">.gmpapa.com</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose a unique prefix for your store's URL
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Your Domain</Label>
                    <Input
                      placeholder="store.example.com"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value.toLowerCase() })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your domain without http:// or https://
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                    <Input
                      id="defaultMarkup"
                      type="number"
                      min={formData.settings.minimumMarkup}
                      max={formData.settings.maximumMarkup}
                      step="0.1"
                      value={formData.settings.defaultMarkup}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          defaultMarkup: parseFloat(e.target.value)
                        }
                      })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowBalanceAlert">Low Balance Alert ($)</Label>
                    <Input
                      id="lowBalanceAlert"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.settings.lowBalanceAlert}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          lowBalanceAlert: parseFloat(e.target.value)
                        }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep) || loading}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-primary"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}