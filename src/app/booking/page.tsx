'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TimeSlotGrid } from '@/components/appointments/time-slot-grid';
import { publicApi } from '../../lib/public-api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Service, Staff } from '../../types/appointment';

// Steps
const STEPS = [
  { id: 1, title: 'Select Service', icon: Scissors },
  { id: 2, title: 'Choose Stylist', icon: User },
  { id: 3, title: 'Pick Date', icon: Calendar },
  { id: 4, title: 'Select Time', icon: Clock },
  { id: 5, title: 'Confirm', icon: CheckCircle },
];

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await publicApi.getServices();
        setServices(data.data || []);
      } catch (error) {
        toast.error('Failed to load services');
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch staff when service is selected
  useEffect(() => {
    if (!selectedService) return;

    const fetchStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const data = await publicApi.getStaff();
        setStaff(data.data || []);
      } catch (error) {
        toast.error('Failed to load stylists');
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [selectedService]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedStaff) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime(''); // Reset time when date changes
      try {
        const data = await publicApi.getAvailableSlots(
          selectedStaff.id,
          selectedService.id,
          selectedDate
        );
        setAvailableSlots(data.data?.slots || []);
      } catch (error) {
        toast.error('Failed to load available times');
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, selectedService, selectedStaff]);

  // Navigation
  const goToStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= 5) {
      setStep(newStep);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    goToStep(2);
  };

  const handleStaffSelect = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setSelectedDate('');
    setSelectedTime('');
    goToStep(3);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    goToStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    goToStep(5);
  };

  const handleSubmit = async () => {
    // Validate customer info
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would submit to the booking API
      // For now, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Appointment booked successfully!');
      // Reset form
      setStep(1);
      setSelectedService(null);
      setSelectedStaff(null);
      setSelectedDate('');
      setSelectedTime('');
      setCustomerInfo({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate date options (next 30 days)
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Book Your Appointment</h1>
          <p className="text-muted-foreground">
            Schedule your next salon visit in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div
                  key={s.id}
                  className={cn(
                    'flex flex-col items-center relative z-10',
                    index < STEPS.length - 1 && 'flex-1'
                  )}
                >
                  <button
                    onClick={() => isCompleted && goToStep(s.id)}
                    disabled={!isCompleted}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      isCompleted && 'bg-green-500 text-white cursor-pointer hover:bg-green-600',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  <span
                    className={cn(
                      'text-xs mt-2 font-medium hidden sm:block',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground'
                    )}
                  >
                    {s.title}
                  </span>
                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-6 left-1/2 w-full h-0.5 -z-10',
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">Choose a Service</h2>
                  <p className="text-muted-foreground">Select the service you would like to book</p>
                </div>
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.filter(s => s.is_active).map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                          selectedService?.id === service.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{service.name}</h3>
                          <span className="font-bold text-primary">${service.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Duration: {service.duration_minutes} minutes
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Choose Staff */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">Choose Your Stylist</h2>
                  <p className="text-muted-foreground">Select your preferred stylist</p>
                </div>
                {isLoadingStaff ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {staff.filter(s => s.is_active).map((staffMember) => (
                      <button
                        key={staffMember.id}
                        onClick={() => handleStaffSelect(staffMember)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-center transition-all hover:shadow-md',
                          selectedStaff?.id === staffMember.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">{staffMember.name}</h3>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-start pt-4">
                  <Button variant="outline" onClick={() => goToStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Pick Date */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">Select a Date</h2>
                  <p className="text-muted-foreground">Choose your preferred appointment date</p>
                </div>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-5 lg:grid-cols-7">
                  {dateOptions.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => handleDateSelect(date.value)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-center transition-all text-sm',
                        selectedDate === date.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50',
                        date.isWeekend && selectedDate !== date.value && 'bg-muted/50'
                      )}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-start pt-4">
                  <Button variant="outline" onClick={() => goToStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Select Time */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">Select a Time</h2>
                  <p className="text-muted-foreground">
                    Available times for {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <TimeSlotGrid
                  slots={availableSlots}
                  selectedSlot={selectedTime}
                  onSelectSlot={handleTimeSelect}
                  isLoading={isLoadingSlots}
                />
                <div className="flex justify-start pt-4">
                  <Button variant="outline" onClick={() => goToStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">Confirm Your Booking</h2>
                  <p className="text-muted-foreground">Review your appointment details and enter your information</p>
                </div>

                {/* Booking Summary */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-semibold mb-3">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stylist:</span>
                      <span className="font-medium">{selectedStaff?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedService?.duration_minutes} minutes</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-primary">${selectedService?.price}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Your Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, firstName: e.target.value })
                        }
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                        }
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requests (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, notes: e.target.value })
                      }
                      placeholder="Any special requests or notes..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => goToStep(4)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Summary (shown on steps 2-4) */}
        {step >= 2 && step < 5 && (
          <Card className="mt-4">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedService && (
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedService.name}</span>
                    <span className="text-primary font-medium">${selectedService.price}</span>
                  </div>
                )}
                {selectedStaff && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStaff.name}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTime}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
