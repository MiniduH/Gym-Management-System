'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotGridProps {
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  disabled,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading available slots...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No available time slots for this date.</p>
        <p className="text-xs mt-1">Please try selecting a different date.</p>
      </div>
    );
  }

  // Group slots by hour for better organization
  const groupedSlots = slots.reduce((acc, slot) => {
    const hour = slot.split(':')[0];
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(slot);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
        <div key={hour}>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {parseInt(hour) < 12 ? `${hour}:00 AM` : hour === '12' ? '12:00 PM' : `${parseInt(hour) - 12}:00 PM`}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {hourSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectSlot(slot)}
                disabled={disabled}
                className={cn(
                  'p-2 text-sm rounded-lg border-2 font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  selectedSlot === slot
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50 hover:bg-accent',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface TimeSlotSelectProps {
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function TimeSlotSelect({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  placeholder = 'Select a time slot',
}: TimeSlotSelectProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading slots...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
        No slots available
      </div>
    );
  }

  return (
    <select
      value={selectedSlot}
      onChange={(e) => onSelectSlot(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {slots.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))}
    </select>
  );
}
