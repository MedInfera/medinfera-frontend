// Generates a colored avatar from initials
const COLORS = [
  'bg-brand-500', 'bg-teal-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-emerald-500',
];

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const color    = getColor(name);
  const initials = getInitials(name);
  const sizeCls  = sizeMap[size] || sizeMap.md;

  return (
    <span className={`avatar ${color} ${sizeCls} ${className}`}>
      {initials}
    </span>
  );
}
