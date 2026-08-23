import { formatLocale } from '../../i18n';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const money = (value: number) => `${value.toLocaleString(formatLocale())} $ CAD`;

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const load = () => { setLoading(true); api.get('/offers').then((response: any) => setOffers(response.data || [])).catch(() => toast.error('Impossible de charger les offres.')).finally(() => setLoading(false)); };
  useEffect(load, []);
  const review = async (id: string, status: 'ACCEPTED' | 'DECLINED') => { setSaving(id); try { await api.patch(`/offers/${id}`, { status }); toast.success(status === 'ACCEPTED' ? 'Offre acceptée et commande créée.' : 'Offre refusée.'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Action impossible.'); } finally { setSaving(null); } };
  return <div className="space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">VENTES</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Offres à examiner</h2><p className="mt-1 text-sm text-slate-600">Acceptez ou refusez les propositions des acheteurs vérifiés.</p></div><Card className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Véhicule</th><th className="px-5 py-4">Offre</th><th className="px-5 py-4">État</th><th className="px-5 py-4 text-right">Décision</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">Chargement…</td></tr> : offers.length ? offers.map((offer) => <tr className="text-slate-700" key={offer.id}><td className="px-5 py-4"><p className="font-semibold text-primary">{offer.user?.firstName} {offer.user?.lastName}</p><p className="text-xs text-slate-500">{offer.user?.email}</p></td><td className="px-5 py-4 font-medium">{offer.vehicle?.year} {offer.vehicle?.make} {offer.vehicle?.model}</td><td className="px-5 py-4 font-extrabold text-primary">{money(offer.amount)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{offer.status}</span></td><td className="px-5 py-4 text-right">{offer.status === 'PENDING' ? <div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={saving === offer.id} onClick={() => review(offer.id, 'DECLINED')}>Refuser</Button><Button size="sm" disabled={saving === offer.id} onClick={() => review(offer.id, 'ACCEPTED')}><Tag className="mr-1 h-3.5 w-3.5" />Accepter</Button></div> : <span className="text-xs font-bold text-slate-500">Traitée</span>}</td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">Aucune offre reçue.</td></tr>}</tbody></table></Card></div>;
}
