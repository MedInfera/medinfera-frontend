// ─── Bed Management Service — exact PostgreSQL schema alignment ───────────────
// buildings → floors → wards → beds → bed_allocations tables

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema CHECK constraint values — UPPERCASE
export const BED_TYPES    = ['GENERAL', 'ICU', 'VENTILATOR', 'MONITORED'];
export const BED_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'DISINFECTING'];
export const WARD_TYPES   = ['GENERAL', 'ICU', 'CCU', 'NICU', 'PICU', 'PRIVATE', 'DELUXE'];
export const BED_ALLOC_STATUSES = ['ACTIVE', 'TRANSFERRED', 'DISCHARGED', 'EXPIRED'];

// buildings table
export const BUILDINGS = [
  { id: 1, hospital_id: 1, name: 'Block A — General', code: 'BLK-A', total_floors: 3, created_at: '2025-01-01' },
  { id: 2, hospital_id: 1, name: 'Block B — Critical Care', code: 'BLK-B', total_floors: 2, created_at: '2025-01-01' },
  { id: 3, hospital_id: 1, name: 'Block C — Private & Deluxe', code: 'BLK-C', total_floors: 4, created_at: '2025-01-01' },
];

// floors table
export const FLOORS = [
  { id: 1, building_id: 1, floor_number: 0, name: 'Ground Floor — OPD',   created_at: '2025-01-01' },
  { id: 2, building_id: 1, floor_number: 1, name: 'First Floor — General', created_at: '2025-01-01' },
  { id: 3, building_id: 1, floor_number: 2, name: 'Second Floor — General',created_at: '2025-01-01' },
  { id: 4, building_id: 2, floor_number: 0, name: 'Ground Floor — ICU',    created_at: '2025-01-01' },
  { id: 5, building_id: 2, floor_number: 1, name: 'First Floor — CCU',     created_at: '2025-01-01' },
  { id: 6, building_id: 3, floor_number: 2, name: 'Second Floor — Private',created_at: '2025-01-01' },
  { id: 7, building_id: 3, floor_number: 3, name: 'Third Floor — Deluxe',  created_at: '2025-01-01' },
];

// wards table
export const WARDS = [
  { id: 1, floor_id: 2, name: 'General Ward A', ward_type: 'GENERAL', total_beds: 12, created_at: '2025-01-01' },
  { id: 2, floor_id: 3, name: 'General Ward B', ward_type: 'GENERAL', total_beds: 12, created_at: '2025-01-01' },
  { id: 3, floor_id: 4, name: 'ICU',            ward_type: 'ICU',     total_beds: 8,  created_at: '2025-01-01' },
  { id: 4, floor_id: 5, name: 'CCU',            ward_type: 'CCU',     total_beds: 6,  created_at: '2025-01-01' },
  { id: 5, floor_id: 6, name: 'NICU',           ward_type: 'NICU',    total_beds: 6,  created_at: '2025-01-01' },
  { id: 6, floor_id: 7, name: 'Private Rooms',  ward_type: 'PRIVATE', total_beds: 10, created_at: '2025-01-01' },
];

