import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5 px-3 h-14">
      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <div className="font-display text-lg text-slate-900 leading-none">Medinfera</div>
          <div className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">Hospital ERP</div>
        </div>
      )}
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, collapsed, end: isEnd }) {
  return (
    <NavLink
      to={to}
      end={isEnd}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon name={icon} className="w-4.5 h-4.5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar({ navGroups }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-200
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 pr-2 flex-shrink-0">
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="section-title">{group.title}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} collapsed={collapsed} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name || `${user?.first_name||''} ${user?.last_name||''}`.trim()} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">{user?.name || `${user?.first_name||''} ${user?.last_name||''}`.trim()}</div>
              <div className="text-xs text-slate-400 truncate capitalize">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <Icon name="logout" className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
