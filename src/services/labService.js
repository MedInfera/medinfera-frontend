// ─── Lab Service — aligned to Prisma schema ────────────────────────────────────
// Models: LabTest, LabTestPanel, LabPanelTest, LabOrder, LabOrderItem

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const LAB_STATUSES   = ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];
export const LAB_PRIORITIES = ['ROUTINE', 'URGENT', 'STAT'];
export const SAMPLE_TYPES   = ['BLOOD', 'URINE', 'STOOL', 'SPUTUM', 'SWAB', 'CSF', 'TISSUE', 'OTHER'];
export const LAB_CATEGORIES = ['HAEMATOLOGY', 'BIOCHEMISTRY', 'MICROBIOLOGY', 'SEROLOGY', 'ENDOCRINOLOGY', 'URINE', 'HISTOPATHOLOGY', 'OTHER'];

let LAB_TESTS = [
  { id: 1, hospital_id: 1, name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'HAEMATOLOGY', sample_type: 'BLOOD', price: 350, gst_rate: 5, turnaround_hours: 4, normal_range_male: 'RBC: 4.5–5.5 M/µL', normal_range_female: 'RBC: 4.0–5.0 M/µL', unit: 'M/µL', is_active: true },
  { id: 2, hospital_id: 1, name: 'Blood Glucose (Fasting)', code: 'FBS', category: 'BIOCHEMISTRY', sample_type: 'BLOOD', price: 120, gst_rate: 5, turnaround_hours: 2, normal_range_male: '70–100 mg/dL', normal_range_female: '70–100 mg/dL', unit: 'mg/dL', is_active: true },
  { id: 3, hospital_id: 1, name: 'Lipid Profile', code: 'LIPID', category: 'BIOCHEMISTRY', sample_type: 'BLOOD', price: 600, gst_rate: 5, turnaround_hours: 6, normal_range_male: 'TC < 200 mg/dL', normal_range_female: 'TC < 200 mg/dL', unit: 'mg/dL', is_active: true },
  { id: 4, hospital_id: 1, name: 'Liver Function Test (LFT)', code: 'LFT', category: 'BIOCHEMISTRY', sample_type: 'BLOOD', price: 750, gst_rate: 5, turnaround_hours: 6, normal_range_male: 'ALT: 7–56 U/L', normal_range_female: 'ALT: 7–56 U/L', unit: 'U/L', is_active: true },
  { id: 5, hospital_id: 1, name: 'Kidney Function Test (KFT)', code: 'KFT', category: 'BIOCHEMISTRY', sample_type: 'BLOOD', price: 650, gst_rate: 5, turnaround_hours: 6, normal_range_male: 'Creatinine: 0.7–1.2', normal_range_female: 'Creatinine: 0.5–1.0', unit: 'mg/dL', is_active: true },
  { id: 6, hospital_id: 1, name: 'HbA1c', code: 'HBA1C', category: 'ENDOCRINOLOGY', sample_type: 'BLOOD', price: 400, gst_rate: 5, turnaround_hours: 8, normal_range_male: '< 5.7%', normal_range_female: '< 5.7%', unit: '%', is_active: true },
  { id: 7, hospital_id: 1, name: 'Thyroid Panel (TSH/T3/T4)', code: 'TFT', category: 'ENDOCRINOLOGY', sample_type: 'BLOOD', price: 900, gst_rate: 5, turnaround_hours: 12, normal_range_male: 'TSH: 0.4–4.0 mIU/L', normal_range_female: 'TSH: 0.4–4.0 mIU/L', unit: 'mIU/L', is_active: true },
  { id: 8, hospital_id: 1, name: 'Urine Routine & Microscopy', code: 'URE', category: 'URINE', sample_type: 'URINE', price: 180, gst_rate: 5, turnaround_hours: 3, normal_range_male: 'pH: 4.5–8', normal_range_female: 'pH: 4.5–8', unit: '', is_active: true },
  { id: 9, hospital_id: 1, name: 'ECG (12-Lead)', code: 'ECG', category: 'OTHER', sample_type: 'OTHER', price: 250, gst_rate: 5, turnaround_hours: 1, normal_range_male: 'Normal sinus rhythm', normal_range_female: 'Normal sinus rhythm', unit: '', is_active: true },
  { id: 10, hospital_id: 1, name: 'COVID-19 RT-PCR', code: 'COVIDPCR', category: 'MICROBIOLOGY', sample_type: 'SWAB', price: 700, gst_rate: 5, turnaround_hours: 24, normal_range_male: 'Negative', normal_range_female: 'Negative', unit: '', is_active: true },
];

