import { formatLocale } from '../../i18n';
import { ArrowUpRight, Fuel, Gauge, MapPin } from 'lucide-react';
import { Vehicle, Auction } from '../../types';
import { Card } from '../ui/Card';
import { SaaqBadge } from './SaaqBadge';
import { CountdownTimer } from '../auctions/CountdownTimer';
import { Link } from 'react-router-dom';

const vehicleImage = (images?: string | string[]) => {
  if (Array.isArray(images)) return images[0];
  return images?.startsWith('[') ? JSON.parse(images)[0] : images;
};

export function VehicleCard({ vehicle, auction }: { vehicle: Vehicle, auction?: Auction }) {
  const activeAuction = auction || vehicle.auctions?.[0];
  const isLive = activeAuction?.status === 'LIVE';
  return <Link to={`/vehicules/${vehicle.id}`} className="group block h-full"><Card className="flex h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100"><img src={vehicleImage(vehicle.images)} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div className="absolute left-3 top-3"><SaaqBadge status={vehicle.saaqStatus} /></div>{isLive && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> EN DIRECT</span>}</div>
    <div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lot disponible</p><h3 className="mt-1 text-lg font-extrabold leading-tight text-primary">{vehicle.year} {vehicle.make} {vehicle.model}</h3></div><ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-accent" /></div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-medium text-slate-600"><span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-slate-400" />{vehicle.mileage?.toLocaleString(formatLocale())} km</span><span className="flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5 text-slate-400" />{vehicle.fuelType}</span><span className="col-span-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{vehicle.location || 'Québec, Canada'}</span></div>
      <div className="mt-5 border-t pt-4">{activeAuction ? <div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mise actuelle</p><p className="mt-1 text-xl font-extrabold text-primary">{activeAuction.currentBid.toLocaleString(formatLocale())} <span className="text-sm">$</span></p></div>{isLive && <CountdownTimer initialSeconds={Math.max(0, Math.floor((new Date(activeAuction.endsAt || activeAuction.scheduledEndAt || Date.now()).getTime() - Date.now()) / 1000))} />}</div> : <p className="text-sm font-bold text-accent">Consulter le véhicule →</p>}</div>
    </div>
  </Card></Link>;
}