// beds table
let BEDS = [
  // Ward 1 — General Ward A
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 1, ward_id: 1,
    bed_number: `A${String(i + 1).padStart(2, '0')}`,
    bed_type: 'GENERAL',
    status: i < 7 ? 'OCCUPIED' : i < 9 ? 'CLEANING' : 'AVAILABLE',
    has_oxygen: i < 7, has_suction: i < 3, has_monitor: i < 3, has_ventilator: false,
    daily_charge: 800,
    last_cleaned_at: i < 9 ? '2026-03-20 06:00:00' : null,
    last_maintenance_at: null,
    // display helpers from bed_allocations JOIN
    patient_name: i < 7 ? ['Ravi Mehta','Sunita Verma','Kiran Joshi','Deepak Singh','Pooja Das','Manish Gupta','Geeta Pillai'][i] : null,
    admitted_on: i < 7 ? '2026-03-15' : null,
  })),
  // Ward 2 — General Ward B
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 13, ward_id: 2,
    bed_number: `B${String(i + 1).padStart(2, '0')}`,
    bed_type: 'GENERAL',
    status: i < 8 ? 'OCCUPIED' : i === 8 ? 'MAINTENANCE' : 'AVAILABLE',
    has_oxygen: i < 8, has_suction: false, has_monitor: false, has_ventilator: false,
    daily_charge: 800,
    last_cleaned_at: null, last_maintenance_at: i === 8 ? '2026-03-19' : null,
    patient_name: i < 8 ? ['P. Kumar','R. Sharma','A. Singh','M. Patel','K. Das','S. Nair','T. Roy','U. Joshi'][i] : null,
    admitted_on: i < 8 ? '2026-03-14' : null,
  })),
  // Ward 3 — ICU
  ...Array.from({ length: 8 }, (_, i) => ({
    id: i + 25, ward_id: 3,
    bed_number: `ICU${String(i + 1).padStart(2, '0')}`,
    bed_type: 'ICU',
    status: i < 5 ? 'OCCUPIED' : i === 5 ? 'DISINFECTING' : 'AVAILABLE',
    has_oxygen: true, has_suction: true, has_monitor: true, has_ventilator: i < 3,
    daily_charge: 5000,
    last_cleaned_at: i === 5 ? '2026-03-20 08:00:00' : null, last_maintenance_at: null,
    patient_name: i < 5 ? ['V. Reddy','A. Khan','B. Gupta','C. Mehta','D. Pillai'][i] : null,
    admitted_on: i < 5 ? '2026-03-16' : null,
  })),
  // Ward 4 — CCU
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 33, ward_id: 4,
    bed_number: `CCU${String(i + 1).padStart(2, '0')}`,
    bed_type: 'MONITORED',
    status: i < 3 ? 'OCCUPIED' : 'AVAILABLE',
    has_oxygen: true, has_suction: true, has_monitor: true, has_ventilator: false,
    daily_charge: 3500,
    last_cleaned_at: null, last_maintenance_at: null,
    patient_name: i < 3 ? ['E. Singh','F. Sharma','G. Patel'][i] : null,
    admitted_on: i < 3 ? '2026-03-17' : null,
  })),
  // Ward 5 — NICU
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 39, ward_id: 5,
    bed_number: `NICU${String(i + 1).padStart(2, '0')}`,
    bed_type: 'ICU',
    status: i < 4 ? 'OCCUPIED' : 'AVAILABLE',
    has_oxygen: true, has_suction: true, has_monitor: true, has_ventilator: i < 2,
    daily_charge: 6000,
    last_cleaned_at: null, last_maintenance_at: null,
    patient_name: i < 4 ? ['Baby M','Baby R','Baby S','Baby T'][i] : null,
    admitted_on: i < 4 ? '2026-03-18' : null,
  })),
  // Ward 6 — Private Rooms
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 45, ward_id: 6,
    bed_number: `P${String(i + 1).padStart(2, '0')}`,
    bed_type: 'GENERAL',
    status: i < 5 ? 'OCCUPIED' : 'AVAILABLE',
    has_oxygen: true, has_suction: false, has_monitor: false, has_ventilator: false,
    daily_charge: 2500,
    last_cleaned_at: null, last_maintenance_at: null,
    patient_name: i < 5 ? ['H. Nair','I. Das','J. Reddy','K. Kumar','L. Joshi'][i] : null,
    admitted_on: i < 5 ? '2026-03-13' : null,
  })),
];

let nextBedId = 56;

// bed_allocations table
let BED_ALLOCATIONS = [
  {
    id: 1, hospital_id: 1, bed_id: 1, patient_id: 2,
    admitted_by: 4, discharged_by: null,
    admitting_doctor_id: 1,
    admission_datetime: '2026-03-15 10:00:00',
    expected_discharge_datetime: '2026-03-22 10:00:00',
    actual_discharge_datetime: null,
    primary_diagnosis: 'Acute Migraine — Inpatient observation',
    treatment_plan: 'IV fluids, Sumatriptan, monitoring BP',
    status: 'ACTIVE',
    transferred_from: null, transferred_to: null, transfer_reason: null,
    daily_charge_applicable: 800, total_charges: 4800,
    notes: 'Patient stable. Pain score 3/10.',
    created_at: '2026-03-15',
  },
];
let nextAllocId = 2;

