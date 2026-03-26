import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, FilterTab, EmptyState } from '../shared';
import {
  getAllMedicines, MEDICINE_CATEGORIES, MEDICINE_FORMS,
} from '../../services/medicineService';

// ─── Medicine Card ─────────────────────────────────────────────────────────────
function MedicineCard({ med, onClick }) {
  const formColor = {
    Tablet: 'bg-brand-50 text-brand-700',
    Capsule: 'bg-violet-50 text-violet-700',
    Syrup: 'bg-teal-50 text-teal-700',
    Inhaler: 'bg-amber-50 text-amber-700',
    Sachet: 'bg-orange-50 text-orange-700',
    default: 'bg-slate-100 text-slate-600',
  };
  const fc = formColor[med.form] || formColor.default;

  return (
    <div
      className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-slide-up"
      onClick={() => onClick(med)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="font-display text-base text-slate-900">{med.brandName}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{med.genericName}</p>
        </div>
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <span className={`badge ${fc}`}>{med.form}</span>
          <span className="text-xs font-mono font-semibold text-slate-600">{med.strength}</span>
        </div>
      </div>
      <div className="space-y-1.5 text-xs border-t border-slate-50 pt-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Category</span>
          <span className="font-medium text-slate-700">{med.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Manufacturer</span>
          <span className="font-medium text-slate-600">{med.manufacturer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Common Dose</span>
          <span className="font-medium text-slate-700 text-right">{med.commonDose}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-50">
          <span className="text-slate-400">Price</span>
          <span className="font-semibold text-teal-700">₹{med.price}</span>
        </div>
      </div>
      {med.contraindications?.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-red-400 text-xs">⚠</span>
          <span className="text-xs text-red-500">{med.contraindications.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

// ─── Medicine Detail Modal ─────────────────────────────────────────────────────
function MedicineDetail({ med, onClose }) {
  if (!med) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-display text-xl text-slate-900">{med.brandName}</h3>
            <p className="text-sm text-slate-400">{med.genericName} · {med.strength}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Form',          value: med.form },
              { label: 'Strength',      value: med.strength },
              { label: 'Category',      value: med.category },
              { label: 'Manufacturer',  value: med.manufacturer },
              { label: 'Price',         value: `₹${med.price}` },
              { label: 'Common Dose',   value: med.commonDose },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {med.contraindications?.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">⚠ Contraindications</p>
              <div className="flex flex-wrap gap-1.5">
                {med.contraindications.map((c) => (
                  <span key={c} className="badge badge-red">{c}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-teal-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Standard Dosage</p>
            <p className="text-sm text-teal-800 font-medium">{med.commonDose}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Medicine DB Module ───────────────────────────────────────────────────
export default function MedicineDatabaseModule() {
  const [medicines, setMedicines] = useState([]);
  const [busy, setBusy]           = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    getAllMedicines().then(setMedicines).finally(() => setBusy(false));
  }, []);

  const displayed = medicines.filter((m) => {
    const matchS = !search ||
      m.brandName.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchC = catFilter === 'all'  || m.category === catFilter;
    const matchF = formFilter === 'all' || m.form === formFilter;
    return matchS && matchC && matchF;
  });

  if (busy) return <PageSpinner />;

  const categories = ['all', ...MEDICINE_CATEGORIES];
  const forms = ['all', ...MEDICINE_FORMS];

  return (
    <div className="space-y-5 page-enter">
      <PageHeader
        title="Medicine Database"
        subtitle={`${medicines.length} drugs in the master database`}
      />

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Total Drugs',  value: medicines.length,        bg: 'bg-brand-50',  text: 'text-brand-700'  },
          { label: 'Categories',   value: MEDICINE_CATEGORIES.length, bg: 'bg-teal-50', text: 'text-teal-700'  },
          { label: 'Forms',        value: MEDICINE_FORMS.length,   bg: 'bg-violet-50', text: 'text-violet-700' },
          { label: 'Antibiotics',  value: medicines.filter(m => m.category === 'Antibiotic').length, bg: 'bg-amber-50', text: 'text-amber-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl px-4 py-2.5 flex items-center gap-2`}>
            <span className={`text-xl font-display ${text}`}>{value}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by brand name, generic name, category…"
          className="max-w-sm"
        />
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${catFilter === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
              >
                {c === 'all' ? 'All Categories' : c}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Form</div>
          <FilterTab value={formFilter} onChange={setFormFilter} options={forms.map(f => ({ label: f === 'all' ? 'All Forms' : f, value: f }))} />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400">{displayed.length} of {medicines.length} medicines</p>

      {/* Grid */}
      {displayed.length === 0 ? (
        <EmptyState icon="lab" title="No medicines found" desc="Try a different search term or remove filters." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((m) => (
            <MedicineCard key={m.id} med={m} onClick={setSelected} />
          ))}
        </div>
      )}

      {selected && <MedicineDetail med={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
