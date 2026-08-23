import { Bid } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { enCA, fr } from 'date-fns/locale';
import { useLocaleStore } from '../../store/locale.store';

export function BidHistory({ bids }: { bids: Bid[] }) {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <div className="flex flex-col gap-2">
      {bids.map((bid, i) => (
        <div key={bid.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {bid.userId?.substring(0, 2).toUpperCase() || 'AN'}
            </div>
            <div className="flex flex-col">
              <span className="font-bold">{bid.actualBidAmount || bid.amount} $ CAD</span>
              <span className="text-xs text-slate-400">
                {locale === 'fr' ? 'il y a ' : ''}{formatDistanceToNow(new Date(bid.timestamp || bid.createdAt), { locale: locale === 'fr' ? fr : enCA, addSuffix: locale === 'en' })}
              </span>
            </div>
          </div>
          {i === 0 && <Badge variant="success">Gagnant</Badge>}
        </div>
      ))}
      {bids.length === 0 && (
        <div className="text-center p-4 text-slate-500">Aucune offre pour le moment</div>
      )}
    </div>
  );
}
