import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, useToast } from '../shared';
import Icon from '../../components/common/Icon';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS_MORNING   = ['09:00','09:30','10:00','10:30','11:00','11:30'];
const SLOTS_AFTERNOON = ['02:00','02:30','03:00','03:30','04:00','04:30','05:00'];

const INIT_SCHEDULE = {
  Monday:    { active: true,  start: '09:00', end: '17:00', slots: 12, offDay: false },
  Tuesday:   { active: true,  start: '09:00', end: '17:00', slots: 12, offDay: false },
  Wednesday: { active: true,  start: '09:00', end: '17:00', slots: 12, offDay: false },
  Thursday:  { active: true,  start: '10:00', end: '16:00', slots: 8,  offDay: false },
  Friday:    { active: true,  start: '09:00', end: '14:00', slots: 6,  offDay: false },
  Saturday:  { active: false, start: '10:00', end: '13:00', slots: 4,  offDay: false },
  Sunday:    { active: false, start: '',      end: '',       slots: 0,  offDay: true  },
};

const UPCOMING_APPTS = [
  { id: 1, patient: 'Aisha Nair',   time: '09:00 AM', date: '2026-03-21', type: 'Online',  status: 'confirmed' },
  { id: 2, patient: 'Ravi Mehta',   time: '10:30 AM', date: '2026-03-21', type: 'Offline', status: 'pending'   },
  { id: 3, patient: 'Deepak Singh', time: '02:00 PM', date: '2026-03-21', type: 'Online',  status: 'confirmed' },
  { id: 4, patient: 'Pooja Das',    time: '03:30 PM', date: '2026-03-21', type: 'Offline', status: 'confirmed' },
  { id: 5, patient: 'Geeta Pillai', time: '09:00 AM', date: '2026-03-22', type: 'Online',  status: 'pending'   },
  { id: 6, patient: 'Manish Gupta', time: '11:00 AM', date: '2026-03-22', type: 'Offline', status: 'confirmed' },
];

export default function ScheduleModule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(INIT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [saving, setSaving] = useState(false);
  const { show, ToastEl } = useToast();

  const toggleDay = (day) => {
    setSchedule((s) => ({
      ...s,
      [day]: { ...s[day], active: !s[day].active },
    }));
  };

  const setField = (day, field, value) => {
    setSchedule((s) => ({
      ...s,
      [day]: { ...s[day], [field]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    show('Schedule saved successfully');
  };

  const dayData = schedule[selectedDay];
  const today = UPCOMING_APPTS.filter((a) => a.date === '2026-03-21');
  const tomorrow = UPCOMING_APPTS.filter((a) => a.date === '2026-03-22');

  return (
    <div className="space-y-6 page-enter">
      {ToastEl}
      <PageHeader
        title="My Schedule"
        subtitle={`${user?.specialization || 'Doctor'} · Weekly availability management`}
        action={
          <button onClick={save} disabled={saving} className="btn-primary btn-sm gap-1.5">
            {saving ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Icon name="check" className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Schedule'}
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-display text-base text-slate-900 mb-4">Weekly Availability</h3>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const d = schedule[day];
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div className="w-24 flex-shrink-0">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-brand-700' : 'text-slate-700'}`}>{day}</span>
                    </div>
                    <div className="flex-1">
                      {d.active ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{d.start} – {d.end}</span>
                          <span className="badge badge-blue">{d.slots} slots</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">{d.offDay ? 'Day off' : 'Not available'}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDay(day); }}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${d.active ? 'bg-teal-500' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day settings */}
          {dayData.active && (
            <div className="card animate-slide-up">
              <h3 className="font-display text-base text-slate-900 mb-4">{selectedDay} — Settings</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={dayData.start} onChange={(e) => setField(selectedDay, 'start', e.target.value)} />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={dayData.end} onChange={(e) => setField(selectedDay, 'end', e.target.value)} />
                </div>
                <div>
                  <label className="label">Max Slots</label>
                  <input type="number" className="input" value={dayData.slots} onChange={(e) => setField(selectedDay, 'slots', Number(e.target.value))} min="1" max="30" />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Available Time Slots (preview)</label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {[...SLOTS_MORNING, ...SLOTS_AFTERNOON].slice(0, dayData.slots).map((slot) => (
                    <span key={slot} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg font-medium border border-teal-200">{slot}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-display text-base text-slate-900 mb-4">Today's Appointments</h3>
            {today.length ? (
              <div className="space-y-3">
                {today.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'confirmed' ? 'bg-teal-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{a.patient}</div>
                      <div className="text-xs text-slate-400">{a.time} · {a.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 text-center py-4">No appointments today</p>}
          </div>

          <div className="card">
            <h3 className="font-display text-base text-slate-900 mb-4">Tomorrow</h3>
            {tomorrow.length ? (
              <div className="space-y-3">
                {tomorrow.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'confirmed' ? 'bg-teal-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{a.patient}</div>
                      <div className="text-xs text-slate-400">{a.time} · {a.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 text-center py-4">No appointments</p>}
          </div>

          {/* Summary card */}
          <div className="card bg-gradient-to-br from-brand-600 to-brand-700 !border-0 text-white">
            <div className="text-xs text-brand-200 font-medium mb-3">This Week Summary</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Slots', value: Object.values(schedule).reduce((s, d) => s + (d.active ? d.slots : 0), 0) },
                { label: 'Active Days', value: Object.values(schedule).filter((d) => d.active).length },
                { label: 'Booked', value: 24 },
                { label: 'Available', value: Object.values(schedule).reduce((s, d) => s + (d.active ? d.slots : 0), 0) - 24 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-xl px-3 py-2">
                  <div className="text-xl font-display">{value}</div>
                  <div className="text-xs text-brand-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
