'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, CalendarDays, List, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AppointmentBookingDialog,
  AppointmentCalendar,
  AppointmentList,
  AppointmentViewDialog,
} from '@/components/appointments';
import { useGetAppointmentsQuery } from '../../../store/services/appointmentApi';
import type { Appointment, AppointmentStatus } from '../../../types/appointment';

export default function AppointmentsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Fetch appointments
  const { data, isLoading, refetch } = useGetAppointmentsQuery({
    status: statusFilter || undefined,
    date: dateFilter || undefined,
    limit: 100,
  });

  const appointments = data?.data || [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDateFilter(format(date, 'yyyy-MM-dd'));
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setSelectedDate(undefined);
  };

  const statusOptions: { value: AppointmentStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and schedule salon appointments
          </p>
        </div>
        <Button onClick={() => setBookingDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter((a: Appointment) => 
                format(new Date(a.start_time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter((a: Appointment) => a.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter((a: Appointment) => a.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {appointments.filter((a: Appointment) => a.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[150px]"
              />
              {(statusFilter || dateFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>

            {/* View Toggle & Refresh */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')}>
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-1" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' ? (
            <AppointmentList
              appointments={appointments}
              isLoading={isLoading}
              onRefresh={refetch}
            />
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              isLoading={isLoading}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AppointmentBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        defaultDate={dateFilter || undefined}
        onSuccess={refetch}
      />

      <AppointmentViewDialog
        appointment={selectedAppointment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onRefresh={refetch}
      />
    </div>
  );
}
