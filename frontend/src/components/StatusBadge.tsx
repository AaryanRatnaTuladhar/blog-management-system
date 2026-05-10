export function StatusBadge({ status }: { status?: string }) {
  const value = status || 'draft';
  return <span className={`badge ${value}`}>{value}</span>;
}
