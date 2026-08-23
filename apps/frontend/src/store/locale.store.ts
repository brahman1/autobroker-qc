import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type Locale = 'fr' | 'en';
const setDocumentLocale = (locale: Locale) => { if (typeof document !== 'undefined') document.documentElement.lang = locale; };
export const useLocaleStore = create<{ locale: Locale; setLocale: (locale: Locale) => void }>()(persist((set) => ({ locale: 'fr', setLocale: (locale) => { setDocumentLocale(locale); set({ locale }); } }), { name: 'autobroker-locale', onRehydrateStorage: () => (state) => { if (state) setDocumentLocale(state.locale); } }));
