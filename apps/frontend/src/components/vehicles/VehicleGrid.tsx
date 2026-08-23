import { Vehicle, Auction } from '../../types';
import { VehicleCard } from './VehicleCard';
import { VehicleCardSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

export function VehicleGrid({ vehicles, auctions = [], isLoading }: { vehicles: Vehicle[], auctions?: Auction[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return <EmptyState title="Aucun véhicule trouvé" description="Essayez de modifier vos filtres de recherche." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map(v => (
        <VehicleCard key={v.id} vehicle={v} auction={auctions.find(a => a.vehicleId === v.id)} />
      ))}
    </div>
  );
}
