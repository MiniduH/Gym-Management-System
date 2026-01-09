'use client';

import { Badge } from '@/components/ui/badge';
import type { AppointmentStatus } from '../../types/appointment';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}> = {
  scheduled: {
    label: 'Scheduled',
    variant: 'info',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'success',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
  },
  no_show: {
    label: 'No Show',
    variant: 'warning',
  },
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
