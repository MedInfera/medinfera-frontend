// ─── IPD Service — aligned to Prisma schema ────────────────────────────────────
// Models: IpdAdmission, IpdNote, IpdBedTransfer, IpdAttendingDoctor, VitalSign

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const IPD_STATUSES = ['ADMITTED', 'UNDER_TREATMENT', 'CRITICAL', 'STABLE', 'DISCHARGED', 'TRANSFERRED', 'ABSCONDED', 'DECEASED'];
export const NOTE_TYPES   = ['PROGRESS', 'NURSING', 'DOCTOR', 'DISCHARGE', 'PROCEDURE', 'OBSERVATION'];

let nextAdmNum = 7;
const padAdm   = (n) => `IPD-2026-${String(n).padStart(4, '0')}`;

let ADMISSIONS = [
  {
    id: 1, hospital_id: 1,
    admission_number: 'IPD-2026-0001',
    patient_id: 1, patient_name: 'Aisha Nair',
    primary_doctor_id: 1, primary_doctor_name: 'Dr. Priya Sharma',
    bed_id: 1, bed_number: 'B-101', ward_id: 1, ward_name: 'General Ward A',
    admission_date: '2026-03-20T09:00:00',
    expected_discharge: '2026-03-27',
    discharge_date: null,
    status: 'UNDER_TREATMENT',
    reason_for_admission: 'Chest pain and breathlessness',
    provisional_diagnosis: 'Unstable Angina',
    final_diagnosis: null,
    treatment_summary: null,
    discharge_notes: null,
    referred_by: 'Dr. Ravi Kumar',
    admitted_by: 'Dr. Priya Sharma',
    discharged_by: null,
    created_at: '2026-03-20',
  },
  {
    id: 2, hospital_id: 1,
    admission_number: 'IPD-2026-0002',
    patient_id: 2, patient_name: 'Ravi Mehta',
    primary_doctor_id: 2, primary_doctor_name: 'Dr. Arjun Patel',
    bed_id: 3, bed_number: 'ICU-02', ward_id: 3, ward_name: 'ICU',
    admission_date: '2026-03-19T14:30:00',
    expected_discharge: '2026-03-26',
    discharge_date: null,
    status: 'CRITICAL',
    reason_for_admission: 'Severe head injury after road accident',
    provisional_diagnosis: 'Traumatic Brain Injury',
    final_diagnosis: null,
    treatment_summary: null,
    discharge_notes: null,
    referred_by: null,
    admitted_by: 'Dr. Arjun Patel',
    discharged_by: null,
    created_at: '2026-03-19',
  },
  {
    id: 3, hospital_id: 1,
    admission_number: 'IPD-2026-0003',
    patient_id: 3, patient_name: 'Sunita Verma',
    primary_doctor_id: 3, primary_doctor_name: 'Dr. Meena Reddy',
    bed_id: 5, bed_number: 'P-201', ward_id: 4, ward_name: 'Private Rooms',
    admission_date: '2026-03-15T11:00:00',
    expected_discharge: '2026-03-22',
    discharge_date: '2026-03-22T10:00:00',
    status: 'DISCHARGED',
    reason_for_admission: 'Hip replacement surgery',
    provisional_diagnosis: 'Osteoarthritis — Hip',
    final_diagnosis: 'Osteoarthritis — Hip',
    treatment_summary: 'Total hip replacement performed successfully. Patient recovered well.',
    discharge_notes: 'Follow up in 2 weeks. Physiotherapy twice weekly.',
    referred_by: null,
    admitted_by: 'Dr. Meena Reddy',
    discharged_by: 'Dr. Meena Reddy',
    created_at: '2026-03-15',
  },
  {
    id: 4, hospital_id: 1,
    admission_number: 'IPD-2026-0004',
    patient_id: 5, patient_name: 'Deepak Singh',
    primary_doctor_id: 1, primary_doctor_name: 'Dr. Priya Sharma',
    bed_id: 2, bed_number: 'B-102', ward_id: 1, ward_name: 'General Ward A',
    admission_date: '2026-03-22T08:00:00',
    expected_discharge: '2026-03-28',
    discharge_date: null,
    status: 'ADMITTED',
    reason_for_admission: 'Hypertensive crisis',
    provisional_diagnosis: 'Hypertensive Emergency',
    final_diagnosis: null,
    treatment_summary: null,
    discharge_notes: null,
    referred_by: null,
    admitted_by: 'Dr. Priya Sharma',
    discharged_by: null,
    created_at: '2026-03-22',
  },
  {
    id: 5, hospital_id: 1,
    admission_number: 'IPD-2026-0005',
    patient_id: 4, patient_name: 'Kiran Joshi',
    primary_doctor_id: 4, primary_doctor_name: 'Dr. Vikram Shah',
    bed_id: 6, bed_number: 'D-01', ward_id: 5, ward_name: 'Dermatology',
    admission_date: '2026-03-23T10:30:00',
    expected_discharge: '2026-03-30',
    discharge_date: null,
    status: 'STABLE',
    reason_for_admission: 'Severe psoriasis flare-up requiring IV therapy',
    provisional_diagnosis: 'Psoriasis Vulgaris',
    final_diagnosis: null,
    treatment_summary: null,
    discharge_notes: null,
    referred_by: null,
    admitted_by: 'Dr. Vikram Shah',
    discharged_by: null,
    created_at: '2026-03-23',
  },
];

