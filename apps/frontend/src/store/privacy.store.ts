import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const usePrivacyStore = create<{ deviceRiskConsent: boolean | null; setDeviceRiskConsent: (value: boolean) => void }>()(persist((set) => ({ deviceRiskConsent: null, setDeviceRiskConsent: (deviceRiskConsent) => set({ deviceRiskConsent }) }), { name: 'autobroker-privacy' }));
