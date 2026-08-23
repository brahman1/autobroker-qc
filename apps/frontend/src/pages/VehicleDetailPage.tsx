import { formatLocale } from '../i18n';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bookmark, FileText, Gavel, MapPin, Scale, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useVehicleStore } from '../store/vehicle.store';
import { useAuthStore } from '../store/auth.store';
import { Card } from '../components/ui/Card';
import { SaaqBadge } from '../components/vehicles/SaaqBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useCompareStore } from '../store/compare.store';

const money = (value?: number | null) => value ? `${value.toLocaleString(formatLocale())} $ CAD` : '—';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVehicle, fetchVehicle, isLoading } = useVehicleStore();
  const { isAuthenticated, user } = useAuthStore();
  const toggleCompare = useCompareStore((state) => state.toggle);
  const comparing = useCompareStore((state) => state.vehicles.some((vehicle) => vehicle.id === selectedVehicle?.id));
  const [auction, setAuction] = useState<any>(null);
  const [loadingAuction, setLoadingAuction] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [actionLoading, setActionLoading] = useState<'watch' | 'offer' | 'buy' | 'quote' | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [estimate, setEstimate] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchVehicle(id);
    setLoadingAuction(true);
    api.get(`/auctions?vehicleId=${id}`).then((res: any) => setAuction((res.data || []).find((item: any) => item.vehicleId === id) || null)).catch(() => setAuction(null)).finally(() => setLoadingAuction(false));
    api.get(`/vehicles/${id}/purchase-estimate`).then((res: any) => setEstimate(res.data)).catch(() => setEstimate(null));
    if (isAuthenticated) api.get('/watchlist').then((res: any) => setWatchlisted((res.data || []).some((item: any) => item.vehicleId === id))).catch(() => setWatchlisted(false));
  }, [id, fetchVehicle, isAuthenticated]);

  if (isLoading || !selectedVehicle) return <div className="p-8 text-center text-slate-600">Chargement des détails…</div>;
  const v = selectedVehicle;
  const requireAccount = () => { if (!isAuthenticated) { toast.error('Connectez-vous pour utiliser cette fonction.'); navigate('/connexion'); return false; } return true; };
  const toggleWatchlist = async () => {
    if (!requireAccount() || !id) return;
    setActionLoading('watch');
    try { if (watchlisted) { await api.delete(`/watchlist/${id}`); setWatchlisted(false); toast.success('Retiré de votre liste de suivi.'); } else { await api.post(`/watchlist/${id}`); setWatchlisted(true); toast.success('Ajouté à votre liste de suivi.'); } } catch { toast.error('Impossible de mettre à jour la liste de suivi.'); } finally { setActionLoading(null); }
  };
  const submitOffer = async () => {
    if (!requireAccount() || !id) return;
    const amount = Number(offerAmount); if (!amount) { toast.error('Indiquez un montant valide.'); return; }
    setActionLoading('offer'); try { await api.post('/offers', { vehicleId: id, auctionId: auction?.id, amount }); toast.success('Votre offre a été transmise.'); setOfferAmount(''); } catch (error: any) { toast.error(error.response?.data?.message || 'Offre impossible : vérifiez votre KYC et votre caution.'); } finally { setActionLoading(null); }
  };
  const buyNow = async () => { if (!requireAccount() || !id) return; setActionLoading('buy'); try { const response: any = await api.post(`/buy-now/${id}`); toast.success(`Lot réservé — commande ${response.data?.orderNumber || ''}`); navigate('/mes-achats'); } catch (error: any) { toast.error(error.response?.data?.message || 'Achat immédiat impossible.'); } finally { setActionLoading(null); } };
  const requestQuote = async () => { if (!requireAccount() || !id) return; setActionLoading('quote'); try { const response: any = await api.post('/transport/quotes', { vehicleId: id, destinationPostalCode: postalCode }); setQuote(response.data); toast.success('Devis de transport créé.'); } catch (error: any) { toast.error(error.response?.data?.message || 'Code postal canadien requis.'); } finally { setActionLoading(null); } };
  const compare = () => { const result = toggleCompare(v); if (result === 'full') toast.error('Vous pouvez comparer jusqu’à trois véhicules.'); else toast.success(result === 'added' ? 'Ajouté au comparateur.' : 'Retiré du comparateur.'); };

  return <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-bold tracking-[.16em] text-accent">{v.lotNumber || 'LOT AUTOBROKER'}</p><h1 className="mt-1 text-3xl font-extrabold text-primary">{v.year} {v.make} {v.model}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 text-accent" />{v.location || 'Québec, Canada'}</p></div><div className="flex flex-wrap items-center gap-3"><SaaqBadge status={v.saaqStatus} size="lg" /><Button variant="outline" size="sm" className="gap-2" onClick={compare}><Scale className="h-4 w-4" />{comparing ? 'Comparé' : 'Comparer'}</Button><Button variant="outline" size="sm" className="gap-2" onClick={toggleWatchlist} isLoading={actionLoading === 'watch'}><Bookmark className={`h-4 w-4 ${watchlisted ? 'fill-accent text-accent' : ''}`} />{watchlisted ? 'Suivi' : 'Suivre'}</Button></div></div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3"><div className="space-y-7 lg:col-span-2"><div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-slate-100 shadow-soft">{v.images?.[0] ? <img src={v.images[0]} alt={`${v.year} ${v.make} ${v.model}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-600">Aucune image disponible</div>}</div><Card className="p-6"><div className="flex items-center gap-2 border-b border-slate-200 pb-4"><FileText className="h-5 w-5 text-accent" /><h2 className="text-xl font-extrabold text-primary">État et spécifications</h2></div><p className="mt-4 text-sm leading-6 text-slate-700">{v.description || 'Informations détaillées disponibles avant toute participation.'}</p><div className="mt-6 grid gap-5 text-sm sm:grid-cols-3">{[['NIV (VIN)', v.vin], ['Kilométrage', `${v.mileage?.toLocaleString(formatLocale())} km`], ['Carburant', v.fuelType], ['Condition', v.condition], ['Dommage primaire', v.primaryDamage], ['Dommage secondaire', v.secondaryDamage || 'Aucun déclaré'], ['Titre', v.titleType || v.saaqStatus], ['Clés', v.hasKeys ? 'Disponibles' : 'Non confirmées'], ['Mécanique', v.runAndDrive ? 'Démarre et roule' : 'À vérifier']].map(([label, value]) => <div key={label as string}><span className="block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><span className="mt-1 block font-semibold text-slate-900">{value}</span></div>)}</div></Card><Card className="p-6"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-accent" /><h2 className="text-lg font-extrabold text-primary">Devis de transport simulé</h2></div><p className="mt-1 text-sm text-slate-600">Obtenez une estimation pour votre code postal canadien.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><Input value={postalCode} onChange={(event) => setPostalCode(event.target.value.toUpperCase())} placeholder="Ex. H2X 1Y4" /><Button onClick={requestQuote} isLoading={actionLoading === 'quote'}>Calculer</Button></div>{quote && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><strong>{money(quote.amount)}</strong> — livraison estimée entre le {new Date(quote.estimatedPickupAt).toLocaleDateString(formatLocale())} et le {new Date(quote.estimatedDeliveryAt).toLocaleDateString(formatLocale())}.</div>}</Card></div>
      <aside className="space-y-5"><Card className="p-6"><p className="text-xs font-bold tracking-[.14em] text-slate-500">VALEUR ESTIMÉE</p><p className="mt-2 text-3xl font-extrabold text-primary">{money(v.estimatedRetailValue)}</p><p className="mt-2 text-sm text-slate-600">Valeur de détail indicative. Vérifiez le véhicule avant l’achat.</p></Card>{estimate && <Card className="border-slate-200 p-6"><div className="flex items-center justify-between"><p className="text-xs font-bold tracking-[.14em] text-slate-500">COÛT TOTAL ESTIMÉ</p><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${estimate.riskScore >= 65 ? 'bg-red-50 text-red-700' : estimate.riskScore >= 35 ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>Risque {estimate.riskLevel}</span></div><p className="mt-2 text-2xl font-extrabold text-primary">{money(estimate.totalBeforeRepair)}</p><div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700"><p className="flex justify-between"><span>Prix véhicule</span><strong>{money(estimate.vehiclePrice)}</strong></p><p className="flex justify-between"><span>Frais acheteur</span><strong>{money(estimate.buyerFee)}</strong></p><p className="flex justify-between"><span>TPS/TVQ estimées</span><strong>{money(estimate.taxes)}</strong></p><p className="flex justify-between"><span>Réparation indicative</span><strong>{money(estimate.repairEstimate)}</strong></p></div><p className="mt-4 text-xs leading-5 text-slate-500">{estimate.assumptions?.[0]}</p></Card>}{v.buyNowPrice && <Card className="border-[#F2C38E] bg-[#FFF9F1] p-6"><p className="text-xs font-bold tracking-[.14em] text-[#9A4A0A]">ACHAT IMMÉDIAT</p><p className="mt-2 text-3xl font-extrabold text-primary">{money(v.buyNowPrice)}</p><p className="mt-2 text-sm leading-6 text-slate-700">Réservez ce lot maintenant. Une caution active et une identité vérifiée sont requises.</p><Button className="mt-5 w-full" onClick={buyNow} isLoading={actionLoading === 'buy'}>Réserver ce lot</Button></Card>}<Card className="p-6"><div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-accent" /><h2 className="font-extrabold text-primary">Offre ou enchère</h2></div>{loadingAuction ? <p className="mt-4 text-sm text-slate-600">Recherche de l’enchère…</p> : auction ? <Link to={`/encheres/${auction.id}`} className="mt-4 block"><Button className="w-full">Accéder à l’enchère</Button></Link> : <><p className="mt-3 text-sm text-slate-600">Ce lot n’est pas en enchère directe. Soumettez une offre au courtier.</p><Input className="mt-4" type="number" min="1" value={offerAmount} onChange={(event) => setOfferAmount(event.target.value)} placeholder="Votre offre en CAD" /><Button className="mt-3 w-full" onClick={submitOffer} isLoading={actionLoading === 'offer'}>Transmettre mon offre</Button></>}<div className="mt-5 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700"><ShieldCheck className="h-4 w-4 shrink-0 text-success" />{user?.kycStatus === 'VERIFIED' ? 'Votre profil est vérifié.' : 'KYC et caution actifs requis pour une offre ou réservation.'}</div></Card><Link to="/vehicules" className="block text-center text-sm font-bold text-accent hover:underline">Retour à l’inventaire</Link></aside></div></div>;
}
