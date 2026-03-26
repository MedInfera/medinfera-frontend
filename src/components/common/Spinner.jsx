export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size] || 'w-6 h-6';
  return (
    <div
      className={`${s} rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Spinner size="lg" />
      <span className="text-sm text-slate-400">Loading…</span>
    </div>
  );
}
