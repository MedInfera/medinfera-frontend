// ─── Patient Service — aligned to PostgreSQL schema ──────────────────────────
// patients table joins with users table via user_id.
// Fields here combine both tables for frontend display convenience.

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema-exact ENUM values from CHECK constraints
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
export const GENDERS      = ['MALE', 'FEMALE', 'OTHER'];   // uppercase as per schema CHECK
export const RELATIONS    = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian', 'Other'];
export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

// Combined users + patients row (as API would return after JOIN)
let PATIENTS = [
  {
    // users table fields
    id: 1, user_id: 6, hospital_id: 1,
    first_name: 'Aisha', last_name: 'Nair',
    email: 'patient@medinfera.com', phone: '+91 98100 55678', alternate_phone: '',
    is_active: true, created_at: '2026-01-10',
    // patients table fields
    date_of_birth: '1990-05-15',
    gender: 'FEMALE',
    blood_group: 'B+',
    allergies: ['Penicillin'],
    chronic_diseases: ['Hypertension'],
    current_medications: ['Amlodipine 5mg OD'],
    emergency_contact_name: 'Rakesh Nair',
    emergency_contact_phone: '+91 98100 66789',
    emergency_contact_relation: 'Spouse',
    // display helpers
    status: 'active', total_visits: 12, last_visit: '2026-03-18',
  },
  {
    id: 2, user_id: 7, hospital_id: 1,
    first_name: 'Ravi', last_name: 'Mehta',
    email: 'ravi.mehta@example.com', phone: '+91 98100 44567', alternate_phone: '',
    is_active: true, created_at: '2025-11-20',
    date_of_birth: '1983-11-08',
    gender: 'MALE',
    blood_group: 'O+',
    allergies: [],
    chronic_diseases: ['Migraine', 'Diabetes Type 2'],
    current_medications: ['Metformin 500mg BD'],
    emergency_contact_name: 'Priya Mehta',
    emergency_contact_phone: '+91 98100 44568',
    emergency_contact_relation: 'Spouse',
    status: 'active', total_visits: 8, last_visit: '2026-03-18',
  },
  {
    id: 3, user_id: 8, hospital_id: 1,
    first_name: 'Sunita', last_name: 'Verma',
    email: 'sunita.verma@example.com', phone: '+91 98100 55679', alternate_phone: '',
    is_active: true, created_at: '2025-12-05',
    date_of_birth: '1997-07-22',
    gender: 'FEMALE',
    blood_group: 'A+',
    allergies: ['Sulfa drugs'],
    chronic_diseases: [],
    current_medications: [],
    emergency_contact_name: 'Ajay Verma',
    emergency_contact_phone: '+91 98100 55680',
    emergency_contact_relation: 'Parent',
    status: 'active', total_visits: 3, last_visit: '2026-03-18',
  },
  {
    id: 4, user_id: 9, hospital_id: 1,
    first_name: 'Kiran', last_name: 'Joshi',
    email: 'kiran.joshi@example.com', phone: '+91 98100 66789', alternate_phone: '',
    is_active: true, created_at: '2024-08-10',
    date_of_birth: '1970-02-14',
    gender: 'MALE',
    blood_group: 'AB-',
    allergies: ['Aspirin', 'Ibuprofen'],
    chronic_diseases: ['Rheumatoid Arthritis', 'Hypertension'],
    current_medications: ['Methotrexate 7.5mg weekly', 'Amlodipine 5mg OD'],
    emergency_contact_name: 'Meena Joshi',
    emergency_contact_phone: '+91 98100 66790',
    emergency_contact_relation: 'Spouse',
    status: 'inactive', total_visits: 21, last_visit: '2026-03-17',
  },
  {
    id: 5, user_id: 10, hospital_id: 1,
    first_name: 'Deepak', last_name: 'Singh',
    email: 'deepak.singh@example.com', phone: '+91 98100 77890', alternate_phone: '',
    is_active: true, created_at: '2025-09-22',
    date_of_birth: '1964-09-30',
    gender: 'MALE',
    blood_group: 'O-',
    allergies: [],
    chronic_diseases: ['Mild Cognitive Impairment', 'Hyperlipidemia'],
    current_medications: ['Atorvastatin 10mg OD'],
    emergency_contact_name: 'Rekha Singh',
    emergency_contact_phone: '+91 98100 77891',
    emergency_contact_relation: 'Spouse',
    status: 'active', total_visits: 5, last_visit: '2026-03-19',
  },
  {
    id: 6, user_id: 11, hospital_id: 1,
    first_name: 'Pooja', last_name: 'Das',
    email: 'pooja.das@example.com', phone: '+91 98100 88901', alternate_phone: '',
    is_active: true, created_at: '2026-02-14',
    date_of_birth: '1994-12-03',
    gender: 'FEMALE',
    blood_group: 'A-',
    allergies: ['Latex'],
    chronic_diseases: ['Eczema (Atopic Dermatitis)'],
    current_medications: ['Cetirizine 10mg OD'],
    emergency_contact_name: 'Amit Das',
    emergency_contact_phone: '+91 98100 88902',
    emergency_contact_relation: 'Sibling',
    status: 'active', total_visits: 6, last_visit: '2026-03-20',
  },
];
let nextId = 7;

// Helper: compute display name from first/last
export const fullName = (p) => `${p.first_name} ${p.last_name}`.trim();

export const getAllPatients   = async () => { await delay(400); return PATIENTS.map((p) => ({ ...p, name: fullName(p) })); };
export const getPatientById  = async (id) => {
  await delay(200);
  const p = PATIENTS.find((x) => x.id === Number(id));
  return p ? { ...p, name: fullName(p) } : null;
};

export const searchPatients = async (query) => {
  await delay(300);
  const q = query.toLowerCase();
  return PATIENTS
    .map((p) => ({ ...p, name: fullName(p) }))
    .filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q)
    );
};

export const createPatient = async (data) => {
  await delay(700);
  const patient = {
    id: nextId++, user_id: nextId + 100, hospital_id: 1,
    is_active: true, status: 'active', total_visits: 0, last_visit: null,
    created_at: new Date().toISOString().split('T')[0],
    ...data,
  };
  PATIENTS.push(patient);
  return { ...patient, name: fullName(patient) };
};

export const updatePatient = async (id, data) => {
  await delay(500);
  const idx = PATIENTS.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error('Patient not found');
  PATIENTS[idx] = { ...PATIENTS[idx], ...data };
  return { ...PATIENTS[idx], name: fullName(PATIENTS[idx]) };
};

export const deletePatient = async (id) => {
  await delay(400);
  PATIENTS = PATIENTS.filter((p) => p.id !== Number(id));
  return { success: true };
};

export const getPatientStats = async () => {
  await delay(300);
  return {
    total:        PATIENTS.length,
    active:       PATIENTS.filter((p) => p.status === 'active').length,
    inactive:     PATIENTS.filter((p) => p.status === 'inactive').length,
    newThisMonth: 3,
  };
};
