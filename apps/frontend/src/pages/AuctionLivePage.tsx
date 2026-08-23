import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuctionStore } from '../store/auction.store';
import { useAuthStore } from '../store/auth.store';
import { Card } from '../components/ui/Card';
import { CountdownTimer } from '../components/auctions/CountdownTimer';
import { BidHistory } from '../components/auctions/BidHistory';
import { BidForm } from '../components/auctions/BidForm';

function estimateTransport(location: string) {
  if (!location) return "Sur devis";
  const loc = location.toLowerCase();
  if (loc.includes('montreal') || loc.includes('montréal')) return "150 $";
  if (loc.includes('quebec') || loc.includes('québec')) return "300 $";
  if (loc.includes('toronto') || loc.includes('ontario')) return "500 $";
  if (loc.includes('new york') || loc.includes('ny')) return "900 $";
  return "Sur devis";
}

export default function AuctionLivePage() {
  const { id } = useParams<{ id: string }>();
  const { currentAuction: auction, bids, remainingSeconds, fetchAuction, placeBid, subscribeToAuction, unsubscribeFromAuction } = useAuctionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchAuction(id);
      subscribeToAuction(id);
      return () => unsubscribeFromAuction();
    }
  }, [id, fetchAuction, subscribeToAuction, unsubscribeFromAuction]);

  if (!auction) return <div className="p-8 text-center text-slate-500">Chargement de l'enchère...</div>;

  const isLive = auction.status === 'ACTIVE' || auction.status === 'LIVE';
  const myLastBid = bids.find((b: any) => b.userId === user?.id);
  const amIWinning = myLastBid && myLastBid.status === 'WINNING';
  
  const serverSeconds = remainingSeconds > 0 ? remainingSeconds : Math.max(0, Math.floor((new Date(auction.scheduledEndAt || auction.endsAt).getTime() - Date.now()) / 1000));

  const transportCost = estimateTransport(auction.vehicle?.location);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden relative border border-slate-200 shadow-sm">
             {auction.vehicle?.images ? (
              <img src={auction.vehicle.images[0]} alt="Véhicule" className="w-full h-full object-cover" />
             ) : (
               <span className="text-slate-400 font-medium">Image non disponible</span>
             )}
             {isLive && (
               <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-mono text-xl font-bold flex items-center gap-2 shadow-lg border border-red-500">
                  <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                  EN DIRECT
               </div>
             )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{auction.vehicle?.year} {auction.vehicle?.make} {auction.vehicle?.model}</h1>
              <p className="text-slate-500 mt-2 font-medium">NIV: {auction.vehicle?.vin} • Emplacement: {auction.vehicle?.location}</p>
            </div>
            <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm px-4 py-2 rounded-md flex items-center gap-2 font-semibold shadow-sm">
              🚛 Transport estimé : {transportCost}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white border-blue-100 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mise actuelle</h2>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1 font-semibold">Temps restant</div>
                <CountdownTimer 
                  initialSeconds={serverSeconds} 
                  serverSeconds={serverSeconds} 
                  onEnd={() => fetchAuction(id!)} 
                />
              </div>
            </div>
            
            <div className="text-5xl font-extrabold text-blue-700 mb-6">{auction.currentBid} $</div>
            
            {myLastBid && (
               <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner">
                  <span className="text-sm font-semibold text-slate-700">Votre statut</span>
                  {amIWinning ? (
                    <span className="bg-green-100 text-green-800 border border-green-200 text-sm px-3 py-1 rounded-full font-bold shadow-sm">OFFRE GAGNANTE</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 border border-red-200 text-sm px-3 py-1 rounded-full font-bold shadow-sm">SURENCHÉRI</span>
                  )}
               </div>
            )}

            <div className="space-y-4">
              <BidForm 
                currentBid={auction.currentBid}
                startingBid={auction.startingBid || 0}
                onBidPlaced={(amount) => placeBid(id!, amount)} 
                disabled={!isLive || serverSeconds <= 0} 
              />
            </div>
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col h-96 bg-white border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Historique des offres</h3>
              <span className="text-xs font-semibold text-slate-500">{bids.length} offres</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <BidHistory bids={bids} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
