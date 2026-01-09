// src/lib/public-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const publicApi = {
  getServices: async () => {
    const res = await fetch(`${API_BASE_URL}/public/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  getStaff: async () => {
    const res = await fetch(`${API_BASE_URL}/public/staff`);
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },

  getAvailableSlots: async (staffId: number, serviceId: number, date: string) => {
    const params = new URLSearchParams({
      staffId: String(staffId),
      serviceId: String(serviceId),
      date,
    });
    const res = await fetch(`${API_BASE_URL}/appointments/available-slots?${params}`);
    if (!res.ok) throw new Error('Failed to fetch available slots');
    return res.json();
  },

  getAvailabilityRange: async (staffId: number, serviceId: number, startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      staffId: String(staffId),
      serviceId: String(serviceId),
      startDate,
      endDate,
    });
    const res = await fetch(`${API_BASE_URL}/appointments/availability-range?${params}`);
    if (!res.ok) throw new Error('Failed to fetch availability range');
    return res.json();
  },
};