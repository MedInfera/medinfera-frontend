// ─── Staff Service — aligned to users table ───────────────────────────────────
// Staff are stored as users (role_id = staff).
// Schema: users table columns ONLY — no separate staff table.
// users: first_name, last_name, email, phone, alternate_phone,
//        profile_photo, is_active, preferred_language, role_id
// NOTE: address, aadhaar_number, salary, joining_date, shift,
//       department, staff_role, qualification, experience_years
//       are NOT columns in any schema table.

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema-exact enums — DB has no ENUM for gender but follows MALE/FEMALE/OTHER pattern
export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

// Mock combined users rows for staff display
let STAFF_MEMBERS = [
  {
    id: 1, hospital_id: 1, role: 'staff', role_id: 4,
    // users table — exact columns
    first_name: 'Kavitha', last_name: 'Reddy',
    email: 'kavitha.reddy@medinfera.com',
    phone: '+91 98110 10001', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-08-10',
    // display-only helpers (not schema columns)
    designation: 'Senior Nurse',
  },
  {
    id: 2, hospital_id: 1, role: 'staff', role_id: 4,
    first_name: 'Mohan', last_name: 'Tiwari',
    email: 'mohan.tiwari@medinfera.com',
    phone: '+91 98110 20002', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-04-01',
    designation: 'Front Desk Receptionist',
  },
  {
    id: 3, hospital_id: 1, role: 'staff', role_id: 4,
    first_name: 'Sunita', last_name: 'Yadav',
    email: 'sunita.yadav@medinfera.com',
    phone: '+91 98110 30003', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'hi',
    created_at: '2025-11-15',
    designation: 'Lab Technician',
  },
  {
    id: 4, hospital_id: 1, role: 'staff', role_id: 4,
    first_name: 'Rajan', last_name: 'Sharma',
    email: 'rajan.sharma@medinfera.com',
    phone: '+91 98110 40004', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2026-01-10',
    designation: 'Ward Attendant',
  },
];
let nextId = 5;

export const fullName = (s) => `${s.first_name || ''} ${s.last_name || ''}`.trim();

export const getAllStaff   = async () => { await delay(350); return STAFF_MEMBERS.map((s) => ({ ...s, name: fullName(s) })); };
export const getStaffById  = async (id) => {
  await delay(200);
  const s = STAFF_MEMBERS.find((x) => x.id === Number(id));
  return s ? { ...s, name: fullName(s) } : null;
};

export const createStaff = async (data) => {
  await delay(600);
  const member = {
    id: nextId++, hospital_id: 1, role: 'staff', role_id: 4,
    is_active: true, preferred_language: 'en', profile_photo: null,
    created_at: new Date().toISOString().split('T')[0],
    // Only schema-valid fields stored
    first_name:      data.first_name      || '',
    last_name:       data.last_name       || '',
    email:           data.email           || '',
    phone:           data.phone           || '',
    alternate_phone: data.alternate_phone || '',
    preferred_language: data.preferred_language || 'en',
    profile_photo:   data.profile_photo   || null,
    designation:     data.designation     || '',
    ...data,
  };
  STAFF_MEMBERS.push(member);
  return { ...member, name: fullName(member) };
};

export const updateStaff = async (id, data) => {
  await delay(500);
  const idx = STAFF_MEMBERS.findIndex((s) => s.id === Number(id));
  if (idx === -1) throw new Error('Staff member not found');
  STAFF_MEMBERS[idx] = { ...STAFF_MEMBERS[idx], ...data };
  return { ...STAFF_MEMBERS[idx], name: fullName(STAFF_MEMBERS[idx]) };
};

export const deleteStaff = async (id) => {
  await delay(400);
  STAFF_MEMBERS = STAFF_MEMBERS.filter((s) => s.id !== Number(id));
  return { success: true };
};

export const getStaffStats = async () => {
  await delay(250);
  return {
    total:  STAFF_MEMBERS.length,
    active: STAFF_MEMBERS.filter((s) => s.is_active).length,
    inactive: STAFF_MEMBERS.filter((s) => !s.is_active).length,
  };
};
