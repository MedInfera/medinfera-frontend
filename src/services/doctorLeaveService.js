// ─── Doctor Leaves Service — aligned to Prisma DoctorLeave model ──────────────
// Separate file to avoid modifying doctorService.js

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let DOCTOR_LEAVES = [
  { id: 1, doctor_id: 1, doctor_name: 'Dr. Priya Sharma', hospital_id: 1, leave_date: '2026-03-28', reason: 'Personal emergency', approved_by: 'Admin', created_at: '2026-03-24' },
  { id: 2, doctor_id: 5, doctor_name: 'Dr. Ritu Agarwal', hospital_id: 1, leave_date: '2026-03-24', reason: 'Medical conference', approved_by: 'Admin', created_at: '2026-03-20' },
  { id: 3, doctor_id: 5, doctor_name: 'Dr. Ritu Agarwal', hospital_id: 1, leave_date: '2026-03-25', reason: 'Medical conference', approved_by: 'Admin', created_at: '2026-03-20' },
  { id: 4, doctor_id: 5, doctor_name: 'Dr. Ritu Agarwal', hospital_id: 1, leave_date: '2026-03-26', reason: 'Medical conference', approved_by: 'Admin', created_at: '2026-03-20' },
  { id: 5, doctor_id: 2, doctor_name: 'Dr. Arjun Patel',  hospital_id: 1, leave_date: '2026-04-05', reason: 'Planned vacation', approved_by: null, created_at: '2026-03-25' },
  { id: 6, doctor_id: 3, doctor_name: 'Dr. Meena Reddy',  hospital_id: 1, leave_date: '2026-04-10', reason: 'CME attendance', approved_by: null, created_at: '2026-03-26' },
];

let nextLeaveId = 7;

export const getAllLeaves = async (doctorId) => {
  await delay(300);
  if (doctorId) return DOCTOR_LEAVES.filter(l => l.doctor_id === Number(doctorId));
  return [...DOCTOR_LEAVES];
};

export const getUpcomingLeaves = async () => {
  await delay(200);
  const today = new Date().toISOString().split('T')[0];
  return DOCTOR_LEAVES.filter(l => l.leave_date >= today);
};

export const createLeave = async (data) => {
  await delay(400);
  const existing = DOCTOR_LEAVES.find(l => l.doctor_id === Number(data.doctor_id) && l.leave_date === data.leave_date);
  if (existing) throw new Error('Leave already marked for this date.');
  const rec = {
    id: nextLeaveId, hospital_id: 1,
    approved_by: null,
    created_at: new Date().toISOString().split('T')[0],
    ...data,
  };
  DOCTOR_LEAVES.push(rec);
  nextLeaveId++;
  return rec;
};

export const approveLeave = async (id) => {
  await delay(300);
  DOCTOR_LEAVES = DOCTOR_LEAVES.map(l => l.id === Number(id) ? { ...l, approved_by: 'Admin' } : l);
  return DOCTOR_LEAVES.find(l => l.id === Number(id));
};

export const deleteLeave = async (id) => {
  await delay(300);
  DOCTOR_LEAVES = DOCTOR_LEAVES.filter(l => l.id !== Number(id));
  return { success: true };
};
