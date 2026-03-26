// ─── Skeleton Loading Components ─────────────────────────────────────────────

function Skel({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="card !p-0">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
        <Skel className="h-6 w-40" />
        <Skel className="h-5 w-16 rounded-full" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Skel className="w-7 h-7 rounded-full" />
              <Skel className="h-4 w-24" />
            </div>
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <Skel key={j} className={`h-4 ${j === cols - 2 ? 'w-16 rounded-full' : 'w-20'} flex-shrink-0`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-center gap-3">
            <Skel className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skel className="h-4 w-3/4" />
              <Skel className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <div className="flex justify-between"><Skel className="h-3 w-20" /><Skel className="h-3 w-16" /></div>
            <div className="flex justify-between"><Skel className="h-3 w-24" /><Skel className="h-3 w-12" /></div>
            <div className="flex justify-between"><Skel className="h-3 w-16" /><Skel className="h-3 w-20" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-center justify-between">
            <Skel className="h-3 w-24" />
            <Skel className="w-9 h-9 rounded-xl" />
          </div>
          <Skel className="h-8 w-20" />
          <Skel className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting */}
      <div className="space-y-2">
        <Skel className="h-7 w-64" />
        <Skel className="h-4 w-48" />
      </div>
      {/* Stats */}
      <StatsSkeleton count={4} />
      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={4} cols={5} />
        </div>
        <div className="card space-y-4">
          <Skel className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skel className="w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skel className="h-3 w-full" />
                <Skel className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skel;
