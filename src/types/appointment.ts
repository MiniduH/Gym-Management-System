// src/types/appointment.ts

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Staff {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface Appointment {
  id: number;
  customer_id: number;
  staff_id: number;
  service_id: number;
  start_time: string;      // ISO datetime
  end_time?: string;       // ISO datetime
  status: AppointmentStatus;
  is_confirmed: boolean;
  notes?: string;
  price?: number;
  customer?: Customer;
  staff?: Staff;
  service?: Service;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  customerId: number;
  staffId: number;
  serviceId: number;
  startTime: string;  // Format: "YYYY-MM-DDTHH:MM:SS"
  notes?: string;
}

export interface CancelAppointmentRequest {
  reason?: string;
}

// API Response types
export interface AvailableSlotsResponse {
  success: boolean;
  data: {
    date: string;
    staffId: number;
    staffName: string;
    serviceId: number;
    serviceName: string;
    serviceDuration: number;
    slots: string[];              // ["09:00", "09:15", ...]
    totalAvailableSlots: number;
    generatedAt: string;
  };
}

export interface AvailabilityRangeResponse {
  success: boolean;
  data: Record<string, {
    hasAvailability: boolean;
    slotCount: number;
    slots: string[];
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}