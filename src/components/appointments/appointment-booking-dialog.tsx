'use client';

import { useState, useEffect } from 'react';
import { Loader2, Clock, User, Scissors } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetStaffQuery,
  useGetServicesQuery,
  useGetCustomersQuery,
  useCreateAppointmentMutation,
} from '../../store/services/appointmentApi';
import { useGetAvailableSlotsQuery } from '../../store/services/appointmentSlotsApi';
import { toast } from 'sonner';
import type { Staff, Service, Customer } from '../../types/appointment';

interface AppointmentBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  onSuccess?: () => void;
}

export function AppointmentBookingDialog({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: AppointmentBookingDialogProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    staffId: '',
    serviceId: '',
    appointmentDate: defaultDate || new Date().toISOString().split('T')[0],
    startTime: '',
    notes: '',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        customerId: '',
        staffId: '',
        serviceId: '',
        appointmentDate: defaultDate || new Date().toISOString().split('T')[0],
        startTime: '',
        notes: '',
      });
    }
  }, [open, defaultDate]);

  // Fetch data
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery();
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery();

  // Fetch available slots when all dependencies are selected
  const {
    data: slotsData,
    isLoading: slotsLoading,
    isFetching: slotsFetching,
  } = useGetAvailableSlotsQuery(
    {
      staffId: parseInt(formData.staffId),
      serviceId: parseInt(formData.serviceId),
      date: formData.appointmentDate,
    },
    {
      skip: !formData.staffId || !formData.serviceId || !formData.appointmentDate,
    }
  );

  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();

  const staff = staffData?.data || [];
  const services = servicesData?.data || [];
  const customers = customersData?.data || [];
  const availableSlots = slotsData?.data?.slots || [];

  // Reset time when dependencies change
  const handleStaffChange = (value: string) => {
    setFormData(prev => ({ ...prev, staffId: value, startTime: '' }));
  };

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceId: value, startTime: '' }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, appointmentDate: e.target.value, startTime: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.staffId || !formData.serviceId || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Combine date + time into ISO format
      const startDateTime = `${formData.appointmentDate}T${formData.startTime}:00`;

      await createAppointment({
        customerId: parseInt(formData.customerId),
        staffId: parseInt(formData.staffId),
        serviceId: parseInt(formData.serviceId),
        startTime: startDateTime,
        notes: formData.notes || undefined,
      }).unwrap();

      toast.success('Appointment booked successfully!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { data?: { code?: string; message?: string } };
      if (err.data?.code === 'BOOKING_CONFLICT') {
        toast.error('This time slot is no longer available. Please select another time.');
      } else {
        toast.error(err.data?.message || 'Failed to book appointment');
      }
    }
  };

  const selectedService = services.find((s: Service) => s.id.toString() === formData.serviceId);
  const selectedStaff = staff.find((s: Staff) => s.id.toString() === formData.staffId);

  const isLoadingAny = staffLoading || servicesLoading || customersLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>

        {isLoadingAny ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer">
                <User className="h-4 w-4 inline mr-1" />
                Customer *
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(v) => setFormData(prev => ({ ...prev, customerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: Customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.first_name} {customer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">
                <Scissors className="h-4 w-4 inline mr-1" />
                Service *
              </Label>
              <Select value={formData.serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter((s: Service) => s.is_active).map((service: Service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.duration_minutes} mins) - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff Selection */}
            <div className="space-y-2">
              <Label htmlFor="staff">
                <User className="h-4 w-4 inline mr-1" />
                Staff Member *
              </Label>
              <Select value={formData.staffId} onValueChange={handleStaffChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.filter((s: Staff) => s.is_active).map((staffMember: Staff) => (
                    <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                      {staffMember.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                type="date"
                id="date"
                value={formData.appointmentDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <Label>
                <Clock className="h-4 w-4 inline mr-1" />
                Time Slot *
              </Label>
              {!formData.staffId || !formData.serviceId ? (
                <p className="text-sm text-muted-foreground">
                  Please select a service and staff member first
                </p>
              ) : slotsLoading || slotsFetching ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading available slots...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {availableSlots.map((slot: string) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, startTime: slot }))}
                      className={`p-2 text-sm rounded-md border-2 font-medium transition-all ${
                        formData.startTime === slot
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-destructive">
                  No slots available for this date. Please try another date.
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Summary */}
            {formData.startTime && selectedService && selectedStaff && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Booking Summary:</p>
                <p>Service: {selectedService.name}</p>
                <p>Staff: {selectedStaff.name}</p>
                <p>Date: {formData.appointmentDate}</p>
                <p>Time: {formData.startTime}</p>
                <p>Duration: {selectedService.duration_minutes} minutes</p>
                <p className="font-medium mt-1">Price: ${selectedService.price}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !formData.startTime}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Appointment
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
