// ─── Pharmacist Service — aligned to users table ──────────────────────────────
// Pharmacists are stored as users (role_id = pharmacist).
// Schema: users table only — no separate pharmacists table.
// users: first_name, last_name, email, phone, alternate_phone,
//        profile_photo, is_active, preferred_language, role_id
// NOTE: address, aadhaar_number, salary, joining_date, shift,
//       pharmacy_name, license_number, license_expiry, qualification,
//       experience_years are NOT in any schema table.

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

let PHARMACISTS = [
  {
    id: 1, hospital_id: 1, role: 'pharmacist', role_id: 5,
    // users table — exact columns
    first_name: 'Dinesh', last_name: 'Bhatia',
    email: 'dinesh.bhatia@medinfera.com',
    phone: '+91 98120 10001', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'en',
    created_at: '2025-09-05',
    designation: 'Chief Pharmacist',
  },
  {
    id: 2, hospital_id: 1, role: 'pharmacist', role_id: 5,
    first_name: 'Seema', last_name: 'Joshi',
    email: 'seema.joshi@medinfera.com',
    phone: '+91 98120 20002', alternate_phone: '',
    profile_photo: null, is_active: true, preferred_language: 'hi',
    created_at: '2026-01-15',
    designation: 'Pharmacist',
  },
];
let nextId = 3;

// Inventory — medicine_batches table display
// Keeping for Inventory UI — these are medicine_batches records
let INVENTORY = [
  { id: 1, medicine_id: 1, medicine_name: 'Amlodipine 5mg', batch_number: 'BCH-2026-001', quantity_total: 500, quantity_available: 342, expiry_date: '2027-06-30', purchase_price: 35, selling_price: 45, supplier: 'Sun Pharma', status: 'in-stock' },
  { id: 2, medicine_id: 2, medicine_name: 'Metoprolol 50mg', batch_number: 'BCH-2026-002', quantity_total: 300, quantity_available: 89,  expiry_date: '2027-03-31', purchase_price: 48, selling_price: 62, supplier: 'Cipla', status: 'low-stock' },
  { id: 3, medicine_id: 8, medicine_name: 'Paracetamol 500mg', batch_number: 'BCH-2026-003', quantity_total: 1000, quantity_available: 756, expiry_date: '2028-01-31', purchase_price: 8, selling_price: 12, supplier: 'Micro Labs', status: 'in-stock' },
  { id: 4, medicine_id: 7, medicine_name: 'Ibuprofen 400mg', batch_number: 'BCH-2026-004', quantity_total: 400, quantity_available: 12,  expiry_date: '2026-06-30', purchase_price: 12, selling_price: 18, supplier: 'Abbott', status: 'critical' },
  { id: 5, medicine_id: 5, medicine_name: 'Cefixime 200mg', batch_number: 'BCH-2026-005', quantity_total: 200, quantity_available: 178, expiry_date: '2025-12-31', purchase_price: 75, selling_price: 95, supplier: 'Alkem', status: 'expiring-soon' },
  { id: 6, medicine_id: 6, medicine_name: 'Azithromycin 500mg', batch_number: 'BCH-2026-006', quantity_total: 150, quantity_available: 94, expiry_date: '2027-09-30', purchase_price: 85, selling_price: 110, supplier: 'Pfizer', status: 'in-stock' },
  { id: 7, medicine_id: 11, medicine_name: 'Metformin 500mg', batch_number: 'BCH-2026-007', quantity_total: 600, quantity_available: 445, expiry_date: '2027-12-31', purchase_price: 15, selling_price: 22, supplier: 'USV', status: 'in-stock' },
  { id: 8, medicine_id: 19, medicine_name: 'Vitamin D3 60000IU', batch_number: 'BCH-2026-008', quantity_total: 100, quantity_available: 0,  expiry_date: '2027-06-30', purchase_price: 20, selling_price: 28, supplier: 'Elder Pharma', status: 'out-of-stock' },
];

let DISPENSING_LOG = [
  { id: 1, prescription_id: 'RX-2026-0001', patient_name: 'Sunita Verma', medicine: 'Amlodipine 5mg', quantity: 30, dispensed_by: 'Dinesh Bhatia', date: '2026-03-18', amount: 1350 },
  { id: 2, prescription_id: 'RX-2026-0002', patient_name: 'Ravi Mehta', medicine: 'Cetirizine 10mg', quantity: 14, dispensed_by: 'Seema Joshi', date: '2026-03-22', amount: 210 },
  { id: 3, prescription_id: 'RX-2026-0003', patient_name: 'Aisha Nair', medicine: 'Amlodipine 5mg', quantity: 30, dispensed_by: 'Dinesh Bhatia', date: '2026-03-18', amount: 1350 },
];

export const fullName = (p) => `${p.first_name || ''} ${p.last_name || ''}`.trim();

export const getAllPharmacists = async () => {
  await delay(300);
  return PHARMACISTS.map((p) => ({ ...p, name: fullName(p) }));
};

export const getInventory     = async () => { await delay(350); return [...INVENTORY]; };
export const getDispensingLog = async () => { await delay(300); return [...DISPENSING_LOG]; };

export const createPharmacist = async (data) => {
  await delay(600);
  const p = {
    id: nextId++, hospital_id: 1, role: 'pharmacist', role_id: 5,
    is_active: true, preferred_language: 'en', profile_photo: null,
    created_at: new Date().toISOString().split('T')[0],
    first_name:      data.first_name      || '',
    last_name:       data.last_name       || '',
    email:           data.email           || '',
    phone:           data.phone           || '',
    alternate_phone: data.alternate_phone || '',
    preferred_language: data.preferred_language || 'en',
    profile_photo:   data.profile_photo   || null,
    designation:     data.designation     || 'Pharmacist',
  };
  PHARMACISTS.push(p);
  return { ...p, name: fullName(p) };
};

export const updatePharmacist = async (id, data) => {
  await delay(500);
  const idx = PHARMACISTS.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error('Pharmacist not found');
  PHARMACISTS[idx] = { ...PHARMACISTS[idx], ...data };
  return { ...PHARMACISTS[idx], name: fullName(PHARMACISTS[idx]) };
};

export const getPharmacyStats = async () => {
  await delay(300);
  return {
    totalPharmacists: PHARMACISTS.length,
    totalBatches:     INVENTORY.length,
    inStock:     INVENTORY.filter((i) => i.status === 'in-stock').length,
    lowStock:    INVENTORY.filter((i) => i.status === 'low-stock').length,
    critical:    INVENTORY.filter((i) => i.status === 'critical').length,
    outOfStock:  INVENTORY.filter((i) => i.status === 'out-of-stock').length,
    expiringSoon:INVENTORY.filter((i) => i.status === 'expiring-soon').length,
    dispensedToday: 3,
  };
};

export const INVENTORY_STATUSES = ['in-stock','low-stock','critical','out-of-stock','expiring-soon'];

export const dispenseItem = async (id, quantity) => {
  await delay(400);
  const item = INVENTORY.find((i) => i.id === Number(id));
  if (!item) throw new Error('Item not found');
  if (item.quantity_available < quantity) throw new Error('Insufficient stock');
  item.quantity_available -= quantity;
  if (item.quantity_available === 0) item.status = 'out-of-stock';
  else if (item.quantity_available < 20) item.status = 'critical';
  return item;
};
