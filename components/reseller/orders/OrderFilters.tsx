'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface OrderFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function OrderFilters({
  status,
  onStatusChange,
  search,
  onSearchChange
}: OrderFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">Order Status</Label>
        <RadioGroup
          value={status}
          onValueChange={onStatusChange}
          className="mt-2 space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm">All Orders</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending" className="text-sm">Pending</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="processing" id="processing" />
            <Label htmlFor="processing" className="text-sm">Processing</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="completed" id="completed" />
            <Label htmlFor="completed" className="text-sm">Completed</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Search Orders</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}