let LAB_PANELS = [
  { id: 1, hospital_id: 1, name: 'Basic Health Checkup', code: 'BASIC', price: 1200, is_active: true, test_ids: [1, 2, 8] },
  { id: 2, hospital_id: 1, name: 'Comprehensive Metabolic Panel', code: 'CMP', price: 2000, is_active: true, test_ids: [1, 2, 3, 4, 5] },
  { id: 3, hospital_id: 1, name: 'Diabetes Screening', code: 'DIAB', price: 750, is_active: true, test_ids: [2, 6] },
  { id: 4, hospital_id: 1, name: 'Thyroid + Diabetes', code: 'THY_DIAB', price: 1200, is_active: true, test_ids: [6, 7] },
];

let nextOrderNum = 5;
const padOrder   = (n) => `LAB-2026-${String(n).padStart(4, '0')}`;

let LAB_ORDERS = [
  {
    id: 1, hospital_id: 1, order_number: 'LAB-2026-0001',
    patient_id: 1, patient_name: 'Aisha Nair',
    doctor_id: 1, doctor_name: 'Dr. Priya Sharma',
    appointment_id: 1, admission_id: null,
    status: 'COMPLETED', priority: 'ROUTINE',
    clinical_info: 'Routine cardiac checkup',
    ordered_by: 'Dr. Priya Sharma', collected_by: 'Lab Tech Suresh', processed_by: 'Lab Tech Suresh', reviewed_by: 'Dr. Priya Sharma',
    ordered_at: '2026-03-18T09:30:00', sample_collected_at: '2026-03-18T10:00:00', completed_at: '2026-03-18T14:00:00', reported_at: '2026-03-18T14:30:00',
    items: [
      { id: 1, lab_test_id: 1, test_name: 'CBC', result_value: 'Hb: 13.2, RBC: 4.8, WBC: 7200', result_notes: 'Within normal limits', is_abnormal: false, completed_at: '2026-03-18T14:00:00' },
      { id: 2, lab_test_id: 9, test_name: 'ECG', result_value: 'Normal sinus rhythm, no ST changes', result_notes: '', is_abnormal: false, completed_at: '2026-03-18T10:30:00' },
    ],
  },
  {
    id: 2, hospital_id: 1, order_number: 'LAB-2026-0002',
    patient_id: 2, patient_name: 'Ravi Mehta',
    doctor_id: 2, doctor_name: 'Dr. Arjun Patel',
    appointment_id: null, admission_id: 2,
    status: 'IN_PROGRESS', priority: 'URGENT',
    clinical_info: 'TBI — baseline labs',
    ordered_by: 'Dr. Arjun Patel', collected_by: 'Lab Tech Suresh', processed_by: null, reviewed_by: null,
    ordered_at: '2026-03-19T15:00:00', sample_collected_at: '2026-03-19T15:30:00', completed_at: null, reported_at: null,
    items: [
      { id: 3, lab_test_id: 1, test_name: 'CBC', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
      { id: 4, lab_test_id: 4, test_name: 'LFT', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
      { id: 5, lab_test_id: 5, test_name: 'KFT', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
    ],
  },
  {
    id: 3, hospital_id: 1, order_number: 'LAB-2026-0003',
    patient_id: 3, patient_name: 'Sunita Verma',
    doctor_id: 3, doctor_name: 'Dr. Meena Reddy',
    appointment_id: 3, admission_id: null,
    status: 'ORDERED', priority: 'ROUTINE',
    clinical_info: 'Pre-op labs for knee surgery',
    ordered_by: 'Dr. Meena Reddy', collected_by: null, processed_by: null, reviewed_by: null,
    ordered_at: '2026-03-25T09:00:00', sample_collected_at: null, completed_at: null, reported_at: null,
    items: [
      { id: 6, lab_test_id: 1, test_name: 'CBC', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
      { id: 7, lab_test_id: 2, test_name: 'FBS', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
    ],
  },
  {
    id: 4, hospital_id: 1, order_number: 'LAB-2026-0004',
    patient_id: 5, patient_name: 'Deepak Singh',
    doctor_id: 1, doctor_name: 'Dr. Priya Sharma',
    appointment_id: null, admission_id: 4,
    status: 'SAMPLE_COLLECTED', priority: 'STAT',
    clinical_info: 'Hypertensive emergency workup',
    ordered_by: 'Dr. Priya Sharma', collected_by: 'Lab Tech Suresh', processed_by: null, reviewed_by: null,
    ordered_at: '2026-03-22T08:30:00', sample_collected_at: '2026-03-22T09:00:00', completed_at: null, reported_at: null,
    items: [
      { id: 8, lab_test_id: 5, test_name: 'KFT', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
      { id: 9, lab_test_id: 3, test_name: 'Lipid Profile', result_value: null, result_notes: null, is_abnormal: null, completed_at: null },
    ],
  },
];

export const getLabStats = async () => {
  await delay(300);
  return {
    total: LAB_ORDERS.length,
    ordered: LAB_ORDERS.filter(o => o.status === 'ORDERED').length,
    in_progress: LAB_ORDERS.filter(o => ['SAMPLE_COLLECTED', 'IN_PROGRESS'].includes(o.status)).length,
    completed: LAB_ORDERS.filter(o => o.status === 'COMPLETED').length,
  };
};

export const getAllLabOrders = async (filter = 'all') => {
  await delay(400);
  if (filter === 'all') return [...LAB_ORDERS];
  return LAB_ORDERS.filter(o => o.status === filter);
};

export const getAllLabTests = async () => { await delay(300); return [...LAB_TESTS]; };
export const getAllLabPanels = async () => {
  await delay(300);
  return LAB_PANELS.map(p => ({
    ...p,
    tests: p.test_ids.map(id => LAB_TESTS.find(t => t.id === id)).filter(Boolean),
  }));
};

export const createLabTest = async (data) => {
  await delay(400);
  const rec = { id: LAB_TESTS.length + 1, hospital_id: 1, is_active: true, ...data };
  LAB_TESTS.push(rec);
  return rec;
};

export const updateLabTest = async (id, data) => {
  await delay(400);
  LAB_TESTS = LAB_TESTS.map(t => t.id === Number(id) ? { ...t, ...data } : t);
  return LAB_TESTS.find(t => t.id === Number(id));
};

export const deleteLabTest = async (id) => {
  await delay(300);
  LAB_TESTS = LAB_TESTS.filter(t => t.id !== Number(id));
  return { success: true };
};

export const createLabOrder = async (data) => {
  await delay(500);
  const num = padOrder(nextOrderNum);
  const rec = {
    id: nextOrderNum,
    hospital_id: 1,
    order_number: num,
    status: 'ORDERED',
    ordered_at: new Date().toISOString(),
    sample_collected_at: null, completed_at: null, reported_at: null,
    collected_by: null, processed_by: null, reviewed_by: null,
    ...data,
  };
  LAB_ORDERS.push(rec);
  nextOrderNum++;
  return rec;
};

export const updateLabOrderStatus = async (id, status, extra = {}) => {
  await delay(400);
  const now = new Date().toISOString();
  const updates = { status, ...extra };
  if (status === 'SAMPLE_COLLECTED') updates.sample_collected_at = now;
  if (status === 'COMPLETED') updates.completed_at = now;
  if (status === 'COMPLETED') updates.reported_at = now;
  LAB_ORDERS = LAB_ORDERS.map(o => o.id === Number(id) ? { ...o, ...updates } : o);
  return LAB_ORDERS.find(o => o.id === Number(id));
};

export const updateLabItemResult = async (orderId, itemId, resultData) => {
  await delay(300);
  LAB_ORDERS = LAB_ORDERS.map(o => {
    if (o.id !== Number(orderId)) return o;
    return {
      ...o,
      items: o.items.map(item =>
        item.id === Number(itemId) ? { ...item, ...resultData, completed_at: new Date().toISOString() } : item
      ),
    };
  });
  return LAB_ORDERS.find(o => o.id === Number(orderId));
};
