// ─── CMS Service (Mock) ───────────────────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let SLIDERS = [
  { id: 1, title: 'Advanced Healthcare', subtitle: 'World-class treatment at your doorstep', image: null, buttonText: 'Book Appointment', link: '/appointment', status: 'active', order: 1 },
  { id: 2, title: 'Expert Doctors', subtitle: 'Over 50 specialists across 20 departments', image: null, buttonText: 'Meet Our Doctors', link: '/doctors', status: 'active', order: 2 },
  { id: 3, title: 'Emergency Care 24/7', subtitle: 'Round-the-clock emergency services', image: null, buttonText: 'Contact Us', link: '/contact', status: 'inactive', order: 3 },
];

let SERVICES = [
  { id: 1, title: 'Cardiology', icon: '🫀', description: 'Comprehensive heart care including ECG, echo, and interventional cardiology.', status: 'active' },
  { id: 2, title: 'Neurology', icon: '🧠', description: 'Expert diagnosis and treatment of brain, spine, and nervous system disorders.', status: 'active' },
  { id: 3, title: 'Orthopedics', icon: '🦴', description: 'Joint replacement, fracture care, and sports medicine by expert surgeons.', status: 'active' },
  { id: 4, title: 'Pediatrics', icon: '👶', description: 'Complete child healthcare from newborn to adolescent care.', status: 'active' },
  { id: 5, title: 'Dermatology', icon: '🧴', description: 'Medical and cosmetic skin treatments including laser therapy.', status: 'active' },
  { id: 6, title: 'Emergency', icon: '🚨', description: '24/7 emergency care with state-of-the-art trauma facility.', status: 'active' },
];

let NEWS = [
  { id: 1, title: 'Medinfera Opens New ICU Wing', excerpt: 'A state-of-the-art 20-bed ICU with the latest monitoring equipment.', category: 'Hospital News', date: '2026-03-15', status: 'published', author: 'Admin' },
  { id: 2, title: 'Free Health Camp This Weekend', excerpt: 'Join us for free blood pressure, sugar, and BMI checkups.', category: 'Events', date: '2026-03-12', status: 'published', author: 'Admin' },
  { id: 3, title: 'New Telemedicine Service Launched', excerpt: 'Book online video consultations from the comfort of your home.', category: 'Services', date: '2026-03-08', status: 'published', author: 'Admin' },
  { id: 4, title: 'Upcoming Cardiology Seminar', excerpt: 'Join Dr. Priya Sharma for a talk on modern heart disease prevention.', category: 'Events', date: '2026-03-25', status: 'draft', author: 'Admin' },
];

let GALLERY = [
  { id: 1, title: 'Main OPD Hall', section: 'Facilities', description: 'Spacious and modern OPD waiting area', status: 'active' },
  { id: 2, title: 'Operation Theatre', section: 'Facilities', description: 'Fully equipped modular OT', status: 'active' },
  { id: 3, title: 'ICU Ward', section: 'Facilities', description: '20-bed ICU with latest monitors', status: 'active' },
  { id: 4, title: 'Pharmacy', section: 'Services', description: 'In-house 24/7 pharmacy', status: 'active' },
  { id: 5, title: 'Lab & Diagnostics', section: 'Services', description: 'NABL accredited laboratory', status: 'active' },
];

let FAQS = [
  { id: 1, question: 'How do I book an appointment?', answer: 'You can book online through our website, call our helpline, or visit the OPD desk.', category: 'Appointments', order: 1 },
  { id: 2, question: 'What are the OPD timings?', answer: 'OPD is open Monday to Saturday, 9:00 AM to 5:00 PM. Emergency is 24/7.', category: 'General', order: 2 },
  { id: 3, question: 'Do you accept insurance?', answer: 'Yes, we are empanelled with all major insurance providers and TPA.', category: 'Billing', order: 3 },
  { id: 4, question: 'Is parking available?', answer: 'Yes, free parking is available for patients and visitors.', category: 'General', order: 4 },
];

let TESTIMONIALS = [
  { id: 1, name: 'Ramesh Gupta', role: 'Patient', content: 'Excellent care and very professional staff. Dr. Priya Sharma is outstanding.', rating: 5, status: 'active' },
  { id: 2, name: 'Sunita Mehta', role: 'Patient', content: 'The telemedicine service was very convenient. Got my prescription without visiting.', rating: 5, status: 'active' },
  { id: 3, name: 'Vivek Joshi', role: 'Patient', content: 'World-class facilities and very caring doctors. Highly recommended.', rating: 4, status: 'active' },
];

let SUBSCRIBERS = [
  { id: 1, email: 'john@example.com', date: '2026-03-01', status: 'active' },
  { id: 2, email: 'priya@example.com', date: '2026-03-05', status: 'active' },
  { id: 3, email: 'ram@example.com', date: '2026-03-10', status: 'active' },
  { id: 4, email: 'sita@example.com', date: '2026-03-12', status: 'unsubscribed' },
];

