import clsx from 'clsx';
import type { ReviewSeverity } from '@/lib/types';

const styles: Record<ReviewSeverity, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export function SeverityBadge({ severity }: { severity: ReviewSeverity }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        styles[severity],
      )}
    >
      {severity}
    </span>
  );
}
