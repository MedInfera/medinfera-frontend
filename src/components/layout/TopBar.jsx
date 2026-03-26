import { useState } from 'react';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_PROFILE = { admin: '/admin/profile', doctor: '/doctor/profile', patient: '/patient/profile' };

export default function TopBar({ title, subtitle, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const NOTIFS = [
    { id: 1, text: 'New appointment booked by Ravi Mehta', time: '2 min ago',  unread: true  },
    { id: 2, text: 'Payment ₹800 received from Aisha Nair',  time: '15 min ago', unread: true  },
    { id: 3, text: 'Dr. Ritu Agarwal marked on leave',       time: '1 hr ago',   unread: false },
  ];
  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const goToProfile = () => {
    setShowUserMenu(false);
    const path = ROLE_PROFILE[user?.role] || '/';
    navigate(path);
  };

  const closeAll = () => { setShowNotifs(false); setShowUserMenu(false); };

  return (
    <header className="h-14 border-b border-slate-100 bg-white flex items-center px-4 md:px-6 gap-3 sticky top-0 z-10 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <Icon name="menu" className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {title    && <h1 className="text-base font-display text-slate-900 leading-tight truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Hospital chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-lg text-xs text-brand-700 font-medium">
          <Icon name="hospital" className="w-3.5 h-3.5" />
          <span className="truncate max-w-[140px]">{user?.hospital}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Icon name="bell" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                <span className="badge badge-blue">{unreadCount} new</span>
              </div>
              <div>
                {NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-brand-50/30' : ''}`}
                    onClick={closeAll}
                  >
                    <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center">
                <button className="text-xs text-brand-600 font-medium hover:underline" onClick={closeAll}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Avatar name={user?.name || `${user?.first_name||''} ${user?.last_name||''}`.trim()} size="sm" />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-700 leading-tight max-w-[100px] truncate">{user?.name || `${user?.first_name||''} ${user?.last_name||''}`.trim()}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
            </div>
            <Icon name="chevronDown" className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-slide-up">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="text-sm font-semibold text-slate-800 truncate">{user?.name || `${user?.first_name||''} ${user?.last_name||''}`.trim()}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                <span className="badge badge-blue mt-1.5 capitalize">{user?.role}</span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Icon name="settings" className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <Icon name="logout" className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close dropdowns */}
      {(showNotifs || showUserMenu) && (
        <div className="fixed inset-0 z-10" onClick={closeAll} />
      )}
    </header>
  );
}
