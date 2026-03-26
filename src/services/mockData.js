// ─── Mock Data Service ────────────────────────────────────────────────────────
// All mock data used across dashboards. Replace with real API calls later.

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─── Appointments ────────────────────────────────────────────────────────────
const MOCK_APPOINTMENTS = [
  { id: 1, patientName: 'Aisha Nair',     doctorName: 'Dr. Priya Sharma',  date: '2026-03-18', time: '09:00 AM', type: 'Online',  status: 'confirmed', service: 'Cardiology',   fee: 800  },
  { id: 2, patientName: 'Ravi Mehta',     doctorName: 'Dr. Arjun Patel',   date: '2026-03-18', time: '10:30 AM', type: 'Offline', status: 'pending',   service: 'Neurology',    fee: 600  },
  { id: 3, patientName: 'Sunita Verma',   doctorName: 'Dr. Priya Sharma',  date: '2026-03-18', time: '11:00 AM', type: 'Online',  status: 'completed', service: 'Cardiology',   fee: 800  },
  { id: 4, patientName: 'Kiran Joshi',    doctorName: 'Dr. Meena Reddy',   date: '2026-03-19', time: '02:00 PM', type: 'Offline', status: 'cancelled', service: 'Orthopedics',  fee: 500  },
  { id: 5, patientName: 'Deepak Singh',   doctorName: 'Dr. Arjun Patel',   date: '2026-03-19', time: '03:30 PM', type: 'Online',  status: 'confirmed', service: 'Neurology',    fee: 600  },
  { id: 6, patientName: 'Pooja Das',      doctorName: 'Dr. Vikram Shah',   date: '2026-03-20', time: '09:30 AM', type: 'Offline', status: 'pending',   service: 'Dermatology',  fee: 450  },
];

// ─── Doctors ─────────────────────────────────────────────────────────────────
const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Priya Sharma',  specialization: 'Cardiology',   qualification: 'MBBS, MD',  experience: 12, fee: 800,  status: 'active',   patients: 284, rating: 4.9 },
  { id: 2, name: 'Dr. Arjun Patel',   specialization: 'Neurology',    qualification: 'MBBS, DM',  experience: 8,  fee: 600,  status: 'active',   patients: 196, rating: 4.7 },
  { id: 3, name: 'Dr. Meena Reddy',   specialization: 'Orthopedics',  qualification: 'MBBS, MS',  experience: 15, fee: 500,  status: 'active',   patients: 321, rating: 4.8 },
  { id: 4, name: 'Dr. Vikram Shah',   specialization: 'Dermatology',  qualification: 'MBBS, DVD', experience: 6,  fee: 450,  status: 'active',   patients: 167, rating: 4.6 },
  { id: 5, name: 'Dr. Ritu Agarwal',  specialization: 'Pediatrics',   qualification: 'MBBS, DCH', experience: 10, fee: 550,  status: 'on-leave', patients: 243, rating: 4.8 },
];

// ─── Patients ────────────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id: 1, name: 'Aisha Nair',    age: 35, gender: 'Female', blood: 'B+',  phone: '+91 98100 33456', lastVisit: '2026-03-18', status: 'active' },
  { id: 2, name: 'Ravi Mehta',    age: 42, gender: 'Male',   blood: 'O+',  phone: '+91 98100 44567', lastVisit: '2026-03-18', status: 'active' },
  { id: 3, name: 'Sunita Verma',  age: 28, gender: 'Female', blood: 'A+',  phone: '+91 98100 55678', lastVisit: '2026-03-18', status: 'active' },
  { id: 4, name: 'Kiran Joshi',   age: 55, gender: 'Male',   blood: 'AB-', phone: '+91 98100 66789', lastVisit: '2026-03-17', status: 'inactive' },
  { id: 5, name: 'Deepak Singh',  age: 61, gender: 'Male',   blood: 'O-',  phone: '+91 98100 77890', lastVisit: '2026-03-19', status: 'active' },
];

// ─── Beds ────────────────────────────────────────────────────────────────────
const MOCK_BEDS = {
  total: 120, available: 34, occupied: 72, cleaning: 9, maintenance: 5,
  wards: [
    { name: 'General Ward A', total: 30, available: 8,  occupied: 20, cleaning: 2 },
    { name: 'General Ward B', total: 30, available: 6,  occupied: 22, cleaning: 2 },
    { name: 'ICU',            total: 20, available: 4,  occupied: 15, cleaning: 1 },
    { name: 'Private Rooms',  total: 24, available: 12, occupied: 10, cleaning: 2 },
    { name: 'NICU',           total: 16, available: 4,  occupied: 10, cleaning: 2 },
  ]
};

// ─── Stats ───────────────────────────────────────────────────────────────────
const MOCK_ADMIN_STATS = {
  todayAppointments: 24,
  totalPatients: 1842,
  totalDoctors: 18,
  monthRevenue: 284600,
  pendingAppointments: 7,
  bedsAvailable: 34,
  activeAmbulances: 3,
};

const MOCK_DOCTOR_STATS = {
  todayAppointments: 8,
  totalPatients: 284,
  pendingRequests: 3,
  monthEarnings: 48000,
  completedThisMonth: 62,
};

const MOCK_PATIENT_STATS = {
  totalAppointments: 12,
  upcomingAppointments: 2,
  totalPrescriptions: 8,
  pendingPayments: 1,
};

// ─── Recent Activity ──────────────────────────────────────────────────────────
const MOCK_ACTIVITY = [
  { id: 1, type: 'appointment', text: 'New appointment booked by Ravi Mehta',   time: '2 min ago',  icon: 'calendar' },
  { id: 2, type: 'payment',     text: 'Payment ₹800 received from Aisha Nair',  time: '15 min ago', icon: 'payment' },
  { id: 3, type: 'bed',         text: 'Bed B-14 allocated to Deepak Singh',      time: '32 min ago', icon: 'bed' },
  { id: 4, type: 'doctor',      text: 'Dr. Ritu Agarwal marked on leave today', time: '1 hr ago',   icon: 'doctor' },
  { id: 5, type: 'lab',         text: 'Lab results ready for Sunita Verma',     time: '2 hr ago',   icon: 'lab' },
];

// ─── Service functions ────────────────────────────────────────────────────────
export const getAppointments = async () => { await delay(400); return MOCK_APPOINTMENTS; };
export const getDoctors      = async () => { await delay(400); return MOCK_DOCTORS; };
export const getPatients     = async () => { await delay(400); return MOCK_PATIENTS; };
export const getBedStats     = async () => { await delay(300); return MOCK_BEDS; };
export const getAdminStats   = async () => { await delay(350); return MOCK_ADMIN_STATS; };
export const getDoctorStats  = async () => { await delay(350); return MOCK_DOCTOR_STATS; };
export const getPatientStats = async () => { await delay(350); return MOCK_PATIENT_STATS; };
export const getRecentActivity = async () => { await delay(300); return MOCK_ACTIVITY; };
