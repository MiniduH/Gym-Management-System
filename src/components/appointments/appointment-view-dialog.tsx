'use client';

import { format, parseISO } from 'date-fns';
import {
  Clock,
  User,
  Scissors,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { useAppointmentActions } from '../../hooks/useAppointmentManagement';
import type { Appointment } from '../../types/appointment';

interface AppointmentViewDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function AppointmentViewDialog({
  appointment,
  open,
  onOpenChange,
  onRefresh,
}: AppointmentViewDialogProps) {
  const { handleConfirm, handleCancel, handleComplete, isLoading } =
    useAppointmentActions();

  if (!appointment) return null;

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'EEEE, MMMM d, yyyy \'at\' h:mm a');
    } catch {
      return dateTimeStr;
    }
  };

  const formatTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'h:mm a');
    } catch {
      return dateTimeStr;
    }
  };

  const onConfirmClick = async () => {
    await handleConfirm(appointment.id);
    onRefresh?.();
    onOpenChange(false);
  };

  const onCompleteClick = async () => {
    await handleComplete(appointment.id);
    onRefresh?.();
    onOpenChange(false);
  };

  const onCancelClick = async () => {
    await handleCancel(appointment.id);
    onRefresh?.();
    onOpenChange(false);
  };

  const canConfirm = appointment.status === 'scheduled';
  const canComplete = appointment.status === 'scheduled' || appointment.status === 'confirmed';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            <AppointmentStatusBadge status={appointment.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(appointment.start_time)}
              </p>
              {appointment.end_time && (
                <p className="text-sm text-muted-foreground">
                  Ends at {formatTime(appointment.end_time)}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Customer</p>
              {appointment.customer ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {appointment.customer.first_name} {appointment.customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.customer.email}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Customer #{appointment.customer_id}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Service */}
          <div className="flex items-start gap-3">
            <Scissors className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Service</p>
              {appointment.service ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {appointment.service.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {appointment.service.duration_minutes} minutes
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Service #{appointment.service_id}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Staff */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Staff Member</p>
              <p className="text-sm text-muted-foreground">
                {appointment.staff?.name || `Staff #${appointment.staff_id}`}
              </p>
            </div>
          </div>

          {/* Price */}
          {appointment.price && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">
                    ${appointment.price}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.notes}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>Created: {formatDateTime(appointment.created_at)}</p>
              <p>Updated: {formatDateTime(appointment.updated_at)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canConfirm && (
            <Button
              onClick={onConfirmClick}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirm
            </Button>
          )}
          {canComplete && (
            <Button onClick={onCompleteClick} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark Complete
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              onClick={onCancelClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Cancel
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