let MENUS = [
  { id: 1, name: 'Main Navigation', items: [
    { id: 1, label: 'Home', url: '/', order: 1 },
    { id: 2, label: 'About', url: '/about-us', order: 2 },
    { id: 3, label: 'Services', url: '/service', order: 3 },
    { id: 4, label: 'Doctors', url: '/doctors', order: 4 },
    { id: 5, label: 'News', url: '/news', order: 5 },
    { id: 6, label: 'Contact', url: '/contact', order: 6 },
  ]},
  { id: 2, name: 'Quick Links', items: [
    { id: 7, label: 'Book Appointment', url: '/patient', order: 1 },
    { id: 8, label: 'Emergency', url: '/contact', order: 2 },
    { id: 9, label: 'Find a Doctor', url: '/doctors', order: 3 },
  ]},
];

let LANGUAGES = [
  { id: 1, code: 'en', name: 'English',  direction: 'LTR', isDefault: true,  isActive: true,  completionPct: 100 },
  { id: 2, code: 'hi', name: 'Hindi',    direction: 'LTR', isDefault: false, isActive: true,  completionPct: 78  },
  { id: 3, code: 'ar', name: 'Arabic',   direction: 'RTL', isDefault: false, isActive: false, completionPct: 0   },
  { id: 4, code: 'ur', name: 'Urdu',     direction: 'RTL', isDefault: false, isActive: false, completionPct: 0   },
  { id: 5, code: 'bn', name: 'Bengali',  direction: 'LTR', isDefault: false, isActive: false, completionPct: 0   },
];

let nextId = { slider: 4, service: 7, news: 5, gallery: 6, faq: 5, testimonial: 4, subscriber: 5, menu: 3, language: 6 };
const mk = (table) => () => nextId[table]++;

// ─── CRUD helpers ─────────────────────────────────────────────────────────────
export const getSliders      = async () => { await delay(300); return [...SLIDERS]; };
export const getServices     = async () => { await delay(300); return [...SERVICES]; };
export const getNews         = async () => { await delay(350); return [...NEWS]; };
export const getGallery      = async () => { await delay(300); return [...GALLERY]; };
export const getFaqs         = async () => { await delay(300); return [...FAQS]; };
export const getTestimonials = async () => { await delay(300); return [...TESTIMONIALS]; };
export const getSubscribers  = async () => { await delay(300); return [...SUBSCRIBERS]; };
export const getMenus        = async () => { await delay(250); return [...MENUS]; };
export const getLanguages    = async () => { await delay(250); return [...LANGUAGES]; };

export const createItem = async (table, data, arr) => {
  await delay(500);
  const item = { id: mk(table)(), ...data };
  arr.push(item);
  return item;
};

export const updateItem = async (arr, id, data) => {
  await delay(400);
  const idx = arr.findIndex((x) => x.id === Number(id));
  if (idx === -1) throw new Error('Not found');
  arr[idx] = { ...arr[idx], ...data };
  return arr[idx];
};

export const deleteItem = async (arr, id) => {
  await delay(350);
  const idx = arr.findIndex((x) => x.id === Number(id));
  if (idx !== -1) arr.splice(idx, 1);
  return { success: true };
};

// Typed wrappers
export const createSlider     = (d) => createItem('slider', d, SLIDERS);
export const updateSlider     = (id, d) => updateItem(SLIDERS, id, d);
export const deleteSlider     = (id) => deleteItem(SLIDERS, id);

export const createService    = (d) => createItem('service', d, SERVICES);
export const updateService    = (id, d) => updateItem(SERVICES, id, d);
export const deleteService    = (id) => deleteItem(SERVICES, id);

export const createNews       = (d) => createItem('news', d, NEWS);
export const updateNews       = (id, d) => updateItem(NEWS, id, d);
export const deleteNews       = (id) => deleteItem(NEWS, id);

export const createFaq        = (d) => createItem('faq', d, FAQS);
export const updateFaq        = (id, d) => updateItem(FAQS, id, d);
export const deleteFaq        = (id) => deleteItem(FAQS, id);

export const createTestimonial= (d) => createItem('testimonial', d, TESTIMONIALS);
export const updateTestimonial= (id, d) => updateItem(TESTIMONIALS, id, d);
export const deleteTestimonial= (id) => deleteItem(TESTIMONIALS, id);

export const addMenuItem      = async (menuId, item) => {
  await delay(400);
  const menu = MENUS.find((m) => m.id === Number(menuId));
  if (!menu) throw new Error('Menu not found');
  const newItem = { id: Date.now(), ...item, order: menu.items.length + 1 };
  menu.items.push(newItem);
  return newItem;
};

export const toggleLanguage   = async (id) => {
  await delay(300);
  const lang = LANGUAGES.find((l) => l.id === Number(id));
  if (!lang) throw new Error('Language not found');
  lang.isActive = !lang.isActive;
  return lang;
};

export const NEWS_CATEGORIES  = ['Hospital News', 'Events', 'Services', 'Health Tips', 'Announcements'];
export const GALLERY_SECTIONS = ['Facilities', 'Services', 'Team', 'Events', 'Awards'];
