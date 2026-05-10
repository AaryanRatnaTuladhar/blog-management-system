import type { BlogStatus } from '@/lib/types';

const labels: Record<BlogStatus, string> = {
  draft: 'Draft',
  pending: 'Pending review',
  approved: 'Published',
  rejected: 'Rejected',
};

export function StatusBadge({ status }: { status?: BlogStatus | string }) {
  const value = (status || 'draft') as BlogStatus;
  return <span className={`badge ${value}`}>{labels[value] || value}</span>;
}
