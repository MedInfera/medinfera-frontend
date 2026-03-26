// ─── Appointment Service — exact PostgreSQL schema alignment ──────────────────
// appointments table: combined with users/patients/doctors for display

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema CHECK constraint values — UPPERCASE
export const APPOINTMENT_TYPES   = ['ONLINE', 'OFFLINE'];
export const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
export const PAYMENT_STATUSES    = ['PENDING', 'PAID', 'REFUNDED'];
export const MEETING_PROVIDERS   = ['ZOOM', 'GOOGLE_MEET'];

// 24-hour time slots (stored as HH:MM, matches time without time zone)
export const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00',
];

// Slot duration from doctors.slot_duration (default 15 min)
export const SLOT_DURATION_MINUTES = 30;

let APPOINTMENTS = [
  {
    // appointments table fields
    id: 1, hospital_id: 1,
    appointment_number: 'APT-2026-0001',
    patient_id: 1, doctor_id: 1,
    created_by: 1,
    appointment_date: '2026-03-18',
    start_time: '09:00', end_time: '09:30',
    appointment_type: 'ONLINE',
    status: 'CONFIRMED',
    chief_complaint: 'Follow-up for BP medication adjustment',
    symptoms: ['headache', 'dizziness'],
    consultation_notes: null,
    meeting_provider: 'ZOOM',
    meeting_link: 'https://zoom.us/j/12345678',
    meeting_id: '123-456-789',
    meeting_password: 'meet123',
    recording_url: null,
    consultation_fee: 800,
    payment_status: 'PAID',
    payment_id: 1,
    is_followup: true,
    followup_from: null,
    cancelled_at: null,
    cancelled_reason: null,
    completed_at: null,
    // JOIN display fields (from users + doctors + patients)
    patient_name: 'Aisha Nair',
    doctor_name: 'Dr. Priya Sharma',
    specialization: 'Cardiology',
    created_at: '2026-03-15',
  },
  {
    id: 2, hospital_id: 1,
    appointment_number: 'APT-2026-0002',
    patient_id: 2, doctor_id: 2,
    created_by: 2,
    appointment_date: '2026-03-18',
    start_time: '10:30', end_time: '11:00',
    appointment_type: 'OFFLINE',
    status: 'PENDING',
    chief_complaint: 'Recurring migraines not responding to OTC medication',
    symptoms: ['migraine', 'nausea', 'photophobia'],
    consultation_notes: null,
    meeting_provider: null,
    meeting_link: null, meeting_id: null, meeting_password: null, recording_url: null,
    consultation_fee: 600,
    payment_status: 'PENDING',
    payment_id: null,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Ravi Mehta',
    doctor_name: 'Dr. Arjun Patel',
    specialization: 'Neurology',
    created_at: '2026-03-16',
  },
  {
    id: 3, hospital_id: 1,
    appointment_number: 'APT-2026-0003',
    patient_id: 3, doctor_id: 1,
    created_by: 1,
    appointment_date: '2026-03-18',
    start_time: '11:00', end_time: '11:30',
    appointment_type: 'ONLINE',
    status: 'COMPLETED',
    chief_complaint: 'Chest pain and shortness of breath during exertion',
    symptoms: ['chest pain', 'dyspnoea'],
    consultation_notes: 'BP 128/82. No significant findings. Advised lifestyle changes.',
    meeting_provider: 'GOOGLE_MEET',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    meeting_id: 'abc-defg-hij', meeting_password: null, recording_url: null,
    consultation_fee: 800,
    payment_status: 'PAID',
    payment_id: 2,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null,
    completed_at: '2026-03-18 11:28:00',
    patient_name: 'Sunita Verma',
    doctor_name: 'Dr. Priya Sharma',
    specialization: 'Cardiology',
    created_at: '2026-03-14',
  },
  {
    id: 4, hospital_id: 1,
    appointment_number: 'APT-2026-0004',
    patient_id: 4, doctor_id: 3,
    created_by: 4,
    appointment_date: '2026-03-19',
    start_time: '14:00', end_time: '14:30',
    appointment_type: 'OFFLINE',
    status: 'CANCELLED',
    chief_complaint: 'Knee pain, post-surgery follow-up',
    symptoms: ['knee pain', 'stiffness'],
    consultation_notes: null,
    meeting_provider: null, meeting_link: null, meeting_id: null, meeting_password: null, recording_url: null,
    consultation_fee: 500,
    payment_status: 'REFUNDED',
    payment_id: null,
    is_followup: true, followup_from: null,
    cancelled_at: '2026-03-18 10:00:00',
    cancelled_reason: 'Patient unable to travel',
    completed_at: null,
    patient_name: 'Kiran Joshi',
    doctor_name: 'Dr. Meena Reddy',
    specialization: 'Orthopedics',
    created_at: '2026-03-15',
  },
  {
    id: 5, hospital_id: 1,
    appointment_number: 'APT-2026-0005',
    patient_id: 5, doctor_id: 2,
    created_by: 5,
    appointment_date: '2026-03-19',
    start_time: '15:30', end_time: '16:00',
    appointment_type: 'ONLINE',
    status: 'CONFIRMED',
    chief_complaint: 'Memory issues and cognitive decline, first consultation',
    symptoms: ['memory loss', 'confusion'],
    consultation_notes: null,
    meeting_provider: 'ZOOM',
    meeting_link: 'https://zoom.us/j/87654321',
    meeting_id: '876-543-210', meeting_password: 'sec456', recording_url: null,
    consultation_fee: 600,
    payment_status: 'PAID',
    payment_id: 3,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Deepak Singh',
    doctor_name: 'Dr. Arjun Patel',
    specialization: 'Neurology',
    created_at: '2026-03-17',
  },
  {
    id: 6, hospital_id: 1,
    appointment_number: 'APT-2026-0006',
    patient_id: 6, doctor_id: 4,
    created_by: 6,
    appointment_date: '2026-03-20',
    start_time: '09:30', end_time: '10:00',
    appointment_type: 'OFFLINE',
    status: 'PENDING',
    chief_complaint: 'Skin rash and itching for past 2 weeks',
    symptoms: ['rash', 'pruritus'],
    consultation_notes: null,
    meeting_provider: null, meeting_link: null, meeting_id: null, meeting_password: null, recording_url: null,
    consultation_fee: 450,
    payment_status: 'PENDING',
    payment_id: null,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Pooja Das',
    doctor_name: 'Dr. Vikram Shah',
    specialization: 'Dermatology',
    created_at: '2026-03-18',
  },
  {
    id: 7, hospital_id: 1,
    appointment_number: 'APT-2026-0007',
    patient_id: 1, doctor_id: 3,
    created_by: 1,
    appointment_date: '2026-03-21',
    start_time: '10:00', end_time: '10:30',
    appointment_type: 'OFFLINE',
    status: 'PENDING',
    chief_complaint: 'Right shoulder pain after gym injury',
    symptoms: ['shoulder pain', 'limited range of motion'],
    consultation_notes: null,
    meeting_provider: null, meeting_link: null, meeting_id: null, meeting_password: null, recording_url: null,
    consultation_fee: 500,
    payment_status: 'PENDING',
    payment_id: null,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Aisha Nair',
    doctor_name: 'Dr. Meena Reddy',
    specialization: 'Orthopedics',
    created_at: '2026-03-19',
  },
  {
    id: 8, hospital_id: 1,
    appointment_number: 'APT-2026-0008',
    patient_id: 2, doctor_id: 5,
    created_by: 2,
    appointment_date: '2026-03-21',
    start_time: '11:30', end_time: '12:00',
    appointment_type: 'ONLINE',
    status: 'CONFIRMED',
    chief_complaint: 'Child vaccination schedule and growth monitoring',
    symptoms: [],
    consultation_notes: null,
    meeting_provider: 'GOOGLE_MEET',
    meeting_link: 'https://meet.google.com/xyz-uvwx-yza',
    meeting_id: 'xyz-uvwx-yza', meeting_password: null, recording_url: null,
    consultation_fee: 550,
    payment_status: 'PAID',
    payment_id: 4,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Manish Gupta (for child)',
    doctor_name: 'Dr. Ritu Agarwal',
    specialization: 'Pediatrics',
    created_at: '2026-03-18',
  },
  {
    id: 9, hospital_id: 1,
    appointment_number: 'APT-2026-0009',
    patient_id: 2, doctor_id: 4,
    created_by: 2,
    appointment_date: '2026-03-22',
    start_time: '14:30', end_time: '15:00',
    appointment_type: 'OFFLINE',
    status: 'COMPLETED',
    chief_complaint: 'Psoriasis treatment review',
    symptoms: ['plaques', 'scaling'],
    consultation_notes: 'Moderate improvement with clobetasol. Continuing same regimen.',
    meeting_provider: null, meeting_link: null, meeting_id: null, meeting_password: null, recording_url: null,
    consultation_fee: 450,
    payment_status: 'PAID',
    payment_id: 5,
    is_followup: true, followup_from: null,
    cancelled_at: null, cancelled_reason: null,
    completed_at: '2026-03-22 14:58:00',
    patient_name: 'Ravi Mehta',
    doctor_name: 'Dr. Vikram Shah',
    specialization: 'Dermatology',
    created_at: '2026-03-18',
  },
  {
    id: 10, hospital_id: 1,
    appointment_number: 'APT-2026-0010',
    patient_id: 4, doctor_id: 1,
    created_by: 4,
    appointment_date: '2026-03-22',
    start_time: '16:00', end_time: '16:30',
    appointment_type: 'ONLINE',
    status: 'PENDING',
    chief_complaint: 'Annual cardiac check-up and review of medications',
    symptoms: [],
    consultation_notes: null,
    meeting_provider: 'ZOOM',
    meeting_link: 'https://zoom.us/j/11223344',
    meeting_id: '112-233-445', meeting_password: 'card789', recording_url: null,
    consultation_fee: 800,
    payment_status: 'PENDING',
    payment_id: null,
    is_followup: false, followup_from: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    patient_name: 'Kiran Joshi',
    doctor_name: 'Dr. Priya Sharma',
    specialization: 'Cardiology',
    created_at: '2026-03-19',
  },
];

