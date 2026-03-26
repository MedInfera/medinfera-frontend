import { useState, useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader } from '../shared';
import {
  getKPISummary, getMonthlyRevenue, getDoctorPerformance,
  getServiceBreakdown, getPatientGrowth, getBedOccupancyTrend,
  getAppointmentTypeBreakdown,
} from '../../services/reportsService';

// ─── Mini bar chart (pure SVG, no dependency) ─────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = '#0f87e8', height = 120, formatValue }) {
  if (!data || data.length === 0) return null;
  const max   = Math.max(...data.map((d) => d[valueKey])) || 1;
  const w     = 580;
  const barW  = Math.floor(w / data.length) - 6;
  const fmt   = formatValue || ((v) => v);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 32}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.round((d[valueKey] / max) * height);
        const x    = i * (barW + 6) + 3;
        const y    = height - barH;
        const cx   = x + barW / 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} fillOpacity="0.85" />
            <text x={cx} y={y - 4} textAnchor="middle" fontSize="9" fill="#64748b">{fmt(d[valueKey])}</text>
            <text x={cx} y={height + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{d[labelKey]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Dual bar chart (new vs returning patients) ────────────────────────────────
function DualBarChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.new + d.returning)) || 1;
  const w      = 580;
  const grpW   = Math.floor(w / data.length);
  const barW   = Math.floor(grpW * 0.35);
  const gap    = 4;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 32}`} className="overflow-visible">
      {data.map((d, i) => {
        const cx    = i * grpW + grpW / 2;
        const newH  = Math.round((d.new      / maxVal) * height);
        const retH  = Math.round((d.returning/ maxVal) * height);
        const x1    = cx - barW - gap / 2;
        const x2    = cx + gap / 2;
        return (
          <g key={i}>
            <rect x={x1} y={height - newH}  width={barW} height={newH}  rx="3" fill="#0f87e8" fillOpacity="0.85" />
            <rect x={x2} y={height - retH}  width={barW} height={retH}  rx="3" fill="#1aa183" fillOpacity="0.75" />
            <text x={cx} y={height + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, growth, icon, color = 'blue' }) {
  const colorMap = {
    blue:   { bg: 'bg-brand-50',  ic: 'text-brand-500'  },
    teal:   { bg: 'bg-teal-50',   ic: 'text-teal-500'   },
    amber:  { bg: 'bg-amber-50',  ic: 'text-amber-500'  },
    violet: { bg: 'bg-violet-50', ic: 'text-violet-500' },
    red:    { bg: 'bg-red-50',    ic: 'text-red-500'    },
    green:  { bg: 'bg-emerald-50',ic: 'text-emerald-500'},
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="card animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon name={icon} className={`w-5 h-5 ${c.ic}`} />
        </div>
        {growth !== undefined && (
          <span className={`text-xs font-semibold ${growth >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
            {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-display text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-base text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main Reports Module ───────────────────────────────────────────────────────
export default function ReportsModule() {
  const [kpi, setKpi]               = useState(null);
  const [revenue, setRevenue]       = useState([]);
  const [docPerf, setDocPerf]       = useState([]);
  const [services, setServices]     = useState([]);
  const [patGrowth, setPatGrowth]   = useState([]);
  const [bedTrend, setBedTrend]     = useState([]);
  const [apptTypes, setApptTypes]   = useState([]);
  const [busy, setBusy]             = useState(true);
  const [period, setPeriod]         = useState('March 2026');

  useEffect(() => {
    Promise.all([
      getKPISummary(), getMonthlyRevenue(), getDoctorPerformance(),
      getServiceBreakdown(), getPatientGrowth(), getBedOccupancyTrend(),
      getAppointmentTypeBreakdown(),
    ]).then(([k, r, d, s, pg, bt, at]) => {
      setKpi(k); setRevenue(r); setDocPerf(d); setServices(s);
      setPatGrowth(pg); setBedTrend(bt); setApptTypes(at);
    }).finally(() => setBusy(false));
  }, []);

  if (busy) return <PageSpinner />;

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue)) || 1;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Hospital performance overview for March 2026"
        action={
          <div className="flex items-center gap-2">
            <select className="input text-sm py-2 w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {['January 2026','February 2026','March 2026'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <button className="btn-secondary btn-sm gap-1.5">
              <Icon name="prescription" className="w-4 h-4" /> Export
            </button>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Month Revenue"       value={`₹${(kpi.monthRevenue/1000).toFixed(0)}K`} growth={kpi.revenueGrowth}       icon="payment"     color="teal"   />
        <KPICard label="Appointments"        value={kpi.totalAppointments}                       growth={kpi.appointmentGrowth}   icon="calendar"    color="blue"   />
        <KPICard label="New Patients"        value={kpi.newPatients}                             growth={kpi.patientGrowth}       icon="users"       color="violet" />
        <KPICard label="Avg Bed Occupancy"   value={`${kpi.avgBedOccupancy}%`}                  growth={kpi.bedOccupancyChange}  icon="bed"         color="amber"  />
        <KPICard label="Avg Doctor Rating"   value={`★ ${kpi.avgRating}`}                       icon="star"                      color="green"      />
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <Section title="Monthly Revenue" subtitle="Last 6 months vs target">
          <BarChart
            data={revenue}
            valueKey="revenue"
            labelKey="month"
            color="#0f87e8"
            formatValue={(v) => `₹${(v/1000).toFixed(0)}K`}
          />
        </Section>

        {/* Patient growth */}
        <Section title="Patient Growth" subtitle="New vs returning patients">
          <div className="flex gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500" />New</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500" />Returning</div>
          </div>
          <DualBarChart data={patGrowth} />
        </Section>

        {/* Bed occupancy trend */}
        <Section title="Bed Occupancy Trend" subtitle="Monthly occupancy percentage">
          <BarChart
            data={bedTrend}
            valueKey="occupancy"
            labelKey="month"
            color="#1aa183"
            formatValue={(v) => `${v}%`}
          />
        </Section>

        {/* Appointment type */}
        <Section title="Appointment Types">
          <div className="space-y-4">
            {apptTypes.map((t) => (
              <div key={t.type}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{t.type}</span>
                  <span className="text-slate-500">{t.count} · {t.percentage}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${t.type === 'Online' ? 'bg-brand-400' : 'bg-teal-400'}`}
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Doctor performance table */}
      <Section title="Doctor Performance" subtitle="This month">
        <div className="table-wrapper border border-slate-100">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Appointments</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {docPerf.map((d) => (
                <tr key={d.name}>
                  <td className="text-sm font-medium text-slate-800">{d.name}</td>
                  <td className="text-xs text-slate-500">{d.specialization}</td>
                  <td className="text-sm text-slate-700">{d.appointments}</td>
                  <td className="text-sm font-semibold text-slate-700">₹{d.revenue.toLocaleString('en-IN')}</td>
                  <td className="text-sm text-amber-500 font-medium">★ {d.rating}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${d.satisfaction >= 95 ? 'bg-teal-500' : d.satisfaction >= 90 ? 'bg-brand-400' : 'bg-amber-400'}`}
                          style={{ width: `${d.satisfaction}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{d.satisfaction}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Service breakdown */}
      <Section title="Revenue by Service">
        <div className="space-y-3">
          {services.sort((a, b) => b.revenue - a.revenue).map((s) => {
            const maxRev = Math.max(...services.map((x) => x.revenue)) || 1;
            const pct = Math.round((s.revenue / maxRev) * 100);
            return (
              <div key={s.service} className="flex items-center gap-4">
                <div className="w-28 text-xs text-slate-600 font-medium truncate flex-shrink-0">{s.service}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-slate-500 w-20 text-right flex-shrink-0">
                  ₹{(s.revenue / 1000).toFixed(0)}K · {s.count} pts
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
