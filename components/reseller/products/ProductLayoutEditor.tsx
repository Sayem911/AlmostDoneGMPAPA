'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, GripVertical, Eye, EyeOff, Lock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductLayoutEditorProps {
  product: any;
  layout: any;
  onLayoutChange: (layout: any) => void;
}

export function ProductLayoutEditor({ product, layout, onLayoutChange }: ProductLayoutEditorProps) {
  const fieldLabels: Record<string, string> = {
    title: 'Product Title',
    description: 'Description',
    variants: 'Product Variants & Pricing',
    guide: 'Usage Guide',
    importantNote: 'Important Note'
  };

  // Define which fields are locked (cannot be hidden)
  const lockedFields = ['title', 'variants'];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Create a new order array
    const newFieldOrder = Array.from(layout.fieldOrder);
    const [removed] = newFieldOrder.splice(sourceIndex, 1);
    newFieldOrder.splice(destinationIndex, 0, removed);

    onLayoutChange({
      ...layout,
      fieldOrder: newFieldOrder
    });
  };

  const toggleFieldVisibility = (field: string) => {
    if (lockedFields.includes(field)) return; // Prevent toggling locked fields

    onLayoutChange({
      ...layout,
      [`show${field.charAt(0).toUpperCase() + field.slice(1)}`]: 
        !layout[`show${field.charAt(0).toUpperCase() + field.slice(1)}`]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Layout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="layout">
          <TabsList>
            <TabsTrigger value="layout">Layout Order</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Field Order</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop to reorder sections on your product page
              </p>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {layout.fieldOrder.map((field: string, index: number) => (
                        <Draggable 
                          key={field} 
                          draggableId={field} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                snapshot.isDragging ? 'bg-accent border-primary' : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>{fieldLabels[field]}</span>
                                  {lockedFields.includes(field) && (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              {!lockedFields.includes(field) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFieldVisibility(field)}
                                >
                                  {layout[`show${field.charAt(0).toUpperCase() + field.slice(1)}`] ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4">
            <div className="space-y-4">
              {layout.fieldOrder.map((field: string) => {
                if (lockedFields.includes(field)) {
                  return (
                    <div
                      key={field}
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                    >
                      <div>
                        <Label className="text-base">{fieldLabels[field]}</Label>
                        <p className="text-sm text-muted-foreground">
                          This section cannot be hidden
                        </p>
                      </div>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                }
                
                return (
                  <div
                    key={field}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <Label className="text-base">{fieldLabels[field]}</Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide this section on the product page
                      </p>
                    </div>
                    <Switch
                      checked={layout[`show${field.charAt(0).toUpperCase() + field.slice(1)}`]}
                      onCheckedChange={() => toggleFieldVisibility(field)}
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}