// ─── Doctor Service — exact PostgreSQL schema alignment ───────────────────────
// doctors table + users table JOIN. Schema field names used exactly.

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema CHECK constraint values
export const MEETING_PROVIDERS    = ['ZOOM', 'GOOGLE_MEET'];
export const AVAILABLE_DAYS_OPTS  = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

export const SPECIALIZATIONS = [
  'Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics',
  'General Medicine','Gynecology','Psychiatry','ENT','Ophthalmology',
  'Urology','Gastroenterology','Endocrinology','Pulmonology','Oncology',
  'Nephrology','Rheumatology','Hematology','Infectious Disease','Emergency Medicine',
];

// Combined doctors + users row (as API JOIN would return)
let DOCTORS = [
  {
    // doctors table
    id: 1, hospital_id: 1, user_id: 3,
    registration_number: 'MCI-DL-2012-4521',  // schema: registration_number NOT license_number
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    experience_years: 12,
    consultation_fee: 800,
    followup_fee: 400,
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30,
    max_appointments_per_day: 20,
    is_online_available: true,
    video_consultation_link: 'https://zoom.us/j/dr-priya-sharma',
    meeting_provider: 'ZOOM',
    is_active: true,
    is_verified: true,
    // users table fields (from JOIN)
    first_name: 'Priya', last_name: 'Sharma',
    email: 'priya.sharma@medinfera.com',
    phone: '+91 98100 22345',
    alternate_phone: '',
    profile_photo: null,
    gender: 'FEMALE',
    date_of_birth: '1980-03-12',
    // display helpers (not in schema, computed)
    designation: 'Senior Cardiologist',
    chamber: 'OPD Room 3',
    bio: 'Senior cardiologist with 12 years of experience in interventional cardiology and heart failure management.',
    patients_count: 284,
    rating: 4.9,
    status: 'active',
  },
  {
    id: 2, hospital_id: 1, user_id: 4,
    registration_number: 'MCI-DL-2016-8832',
    specialization: 'Neurology',
    qualification: 'MBBS, DM (Neurology)',
    experience_years: 8,
    consultation_fee: 600,
    followup_fee: 300,
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30,
    max_appointments_per_day: 16,
    is_online_available: true,
    video_consultation_link: 'https://meet.google.com/dr-arjun-patel',
    meeting_provider: 'GOOGLE_MEET',
    is_active: true,
    is_verified: true,
    first_name: 'Arjun', last_name: 'Patel',
    email: 'arjun.patel@medinfera.com',
    phone: '+91 98100 33456', alternate_phone: '', profile_photo: null,
    gender: 'MALE', date_of_birth: '1986-07-24',
    designation: 'Consultant Neurologist', chamber: 'OPD Room 5',
    bio: 'Specialist in stroke management and epilepsy treatment.',
    patients_count: 196, rating: 4.7, status: 'active',
  },
  {
    id: 3, hospital_id: 1, user_id: 5,
    registration_number: 'MCI-AP-2009-3301',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS (Ortho)',
    experience_years: 15,
    consultation_fee: 500,
    followup_fee: 250,
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30,
    max_appointments_per_day: 18,
    is_online_available: false,
    video_consultation_link: null,
    meeting_provider: 'GOOGLE_MEET',
    is_active: true,
    is_verified: true,
    first_name: 'Meena', last_name: 'Reddy',
    email: 'meena.reddy@medinfera.com',
    phone: '+91 98100 44567', alternate_phone: '', profile_photo: null,
    gender: 'FEMALE', date_of_birth: '1975-11-05',
    designation: 'Senior Orthopedic Surgeon', chamber: 'OPD Room 2',
    bio: 'Expert orthopedic surgeon specializing in joint replacements and sports medicine.',
    patients_count: 321, rating: 4.8, status: 'active',
  },
  {
    id: 4, hospital_id: 1, user_id: 6,
    registration_number: 'MCI-GJ-2018-6612',
    specialization: 'Dermatology',
    qualification: 'MBBS, DVD',
    experience_years: 6,
    consultation_fee: 450,
    followup_fee: 200,
    available_days: ['MON','TUE','WED','THU','FRI','SAT'],
    slot_duration: 20,
    max_appointments_per_day: 24,
    is_online_available: true,
    video_consultation_link: 'https://zoom.us/j/dr-vikram-shah',
    meeting_provider: 'ZOOM',
    is_active: true,
    is_verified: true,
    first_name: 'Vikram', last_name: 'Shah',
    email: 'vikram.shah@medinfera.com',
    phone: '+91 98100 55678', alternate_phone: '', profile_photo: null,
    gender: 'MALE', date_of_birth: '1990-09-18',
    designation: 'Consultant Dermatologist', chamber: 'OPD Room 7',
    bio: 'Skilled dermatologist focusing on cosmetic and medical dermatology.',
    patients_count: 167, rating: 4.6, status: 'active',
  },
  {
    id: 5, hospital_id: 1, user_id: 7,
    registration_number: 'MCI-UP-2014-5523',
    specialization: 'Pediatrics',
    qualification: 'MBBS, DCH, MD',
    experience_years: 10,
    consultation_fee: 550,
    followup_fee: 275,
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30,
    max_appointments_per_day: 20,
    is_online_available: true,
    video_consultation_link: 'https://meet.google.com/dr-ritu-agarwal',
    meeting_provider: 'GOOGLE_MEET',
    is_active: false,  // on leave
    is_verified: true,
    first_name: 'Ritu', last_name: 'Agarwal',
    email: 'ritu.agarwal@medinfera.com',
    phone: '+91 98100 66789', alternate_phone: '', profile_photo: null,
    gender: 'FEMALE', date_of_birth: '1984-06-30',
    designation: 'Senior Pediatrician', chamber: 'OPD Room 1',
    bio: 'Dedicated pediatrician specializing in neonatal care and childhood development.',
    patients_count: 243, rating: 4.8, status: 'on-leave',
  },
  {
    id: 6, hospital_id: 1, user_id: 8,
    registration_number: 'MCI-DL-2004-1190',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    experience_years: 20,
    consultation_fee: 350,
    followup_fee: 150,
    available_days: ['MON','TUE','WED','THU','FRI','SAT'],
    slot_duration: 15,
    max_appointments_per_day: 30,
    is_online_available: false,
    video_consultation_link: null,
    meeting_provider: 'GOOGLE_MEET',
    is_active: true,
    is_verified: true,
    first_name: 'Suresh', last_name: 'Kumar',
    email: 'suresh.kumar@medinfera.com',
    phone: '+91 98100 77890', alternate_phone: '', profile_photo: null,
    gender: 'MALE', date_of_birth: '1970-01-15',
    designation: 'Senior Physician', chamber: 'OPD Room 4',
    bio: 'Senior physician with two decades of experience in internal medicine.',
    patients_count: 512, rating: 4.9, status: 'active',
  },
  {
    id: 7, hospital_id: 1, user_id: 9,
    registration_number: 'MCI-WB-2010-7741',
    specialization: 'Gynecology',
    qualification: 'MBBS, MS (Gynec)',
    experience_years: 14,
    consultation_fee: 600,
    followup_fee: 300,
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30,
    max_appointments_per_day: 16,
    is_online_available: true,
    video_consultation_link: 'https://zoom.us/j/dr-anita-bose',
    meeting_provider: 'ZOOM',
    is_active: true,
    is_verified: true,
    first_name: 'Anita', last_name: 'Bose',
    email: 'anita.bose@medinfera.com',
    phone: '+91 98100 88901', alternate_phone: '', profile_photo: null,
    gender: 'FEMALE', date_of_birth: '1982-04-22',
    designation: 'Senior Gynecologist', chamber: 'OPD Room 6',
    bio: 'Experienced gynecologist and obstetrician specializing in high-risk pregnancies.',
    patients_count: 398, rating: 4.7, status: 'active',
  },
];

