import { STATUS_LABELS, STATUS_BADGE } from '@/lib/dashboard';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const badge = STATUS_BADGE[status] || 'badge-gray';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`badge ${badge} ${className}`}>
      {label}
    </span>
  );
}
