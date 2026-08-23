import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface VehicleFilters {
  q?: string;
  saaqStatus?: string;
  category?: string;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  runAndDrive?: boolean;
  hasKeys?: boolean;
  fuelType?: string;
  titleType?: string;
  sort?: string;
}

const selectClass = 'mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

export function VehicleFilters({ filters, onChange }: { filters: VehicleFilters, onChange: (f: VehicleFilters) => void }) {
  const update = (patch: Partial<VehicleFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-5 text-slate-800">
      <label className="block text-sm font-bold text-slate-700">Recherche
        <Input className="mt-2" value={filters.q || ''} onChange={(event) => update({ q: event.target.value || undefined })} placeholder="Marque, modèle, NIV, lot…" />
      </label>
      <label className="block text-sm font-bold text-slate-700">Statut SAAQ
        <select className={selectClass} value={filters.saaqStatus || ''} onChange={(event) => update({ saaqStatus: event.target.value || undefined })}>
          <option value="">Tous les statuts</option><option value="CLEAN">Propre</option><option value="VGA">VGA</option><option value="SCRAP">Irrécupérable</option>
        </select>
      </label>
      <label className="block text-sm font-bold text-slate-700">Type de véhicule
        <select className={selectClass} value={filters.category || ''} onChange={(event) => update({ category: event.target.value || undefined })}>
          <option value="">Toutes les catégories</option><option value="CAR">Auto</option><option value="SUV">VUS</option><option value="TRUCK">Camion</option><option value="MOTORCYCLE">Moto</option><option value="BOAT">Bateau</option><option value="RV">VR</option><option value="TRAILER">Remorque</option><option value="INDUSTRIAL">Industriel</option><option value="ELECTRIC">Électrique</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold text-slate-700">Année min.<Input className="mt-2" type="number" value={filters.minYear || ''} onChange={(event) => update({ minYear: event.target.value ? Number(event.target.value) : undefined })} placeholder="2018" /></label><label className="block text-sm font-bold text-slate-700">Année max.<Input className="mt-2" type="number" value={filters.maxYear || ''} onChange={(event) => update({ maxYear: event.target.value ? Number(event.target.value) : undefined })} placeholder="2026" /></label><label className="block text-sm font-bold text-slate-700">Prix min.<Input className="mt-2" type="number" value={filters.minPrice || ''} onChange={(event) => update({ minPrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="5 000" /></label><label className="block text-sm font-bold text-slate-700">Prix max.<Input className="mt-2" type="number" value={filters.maxPrice || ''} onChange={(event) => update({ maxPrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="25 000" /></label></div>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold text-slate-700">Énergie<select className={selectClass} value={filters.fuelType || ''} onChange={(event) => update({ fuelType: event.target.value || undefined })}><option value="">Toutes</option><option value="ESSENCE">Essence</option><option value="DIESEL">Diesel</option><option value="HYBRIDE">Hybride</option><option value="ELECTRIQUE">Électrique</option></select></label><label className="block text-sm font-bold text-slate-700">Titre<select className={selectClass} value={filters.titleType || ''} onChange={(event) => update({ titleType: event.target.value || undefined })}><option value="">Tous</option><option value="CLEAN">Propre</option><option value="VGA">VGA</option><option value="SCRAP">Irrécupérable</option></select></label></div>
      <div className="space-y-2 border-y border-slate-100 py-4"><label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" className="rounded border-slate-300 text-accent focus:ring-accent" checked={filters.runAndDrive || false} onChange={(event) => update({ runAndDrive: event.target.checked || undefined })} /> Démarre et roule</label><label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" className="rounded border-slate-300 text-accent focus:ring-accent" checked={filters.hasKeys || false} onChange={(event) => update({ hasKeys: event.target.checked || undefined })} /> Clés disponibles</label></div>
      <label className="block text-sm font-bold text-slate-700">Trier par
        <select className={selectClass} value={filters.sort || ''} onChange={(event) => update({ sort: event.target.value || undefined })}><option value="">Plus récents</option><option value="price_asc">Prix croissant</option><option value="year_desc">Année décroissante</option></select>
      </label>
      <Button variant="outline" className="w-full" onClick={() => onChange({})}>Réinitialiser</Button>
    </div>
  );
}
