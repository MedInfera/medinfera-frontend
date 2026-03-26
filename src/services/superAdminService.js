// ─── Super Admin Service — Medinfera Health Platform ─────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const SUBSCRIPTION_PLANS = ['Starter', 'Professional', 'Enterprise', 'Custom'];

let HOSPITALS = [
  {
    id: 1, name: 'Medinfera General Hospital', email: 'admin@medinfera.com',
    phone: '+91 11-1234-5678', address: '123 MG Road', city: 'New Delhi', state: 'Delhi',
    zip_code: '110001', logo_url: null, subscription_plan: 'Enterprise',
    is_active: true, created_at: '2025-06-15',
    admin_name: 'Rajesh Kumar', admin_email: 'admin@medinfera.com',
    beds: 120, doctors: 18, staff: 45, patients_total: 1842,
    monthly_revenue: 284600, appointments_this_month: 267,
  },
  {
    id: 2, name: 'City Care Hospital', email: 'admin@citycare.com',
    phone: '+91 11-2345-6789', address: '45 Ring Road', city: 'Bengaluru', state: 'Karnataka',
    zip_code: '560001', logo_url: null, subscription_plan: 'Professional',
    is_active: true, created_at: '2025-09-01',
    admin_name: 'Pooja Rao', admin_email: 'admin@citycare.com',
    beds: 80, doctors: 12, staff: 30, patients_total: 1124,
    monthly_revenue: 186400, appointments_this_month: 189,
  },
  {
    id: 3, name: 'Apollo Lifeline Clinic', email: 'admin@apollolifeline.com',
    phone: '+91 22-3456-7890', address: '78 Marine Drive', city: 'Mumbai', state: 'Maharashtra',
    zip_code: '400001', logo_url: null, subscription_plan: 'Starter',
    is_active: true, created_at: '2025-12-10',
    admin_name: 'Vikram Desai', admin_email: 'admin@apollolifeline.com',
    beds: 40, doctors: 6, staff: 15, patients_total: 432,
    monthly_revenue: 68200, appointments_this_month: 98,
  },
  {
    id: 4, name: 'Green Valley Medical Center', email: 'admin@greenvalley.com',
    phone: '+91 40-4567-8901', address: '12 Jubilee Hills', city: 'Hyderabad', state: 'Telangana',
    zip_code: '500033', logo_url: null, subscription_plan: 'Professional',
    is_active: false, created_at: '2026-01-05',
    admin_name: 'Srinivas Reddy', admin_email: 'admin@greenvalley.com',
    beds: 60, doctors: 9, staff: 22, patients_total: 287,
    monthly_revenue: 0, appointments_this_month: 0,
  },
];
let nextHospitalId = 5;

export const getHospitals     = async () => { await delay(400); return [...HOSPITALS]; };
export const getHospitalById  = async (id) => { await delay(200); return HOSPITALS.find((h) => h.id === Number(id)) || null; };

export const getPlatformStats = async () => {
  await delay(350);
  const active = HOSPITALS.filter((h) => h.is_active);
  return {
    totalHospitals:    HOSPITALS.length,
    activeHospitals:   active.length,
    inactiveHospitals: HOSPITALS.filter((h) => !h.is_active).length,
    totalDoctors:      HOSPITALS.reduce((s, h) => s + h.doctors, 0),
    totalPatients:     HOSPITALS.reduce((s, h) => s + h.patients_total, 0),
    totalBeds:         HOSPITALS.reduce((s, h) => s + h.beds, 0),
    monthRevenue:      active.reduce((s, h) => s + h.monthly_revenue, 0),
    monthAppointments: active.reduce((s, h) => s + h.appointments_this_month, 0),
    planBreakdown:     SUBSCRIPTION_PLANS.map((p) => ({
      plan:  p,
      count: HOSPITALS.filter((h) => h.subscription_plan === p).length,
    })),
  };
};

export const createHospital = async (data) => {
  await delay(800);
  const h = {
    id: nextHospitalId++,
    is_active: true,
    created_at: new Date().toISOString().split('T')[0],
    beds: 0, doctors: 0, staff: 0, patients_total: 0,
    monthly_revenue: 0, appointments_this_month: 0,
    logo_url: null,
    ...data,
  };
  HOSPITALS.push(h);
  return h;
};

export const updateHospital = async (id, data) => {
  await delay(500);
  const idx = HOSPITALS.findIndex((h) => h.id === Number(id));
  if (idx === -1) throw new Error('Hospital not found');
  HOSPITALS[idx] = { ...HOSPITALS[idx], ...data };
  return HOSPITALS[idx];
};

export const toggleHospitalStatus = async (id) => {
  await delay(400);
  const h = HOSPITALS.find((x) => x.id === Number(id));
  if (!h) throw new Error('Hospital not found');
  h.is_active = !h.is_active;
  return h;
};
