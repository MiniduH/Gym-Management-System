// src/hooks/useAppointmentManagement.ts
import { useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateAppointmentMutation,
  useConfirmAppointmentMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useGetAppointmentsQuery,
} from '../store/services/appointmentApi';
import type { CreateAppointmentRequest } from '../types/appointment';

export const useCreateAppointmentHandler = () => {
  const [createAppointment, { isLoading, error }] = useCreateAppointmentMutation();

  const handleCreate = async (data: CreateAppointmentRequest) => {
    try {
      const result = await createAppointment(data).unwrap();
      toast.success('Appointment booked successfully!');
      return result;
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Booking failed';
      toast.error(message);
      throw err;
    }
  };

  return { handleCreate, isLoading, error };
};

export const useAppointmentActions = () => {
  const [confirmAppointment, { isLoading: confirming }] = useConfirmAppointmentMutation();
  const [cancelAppointment, { isLoading: cancelling }] = useCancelAppointmentMutation();
  const [completeAppointment, { isLoading: completing }] = useCompleteAppointmentMutation();

  const handleConfirm = async (id: number) => {
    try {
      await confirmAppointment(id).unwrap();
      toast.success('Appointment confirmed successfully');
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (id: number, reason?: string) => {
    try {
      await cancelAppointment({ id, reason }).unwrap();
      toast.success('Appointment cancelled successfully');
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeAppointment(id).unwrap();
      toast.success('Appointment completed successfully');
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to complete appointment');
    }
  };

  return {
    handleConfirm,
    handleCancel,
    handleComplete,
    isLoading: confirming || cancelling || completing,
  };
};

export const useFetchAppointmentsByDate = (date: string) => {
  const { data, isLoading, error, refetch } = useGetAppointmentsQuery({
    date,
    limit: 100,
  });

  return {
    appointments: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useAppointmentFilters = () => {
  const [filters, setFilters] = useState({
    status: '',
    staffId: '',
    customerId: '',
    date: '',
  });

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      staffId: '',
      customerId: '',
      date: '',
    });
  };

  return { filters, updateFilter, clearFilters };
};