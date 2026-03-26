import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, EmptyState, FormModal, Field, useToast } from '../shared';
import {
  getSliders, getServices, getNews, getGallery, getFaqs, getTestimonials,
  getSubscribers, getMenus, getLanguages,
  createSlider, updateSlider, deleteSlider,
  createService, updateService, deleteService,
  createNews, updateNews, deleteNews,
  createFaq, updateFaq, deleteFaq,
  createTestimonial, updateTestimonial, deleteTestimonial,
  addMenuItem, toggleLanguage,
  NEWS_CATEGORIES, GALLERY_SECTIONS,
} from '../../services/cmsService';

// ─── Generic CRUD Table ───────────────────────────────────────────────────────
function CrudTable({ columns, rows, onEdit, onDelete, loading }) {
  if (loading) return <PageSpinner />;
  if (!rows.length) return <EmptyState icon="prescription" title="No items yet" desc="Add your first item above." />;
  return (
    <div className="card !p-0">
      <div className="table-wrapper border-0">
        <table className="data-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row[c.key], row) : (
                      <span className="text-sm text-slate-700">{String(row[c.key] ?? '—').slice(0, 60)}</span>
                    )}
                  </td>
                ))}
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(row)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                    <button onClick={() => onDelete(row.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Status Toggle Badge ──────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const active = value === 'active' || value === 'published' || value === true;
  return <span className={`badge ${active ? 'badge-green' : 'badge-slate'}`}>{active ? (value === 'published' ? 'Published' : 'Active') : (value === 'draft' ? 'Draft' : 'Inactive')}</span>;
}

// ─── Sliders Section ──────────────────────────────────────────────────────────
function SlidersSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }   = useToast();
  const blank = { title: '', subtitle: '', buttonText: 'Book Now', link: '/', status: 'active', order: 1 };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setBusy(true); setItems(await getSliders()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const openNew  = () => { setEditing(null); setForm(blank); setShowForm(true); };

  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await updateSlider(editing.id, form);
      else await createSlider(form);
      show(editing ? 'Slider updated' : 'Slider created');
      setShowForm(false); load();
    } catch (e) { show(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => { await deleteSlider(id); show('Slider deleted'); load(); };

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex justify-end"><button onClick={openNew} className="btn-primary btn-sm gap-1.5"><Icon name="plus" className="w-4 h-4"/>Add Slider</button></div>
      <CrudTable
        loading={busy}
        rows={items}
        columns={[
          { key: 'order', label: '#' },
          { key: 'title', label: 'Title' },
          { key: 'subtitle', label: 'Subtitle' },
          { key: 'buttonText', label: 'Button' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
        ]}
        onEdit={openEdit} onDelete={remove}
      />
      {showForm && (
        <FormModal title={editing ? 'Edit Slider' : 'New Slider'} onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <div className="space-y-4">
            <Field label="Title" required><input className="input" value={form.title} onChange={set('title')} placeholder="Hero headline" /></Field>
            <Field label="Subtitle"><input className="input" value={form.subtitle} onChange={set('subtitle')} placeholder="Supporting text" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Button Text"><input className="input" value={form.buttonText} onChange={set('buttonText')} /></Field>
              <Field label="Link URL"><input className="input" value={form.link} onChange={set('link')} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Order"><input type="number" className="input" value={form.order} onChange={set('order')} min="1" /></Field>
              <Field label="Status"><select className="input" value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────
function ServicesSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }   = useToast();
  const blank = { title: '', icon: '🏥', description: '', status: 'active' };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setBusy(true); setItems(await getServices()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await updateService(editing.id, form); else await createService(form);
      show(editing ? 'Service updated' : 'Service added'); setShowForm(false); load();
    } catch (e) { show(e.message, 'error'); } finally { setSaving(false); }
  };
  const remove = async (id) => { await deleteService(id); show('Service deleted'); load(); };

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="btn-primary btn-sm gap-1.5"><Icon name="plus" className="w-4 h-4"/>Add Service</button></div>
      <CrudTable loading={busy} rows={items}
        columns={[
          { key: 'icon', label: 'Icon' },
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
        ]}
        onEdit={openEdit} onDelete={remove}
      />
      {showForm && (
        <FormModal title={editing ? 'Edit Service' : 'New Service'} onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Field label="Icon (emoji)"><input className="input text-2xl" value={form.icon} onChange={set('icon')} /></Field>
              <div className="col-span-3"><Field label="Title" required><input className="input" value={form.title} onChange={set('title')} /></Field></div>
            </div>
            <Field label="Description"><textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} /></Field>
            <Field label="Status"><select className="input" value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── News / Blog Section ──────────────────────────────────────────────────────
function NewsSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }   = useToast();
  const blank = { title: '', excerpt: '', category: 'Hospital News', date: new Date().toISOString().split('T')[0], status: 'draft', author: 'Admin' };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setBusy(true); setItems(await getNews()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await updateNews(editing.id, form); else await createNews(form);
      show(editing ? 'Post updated' : 'Post created'); setShowForm(false); load();
    } catch (e) { show(e.message, 'error'); } finally { setSaving(false); }
  };
  const remove = async (id) => { await deleteNews(id); show('Post deleted'); load(); };

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="btn-primary btn-sm gap-1.5"><Icon name="plus" className="w-4 h-4"/>New Post</button></div>
      <CrudTable loading={busy} rows={items}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'category', label: 'Category', render: (v) => <span className="badge badge-blue">{v}</span> },
          { key: 'author', label: 'Author' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
        ]}
        onEdit={openEdit} onDelete={remove}
      />
      {showForm && (
        <FormModal title={editing ? 'Edit Post' : 'New Post'} onClose={() => setShowForm(false)} onSubmit={submit} loading={saving} wide>
          <div className="space-y-4">
            <Field label="Title" required><input className="input" value={form.title} onChange={set('title')} /></Field>
            <Field label="Excerpt"><textarea className="input resize-none" rows={3} value={form.excerpt} onChange={set('excerpt')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category"><select className="input" value={form.category} onChange={set('category')}>{NEWS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Date"><input type="date" className="input" value={form.date} onChange={set('date')} /></Field>
            </div>
            <Field label="Status"><select className="input" value={form.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option></select></Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── FAQs Section ─────────────────────────────────────────────────────────────
function FaqsSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }   = useToast();
  const blank = { question: '', answer: '', category: 'General', order: 1 };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setBusy(true); setItems(await getFaqs()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await updateFaq(editing.id, form); else await createFaq(form);
      show(editing ? 'FAQ updated' : 'FAQ added'); setShowForm(false); load();
    } catch (e) { show(e.message, 'error'); } finally { setSaving(false); }
  };
  const remove = async (id) => { await deleteFaq(id); show('FAQ deleted'); load(); };

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="btn-primary btn-sm gap-1.5"><Icon name="plus" className="w-4 h-4"/>Add FAQ</button></div>
      <CrudTable loading={busy} rows={items}
        columns={[
          { key: 'order', label: '#' },
          { key: 'question', label: 'Question' },
          { key: 'category', label: 'Category', render: (v) => <span className="badge badge-slate">{v}</span> },
        ]}
        onEdit={openEdit} onDelete={remove}
      />
      {showForm && (
        <FormModal title={editing ? 'Edit FAQ' : 'New FAQ'} onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <div className="space-y-4">
            <Field label="Question" required><input className="input" value={form.question} onChange={set('question')} /></Field>
            <Field label="Answer" required><textarea className="input resize-none" rows={4} value={form.answer} onChange={set('answer')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category"><select className="input" value={form.category} onChange={set('category')}>{['General','Appointments','Billing','Emergency'].map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Order"><input type="number" className="input" value={form.order} onChange={set('order')} min="1" /></Field>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────
function TestimonialsSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }   = useToast();
  const blank = { name: '', role: 'Patient', content: '', rating: 5, status: 'active' };
  const [form, setForm]     = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { setBusy(true); setItems(await getTestimonials()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };
  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await updateTestimonial(editing.id, form); else await createTestimonial(form);
      show(editing ? 'Updated' : 'Added'); setShowForm(false); load();
    } catch (e) { show(e.message, 'error'); } finally { setSaving(false); }
  };
  const remove = async (id) => { await deleteTestimonial(id); show('Deleted'); load(); };

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="btn-primary btn-sm gap-1.5"><Icon name="plus" className="w-4 h-4"/>Add Testimonial</button></div>
      <CrudTable loading={busy} rows={items}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'Role' },
          { key: 'rating', label: 'Rating', render: (v) => <span className="text-amber-500 font-medium">{'★'.repeat(v)}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge value={v} /> },
        ]}
        onEdit={openEdit} onDelete={remove}
      />
      {showForm && (
        <FormModal title={editing ? 'Edit Testimonial' : 'New Testimonial'} onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" required><input className="input" value={form.name} onChange={set('name')} /></Field>
              <Field label="Role"><input className="input" value={form.role} onChange={set('role')} /></Field>
            </div>
            <Field label="Content"><textarea className="input resize-none" rows={3} value={form.content} onChange={set('content')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Rating (1–5)"><select className="input" value={form.rating} onChange={set('rating')}>{[1,2,3,4,5].map((r) => <option key={r} value={r}>{r} ★</option>)}</select></Field>
              <Field label="Status"><select className="input" value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── Subscribers Section ──────────────────────────────────────────────────────
function SubscribersSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const { show, ToastEl }   = useToast();

  const load = useCallback(async () => { setBusy(true); setItems(await getSubscribers()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const active = items.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="bg-teal-50 rounded-xl px-4 py-2.5 text-center"><div className="text-2xl font-display text-teal-700">{active}</div><div className="text-xs text-slate-500">Active</div></div>
          <div className="bg-slate-100 rounded-xl px-4 py-2.5 text-center"><div className="text-2xl font-display text-slate-700">{items.length}</div><div className="text-xs text-slate-500">Total</div></div>
        </div>
        <button onClick={() => show('Newsletter sent to all active subscribers!', 'success')} className="btn-primary btn-sm gap-1.5">
          <Icon name="bell" className="w-4 h-4" /> Send Newsletter
        </button>
      </div>
      {busy ? <PageSpinner /> : (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead><tr><th>Email</th><th>Subscribed</th><th>Status</th></tr></thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td className="text-sm font-medium text-slate-800">{s.email}</td>
                    <td className="text-xs text-slate-500">{s.date}</td>
                    <td><StatusBadge value={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Menus Section ────────────────────────────────────────────────────────────
function MenusSection() {
  const [menus, setMenus]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [newItem, setNewItem] = useState({ label: '', url: '' });
  const { show, ToastEl }   = useToast();

  const load = useCallback(async () => { setBusy(true); const m = await getMenus(); setMenus(m); setActiveMenu(m[0]?.id || null); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const selectedMenu = menus.find((m) => m.id === activeMenu);

  const addItem = async () => {
    if (!newItem.label || !newItem.url) return;
    await addMenuItem(activeMenu, newItem);
    show('Menu item added'); setNewItem({ label: '', url: '' }); load();
  };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="flex gap-2">
        {menus.map((m) => (
          <button key={m.id} onClick={() => setActiveMenu(m.id)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeMenu === m.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{m.name}</button>
        ))}
      </div>
      {selectedMenu && (
        <div className="card">
          <h3 className="font-display text-base text-slate-900 mb-4">{selectedMenu.name}</h3>
          <div className="space-y-2 mb-4">
            {selectedMenu.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Icon name="menu" className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800 flex-1">{item.label}</span>
                <span className="text-xs text-slate-400 font-mono">{item.url}</span>
                <span className="text-xs text-slate-400">#{item.order}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <input className="input flex-1" value={newItem.label} onChange={(e) => setNewItem((n) => ({ ...n, label: e.target.value }))} placeholder="Label (e.g. Home)" />
            <input className="input flex-1" value={newItem.url} onChange={(e) => setNewItem((n) => ({ ...n, url: e.target.value }))} placeholder="URL (e.g. /home)" />
            <button onClick={addItem} className="btn-primary btn-sm gap-1.5 flex-shrink-0"><Icon name="plus" className="w-4 h-4"/>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Languages Section ────────────────────────────────────────────────────────
function LanguagesSection() {
  const [items, setItems]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const { show, ToastEl }   = useToast();

  const load = useCallback(async () => { setBusy(true); setItems(await getLanguages()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    const lang = items.find((l) => l.id === id);
    if (lang?.isDefault) { show('Cannot deactivate default language', 'error'); return; }
    await toggleLanguage(id);
    show('Language status updated'); load();
  };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      {ToastEl}
      <div className="card !p-0">
        <div className="table-wrapper border-0">
          <table className="data-table">
            <thead><tr><th>Language</th><th>Code</th><th>Direction</th><th>Default</th><th>Completion</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id}>
                  <td className="text-sm font-medium text-slate-800">{l.name}</td>
                  <td className="text-xs font-mono uppercase text-slate-500">{l.code}</td>
                  <td><span className={`badge ${l.direction === 'RTL' ? 'badge-purple' : 'badge-slate'}`}>{l.direction}</span></td>
                  <td>{l.isDefault ? <span className="badge badge-blue">Default</span> : '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-teal-400 rounded-full" style={{ width: `${l.completionPct}%` }} /></div>
                      <span className="text-xs text-slate-500">{l.completionPct}%</span>
                    </div>
                  </td>
                  <td><StatusBadge value={l.isActive ? 'active' : 'inactive'} /></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => toggle(l.id)} className={`text-xs font-medium ${l.isActive ? 'text-red-500 hover:text-red-700' : 'text-teal-600 hover:text-teal-800'}`}>{l.isActive ? 'Deactivate' : 'Activate'}</button>
                      {l.completionPct < 100 && <button onClick={() => show('Translation editor coming soon', 'info')} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Translate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main CMS Module ──────────────────────────────────────────────────────────
const CMS_TABS = [
  { key: 'sliders',      label: 'Sliders',       icon: 'home'        },
  { key: 'services',     label: 'Services',      icon: 'star'        },
  { key: 'news',         label: 'News / Blog',   icon: 'prescription'},
  { key: 'faqs',         label: 'FAQs',          icon: 'search'      },
  { key: 'testimonials', label: 'Testimonials',  icon: 'users'       },
  { key: 'subscribers',  label: 'Subscribers',   icon: 'bell'        },
  { key: 'menus',        label: 'Menus',         icon: 'menu'        },
  { key: 'languages',    label: 'Languages',     icon: 'chart'       },
];

export default function CmsModule() {
  const [tab, setTab] = useState('sliders');

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="CMS & Website" subtitle="Manage website content, menus, and languages" />
      <div className="flex gap-1 flex-wrap border-b border-slate-100">
        {CMS_TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name={icon} className="w-4 h-4" />{label}
          </button>
        ))}
      </div>
      {tab === 'sliders'      && <SlidersSection />}
      {tab === 'services'     && <ServicesSection />}
      {tab === 'news'         && <NewsSection />}
      {tab === 'faqs'         && <FaqsSection />}
      {tab === 'testimonials' && <TestimonialsSection />}
      {tab === 'subscribers'  && <SubscribersSection />}
      {tab === 'menus'        && <MenusSection />}
      {tab === 'languages'    && <LanguagesSection />}
    </div>
  );
}
