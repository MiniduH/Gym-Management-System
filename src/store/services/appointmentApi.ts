// src/store/services/appointmentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type {
  Appointment,
  CreateAppointmentRequest,
  ApiResponse,
  Staff,
  Service,
  Customer,
} from '../../types/appointment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.tokens?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment', 'Staff', 'Service', 'Customer'],
  endpoints: (builder) => ({
    // Get all appointments
    getAppointments: builder.query<ApiResponse<Appointment[]>, {
      page?: number;
      limit?: number;
      status?: string;
      date?: string;
      staffId?: number;
      customerId?: number;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);
        if (params.date) searchParams.set('date', params.date);
        if (params.staffId) searchParams.set('staffId', params.staffId.toString());
        if (params.customerId) searchParams.set('customerId', params.customerId.toString());

        return `/appointments?${searchParams.toString()}`;
      },
      providesTags: ['Appointment'],
    }),

    // Get appointment by ID
    getAppointment: builder.query<ApiResponse<Appointment>, number>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    // Create appointment
    createAppointment: builder.mutation<ApiResponse<Appointment>, CreateAppointmentRequest>({
      query: (appointment) => ({
        url: '/appointments/book',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Update appointment status
    updateAppointmentStatus: builder.mutation<
      ApiResponse<Appointment>,
      { id: number; status: string; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: `/appointments/${id}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Appointment', id }],
    }),

    // Confirm appointment
    confirmAppointment: builder.mutation<ApiResponse<Appointment>, number>({
      query: (id) => ({
        url: `/appointments/${id}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    // Cancel appointment
    cancelAppointment: builder.mutation<ApiResponse<Appointment>, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/appointments/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Appointment', id }],
    }),

    // Complete appointment
    completeAppointment: builder.mutation<ApiResponse<Appointment>, number>({
      query: (id) => ({
        url: `/appointments/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    // Get staff list
    getStaff: builder.query<ApiResponse<Staff[]>, void>({
      query: () => '/staff',
      providesTags: ['Staff'],
    }),

    // Get services list
    getServices: builder.query<ApiResponse<Service[]>, void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),

    // Get customers list
    getCustomers: builder.query<ApiResponse<Customer[]>, void>({
      query: () => '/customers',
      providesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useConfirmAppointmentMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useGetStaffQuery,
  useGetServicesQuery,
  useGetCustomersQuery,
} = appointmentApi;