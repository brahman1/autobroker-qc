import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/auth.store';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export function BidForm({ currentBid, startingBid, onBidPlaced, disabled }: { currentBid: number, startingBid: number, onBidPlaced: (amount: number) => Promise<void>, disabled?: boolean }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  
  const [hasDeposit, setHasDeposit] = useState(false);
  const [checkingDeposit, setCheckingDeposit] = useState(true);
  
  const minBid = currentBid === 0 ? startingBid : currentBid + 100;

  useEffect(() => {
    if (user && user.kycStatus === 'VERIFIED') {
      api.get('/deposits/my').then((res: any) => {
        const deposits = res.data || [];
        setHasDeposit(deposits.some((d: any) => d.status === 'HOLD'));
      }).catch(console.error).finally(() => {
        setCheckingDeposit(false);
      });
    } else {
      setCheckingDeposit(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const val = Number(amount);
    if (isNaN(val) || val < minBid) {
      setError(`La mise doit être d'au moins ${minBid} $.`);
      return;
    }
    
    setIsLoading(true);
    try {
      await onBidPlaced(val);
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur lors de la mise");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculateur de Frais ---
  const val = Number(amount) || minBid;
  const copartFee = val * 0.08; // 8% frais encan
  const brokerFee = 400; // 400$ frais courtage
  const subTotal = val + copartFee + brokerFee;
  const tps = subTotal * 0.05;
  const tvq = subTotal * 0.09975;
  const totalCost = subTotal + tps + tvq;

  if (!user) {
    return <div className="text-center p-4 text-slate-500 font-medium bg-slate-50 rounded-lg border border-slate-200">Veuillez vous <Link to="/connexion" className="text-blue-600 font-bold hover:underline">connecter</Link> pour miser.</div>;
  }

  if (user.kycStatus !== 'VERIFIED') {
    return <div className="text-center p-4 text-red-700 border border-red-200 bg-red-50 rounded-lg font-medium shadow-sm">Identité non vérifiée. <Link to="/tableau-de-bord" className="underline font-bold hover:text-red-800">Vérifier mon identité</Link></div>;
  }

  if (checkingDeposit) {
    return <div className="text-center p-4 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 font-medium animate-pulse">Vérification du dépôt...</div>;
  }

  if (!hasDeposit) {
    return <div className="text-center p-4 text-yellow-800 border border-yellow-200 bg-yellow-50 rounded-lg shadow-sm font-medium">Dépôt de caution requis. <Link to="/depot" className="underline font-bold hover:text-yellow-900">Effectuer un dépôt</Link></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Mise Maximum (Auto-Bid) $</label>
        <Input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={`Ex: ${minBid} $`}
          disabled={disabled || isLoading}
          className="text-lg py-3 font-semibold text-blue-900 bg-white border-slate-300 shadow-sm"
        />
        <p className="text-xs text-slate-500 mt-2 font-medium">Le système misera juste assez pour battre l'offre actuelle, jusqu'à votre maximum.</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-200 shadow-inner">
        <div className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Estimateur de coût total</div>
        <div className="flex justify-between mb-1"><span>Mise saisie :</span> <span className="font-semibold">{val.toFixed(2)}$</span></div>
        <div className="flex justify-between mb-1"><span>Frais Encan (8%) :</span> <span className="font-semibold">{copartFee.toFixed(2)}$</span></div>
        <div className="flex justify-between mb-1"><span>Frais Courtier :</span> <span className="font-semibold">{brokerFee.toFixed(2)}$</span></div>
        <div className="flex justify-between mb-1 text-slate-500"><span>TPS (5%) :</span> <span>{tps.toFixed(2)}$</span></div>
        <div className="flex justify-between mb-1 text-slate-500"><span>TVQ (9.975%) :</span> <span>{tvq.toFixed(2)}$</span></div>
        <div className="flex justify-between font-extrabold text-blue-700 mt-3 pt-3 border-t border-slate-200 text-base">
          <span>COÛT TOTAL ESTIMÉ :</span> <span>{totalCost.toFixed(2)}$</span>
        </div>
      </div>

      {error && <div className="text-red-700 text-sm font-bold bg-red-50 border border-red-200 p-3 rounded-lg shadow-sm">{error}</div>}
      
      <Button type="submit" className="w-full h-14 text-lg font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white" disabled={disabled || isLoading} isLoading={isLoading}>
        Placer ma mise automatique
      </Button>
    </form>
  );
}
