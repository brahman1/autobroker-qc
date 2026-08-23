import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vehicle } from '../types';

interface CompareState {
  vehicles: Vehicle[];
  toggle: (vehicle: Vehicle) => 'added' | 'removed' | 'full';
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(persist((set, get) => ({
  vehicles: [],
  toggle: (vehicle) => {
    const existing = get().vehicles;
    if (existing.some((item) => item.id === vehicle.id)) { set({ vehicles: existing.filter((item) => item.id !== vehicle.id) }); return 'removed'; }
    if (existing.length >= 3) return 'full';
    set({ vehicles: [...existing, vehicle] }); return 'added';
  },
  remove: (id) => set({ vehicles: get().vehicles.filter((vehicle) => vehicle.id !== id) }),
  clear: () => set({ vehicles: [] }),
}), { name: 'vehicle-comparison' }));
