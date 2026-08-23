import { Badge } from '../ui/Badge';
import { Vehicle } from '../../types';

export function SaaqBadge({ status, size = 'sm' }: { status: Vehicle['saaqStatus'], size?: 'sm' | 'md' | 'lg' }) {
  if (status === 'CLEAN') {
    return (
      <Badge variant="success" className={size === 'lg' ? 'text-lg px-4 py-2' : ''}>
        ✓ {size === 'lg' ? 'Titre Propre' : 'Propre'}
      </Badge>
    );
  }
  if (status === 'VGA') {
    return (
      <Badge variant="warning" className={size === 'lg' ? 'text-lg px-4 py-2' : ''}>
        ⚠️ {size === 'lg' ? 'VGA - Gravement Accidenté' : 'VGA'}
      </Badge>
    );
  }
  return (
    <Badge variant="danger" className={size === 'lg' ? 'text-lg px-4 py-2' : ''}>
      ✖ {size === 'lg' ? 'Irrécupérable' : 'Irrécupérable'}
    </Badge>
  );
}
