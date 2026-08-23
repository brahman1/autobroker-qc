import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VehicleGrid } from '../components/vehicles/VehicleGrid';
import { api } from '../lib/api';
import { Vehicle } from '../types';
import { useLocaleStore } from '../store/locale.store';

const categoryLabels: Record<'fr' | 'en', Record<string, string>> = {
  fr: { car: 'autos', suv: 'VUS', truck: 'camions', motorcycle: 'motos', boat: 'bateaux', rv: 'véhicules récréatifs', trailer: 'remorques', industrial: 'véhicules industriels', electric: 'véhicules électriques' },
  en: { car: 'cars', suv: 'SUVs', truck: 'trucks', motorcycle: 'motorcycles', boat: 'boats', rv: 'RVs', trailer: 'trailers', industrial: 'industrial vehicles', electric: 'electric vehicles' },
};
export default function SeoInventoryPage() {
  const { category, make, model } = useParams(); const [vehicles, setVehicles] = useState<Vehicle[]>([]); const [loading, setLoading] = useState(true);
  const locale = useLocaleStore((state) => state.locale);
  const itemLabel = categoryLabels[locale][category || ''] || category || '';
  const heading = locale === 'fr' ? (model ? `${make} ${model} d’occasion aux enchères` : make ? `${make} d’occasion aux enchères` : `${itemLabel} aux enchères`) : (model ? `${make} ${model} used vehicles at auction` : make ? `Used ${make} vehicles at auction` : `${itemLabel} at auction`);
  useEffect(() => { const filters = new URLSearchParams(); if (category) filters.set('category', category.toUpperCase()); if (make) filters.set('make', make); if (model) filters.set('model', model); api.get(`/vehicles?${filters}`).then((response: any) => setVehicles(response.data?.data || [])).finally(() => setLoading(false)); document.title = `${heading} | AutoBroker QC`; const description = locale === 'fr' ? `Découvrez nos ${heading.toLowerCase()} avec frais transparents et estimation du coût total.` : `Browse ${heading.toLowerCase()} with transparent fees and a total-cost estimate.`; document.querySelector('meta[name="description"]')?.setAttribute('content', description); }, [category, make, model, heading, locale]);
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-bold tracking-[.16em] text-accent">INVENTAIRE CANADIEN</p><h1 className="mt-2 text-3xl font-extrabold text-primary">{heading}</h1><p className="mt-2 text-sm text-slate-600">Parcourez les lots disponibles, leur historique et les estimations de frais avant de participer.</p><div className="mt-8"><VehicleGrid vehicles={vehicles} isLoading={loading} /></div></div>;
}