let nextId = 11;
let nextAptNum = 11;

const padAptNum = (n) => `APT-2026-${String(n).padStart(4, '0')}`;

export const getAllAppointments         = async () => { await delay(400); return [...APPOINTMENTS]; };
export const getAppointmentsByDoctor   = async (doctorId) => { await delay(350); return APPOINTMENTS.filter((a) => a.doctor_id === Number(doctorId)); };
export const getAppointmentsByPatient  = async (patientId) => { await delay(350); return APPOINTMENTS.filter((a) => a.patient_id === Number(patientId)); };
export const getAppointmentById        = async (id) => { await delay(200); return APPOINTMENTS.find((a) => a.id === Number(id)) || null; };

export const createAppointment = async (data) => {
  await delay(600);
  const appt = {
    id: nextId++,
    hospital_id: 1,
    appointment_number: padAptNum(nextAptNum++),
    status: 'PENDING',
    payment_status: 'PENDING',
    payment_id: null,
    symptoms: [],
    consultation_notes: null,
    cancelled_at: null, cancelled_reason: null, completed_at: null,
    recording_url: null,
    created_at: new Date().toISOString().split('T')[0],
    ...data,
  };
  APPOINTMENTS.push(appt);
  return appt;
};

export const updateAppointmentStatus = async (id, status, extra = {}) => {
  await delay(400);
  const idx = APPOINTMENTS.findIndex((a) => a.id === Number(id));
  if (idx === -1) throw new Error('Appointment not found');
  APPOINTMENTS[idx] = { ...APPOINTMENTS[idx], status, ...extra };
  return APPOINTMENTS[idx];
};

export const cancelAppointment  = async (id, cancelled_reason = '') => {
  return updateAppointmentStatus(id, 'CANCELLED', { cancelled_at: new Date().toISOString(), cancelled_reason });
};
export const approveAppointment = async (id) => updateAppointmentStatus(id, 'CONFIRMED');
export const completeAppointment = async (id) => {
  return updateAppointmentStatus(id, 'COMPLETED', { completed_at: new Date().toISOString() });
};

export const getAppointmentStats = async () => {
  await delay(300);
  const total     = APPOINTMENTS.length;
  const pending   = APPOINTMENTS.filter((a) => a.status === 'PENDING').length;
  const confirmed = APPOINTMENTS.filter((a) => a.status === 'CONFIRMED').length;
  const completed = APPOINTMENTS.filter((a) => a.status === 'COMPLETED').length;
  const cancelled = APPOINTMENTS.filter((a) => a.status === 'CANCELLED').length;
  const revenue   = APPOINTMENTS.filter((a) => a.payment_status === 'PAID').reduce((s, a) => s + a.consultation_fee, 0);
  return { total, pending, confirmed, completed, cancelled, revenue };
};

// Compat aliases used by existing modules
export const getAppointments = getAllAppointments;
