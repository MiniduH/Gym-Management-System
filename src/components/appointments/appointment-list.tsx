'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Scissors,
  Loader2,
  Calendar,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { useAppointmentActions } from '../../hooks/useAppointmentManagement';
import type { Appointment } from '../../types/appointment';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AppointmentList({
  appointments,
  isLoading,
  onRefresh,
}: AppointmentListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { handleConfirm, handleCancel, handleComplete, isLoading: actionLoading } =
    useAppointmentActions();

  const formatTime = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'HH:mm');
    } catch {
      return dateTimeStr;
    }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      return format(parseISO(dateTimeStr), 'MMM dd, yyyy');
    } catch {
      return dateTimeStr;
    }
  };

  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      await handleCancel(selectedAppointment.id, cancelReason);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      onRefresh?.();
    }
  };

  const onConfirm = async (appointment: Appointment) => {
    await handleConfirm(appointment.id);
    onRefresh?.();
  };

  const onComplete = async (appointment: Appointment) => {
    await handleComplete(appointment.id);
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No appointments found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          There are no appointments scheduled for this period.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatDate(appointment.start_time)}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(appointment.start_time)}
                      {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {appointment.customer
                        ? `${appointment.customer.first_name} ${appointment.customer.last_name}`
                        : `Customer #${appointment.customer_id}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {appointment.service?.name || `Service #${appointment.service_id}`}
                    </span>
                    {appointment.service?.duration_minutes && (
                      <span className="text-xs text-muted-foreground">
                        ({appointment.service.duration_minutes} min)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {appointment.staff?.name || `Staff #${appointment.staff_id}`}
                </TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={appointment.status} />
                </TableCell>
                <TableCell>
                  {appointment.price ? `$${appointment.price}` : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={actionLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {appointment.status === 'scheduled' && (
                        <DropdownMenuItem onClick={() => onConfirm(appointment)}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Confirm
                        </DropdownMenuItem>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                          <DropdownMenuItem onClick={() => onComplete(appointment)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openCancelDialog(appointment)}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                      {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                        <DropdownMenuItem disabled>
                          No actions available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
