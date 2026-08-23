import { create } from 'zustand';
import { api } from '../lib/api';
import { Vehicle } from '../types';

interface VehicleState {
  vehicles: Vehicle[];
  total: number;
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  fetchVehicles: (filters?: any) => Promise<void>;
  fetchVehicle: (id: string) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  total: 0,
  selectedVehicle: null,
  isLoading: false,
  fetchVehicles: async (filters) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(
        Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== '' && value !== false).map(([key, value]) => [key, String(value)]),
      ).toString();
      const response = await api.get(`/vehicles?${params}`) as any;
      set({ vehicles: response.data?.data || [], total: response.data?.total || 0, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  fetchVehicle: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/vehicles/${id}`) as any;
      set({ selectedVehicle: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  }
}));
