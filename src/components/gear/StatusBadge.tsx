import { GearStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: GearStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors: Record<GearStatus, string> = {
    'available': 'bg-green-500 text-white',
    'in-use': 'bg-orange-500 text-white',
    'archived': 'bg-gray-500 text-white',
    'maintenance': 'bg-blue-500 text-white',
    'broken': 'bg-red-500 text-white',
  };

  const statusLabels: Record<GearStatus, string> = {
    'available': 'Available',
    'in-use': 'In Use',
    'archived': 'Archived',
    'maintenance': 'Maintenance',
    'broken': 'Broken',
  };

  return (
    <Badge className={cn(statusColors[status], className)}>
      {statusLabels[status]}
    </Badge>
  );
}
