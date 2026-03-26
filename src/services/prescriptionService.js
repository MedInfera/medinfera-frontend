// ─── Prescription Service — exact PostgreSQL schema alignment ─────────────────
// prescriptions table + prescription_medicines table

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// prescription_medicines.route options
export const MEDICINE_ROUTES = ['ORAL', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALATION', 'SUBLINGUAL', 'RECTAL', 'NASAL'];

let PRESCRIPTIONS = [
  {
    // prescriptions table fields — exact column names
    id: 1, hospital_id: 1,
    prescription_number: 'RX-2026-0001',
    appointment_id: 3,        // NOT NULL in schema
    patient_id: 3, doctor_id: 1,
    diagnosis: 'Essential Hypertension — Stage 1',
    subjective_findings: 'Patient complains of occasional headaches and dizziness. BP elevated at home per diary readings. No chest pain.',
    objective_findings:  'BP: 140/90 mmHg, Pulse: 78/min, Weight: 62kg, SpO2: 98%. No pedal oedema.',
    assessment: 'Stage 1 hypertension with good medication adherence. Target organ damage absent.',
    advice: 'Low sodium diet (<2g/day). 30-min brisk walk daily. Avoid stress. Report if BP >160/100.',
    followup_date: '2026-04-18',
    qr_code: 'RX-2026-0001',
    is_verified: false, verified_at: null, verified_by: null,
    created_at: '2026-03-18', updated_at: '2026-03-18',
    // JOIN display fields
    patient_name: 'Aisha Nair',
    doctor_name: 'Dr. Priya Sharma',
    doctor_specialization: 'Cardiology',
    // prescription_medicines (child table rows embedded for display)
    medicines: [
      { id: 1, prescription_id: 1, medicine_id: 1, medicine_batch_id: null,
        medicine_name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate',
        dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '30 days',
        route: 'ORAL', instructions: 'Take after evening meal',
        quantity_prescribed: 30, quantity_dispensed: 30, is_dispensed: true },
      { id: 2, prescription_id: 1, medicine_id: 2, medicine_batch_id: null,
        medicine_name: 'Metoprolol 50mg', generic_name: 'Metoprolol Tartrate',
        dosage: '1 tablet', frequency: 'Twice daily (BD)', duration: '30 days',
        route: 'ORAL', instructions: 'Take after meals',
        quantity_prescribed: 60, quantity_dispensed: 60, is_dispensed: true },
    ],
  },
  {
    id: 2, hospital_id: 1,
    prescription_number: 'RX-2026-0002',
    appointment_id: 9,
    patient_id: 2, doctor_id: 4,
    diagnosis: 'Plaque Psoriasis — Moderate severity',
    subjective_findings: 'Widespread scaly plaques on scalp, elbows and knees since 6 months. Significant pruritus affecting sleep.',
    objective_findings:  'PASI score 12. Plaques 5-10cm, well-defined. No nail or joint involvement.',
    assessment: 'Moderate plaque psoriasis. Responding to topical therapy.',
    advice: 'Avoid scratching. Use mild soap. Moisturize twice daily. Avoid sun exposure on plaques.',
    followup_date: '2026-04-05',
    qr_code: 'RX-2026-0002',
    is_verified: false, verified_at: null, verified_by: null,
    created_at: '2026-03-22', updated_at: '2026-03-22',
    patient_name: 'Ravi Mehta',
    doctor_name: 'Dr. Vikram Shah',
    doctor_specialization: 'Dermatology',
    medicines: [
      { id: 3, prescription_id: 2, medicine_id: 3, medicine_batch_id: null,
        medicine_name: 'Clobetasol Propionate Cream 0.05%', generic_name: 'Clobetasol Propionate',
        dosage: 'Thin film', frequency: 'Twice daily (BD)', duration: '14 days',
        route: 'TOPICAL', instructions: 'Apply to affected skin only. Do not use on face.',
        quantity_prescribed: 2, quantity_dispensed: 2, is_dispensed: true },
      { id: 4, prescription_id: 2, medicine_id: 7, medicine_batch_id: null,
        medicine_name: 'Cetirizine 10mg', generic_name: 'Cetirizine Hydrochloride',
        dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '14 days',
        route: 'ORAL', instructions: 'Take at bedtime',
        quantity_prescribed: 14, quantity_dispensed: 0, is_dispensed: false },
    ],
  },
  {
    id: 3, hospital_id: 1,
    prescription_number: 'RX-2026-0003',
    appointment_id: 1,
    patient_id: 1, doctor_id: 1,
    diagnosis: 'Hypertension — Follow-up, well controlled',
    subjective_findings: 'Patient reports no headaches. BP maintained well at home. Good medication compliance.',
    objective_findings:  'BP: 128/82 mmHg, Pulse: 74/min, Weight: 62kg.',
    assessment: 'Hypertension well controlled on current regime. No adverse effects reported.',
    advice: 'Continue current medications. Salt restriction 2g/day. Report if BP exceeds 160/100.',
    followup_date: '2026-04-18',
    qr_code: 'RX-2026-0003',
    is_verified: true, verified_at: '2026-03-18 11:30:00', verified_by: 5,
    created_at: '2026-03-18', updated_at: '2026-03-18',
    patient_name: 'Aisha Nair',
    doctor_name: 'Dr. Priya Sharma',
    doctor_specialization: 'Cardiology',
    medicines: [
      { id: 5, prescription_id: 3, medicine_id: 1, medicine_batch_id: null,
        medicine_name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate',
        dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '30 days',
        route: 'ORAL', instructions: 'Take after evening meal',
        quantity_prescribed: 30, quantity_dispensed: 30, is_dispensed: true },
      { id: 6, prescription_id: 3, medicine_id: 4, medicine_batch_id: null,
        medicine_name: 'Telmisartan 40mg', generic_name: 'Telmisartan',
        dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '30 days',
        route: 'ORAL', instructions: 'Take before breakfast',
        quantity_prescribed: 30, quantity_dispensed: 30, is_dispensed: true },
    ],
  },
];

let nextId = 4;
let nextRxNum = 4;
const padRxNum = (n) => `RX-2026-${String(n).padStart(4, '0')}`;

export const getAllPrescriptions = async () => { await delay(400); return [...PRESCRIPTIONS]; };

export const getPrescriptionsByPatient = async (patientId) => {
  await delay(350);
  return PRESCRIPTIONS.filter((p) => p.patient_id === Number(patientId));
};

export const getPrescriptionsByDoctor = async (doctorId) => {
  await delay(350);
  return PRESCRIPTIONS.filter((p) => p.doctor_id === Number(doctorId));
};

export const getPrescriptionById = async (id) => {
  await delay(200);
  return PRESCRIPTIONS.find((p) => p.id === Number(id)) || null;
};

export const createPrescription = async (data) => {
  await delay(700);
  const rx = {
    id: nextId++, hospital_id: 1,
    prescription_number: padRxNum(nextRxNum++),
    is_verified: false, verified_at: null, verified_by: null,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0],
    ...data,
    // Normalize medicines to schema structure
    medicines: (data.medicines || []).map((m, i) => ({
      id: Date.now() + i, prescription_id: nextId - 1,
      medicine_id: m.medicine_id || m.id || null,
      medicine_batch_id: m.medicine_batch_id || null,
      medicine_name: m.medicine_name || m.name || m.brand_name || '',
      generic_name:  m.generic_name || '',
      dosage:   m.dosage   || '',
      frequency: m.frequency || '',
      duration: m.duration  || '',
      route: m.route || 'ORAL',
      instructions: m.instructions || '',
      quantity_prescribed: Number(m.quantity_prescribed || m.quantity || 0),
      quantity_dispensed: 0, is_dispensed: false,
    })),
  };
  PRESCRIPTIONS.push(rx);
  return rx;
};

export const updatePrescription = async (id, data) => {
  await delay(500);
  const idx = PRESCRIPTIONS.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error('Prescription not found');
  PRESCRIPTIONS[idx] = { ...PRESCRIPTIONS[idx], ...data, updated_at: new Date().toISOString().split('T')[0] };
  return PRESCRIPTIONS[idx];
};
