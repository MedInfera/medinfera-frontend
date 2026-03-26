import { useState } from 'react';
import Icon from '../../components/common/Icon';
import { PageHeader, Field, useToast } from '../shared';

// ─── Settings Section Wrapper ─────────────────────────────────────────────────
function SettingsSection({ title, desc, children, onSave, saving }) {
  return (
    <div className="card animate-slide-up">
      <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-display text-base text-slate-900">{title}</h3>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
        {onSave && (
          <button onClick={onSave} disabled={saving} className="btn-primary btn-sm">
            {saving ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Save'}
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-slate-200'}`}
        style={{ height: '22px' }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

// ─── Settings Sections ─────────────────────────────────────────────────────────
function SiteSettings({ show }) {
  const [form, setForm] = useState({ name: 'Medinfera General Hospital', email: 'info@medinfera.com', phone: '+91 11-1234-5678', address: '123 MG Road, New Delhi 110001', helpline: '1800-MED-HELP', timezone: 'Asia/Kolkata', currency: 'INR', logo: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); show('Site settings saved'); };
  return (
    <SettingsSection title="Site Identity" desc="Hospital name, contact info, and branding" onSave={save} saving={saving}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Hospital Name"><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" className="input" value={form.email} onChange={set('email')} /></Field>
        <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Helpline"><input className="input" value={form.helpline} onChange={set('helpline')} /></Field>
        <Field label="Timezone">
          <select className="input" value={form.timezone} onChange={set('timezone')}>
            {['Asia/Kolkata','Asia/Dubai','Europe/London','America/New_York'].map(tz => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select className="input" value={form.currency} onChange={set('currency')}>
            {['INR','USD','EUR','GBP','AED'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Address"><input className="input" value={form.address} onChange={set('address')} /></Field>
    </SettingsSection>
  );
}

function SmtpSettings({ show }) {
  const [form, setForm] = useState({ host: 'smtp.gmail.com', port: '587', username: 'noreply@medinfera.com', password: '', fromName: 'Medinfera Hospital', encryption: 'TLS' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); show('SMTP settings saved'); };
  const test = async () => { setTesting(true); await new Promise(r => setTimeout(r, 1200)); setTesting(false); show('Test email sent successfully', 'success'); };
  return (
    <SettingsSection title="Email / SMTP" desc="Configure outgoing email server" onSave={save} saving={saving}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="SMTP Host"><input className="input" value={form.host} onChange={set('host')} placeholder="smtp.gmail.com" /></Field>
        <Field label="Port"><input className="input" value={form.port} onChange={set('port')} placeholder="587" /></Field>
        <Field label="Username"><input className="input" value={form.username} onChange={set('username')} /></Field>
        <Field label="Password"><input type="password" className="input" value={form.password} onChange={set('password')} placeholder="••••••••" /></Field>
        <Field label="From Name"><input className="input" value={form.fromName} onChange={set('fromName')} /></Field>
        <Field label="Encryption">
          <select className="input" value={form.encryption} onChange={set('encryption')}><option>TLS</option><option>SSL</option><option>None</option></select>
        </Field>
      </div>
      <button onClick={test} disabled={testing} className="btn-secondary btn-sm gap-1.5">
        {testing ? <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" /> : <Icon name="bell" className="w-3.5 h-3.5" />}
        {testing ? 'Sending…' : 'Send Test Email'}
      </button>
    </SettingsSection>
  );
}

function ZoomSettings({ show }) {
  const [form, setForm] = useState({ apiKey: 'your_zoom_api_key', apiSecret: '', sdkKey: '', sdkSecret: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); show('Zoom credentials saved'); };
  return (
    <SettingsSection title="Zoom / Telemedicine" desc="Credentials for online appointment video calls" onSave={save} saving={saving}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="API Key" hint="From Zoom Developer Console"><input className="input font-mono text-xs" value={form.apiKey} onChange={set('apiKey')} /></Field>
        <Field label="API Secret"><input type="password" className="input font-mono text-xs" value={form.apiSecret} onChange={set('apiSecret')} placeholder="••••••••••••" /></Field>
        <Field label="SDK Key"><input className="input font-mono text-xs" value={form.sdkKey} onChange={set('sdkKey')} /></Field>
        <Field label="SDK Secret"><input type="password" className="input font-mono text-xs" value={form.sdkSecret} onChange={set('sdkSecret')} placeholder="••••••••••••" /></Field>
      </div>
    </SettingsSection>
  );
}

function PaymentSettings({ show }) {
  const [gateways, setGateways] = useState({
    paypal:    { enabled: true,  key: 'sandbox_key',  secret: '' },
    stripe:    { enabled: true,  key: 'pk_test_key',  secret: '' },
    sslcommerz:{ enabled: false, key: '',              secret: '' },
    bank:      { enabled: true,  key: '',              secret: '' },
  });
  const [saving, setSaving] = useState(false);
  const toggle = (gw) => setGateways((prev) => ({ ...prev, [gw]: { ...prev[gw], enabled: !prev[gw].enabled } }));
  const setKey = (gw, field) => (e) => setGateways((prev) => ({ ...prev, [gw]: { ...prev[gw], [field]: e.target.value } }));
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); show('Payment gateways saved'); };

  return (
    <SettingsSection title="Payment Gateways" desc="Configure online payment methods" onSave={save} saving={saving}>
      {[
        { key: 'paypal',     label: 'PayPal',           hasKey: true },
        { key: 'stripe',     label: 'Stripe',           hasKey: true },
        { key: 'sslcommerz', label: 'SSLCommerz',       hasKey: true },
        { key: 'bank',       label: 'Bank Deposit',     hasKey: false },
      ].map(({ key, label, hasKey }) => (
        <div key={key} className="border border-slate-100 rounded-xl p-4 space-y-3">
          <Toggle
            label={label}
            desc={gateways[key].enabled ? 'Active' : 'Disabled'}
            value={gateways[key].enabled}
            onChange={() => toggle(key)}
          />
          {gateways[key].enabled && hasKey && (
            <div className="grid grid-cols-2 gap-3">
              <input className="input text-xs font-mono" value={gateways[key].key} onChange={setKey(key, 'key')} placeholder="API Key / Client ID" />
              <input type="password" className="input text-xs font-mono" value={gateways[key].secret} onChange={setKey(key, 'secret')} placeholder="Secret Key" />
            </div>
          )}
        </div>
      ))}
    </SettingsSection>
  );
}

function LanguageSettings({ show }) {
  const [langs] = useState([
    { code: 'en', name: 'English',  dir: 'LTR', active: true,  default: true  },
    { code: 'hi', name: 'Hindi',    dir: 'LTR', active: true,  default: false },
    { code: 'ar', name: 'Arabic',   dir: 'RTL', active: false, default: false },
    { code: 'ur', name: 'Urdu',     dir: 'RTL', active: false, default: false },
  ]);
  return (
    <SettingsSection title="Languages" desc="Manage multilingual support and RTL/LTR direction">
      <div className="space-y-2">
        {langs.map((l) => (
          <div key={l.code} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{l.name}</span>
                {l.default && <span className="badge badge-blue">Default</span>}
                <span className={`badge ${l.dir === 'RTL' ? 'badge-purple' : 'badge-slate'}`}>{l.dir}</span>
                <span className={`badge ${l.active ? 'badge-green' : 'badge-slate'}`}>{l.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Code: {l.code.toUpperCase()}</div>
            </div>
            <button className="text-brand-600 hover:text-brand-800 text-xs font-medium">Translate</button>
          </div>
        ))}
      </div>
      <button onClick={() => show('Language added (mock)')} className="btn-secondary btn-sm gap-1.5">
        <Icon name="plus" className="w-3.5 h-3.5" /> Add Language
      </button>
    </SettingsSection>
  );
}

function RolesSettings({ show }) {
  const ROLES = [
    { name: 'Super Admin',    perms: ['All permissions'], count: 1 },
    { name: 'Hospital Admin', perms: ['Manage doctors', 'Manage patients', 'View reports', 'CMS control'], count: 2 },
    { name: 'Doctor',         perms: ['View appointments', 'Write prescriptions', 'Manage own patients'], count: 18 },
    { name: 'Staff',          perms: ['Approve appointments', 'Manage beds', 'Dispatch ambulance'], count: 24 },
    { name: 'Patient',        perms: ['Book appointments', 'View prescriptions', 'Make payments'], count: 1842 },
  ];
  return (
    <SettingsSection title="Roles & Permissions" desc="User roles and their access levels">
      <div className="space-y-3">
        {ROLES.map((r) => (
          <div key={r.name} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                <span className="badge badge-slate">{r.count} users</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.perms.map((p) => <span key={p} className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{p}</span>)}
              </div>
            </div>
            <button className="text-brand-600 hover:text-brand-800 text-xs font-medium flex-shrink-0">Edit</button>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

// ─── Main Settings Module ─────────────────────────────────────────────────────
export default function SettingsModule() {
  const TABS = [
    { key: 'site',     label: 'Site Identity', icon: 'hospital'  },
    { key: 'smtp',     label: 'Email / SMTP',  icon: 'bell'      },
    { key: 'zoom',     label: 'Zoom / Video',  icon: 'eye'       },
    { key: 'payments', label: 'Payments',      icon: 'payment'   },
    { key: 'languages',label: 'Languages',     icon: 'star'      },
    { key: 'roles',    label: 'Roles',         icon: 'users'     },
  ];
  const [tab, setTab] = useState('site');
  const { show, ToastEl } = useToast();

  return (
    <div className="space-y-6 page-enter">
      {ToastEl}
      <PageHeader title="Settings" subtitle="Configure your hospital system" />

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-slate-100 pb-0">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name={icon} className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'site'      && <SiteSettings     show={show} />}
      {tab === 'smtp'      && <SmtpSettings     show={show} />}
      {tab === 'zoom'      && <ZoomSettings     show={show} />}
      {tab === 'payments'  && <PaymentSettings  show={show} />}
      {tab === 'languages' && <LanguageSettings show={show} />}
      {tab === 'roles'     && <RolesSettings    show={show} />}
    </div>
  );
}
