import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';

type PaymentConfig = { isMock: boolean; mode: 'demo' | 'test'; publishableKey: string | null };

function CheckoutForm({ demoMode, onReserved }: { demoMode: boolean; onReserved?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response: any = await api.post('/deposits/create-intent');
      const { clientSecret, depositId, isMock } = response.data;
      if (isMock) {
        toast.success('Caution de démonstration activée.');
        onReserved?.();
        return;
      }
      if (!stripe || !elements) throw new Error('Stripe est indisponible.');
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Les informations de carte sont incomplètes.');
      const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      if (result.error) throw result.error;
      await api.post(`/deposits/${depositId}/confirm`);
      toast.success('Préautorisation Stripe confirmée. Votre caution est active.');
      onReserved?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Impossible d’activer la caution.');
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit} className="space-y-5">
    {demoMode ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong className="block font-extrabold">Mode démonstration</strong>Aucune carte n’est demandée et aucun montant ne sera débité.</div> : <div className="rounded-xl border border-slate-300 bg-white p-4"><p className="mb-3 text-sm font-bold text-slate-700">Carte de test Stripe</p><CardElement options={{ style: { base: { color: '#0B1F33', fontFamily: 'Inter, sans-serif', fontSize: '16px', '::placeholder': { color: '#64748b' } }, invalid: { color: '#dc2626', iconColor: '#dc2626' } } }} /></div>}
    <p className="text-sm leading-6 text-slate-600">{demoMode ? 'La caution sera activée immédiatement pour tester les enchères.' : 'Une préautorisation de 600 $ CAD sera créée. Elle n’est capturée que si vous remportez un lot.'}</p>
    <Button type="submit" className="h-12 w-full text-base" isLoading={isLoading}>{demoMode ? 'Activer la caution de démonstration' : 'Préautoriser 600 $ CAD'}</Button>
  </form>;
}

export function StripeDepositForm({ onReserved }: { onReserved?: () => void }) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { api.get('/payments/config').then((response: any) => setConfig(response.data)).catch(() => setFailed(true)); }, []);
  const stripePromise = useMemo(() => config?.publishableKey ? loadStripe(config.publishableKey) : null, [config?.publishableKey]);
  if (failed) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">La configuration de paiement est indisponible. Réessayez dans un instant.</div>;
  if (!config) return <p className="text-sm text-slate-600">Chargement de la configuration de paiement…</p>;
  if (!config.isMock && !stripePromise) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">La clé publique Stripe de test manque dans la configuration serveur.</div>;
  return <Elements stripe={stripePromise}><CheckoutForm demoMode={config.isMock} onReserved={onReserved} /></Elements>;
}
