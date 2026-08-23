import { Auction, Vehicle } from '../../types';
import { Card } from '../ui/Card';
import { SaaqBadge } from '../vehicles/SaaqBadge';
import { CountdownTimer } from './CountdownTimer';
import { Link } from 'react-router-dom';

export function AuctionCard({ auction }: { auction: Auction & { vehicle?: Vehicle } }) {
  const v = auction.vehicle;
  const isLive = auction.status === 'LIVE';
  
  const secondsLeft = Math.max(0, Math.floor((new Date(auction.endsAt).getTime() - Date.now()) / 1000));

  return (
    <Link to={`/encheres/${auction.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-border bg-card group">
        <div className="relative aspect-video bg-slate-800">
          {v?.images?.[0] ? (
            <img src={v.images[0]} alt={v.make} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">Sans image</div>
          )}
          {isLive && (
            <div className="absolute top-2 right-2 bg-danger text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              EN DIRECT
            </div>
          )}
          {v && (
            <div className="absolute top-2 left-2">
              <SaaqBadge status={v.saaqStatus} size="sm" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{v?.year} {v?.make} {v?.model}</h3>
          <div className="flex justify-between items-end mt-4">
            <div>
              <div className="text-sm text-slate-400">Enchère actuelle</div>
              <div className="text-xl font-bold text-accent">{auction.currentBid} $ CAD</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 text-right">Temps restant</div>
              <CountdownTimer initialSeconds={secondsLeft} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
