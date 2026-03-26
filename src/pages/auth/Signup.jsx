// ─── Patient Self-Registration — aligned to users + patients tables ───────────
// users columns: first_name, last_name, email, phone, alternate_phone,
//                profile_photo, preferred_language
// patients columns: date_of_birth NOT NULL, gender CHECK(MALE|FEMALE|OTHER),
//                   blood_group, allergies jsonb, chronic_diseases jsonb,
//                   current_medications jsonb, emergency_contact_*
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/common/Icon';

// Schema-exact enum values (patients.gender CHECK constraint)
const GENDER_OPTIONS    = ['MALE', 'FEMALE', 'OTHER'];
// Schema-exact blood_group values
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
// users.preferred_language
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi'   },
  { value: 'ta', label: 'Tamil'   },
  { value: 'te', label: 'Telugu'  },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
];
// patients.emergency_contact_relation
const RELATION_OPTIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian', 'Other'];

export default function Signup() {
  const { signup }  = useAuth();
  const navigate    = useNavigate();

  // ── All fields match exact DB column names ────────────────────────────────
  const [form, setForm] = useState({
    // users table
    first_name:        '',
    last_name:         '',
    email:             '',
    phone:             '',
    alternate_phone:   '',
    profile_photo:     null,          // users.profile_photo
    preferred_language:'en',          // users.preferred_language DEFAULT 'en'
    password:          '',
    confirm:           '',
    // patients table
    date_of_birth:     '',            // patients.date_of_birth NOT NULL
    gender:            'MALE',        // patients.gender CHECK: MALE|FEMALE|OTHER
    blood_group:       'UNKNOWN',     // patients.blood_group DEFAULT 'UNKNOWN'
    // jsonb arrays — entered as comma-separated text, split on submit
    allergies_text:           '',     // → patients.allergies jsonb
    chronic_diseases_text:    '',     // → patients.chronic_diseases jsonb
    current_medications_text: '',     // → patients.current_medications jsonb
    // patients.emergency_contact_*
    emergency_contact_name:     '',
    emergency_contact_phone:    '',
    emergency_contact_relation: 'Spouse',
  });

  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [agreed, setAgreed]   = useState(false);
  const [step, setStep]       = useState(1); // 1 = account, 2 = medical

  const set   = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toArr = (text) => (text || '').split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreed)                              { setError('Please accept the Terms & Conditions to continue.'); return; }
    if (!form.first_name)                     { setError('First name is required.'); return; }
    if (!form.phone)                          { setError('Phone number is required.'); return; }
    if (!form.date_of_birth)                  { setError('Date of birth is required.'); return; }
    if (form.password !== form.confirm)       { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)             { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await signup({
        // users table
        first_name:        form.first_name,
        last_name:         form.last_name,
        email:             form.email,
        phone:             form.phone,
        alternate_phone:   form.alternate_phone,
        profile_photo:     form.profile_photo,
        preferred_language:form.preferred_language,
        password:          form.password,
        // patients table
        date_of_birth:     form.date_of_birth,
        gender:            form.gender,
        blood_group:       form.blood_group,
        allergies:           toArr(form.allergies_text),
        chronic_diseases:    toArr(form.chronic_diseases_text),
        current_medications: toArr(form.current_medications_text),
        emergency_contact_name:     form.emergency_contact_name,
        emergency_contact_phone:    form.emergency_contact_phone,
        emergency_contact_relation: form.emergency_contact_relation,
      });
      navigate('/patient');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength] || '';
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-teal-400', 'bg-teal-500'][strength] || '';

  const SectionTitle = ({ children }) => (
    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">{children}</div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-xl text-slate-900">Medinfera</span>
          </Link>
          <h1 className="font-display text-3xl text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Patient self-registration. Doctors & staff are added by admins.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${step >= n ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{n}</div>
              <div className="text-xs text-slate-500 font-medium">{n === 1 ? 'Account & Personal' : 'Medical Details'}</div>
              {n < 2 && <div className={`flex-1 h-px ${step > n ? 'bg-brand-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {error && (
            <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-fade-in">
              <Icon name="close" className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                {/* ── users table fields ── */}
                <SectionTitle>Personal Information (users table)</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name <span className="text-red-500">*</span></label>
                    <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="First name" required />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" />
                  </div>
                  <div>
                    <label className="label">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98100 00000" required autoComplete="tel" />
                  </div>
                </div>

                <div>
                  <label className="label">Alternate Phone</label>
                  <input type="tel" className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98100 00000 (optional)" />
                </div>

                <div>
                  <label className="label">Preferred Language</label>
                  <select className="input" value={form.preferred_language} onChange={set('preferred_language')}>
                    {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>

                {/* ── patients table fields ── */}
                <SectionTitle>Patient Details (patients table)</SectionTitle>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} required />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select className="input" value={form.gender} onChange={set('gender')}>
                      {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Blood Group</label>
                    <select className="input" value={form.blood_group} onChange={set('blood_group')}>
                      {BLOOD_GROUP_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <SectionTitle>Account Security</SectionTitle>
                <div>
                  <label className="label">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} className="input pr-11" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Icon name={showPw ? 'eyeSlash' : 'eye'} className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-200'}`} />)}
                      </div>
                      <p className="text-xs text-slate-500">{strengthLabel} password</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} className={`input pr-10 ${form.confirm && form.confirm !== form.password ? 'border-red-300' : ''}`} value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" required autoComplete="new-password" />
                    {form.confirm && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {form.confirm === form.password ? <Icon name="check" className="w-4 h-4 text-teal-500" /> : <span className="text-red-400 text-sm">✕</span>}
                      </span>
                    )}
                  </div>
                </div>

                <button type="button" onClick={() => { if (!form.first_name || !form.phone || !form.date_of_birth) { setError('First name, phone, and date of birth are required.'); return; } setError(''); setStep(2); }} className="btn-primary w-full mt-2">
                  Continue to Medical Details →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {/* ── patients.allergies / chronic_diseases / current_medications ── */}
                <SectionTitle>Clinical Data (patients table — jsonb arrays)</SectionTitle>

                <div>
                  <label className="label">Known Allergies</label>
                  <input className="input" value={form.allergies_text} onChange={set('allergies_text')} placeholder="e.g. Penicillin, Aspirin, Latex (comma-separated)" />
                  <p className="text-xs text-slate-400 mt-1">Stored as patients.allergies jsonb</p>
                </div>
                <div>
                  <label className="label">Chronic Diseases</label>
                  <input className="input" value={form.chronic_diseases_text} onChange={set('chronic_diseases_text')} placeholder="e.g. Hypertension, Diabetes Type 2 (comma-separated)" />
                  <p className="text-xs text-slate-400 mt-1">Stored as patients.chronic_diseases jsonb</p>
                </div>
                <div>
                  <label className="label">Current Medications</label>
                  <input className="input" value={form.current_medications_text} onChange={set('current_medications_text')} placeholder="e.g. Amlodipine 5mg OD, Metformin 500mg BD" />
                  <p className="text-xs text-slate-400 mt-1">Stored as patients.current_medications jsonb</p>
                </div>

                {/* ── patients.emergency_contact_* ── */}
                <SectionTitle>Emergency Contact (patients.emergency_contact_*)</SectionTitle>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Contact Name</label>
                    <input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="label">Contact Phone</label>
                    <input type="tel" className="input" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="+91 98100 00000" />
                  </div>
                  <div>
                    <label className="label">Relation</label>
                    <select className="input" value={form.emergency_contact_relation} onChange={set('emergency_contact_relation')}>
                      {RELATION_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group mt-2">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors ${agreed ? 'bg-brand-600 border-brand-600' : 'border-slate-300 group-hover:border-brand-400'}`}>
                      {agreed && <Icon name="check" className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed">
                    I agree to the <button type="button" className="text-brand-600 hover:underline font-medium">Terms of Service</button> and <button type="button" className="text-brand-600 hover:underline font-medium">Privacy Policy</button>
                  </span>
                </label>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base rounded-xl">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account…
                      </span>
                    ) : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
