import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, FormModal, Field, FilterTab, SearchBar, EmptyState, useToast } from '../shared';
import {
  getAmbulances, getDrivers, getTrips,
  dispatchAmbulance, completeTrip, cancelTrip,
  getAmbulanceSummary, calculateBill,
  AMBULANCE_TYPES, AMBULANCE_STATUSES, TRIP_REQUEST_TYPES, TRIP_STATUSES, TRIP_PAYMENT_STATUSES,
} from '../../services/ambulanceService';

// Schema-exact status configs — UPPERCASE enum values
const AMB_STATUS_CFG = {
  AVAILABLE:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   label: 'Available'    },
  ON_TRIP:     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'On Trip'      },
  MAINTENANCE: { bg: 'bg-slate-100', text: 'text-slate-500',  border: 'border-slate-200',  label: 'Maintenance'  },
  OFF_DUTY:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Off Duty'     },
};

const TRIP_STATUS_CFG = {
  REQUESTED:   { cls: 'badge-amber',  label: 'Requested'    },
  DISPATCHED:  { cls: 'badge-blue',   label: 'Dispatched'   },
  ARRIVED:     { cls: 'badge-purple', label: 'Arrived'      },
  PICKED_UP:   { cls: 'badge-purple', label: 'Picked Up'    },
  TRANSPORTING:{ cls: 'badge-red',    label: 'Transporting' },
  COMPLETED:   { cls: 'badge-green',  label: 'Completed'    },
  CANCELLED:   { cls: 'badge-red',    label: 'Cancelled'    },
};

const TYPE_LABEL = { BLS: 'BLS', ALS: 'ALS', PATIENT_TRANSPORT: 'Patient Transport', ICU_AMBULANCE: 'ICU Ambulance' };

