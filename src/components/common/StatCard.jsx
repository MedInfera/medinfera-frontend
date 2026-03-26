import Icon from './Icon';

export default function StatCard({ label, value, icon, trend, trendLabel, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue:   { bg: 'bg-brand-50',  text: 'text-brand-600',   icon: 'text-brand-500'  },
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',    icon: 'text-teal-500'   },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',   icon: 'text-amber-500'  },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',     icon: 'text-red-500'    },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600',  icon: 'text-violet-500' },
    green:  { bg: 'bg-emerald-50',text: 'text-emerald-600', icon: 'text-emerald-500'},
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon name={icon} className={`w-4.5 h-4.5 ${c.icon}`} />
        </div>
      </div>

      <div className="stat-value">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={trend >= 0 ? 'text-teal-600 font-medium' : 'text-red-500 font-medium'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-400">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
