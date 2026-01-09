// src/store/services/appointmentSlotsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type {
  AvailableSlotsResponse,
  AvailabilityRangeResponse,
} from '../../types/appointment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const appointmentSlotsApi = createApi({
  reducerPath: 'appointmentSlotsApi',
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
  endpoints: (builder) => ({
    // Get available slots for a specific date
    getAvailableSlots: builder.query<AvailableSlotsResponse, {
      staffId: number;
      serviceId: number;
      date: string;
    }>({
      query: ({ staffId, serviceId, date }) =>
        `/appointments/available-slots?staffId=${staffId}&serviceId=${serviceId}&date=${date}`,
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get availability for date range (calendar view)
    getAvailabilityRange: builder.query<AvailabilityRangeResponse, {
      staffId: number;
      serviceId: number;
      startDate: string;
      endDate: string;
    }>({
      query: ({ staffId, serviceId, startDate, endDate }) =>
        `/appointments/availability-range?staffId=${staffId}&serviceId=${serviceId}&startDate=${startDate}&endDate=${endDate}`,
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
  }),
});

export const {
  useGetAvailableSlotsQuery,
  useGetAvailabilityRangeQuery,
} = appointmentSlotsApi;