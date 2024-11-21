'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Palette, Layout, Image as ImageIcon } from 'lucide-react';

interface StoreAppearanceProps {
  store: any;
  onUpdate: (theme: any) => Promise<void>;
}

export function StoreAppearance({ store, onUpdate }: StoreAppearanceProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [theme, setTheme] = useState({
    primaryColor: store.theme.primaryColor,
    accentColor: store.theme.accentColor,
    backgroundColor: store.theme.backgroundColor,
    logo: store.logo || '',
    banner: store.banner || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onUpdate(theme);
      toast({
        title: 'Success',
        description: 'Store appearance updated successfully',
      });
    } catch (error) {
      console.error('Failed to update appearance:', error);
      setError(error instanceof Error ? error.message : 'Failed to update appearance');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload this to your storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setTheme(prev => ({
          ...prev,
          [type]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
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

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="branding">
            <ImageIcon className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        primaryColor: e.target.value
                      })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        primaryColor: e.target.value
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        accentColor: e.target.value
                      })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        accentColor: e.target.value
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        backgroundColor: e.target.value
                      })}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={theme.backgroundColor}
                      onChange={(e) => setTheme({
                        ...theme,
                        backgroundColor: e.target.value
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div 
                  className="p-6 rounded-lg border"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  <div className="space-y-4">
                    <Button
                      style={{ 
                        backgroundColor: theme.primaryColor,
                        color: '#ffffff'
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{ 
                        borderColor: theme.accentColor,
                        color: theme.accentColor
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Store Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Store Logo</Label>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      {theme.logo && (
                        <div className="relative w-20 h-20">
                          <img
                            src={theme.logo}
                            alt="Store logo"
                            className="object-contain rounded-lg border"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended size: 200x200px. Max file size: 2MB
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Store Banner</Label>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      {theme.banner && (
                        <div className="relative w-full h-32">
                          <img
                            src={theme.banner}
                            alt="Store banner"
                            className="object-cover rounded-lg border w-full h-full"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended size: 1200x300px. Max file size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Layout customization options coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}