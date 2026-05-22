import { STATUS_LABELS, STATUS_BADGE } from '@/lib/dashboard';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Workflow status badge — uses design system badge-workflow classes.
 * Falls back to badge-gray for unknown statuses.
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const badgeClass = STATUS_BADGE[status] || 'badge badge-gray';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`${badgeClass} ${className}`}>
      {label}
    </span>
  );
}