let VITAL_SIGNS = [
  { id: 1, admission_id: 1, patient_id: 1, hospital_id: 1, bp_systolic: 145, bp_diastolic: 92, heart_rate: 88, temperature_celsius: 37.2, oxygen_saturation: 97.0, respiratory_rate: 18, weight_kg: 62.5, height_cm: 162.0, bmi: 23.8, blood_glucose: null, pain_scale: 4, notes: 'Patient comfortable', recorded_by: 'Nurse Kavitha', recorded_at: '2026-03-20T10:00:00' },
  { id: 2, admission_id: 1, patient_id: 1, hospital_id: 1, bp_systolic: 138, bp_diastolic: 88, heart_rate: 82, temperature_celsius: 36.9, oxygen_saturation: 98.0, respiratory_rate: 16, weight_kg: null, height_cm: null, bmi: null, blood_glucose: null, pain_scale: 3, notes: 'Improvement noted', recorded_by: 'Nurse Kavitha', recorded_at: '2026-03-21T08:00:00' },
  { id: 3, admission_id: 2, patient_id: 2, hospital_id: 1, bp_systolic: 160, bp_diastolic: 100, heart_rate: 102, temperature_celsius: 38.1, oxygen_saturation: 94.0, respiratory_rate: 22, weight_kg: 78.0, height_cm: 175.0, bmi: 25.5, blood_glucose: null, pain_scale: 8, notes: 'GCS 10, pupils reactive', recorded_by: 'Nurse Mohan', recorded_at: '2026-03-19T15:00:00' },
];

let IPD_NOTES = [
  { id: 1, admission_id: 1, hospital_id: 1, note_type: 'PROGRESS', content: 'Patient stable. ECG shows ST changes resolving. Cardiology consult done. Continue current medications.', written_by: 'Dr. Priya Sharma', written_at: '2026-03-20T14:00:00' },
  { id: 2, admission_id: 1, hospital_id: 1, note_type: 'NURSING', content: 'Vitals stable. Patient ambulatory. Oral intake adequate. No complaints.', written_by: 'Nurse Kavitha', written_at: '2026-03-21T09:00:00' },
  { id: 3, admission_id: 2, hospital_id: 1, note_type: 'DOCTOR', content: 'CT scan shows right temporal hematoma. Neurosurgery team alerted. Monitoring ICP closely.', written_by: 'Dr. Arjun Patel', written_at: '2026-03-19T16:00:00' },
];

let nextVitalId = 4;
let nextNoteId  = 4;

export const getIpdStats = async () => {
  await delay(300);
  const active    = ADMISSIONS.filter(a => a.status !== 'DISCHARGED').length;
  const critical  = ADMISSIONS.filter(a => a.status === 'CRITICAL').length;
  const discharged= ADMISSIONS.filter(a => a.status === 'DISCHARGED').length;
  return { total: ADMISSIONS.length, active, critical, discharged };
};

export const getAllAdmissions = async (filter = 'all') => {
  await delay(400);
  if (filter === 'all') return [...ADMISSIONS];
  if (filter === 'ACTIVE') return ADMISSIONS.filter(a => a.status !== 'DISCHARGED');
  return ADMISSIONS.filter(a => a.status === filter);
};

export const getAdmissionById = async (id) => {
  await delay(200);
  return ADMISSIONS.find(a => a.id === Number(id)) || null;
};

export const createAdmission = async (data) => {
  await delay(500);
  const rec = {
    id: nextAdmNum,
    hospital_id: 1,
    admission_number: padAdm(nextAdmNum),
    ...data,
    status: 'ADMITTED',
    discharge_date: null,
    final_diagnosis: null,
    treatment_summary: null,
    discharge_notes: null,
    discharged_by: null,
    created_at: new Date().toISOString().split('T')[0],
  };
  ADMISSIONS.push(rec);
  nextAdmNum++;
  return rec;
};

export const updateAdmission = async (id, data) => {
  await delay(400);
  ADMISSIONS = ADMISSIONS.map(a => a.id === Number(id) ? { ...a, ...data } : a);
  return ADMISSIONS.find(a => a.id === Number(id));
};

export const dischargeAdmission = async (id, data) => {
  await delay(500);
  const now = new Date().toISOString();
  return updateAdmission(id, {
    status: 'DISCHARGED',
    discharge_date: now,
    ...data,
  });
};

// Vital Signs
export const getVitalSigns = async (admissionId) => {
  await delay(300);
  return VITAL_SIGNS.filter(v => v.admission_id === Number(admissionId));
};

export const addVitalSign = async (data) => {
  await delay(400);
  const rec = { id: nextVitalId, ...data, recorded_at: new Date().toISOString() };
  VITAL_SIGNS.push(rec);
  nextVitalId++;
  return rec;
};

// IPD Notes
export const getIpdNotes = async (admissionId) => {
  await delay(300);
  return IPD_NOTES.filter(n => n.admission_id === Number(admissionId));
};

export const addIpdNote = async (data) => {
  await delay(400);
  const rec = { id: nextNoteId, ...data, written_at: new Date().toISOString() };
  IPD_NOTES.push(rec);
  nextNoteId++;
  return rec;
};
