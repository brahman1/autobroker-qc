import { formatLocale } from '../i18n';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Search, BookmarkPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVehicleStore } from '../store/vehicle.store';
import { VehicleGrid } from '../components/vehicles/VehicleGrid';
import { VehicleFilters, type VehicleFilters as FiltersType } from '../components/vehicles/VehicleFilters';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

export default function VehiclesPage() {
  const { vehicles, total, isLoading, fetchVehicles } = useVehicleStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [filters, setFilters] = useState<FiltersType>({});
  const location = useLocation();
  const liveOnly = new URLSearchParams(location.search).get('status') === 'live';
  useEffect(() => { fetchVehicles({ ...filters, ...(liveOnly ? { status: 'live' } : {}) }); }, [fetchVehicles, filters, liveOnly]);
  const saveSearch = async () => {
    if (!isAuthenticated) { toast.error('Connectez-vous pour enregistrer cette recherche.'); return; }
    try { await api.post('/saved-searches', { name: `Recherche du ${new Date().toLocaleDateString(formatLocale())}`, filters }); toast.success('Recherche enregistrée dans votre espace.'); } catch { toast.error('Impossible d’enregistrer cette recherche.'); }
  };
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold tracking-[.16em] text-accent">INVENTAIRE</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary">Explorez les véhicules disponibles</h1><p className="mt-2 text-sm text-slate-600">Filtrez par statut SAAQ, lot, état mécanique et prix avant de participer.</p></div><div className="flex flex-wrap gap-2"><div className="inline-flex items-center gap-2 self-start rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-600"><Search className="h-4 w-4 text-accent" /> {total} véhicule{total > 1 ? 's' : ''}</div><Button variant="outline" size="sm" className="gap-2" onClick={saveSearch}><BookmarkPlus className="h-4 w-4" /> Enregistrer</Button></div></div>
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4"><aside className="md:col-span-1"><div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-soft"><h2 className="mb-5 flex items-center gap-2 border-b pb-4 text-base font-extrabold text-primary"><Filter className="h-4 w-4 text-accent" /> Filtres</h2><VehicleFilters filters={filters} onChange={setFilters} /></div></aside><main className="md:col-span-3"><VehicleGrid vehicles={vehicles} isLoading={isLoading} /></main></div>
  </div>;
}