// ─── Getters ─────────────────────────────────────────────────────────────────
export const getAllBeds   = async () => { await delay(400); return [...BEDS]; };
export const getWards    = async () => { await delay(200); return [...WARDS]; };
export const getBuildings = async () => { await delay(150); return [...BUILDINGS]; };
export const getFloors   = async () => { await delay(150); return [...FLOORS]; };
export const getBedAllocations = async () => { await delay(300); return [...BED_ALLOCATIONS]; };

export const getBeds = async (wardId) => {
  await delay(300);
  return wardId ? BEDS.filter((b) => b.ward_id === Number(wardId)) : [...BEDS];
};

export const getOccupancySummary = async () => {
  await delay(300);
  return {
    total:        BEDS.length,
    available:    BEDS.filter((b) => b.status === 'AVAILABLE').length,
    occupied:     BEDS.filter((b) => b.status === 'OCCUPIED').length,
    reserved:     BEDS.filter((b) => b.status === 'RESERVED').length,
    cleaning:     BEDS.filter((b) => b.status === 'CLEANING').length,
    maintenance:  BEDS.filter((b) => b.status === 'MAINTENANCE').length,
    disinfecting: BEDS.filter((b) => b.status === 'DISINFECTING').length,
    occupancy_pct: Math.round((BEDS.filter((b) => b.status === 'OCCUPIED').length / BEDS.length) * 100),
    ward_summary: WARDS.map((w) => {
      const wardBeds = BEDS.filter((b) => b.ward_id === w.id);
      return {
        ward_id: w.id, ward_name: w.name, ward_type: w.ward_type,
        total: wardBeds.length,
        available: wardBeds.filter((b) => b.status === 'AVAILABLE').length,
        occupied:  wardBeds.filter((b) => b.status === 'OCCUPIED').length,
      };
    }),
  };
};

// Compat alias
export const getBedStats = getOccupancySummary;

// ─── Mutations ────────────────────────────────────────────────────────────────
export const allocateBed = async ({
  bed_id, patient_id, admitting_doctor_id, admitted_by,
  primary_diagnosis, treatment_plan, daily_charge_applicable,
  expected_discharge_datetime, notes,
}) => {
  await delay(600);
  const bed = BEDS.find((b) => b.id === Number(bed_id));
  if (!bed) throw new Error('Bed not found');
  if (bed.status !== 'AVAILABLE') throw new Error('Bed is not available');
  bed.status = 'OCCUPIED';
  const alloc = {
    id: nextAllocId++, hospital_id: 1,
    bed_id: Number(bed_id), patient_id: Number(patient_id),
    admitted_by: Number(admitted_by || 1),
    discharged_by: null,
    admitting_doctor_id: Number(admitting_doctor_id || 1),
    admission_datetime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    expected_discharge_datetime: expected_discharge_datetime || null,
    actual_discharge_datetime: null,
    primary_diagnosis, treatment_plan,
    status: 'ACTIVE',
    transferred_from: null, transferred_to: null, transfer_reason: null,
    daily_charge_applicable: Number(daily_charge_applicable || bed.daily_charge),
    total_charges: 0, notes: notes || null,
    created_at: new Date().toISOString().split('T')[0],
  };
  BED_ALLOCATIONS.push(alloc);
  return alloc;
};

export const dischargeBed = async (bed_id, { actual_discharge_datetime, discharged_by, notes } = {}) => {
  await delay(500);
  const bed = BEDS.find((b) => b.id === Number(bed_id));
  if (!bed) throw new Error('Bed not found');
  bed.status = 'CLEANING';
  bed.patient_name = null; bed.admitted_on = null;
  const alloc = BED_ALLOCATIONS.find((a) => a.bed_id === Number(bed_id) && a.status === 'ACTIVE');
  if (alloc) {
    alloc.status = 'DISCHARGED';
    alloc.actual_discharge_datetime = actual_discharge_datetime || new Date().toISOString().replace('T', ' ').slice(0, 19);
    alloc.discharged_by = Number(discharged_by || 1);
    if (notes) alloc.notes = notes;
  }
  return { bed, alloc };
};

export const updateBedStatus = async (bed_id, status) => {
  await delay(400);
  const bed = BEDS.find((b) => b.id === Number(bed_id));
  if (!bed) throw new Error('Bed not found');
  bed.status = status;
  return bed;
};