// ─── Dispatch Form — aligned to ambulance_trips table ─────────────────────────
function DispatchForm({ ambulances, drivers, onClose, onDispatched }) {
  const [form, setForm] = useState({
    ambulance_id: '',
    driver_id: '',
    request_type: 'EMERGENCY',      // EMERGENCY | TRANSFER | DISCHARGE
    requested_by: '',
    pickup_location: '',
    destination_location: '',
    patient_id: '',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const availAmbs    = ambulances.filter((a) => a.status === 'AVAILABLE');
  const activeDrivers = drivers.filter((d) => d.status === 'active' || d.is_active);

  const submit = async () => {
    if (!form.ambulance_id || !form.driver_id || !form.pickup_location || !form.destination_location) {
      setErr('Ambulance, driver, pickup location and destination are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      await dispatchAmbulance({
        ambulance_id: Number(form.ambulance_id),
        driver_id: Number(form.driver_id),
        request_type: form.request_type,
        requested_by: form.requested_by,
        pickup_location: form.pickup_location,
        destination_location: form.destination_location,
        patient_id: form.patient_id ? Number(form.patient_id) : null,
        notes: form.notes || null,
      });
      onDispatched('Ambulance dispatched successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal title="Dispatch Ambulance" onClose={onClose} onSubmit={submit} loading={busy} submitLabel="Dispatch Now" wide>
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Dispatch Details</div>
          <div className="space-y-4">
            <Field label="Request Type" required>
              <select className="input" value={form.request_type} onChange={set('request_type')}>
                {TRIP_REQUEST_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Ambulance" required>
              <select className="input" value={form.ambulance_id} onChange={set('ambulance_id')}>
                <option value="">Select ambulance…</option>
                {availAmbs.map((a) => (
                  <option key={a.id} value={a.id}>{a.vehicle_number} — {TYPE_LABEL[a.type] || a.type} (₹{a.base_charge} base + ₹{a.per_km_charge}/km)</option>
                ))}
              </select>
              {availAmbs.length === 0 && <p className="text-xs text-red-500 mt-1">No ambulances available</p>}
            </Field>
            <Field label="Driver" required>
              <select className="input" value={form.driver_id} onChange={set('driver_id')}>
                <option value="">Select driver…</option>
                {activeDrivers.map((d) => <option key={d.id} value={d.id}>{d.first_name} {d.last_name} — {d.license_number}</option>)}
              </select>
            </Field>
            <Field label="Requested By" hint="Name of person requesting the ambulance">
              <input className="input" value={form.requested_by} onChange={set('requested_by')} placeholder="Patient name or relative name" />
            </Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Location Details</div>
          <div className="space-y-4">
            <Field label="Pickup Location" required>
              <textarea className="input resize-none" rows={2} value={form.pickup_location} onChange={set('pickup_location')} placeholder="Full address — house/flat no., street, area, city" />
            </Field>
            <Field label="Destination Location" required>
              <textarea className="input resize-none" rows={2} value={form.destination_location} onChange={set('destination_location')} placeholder="Full address of destination" />
            </Field>
            <Field label="Patient ID" hint="If patient is registered in system">
              <input type="number" className="input" value={form.patient_id} onChange={set('patient_id')} placeholder="Leave blank if not registered" />
            </Field>
            <Field label="Notes">
              <input className="input" value={form.notes} onChange={set('notes')} placeholder="Special instructions, medical condition, urgency level" />
            </Field>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Complete Trip Form — aligned to ambulance_trips table ────────────────────
function CompleteTripForm({ trip, ambulance, onClose, onCompleted }) {
  const [form, setForm] = useState({ distance_km: '', waiting_minutes: '0', additional_charges: '0', notes: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const perKm    = ambulance?.per_km_charge || 25;
  const perHour  = ambulance?.waiting_charge_per_hour || 100;
  const base     = trip.base_charge || 500;
  const distCharge  = Number(form.distance_km || 0) * perKm;
  const waitCharge  = Math.round(Number(form.waiting_minutes || 0) / 60) * perHour;
  const addCharge   = Number(form.additional_charges || 0);
  const totalAmount = base + distCharge + waitCharge + addCharge;

  const submit = async () => {
    if (!form.distance_km) { setErr('Distance is required.'); return; }
    setErr(''); setBusy(true);
    try {
      await completeTrip(trip.id, { distance_km: Number(form.distance_km), waiting_minutes: Number(form.waiting_minutes || 0), additional_charges: Number(form.additional_charges || 0), notes: form.notes || null });
      onCompleted('Trip completed successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal title={`Complete Trip — ${trip.trip_number}`} onClose={onClose} onSubmit={submit} loading={busy} submitLabel="Complete Trip">
      <div className="space-y-4">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{err}</div>}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Distance (km)" required><input type="number" step="0.1" className="input" value={form.distance_km} onChange={set('distance_km')} placeholder="0.0" min="0" /></Field>
          <Field label="Waiting (minutes)"><input type="number" className="input" value={form.waiting_minutes} onChange={set('waiting_minutes')} placeholder="0" min="0" /></Field>
        </div>
        <Field label="Additional Charges (₹)" hint="Toll, extra services, etc.">
          <input type="number" className="input" value={form.additional_charges} onChange={set('additional_charges')} placeholder="0" min="0" />
        </Field>
        <Field label="Notes"><input className="input" value={form.notes} onChange={set('notes')} placeholder="Any additional notes" /></Field>
        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5">
          <div className="font-semibold text-slate-700 mb-2">Billing Breakdown</div>
          {[['Base charge', `₹${base}`], [`Distance (${form.distance_km||0} km × ₹${perKm})`, `₹${distCharge.toFixed(0)}`], [`Waiting (${form.waiting_minutes||0} min)`, `₹${waitCharge.toFixed(0)}`], ['Additional charges', `₹${addCharge}`]].map(([l,v]) => (
            <div key={l} className="flex justify-between text-slate-500"><span>{l}</span><span>{v}</span></div>
          ))}
          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2"><span>Total Amount</span><span>₹{totalAmount.toFixed(0)}</span></div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Ambulance Card ────────────────────────────────────────────────────────────
function AmbulanceCard({ amb }) {
  const cfg = AMB_STATUS_CFG[amb.status] || AMB_STATUS_CFG.AVAILABLE;
  return (
    <div className={`card border-2 ${cfg.border} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-slate-800">{amb.vehicle_number}</div>
          <div className="text-xs text-slate-500 mt-0.5">{TYPE_LABEL[amb.type] || amb.type}</div>
          {amb.make_model && <div className="text-xs text-slate-400 mt-0.5">{amb.make_model} {amb.year_of_manufacture ? `(${amb.year_of_manufacture})` : ''}</div>}
        </div>
        <span className={`badge ${amb.status === 'AVAILABLE' ? 'badge-green' : amb.status === 'ON_TRIP' ? 'badge-red' : amb.status === 'MAINTENANCE' ? 'badge-slate' : 'badge-amber'}`}>{cfg.label}</span>
      </div>

      {/* Equipment flags */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {amb.has_oxygen       && <span className="badge badge-blue text-[10px]">O₂</span>}
        {amb.has_defibrillator && <span className="badge badge-red text-[10px]">Defib</span>}
        {amb.has_ventilator   && <span className="badge badge-purple text-[10px]">Ventilator</span>}
      </div>

      {/* Charges */}
      <div className="text-xs text-slate-500 space-y-0.5 border-t border-slate-100 pt-3">
        <div className="flex justify-between"><span>Base Charge</span><span className="font-medium text-slate-700">₹{amb.base_charge}</span></div>
        <div className="flex justify-between"><span>Per KM</span><span className="font-medium text-slate-700">₹{amb.per_km_charge}/km</span></div>
        <div className="flex justify-between"><span>Waiting/hr</span><span className="font-medium text-slate-700">₹{amb.waiting_charge_per_hour}/hr</span></div>
        {amb.insurance_expiry && <div className="flex justify-between"><span>Insurance</span><span className="text-slate-600">{amb.insurance_expiry}</span></div>}
        {amb.permit_expiry    && <div className="flex justify-between"><span>Permit</span><span className="text-slate-600">{amb.permit_expiry}</span></div>}
      </div>
    </div>
  );
}

// ─── Main Module ───────────────────────────────────────────────────────────────
export default function AmbulanceModule() {
  const [ambs, setAmbs]         = useState([]);
  const [drivers, setDrivers]   = useState([]);
  const [trips, setTrips]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [busy, setBusy]         = useState(true);
  const [tab, setTab]           = useState('fleet');
  const [showDispatch, setShowDispatch] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const { show, ToastEl }       = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [a, d, t, s] = await Promise.all([getAmbulances(), getDrivers(), getTrips(), getAmbulanceSummary()]);
    setAmbs(a); setDrivers(d); setTrips(t); setSummary(s);
    setBusy(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAction = (msg) => { show(msg); setShowDispatch(false); setCompletingTrip(null); load(); };

  const activeTrips = trips.filter((t) => !['COMPLETED','CANCELLED'].includes(t.status));

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader
        title="Ambulance Management"
        subtitle={`${summary?.total || 0} vehicles · ${summary?.available || 0} available · ${summary?.active_trips || 0} active trips`}
        action={<button className="btn-primary btn-sm gap-1.5" onClick={() => setShowDispatch(true)}><Icon name="plus" className="w-4 h-4"/>Dispatch Ambulance</button>}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Available',    value: summary?.available,    bg: 'bg-teal-50',   text: 'text-teal-700'   },
          { label: 'On Trip',      value: summary?.on_trip,      bg: 'bg-red-50',    text: 'text-red-700'    },
          { label: 'Maintenance',  value: summary?.maintenance,  bg: 'bg-slate-100', text: 'text-slate-700'  },
          { label: 'Active Trips', value: summary?.active_trips, bg: 'bg-amber-50',  text: 'text-amber-700'  },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl px-4 py-3 text-center`}>
            <div className={`text-2xl font-display ${text}`}>{value ?? 0}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Active trips alert */}
      {activeTrips.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="ambulance" className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">{activeTrips.length} active trip{activeTrips.length > 1 ? 's' : ''} in progress</span>
          </div>
          <div className="space-y-2">
            {activeTrips.map((t) => {
              const cfg = TRIP_STATUS_CFG[t.status] || { cls: 'badge-slate', label: t.status };
              return (
                <div key={t.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className={`badge ${cfg.cls} flex-shrink-0`}>{cfg.label}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{t.trip_number}</div>
                    <div className="text-xs text-slate-500 truncate">{t.pickup_location} → {t.destination_location}</div>
                  </div>
                  <button onClick={() => setCompletingTrip(t)} className="btn-sm btn-primary text-xs flex-shrink-0">Complete</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {[['fleet','Fleet'], ['trips','Trip History'], ['drivers','Drivers']].map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{lbl}</button>
        ))}
      </div>

      {/* Fleet tab */}
      {tab === 'fleet' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambs.map((a) => <AmbulanceCard key={a.id} amb={a} />)}
        </div>
      )}

      {/* Trips tab */}
      {tab === 'trips' && (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip #</th><th>Request Type</th><th>Pickup</th><th>Destination</th>
                  <th>Distance</th><th>Status</th><th>Payment</th><th>Total</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => {
                  const cfg = TRIP_STATUS_CFG[t.status] || { cls: 'badge-slate', label: t.status };
                  const total = t.base_charge + (t.distance_charge || 0) + (t.waiting_charge || 0) + (t.additional_charges || 0);
                  return (
                    <tr key={t.id}>
                      <td className="text-xs font-mono text-slate-500">{t.trip_number}</td>
                      <td><span className={`badge ${t.request_type === 'EMERGENCY' ? 'badge-red' : t.request_type === 'TRANSFER' ? 'badge-blue' : 'badge-slate'}`}>{t.request_type}</span></td>
                      <td className="text-xs text-slate-500 max-w-[130px] truncate">{t.pickup_location}</td>
                      <td className="text-xs text-slate-500 max-w-[130px] truncate">{t.destination_location}</td>
                      <td className="text-xs text-slate-600">{t.distance_km ? `${t.distance_km} km` : '—'}</td>
                      <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                      <td><span className={`badge ${t.payment_status === 'PAID' ? 'badge-green' : t.payment_status === 'INSURANCE' ? 'badge-blue' : 'badge-amber'}`}>{t.payment_status}</span></td>
                      <td className="text-sm font-semibold text-teal-700">₹{total.toFixed(0)}</td>
                      <td>
                        {!['COMPLETED','CANCELLED'].includes(t.status) && (
                          <button onClick={() => setCompletingTrip(t)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Complete</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drivers tab */}
      {tab === 'drivers' && (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead><tr><th>Driver</th><th>License #</th><th>License Expiry</th><th>Experience</th><th>Shift</th><th>Status</th></tr></thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={`${d.first_name} ${d.last_name}`} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{d.first_name} {d.last_name}</div>
                          <div className="text-xs text-slate-400">{d.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-slate-500">{d.license_number}</td>
                    <td className="text-xs text-slate-500">{d.license_expiry}</td>
                    <td className="text-xs text-slate-600">{d.experience_years}y</td>
                    <td><span className="badge badge-slate">{d.shift}</span></td>
                    <td><span className={`badge ${d.is_active ? (d.status === 'on-trip' ? 'badge-red' : 'badge-green') : 'badge-slate'}`}>{d.status === 'on-trip' ? 'On Trip' : d.is_active ? 'Active' : 'Off Duty'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDispatch && (
        <DispatchForm ambulances={ambs} drivers={drivers} onClose={() => setShowDispatch(false)} onDispatched={handleAction} />
      )}
      {completingTrip && (
        <CompleteTripForm
          trip={completingTrip}
          ambulance={ambs.find((a) => a.id === completingTrip.ambulance_id)}
          onClose={() => setCompletingTrip(null)}
          onCompleted={handleAction}
        />
      )}
    </div>
  );
}
