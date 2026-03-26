// ─── Auth Service — Medinfera Hospital ERP ───────────────────────────────────
// users table: first_name, last_name, email, phone, alternate_phone,
//              profile_photo, role_id, is_active, preferred_language

import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('med_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Mock users (combined users + role-specific fields for display) ────────────
// Schema-exact fields on users table:
//   first_name, last_name, email, phone, alternate_phone,
//   profile_photo, is_active, preferred_language, role_id
const USERS = [
  {
    id: 1, hospital_id: null, role: 'superadmin', role_id: 1,
    first_name: 'Arjun', last_name: 'Mehrotra',
    email: 'superadmin@medinfera.com', password: 'super@2026',
    phone: '+91 98100 00001', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-01-01',
    platform: 'Medinfera Health Platform', designation: 'Platform Owner',
  },
  {
    id: 2, hospital_id: 1, role: 'admin', role_id: 2,
    first_name: 'Rajesh', last_name: 'Kumar',
    email: 'admin@medinfera.com', password: 'admin@2026',
    phone: '+91 98100 11234', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-06-15',
    hospital: 'Medinfera General Hospital', designation: 'Hospital Administrator',
  },
  {
    id: 3, hospital_id: 1, role: 'doctor', role_id: 3,
    first_name: 'Priya', last_name: 'Sharma',
    email: 'doctor@medinfera.com', password: 'doctor@2026',
    phone: '+91 98100 22345', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-07-01',
    hospital: 'Medinfera General Hospital', specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)', experience_years: 12,
    registration_number: 'MCI-DL-2012-4521', consultation_fee: 800,
    followup_fee: 400, slot_duration: 30, max_appointments_per_day: 20,
    is_online_available: true, meeting_provider: 'ZOOM',
    video_consultation_link: 'https://zoom.us/j/dr-priya-sharma',
    is_verified: true,
    chamber: 'OPD Room 3', designation: 'Senior Cardiologist',
  },
  {
    id: 4, hospital_id: 1, role: 'staff', role_id: 4,
    first_name: 'Kavitha', last_name: 'Reddy',
    email: 'staff@medinfera.com', password: 'staff@2026',
    phone: '+91 98100 33456', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-08-10',
    hospital: 'Medinfera General Hospital', designation: 'Senior Nurse',
  },
  {
    id: 5, hospital_id: 1, role: 'pharmacist', role_id: 5,
    first_name: 'Dinesh', last_name: 'Bhatia',
    email: 'pharmacist@medinfera.com', password: 'pharma@2026',
    phone: '+91 98100 44567', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-09-05',
    hospital: 'Medinfera General Hospital', designation: 'Chief Pharmacist',
  },
  {
    id: 6, hospital_id: 1, role: 'patient', role_id: 6,
    first_name: 'Aisha', last_name: 'Nair',
    email: 'patient@medinfera.com', password: 'patient@2026',
    phone: '+91 98100 55678', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2026-01-10',
    hospital: 'Medinfera General Hospital',
    // patients table fields
    gender: 'FEMALE', date_of_birth: '1990-05-15',
    blood_group: 'B+',
    allergies: ['Penicillin'],
    chronic_diseases: ['Hypertension'],
    current_medications: ['Amlodipine 5mg OD'],
    emergency_contact_name: 'Rakesh Nair',
    emergency_contact_phone: '+91 98100 66789',
    emergency_contact_relation: 'Spouse',
  },
];

const delay   = (ms) => new Promise((r) => setTimeout(r, ms));
const mkToken = (u)  => `erp_${u.role}_${u.id}_${Date.now()}`;

// Helper: full display name from first/last
export const displayName = (u) => {
  if (!u) return '';
  if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  return u.name || '';
};

export const ROLE_HOME_MAP = {
  superadmin: '/superadmin',
  admin:      '/admin',
  doctor:     '/doctor',
  staff:      '/staff',
  pharmacist: '/pharmacist',
  patient:    '/patient',
};

export const login = async ({ email, password }) => {
  await delay(650);
  const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error('Invalid email or password. Please check your credentials.');
  if (!user.is_active) throw new Error('Your account is deactivated. Contact your administrator.');
  const { password: _p, ...safeUser } = user;
  // Add computed name for UI compatibility
  safeUser.name = displayName(safeUser);
  const token = mkToken(safeUser);
  localStorage.setItem('med_token', token);
  localStorage.setItem('med_user', JSON.stringify(safeUser));
  return { user: safeUser, token, redirectTo: ROLE_HOME_MAP[safeUser.role] };
};

// ─── Signup — schema-exact fields (users + patients tables) ──────────────────
export const signup = async ({
  // users table
  first_name, last_name, email, password, phone, alternate_phone = '',
  profile_photo = null, preferred_language = 'en',
  // patients table
  gender, date_of_birth, blood_group,
  allergies = [], chronic_diseases = [], current_medications = [],
  emergency_contact_name = '', emergency_contact_phone = '', emergency_contact_relation = '',
}) => {
  await delay(900);
  if (USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email address already exists.');
  }
  const newUser = {
    id: USERS.length + 10, hospital_id: 1, role: 'patient', role_id: 6,
    // users table — exact columns
    first_name, last_name, email, phone, alternate_phone,
    profile_photo, is_active: true, preferred_language,
    created_at: new Date().toISOString().split('T')[0],
    hospital: 'Medinfera General Hospital',
    // patients table — exact columns
    gender: (gender || 'OTHER').toUpperCase(),
    date_of_birth: date_of_birth || null,
    blood_group: blood_group || 'UNKNOWN',
    allergies: Array.isArray(allergies) ? allergies : [],
    chronic_diseases: Array.isArray(chronic_diseases) ? chronic_diseases : [],
    current_medications: Array.isArray(current_medications) ? current_medications : [],
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    // computed for UI
    name: `${first_name || ''} ${last_name || ''}`.trim(),
  };
  USERS.push({ ...newUser, password });
  const token = mkToken(newUser);
  localStorage.setItem('med_token', token);
  localStorage.setItem('med_user', JSON.stringify(newUser));
  return { user: newUser, token, redirectTo: '/patient' };
};

export const logout = async () => {
  await delay(150);
  localStorage.removeItem('med_token');
  localStorage.removeItem('med_user');
};

export const getSession = () => {
  try {
    const token = localStorage.getItem('med_token');
    const user  = localStorage.getItem('med_user');
    if (!token || !user) return null;
    const parsed = JSON.parse(user);
    // Ensure computed name exists
    if (!parsed.name) parsed.name = displayName(parsed);
    return { token, user: parsed };
  } catch { return null; }
};

export const loginAs = async (role) => {
  const creds = {
    superadmin: { email: 'superadmin@medinfera.com', password: 'super@2026' },
    admin:      { email: 'admin@medinfera.com',      password: 'admin@2026' },
    doctor:     { email: 'doctor@medinfera.com',     password: 'doctor@2026' },
    staff:      { email: 'staff@medinfera.com',      password: 'staff@2026' },
    pharmacist: { email: 'pharmacist@medinfera.com', password: 'pharma@2026' },
    patient:    { email: 'patient@medinfera.com',    password: 'patient@2026' },
  };
  if (!creds[role]) throw new Error(`Unknown role: ${role}`);
  return login(creds[role]);
};
