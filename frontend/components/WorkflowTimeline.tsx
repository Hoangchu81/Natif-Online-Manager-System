import { WORKFLOW_STEPS, getWorkflowIndex, STATUS_LABELS } from '@/lib/dashboard';

interface WorkflowTimelineProps {
  currentStatus: string;
  className?: string;
}

export default function WorkflowTimeline({ currentStatus, className = '' }: WorkflowTimelineProps) {
  const currentIndex = getWorkflowIndex(currentStatus);
  const isRejected = currentStatus === 'rejected' || currentStatus === 'dept_rejected';
  const isReturned = currentStatus === 'returned';

  return (
    <div className={`flex items-center gap-0 ${className}`}>
      {WORKFLOW_STEPS.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        let dotClass = 'bg-gray-200';
        let lineClass = 'bg-gray-200';
        let textClass = 'text-gray-400';

        if (isRejected) {
          if (idx < currentIndex && idx < 8) {
            dotClass = 'bg-red-400';
            textClass = 'text-red-600';
          } else if (idx === currentIndex) {
            dotClass = 'bg-red-500 ring-4 ring-red-100';
            textClass = 'text-red-700 font-semibold';
          }
        } else if (isReturned) {
          if (idx < currentIndex && idx < 8) {
            dotClass = 'bg-amber-400';
            textClass = 'text-amber-600';
          } else if (idx === currentIndex) {
            dotClass = 'bg-amber-500 ring-4 ring-amber-100';
            textClass = 'text-amber-700 font-semibold';
          }
        } else {
          if (isPast) {
            dotClass = 'bg-green-500';
            textClass = 'text-green-700';
          }
          if (isCurrent) {
            dotClass = 'bg-natif-blue ring-4 ring-natif-blue/20';
            textClass = 'text-natif-blue font-semibold';
          }
        }

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${dotClass} shrink-0`} />
              <span className={`text-[10px] mt-1.5 whitespace-nowrap ${textClass}`}>
                {step.label}
              </span>
            </div>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-0.5 ${isPast && !isRejected && !isReturned ? 'bg-green-400' : lineClass}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SimpleWorkflowBadgeProps {
  currentStatus: string;
}

export function SimpleWorkflowBadge({ currentStatus }: SimpleWorkflowBadgeProps) {
  const label = STATUS_LABELS[currentStatus] || currentStatus;
  const idx = getWorkflowIndex(currentStatus);
  const total = WORKFLOW_STEPS.length - 1;
  const pct = Math.round((idx / total) * 100);

  let barColor = 'bg-natif-blue';
  if (currentStatus === 'rejected' || currentStatus === 'dept_rejected') barColor = 'bg-red-500';
  if (currentStatus === 'returned') barColor = 'bg-amber-500';
  if (currentStatus === 'approved') barColor = 'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