let nextId = 8;

// Helper: full name from first/last
export const fullName = (d) => `Dr. ${d.first_name} ${d.last_name}`.trim();

export const getAllDoctors = async () => { await delay(400); return DOCTORS.map((d) => ({ ...d, name: fullName(d) })); };
export const getDoctorById = async (id) => {
  await delay(200);
  const d = DOCTORS.find((x) => x.id === Number(id));
  return d ? { ...d, name: fullName(d) } : null;
};
export const getDoctorsBySpecialization = async (spec) => {
  await delay(350);
  return DOCTORS.filter((d) => !spec || d.specialization === spec).map((d) => ({ ...d, name: fullName(d) }));
};

export const createDoctor = async (data) => {
  await delay(700);
  const doc = {
    id: nextId++, hospital_id: 1, user_id: nextId + 200,
    is_active: true, is_verified: false, patients_count: 0, rating: 0, status: 'active',
    available_days: ['MON','TUE','WED','THU','FRI'],
    slot_duration: 30, max_appointments_per_day: 20,
    is_online_available: true,
    meeting_provider: 'GOOGLE_MEET',
    ...data,
    experience_years: Number(data.experience_years) || 0,
    consultation_fee: Number(data.consultation_fee) || 0,
    followup_fee: Number(data.followup_fee) || 0,
  };
  DOCTORS.push(doc);
  return { ...doc, name: fullName(doc) };
};

export const updateDoctor = async (id, data) => {
  await delay(500);
  const idx = DOCTORS.findIndex((d) => d.id === Number(id));
  if (idx === -1) throw new Error('Doctor not found');
  DOCTORS[idx] = { ...DOCTORS[idx], ...data };
  return { ...DOCTORS[idx], name: fullName(DOCTORS[idx]) };
};

export const updateDoctorStatus = async (id, is_active) => updateDoctor(id, { is_active, status: is_active ? 'active' : 'inactive' });
export const deleteDoctor = async (id) => { await delay(400); DOCTORS = DOCTORS.filter((d) => d.id !== Number(id)); return { success: true }; };

export const getDoctorStats = async () => {
  await delay(300);
  return {
    total:      DOCTORS.length,
    active:     DOCTORS.filter((d) => d.is_active).length,
    inactive:   DOCTORS.filter((d) => !d.is_active).length,
    online:     DOCTORS.filter((d) => d.is_online_available).length,
    verified:   DOCTORS.filter((d) => d.is_verified).length,
    bySpec:     [...new Set(DOCTORS.map((d) => d.specialization))].map((s) => ({
      spec: s, count: DOCTORS.filter((d) => d.specialization === s).length,
    })),
  };
};
