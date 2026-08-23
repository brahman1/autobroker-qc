import { formatLocale } from '../i18n';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { useCompareStore } from '../store/compare.store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const rows: { label: string; value: (vehicle: any) => string }[] = [
  { label: 'Catégorie', value: (v) => v.category || 'Auto' }, { label: 'Valeur estimée', value: (v) => `${v.estimatedRetailValue?.toLocaleString(formatLocale())} $` },
  { label: 'Kilométrage', value: (v) => `${v.mileage?.toLocaleString(formatLocale())} km` }, { label: 'Carburant', value: (v) => v.fuelType },
  { label: 'Statut SAAQ', value: (v) => v.saaqStatus }, { label: 'Titre', value: (v) => v.titleType || '—' },
  { label: 'Dommage primaire', value: (v) => v.primaryDamage }, { label: 'Clés', value: (v) => v.hasKeys ? 'Disponibles' : 'Non confirmées' },
  { label: 'État mécanique', value: (v) => v.runAndDrive ? 'Démarre et roule' : 'À vérifier' }, { label: 'Lieu', value: (v) => v.location || 'Québec, Canada' },
];

export default function ComparePage() {
  const { vehicles, remove, clear } = useCompareStore();
  if (!vehicles.length) return <div className="mx-auto max-w-4xl px-4 py-20 text-center"><Scale className="mx-auto h-11 w-11 text-accent" /><h1 className="mt-5 text-3xl font-extrabold text-primary">Comparez vos véhicules</h1><p className="mt-2 text-slate-600">Ajoutez jusqu’à trois véhicules depuis leur fiche pour les comparer côte à côte.</p><Link to="/vehicules"><Button className="mt-6">Explorer l’inventaire</Button></Link></div>;
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold tracking-[.16em] text-accent">OUTIL D’ACHAT</p><h1 className="mt-2 text-3xl font-extrabold text-primary">Comparer les véhicules</h1><p className="mt-2 text-sm text-slate-600">Les informations sont indicatives et ne remplacent pas une inspection.</p></div><Button variant="outline" onClick={clear}>Tout retirer</Button></div><Card className="mt-8 overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b bg-slate-50"><th className="w-48 px-5 py-5 text-sm font-bold text-slate-500">Critère</th>{vehicles.map((vehicle) => <th key={vehicle.id} className="min-w-56 px-5 py-5"><div className="flex items-start justify-between gap-2"><Link to={`/vehicules/${vehicle.id}`} className="font-extrabold text-primary hover:text-accent">{vehicle.year} {vehicle.make} {vehicle.model}</Link><button aria-label="Retirer du comparateur" onClick={() => remove(vehicle.id)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900"><X className="h-4 w-4" /></button></div></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.label}><th className="bg-slate-50/60 px-5 py-4 text-sm font-bold text-slate-700">{row.label}</th>{vehicles.map((vehicle) => <td key={vehicle.id} className="px-5 py-4 text-sm font-medium text-slate-800">{row.value(vehicle)}</td>)}</tr>)}</tbody></table></Card></div>;
}
