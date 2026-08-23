import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileUp } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const example = 'make,model,year,vin,mileage,saaqStatus,category,estimatedRetailValue,location\nToyota,Corolla,2021,2T1BURHE0MC000001,52000,CLEAN,CAR,18500,Montréal QC';

export default function AdminImportPage() {
  const [csv, setCsv] = useState(example);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { line: number; message: string }[] } | null>(null);
  const importCsv = async () => { setLoading(true); try { const response: any = await api.post('/vehicles/import/csv', { csv }); setResult(response.data); toast.success(`${response.data.created} véhicule(s) importé(s).`); } catch (error: any) { toast.error(error.response?.data?.message || 'Import impossible.'); } finally { setLoading(false); } };
  return <div className="max-w-4xl space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">INVENTAIRE</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Import CSV manuel</h2><p className="mt-1 text-sm text-slate-600">Collez un export CSV. Les colonnes requises sont : make, model, year, vin.</p></div><Card className="p-6"><label className="block text-sm font-bold text-slate-800">Contenu CSV<textarea className="mt-2 min-h-64 w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-xs text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" value={csv} onChange={(event) => setCsv(event.target.value)} /></label><p className="mt-3 text-xs leading-5 text-slate-500">Colonnes optionnelles : mileage, saaqStatus, category, estimatedRetailValue, location, fuelType, titleType, lotNumber, images (séparées par |), buyNowPrice.</p><Button className="mt-5 gap-2" onClick={importCsv} isLoading={loading}><FileUp className="h-4 w-4" />Importer les véhicules</Button></Card>{result && <Card className="p-6"><h3 className="font-extrabold text-primary">Résultat : {result.created} créé(s)</h3>{result.errors.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">{result.errors.map((error) => <li key={`${error.line}-${error.message}`}>Ligne {error.line} : {error.message}</li>)}</ul> : <p className="mt-2 text-sm text-green-700">Aucune erreur détectée.</p>}</Card>}</div>;
}
