import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/common/Icon';

const QUICK_ACCESS = [
  { role: 'superadmin', label: 'Super Admin', email: 'superadmin@medinfera.com', password: 'super@2026',  color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
  { role: 'admin',      label: 'Admin',       email: 'admin@medinfera.com',       password: 'admin@2026', color: 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100'   },
  { role: 'doctor',     label: 'Doctor',      email: 'doctor@medinfera.com',       password: 'doctor@2026',color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'     },
  { role: 'staff',      label: 'Staff',       email: 'staff@medinfera.com',        password: 'staff@2026', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
  { role: 'pharmacist', label: 'Pharmacist',  email: 'pharmacist@medinfera.com',   password: 'pharma@2026',color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
  { role: 'patient',    label: 'Patient',     email: 'patient@medinfera.com',      password: 'patient@2026',color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' },
];

const ROLE_HOME = {
  superadmin: '/superadmin', admin: '/admin', doctor: '/doctor',
  staff: '/staff', pharmacist: '/pharmacist', patient: '/patient',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [quickRole, setQuickRole] = useState(null);
  const [error, setError]       = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const doLogin = async (creds) => {
    const user = await login(creds);
    navigate(ROLE_HOME[user.role] || '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await doLogin(form); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleQuickAccess = async (acc) => {
    setError(''); setQuickRole(acc.role);
    try { await doLogin({ email: acc.email, password: acc.password }); }
    catch (err) { setError(err.message); }
    finally { setQuickRole(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-16 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span className="font-display text-xl text-white">Medinfera</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <div>
            <h2 className="font-display text-4xl text-white mb-4 leading-tight">Hospital ERP<br /><span className="text-brand-400 italic">for every role.</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">Six role-based portals — Super Admin, Admin, Doctor, Staff, Pharmacist, and Patient — each with tailored workflows and permissions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Super Admin','Admin','Doctor','Staff','Pharmacist','Patient'].map((r) => (
              <span key={r} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">{r}</span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-600">© 2026 Medinfera Health Platform</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5"><path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span className="font-display text-xl text-slate-900">Medinfera</span>
          </Link>

          <h1 className="font-display text-3xl text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">Access your role-based portal.</p>

          {/* Quick access */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Access — All Roles</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACCESS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleQuickAccess(acc)}
                  disabled={!!quickRole || loading}
                  className={`border rounded-xl px-3 py-2.5 text-xs font-medium transition-all text-left ${acc.color} disabled:opacity-50`}
                >
                  {quickRole === acc.role ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Loading…
                    </span>
                  ) : (
                    <span>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="opacity-60 truncate mt-0.5">{acc.email.split('@')[0]}</div>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or sign in with credentials</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@medinfera.com" required autoComplete="email" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <button type="button" className="text-xs text-brand-600 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input pr-11" placeholder="••••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Icon name={showPw ? 'eyeSlash' : 'eye'} className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !!quickRole} className="btn-primary w-full py-3 text-base rounded-xl">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</span> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New patient?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
