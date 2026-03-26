// ─── Staff Payroll Service — aligned to Prisma schema ─────────────────────────
// Models: StaffPayroll, Payout

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const PAYOUT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'];
export const PAYOUT_TYPES    = ['SALARY', 'ADVANCE', 'REIMBURSEMENT', 'BONUS', 'INCENTIVE', 'DEDUCTION'];
export const PAYMENT_MODES   = ['CASH', 'CARD', 'UPI', 'NETBANKING', 'CHEQUE'];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const getMonthName = (m) => MONTHS[m - 1] || '';

// Mock users (staff across roles) — in real app this joins users table
const STAFF_USERS = [
  { user_id: 1, name: 'Kavitha Reddy',   role: 'NURSE',          department: 'Nursing',    employee_code: 'EMP-001' },
  { user_id: 2, name: 'Mohan Tiwari',    role: 'RECEPTIONIST',   department: 'Front Desk', employee_code: 'EMP-002' },
  { user_id: 3, name: 'Sunita Yadav',    role: 'NURSE',          department: 'Nursing',    employee_code: 'EMP-003' },
  { user_id: 4, name: 'Dinesh Bhatia',   role: 'PHARMACIST',     department: 'Pharmacy',   employee_code: 'EMP-004' },
  { user_id: 5, name: 'Seema Joshi',     role: 'PHARMACIST',     department: 'Pharmacy',   employee_code: 'EMP-005' },
  { user_id: 6, name: 'Rajesh Kumar',    role: 'LAB_TECHNICIAN', department: 'Laboratory', employee_code: 'EMP-006' },
  { user_id: 7, name: 'Pooja Mishra',    role: 'BILLING',        department: 'Finance',    employee_code: 'EMP-007' },
  { user_id: 8, name: 'Arjun Malhotra',  role: 'DRIVER',         department: 'Transport',  employee_code: 'EMP-008' },
];

export const getStaffUsers = async () => { await delay(200); return [...STAFF_USERS]; };

let PAYROLLS = [
  { id: 1, hospital_id: 1, user_id: 1, user_name: 'Kavitha Reddy',   role: 'NURSE',          month: 3, year: 2026, basic_salary: 35000, allowances: 5000, deductions: 2000, net_salary: 38000, status: 'PENDING',    notes: null, processed_by: null, processed_at: null, paid_at: null, created_at: '2026-03-01' },
  { id: 2, hospital_id: 1, user_id: 2, user_name: 'Mohan Tiwari',    role: 'RECEPTIONIST',   month: 3, year: 2026, basic_salary: 22000, allowances: 3000, deductions: 1000, net_salary: 24000, status: 'PENDING',    notes: null, processed_by: null, processed_at: null, paid_at: null, created_at: '2026-03-01' },
  { id: 3, hospital_id: 1, user_id: 3, user_name: 'Sunita Yadav',    role: 'NURSE',          month: 3, year: 2026, basic_salary: 30000, allowances: 4000, deductions: 1500, net_salary: 32500, status: 'PROCESSING', notes: null, processed_by: 'Admin', processed_at: '2026-03-25T10:00:00', paid_at: null, created_at: '2026-03-01' },
  { id: 4, hospital_id: 1, user_id: 4, user_name: 'Dinesh Bhatia',   role: 'PHARMACIST',     month: 3, year: 2026, basic_salary: 40000, allowances: 6000, deductions: 2500, net_salary: 43500, status: 'PAID',       notes: 'March salary', processed_by: 'Admin', processed_at: '2026-03-24T11:00:00', paid_at: '2026-03-25T09:00:00', created_at: '2026-03-01' },
  { id: 5, hospital_id: 1, user_id: 5, user_name: 'Seema Joshi',     role: 'PHARMACIST',     month: 3, year: 2026, basic_salary: 32000, allowances: 4500, deductions: 1800, net_salary: 34700, status: 'PAID',       notes: null, processed_by: 'Admin', processed_at: '2026-03-24T11:00:00', paid_at: '2026-03-25T09:00:00', created_at: '2026-03-01' },
  { id: 6, hospital_id: 1, user_id: 6, user_name: 'Rajesh Kumar',    role: 'LAB_TECHNICIAN', month: 3, year: 2026, basic_salary: 28000, allowances: 3500, deductions: 1200, net_salary: 30300, status: 'PENDING',    notes: null, processed_by: null, processed_at: null, paid_at: null, created_at: '2026-03-01' },
  // Feb records
  { id: 7, hospital_id: 1, user_id: 1, user_name: 'Kavitha Reddy',   role: 'NURSE',          month: 2, year: 2026, basic_salary: 35000, allowances: 5000, deductions: 2000, net_salary: 38000, status: 'PAID', notes: null, processed_by: 'Admin', processed_at: '2026-02-25', paid_at: '2026-02-28', created_at: '2026-02-01' },
  { id: 8, hospital_id: 1, user_id: 2, user_name: 'Mohan Tiwari',    role: 'RECEPTIONIST',   month: 2, year: 2026, basic_salary: 22000, allowances: 3000, deductions: 1000, net_salary: 24000, status: 'PAID', notes: null, processed_by: 'Admin', processed_at: '2026-02-25', paid_at: '2026-02-28', created_at: '2026-02-01' },
];

let PAYOUTS = [
  { id: 1, hospital_id: 1, user_id: 4, user_name: 'Dinesh Bhatia', payroll_id: 4, type: 'SALARY', amount: 43500, status: 'PAID', reference_number: 'TXN-2026-0001', payment_mode: 'NETBANKING', notes: null, processed_by: 'Admin', processed_at: '2026-03-25T09:00:00', created_at: '2026-03-24' },
  { id: 2, hospital_id: 1, user_id: 5, user_name: 'Seema Joshi',   payroll_id: 5, type: 'SALARY', amount: 34700, status: 'PAID', reference_number: 'TXN-2026-0002', payment_mode: 'NETBANKING', notes: null, processed_by: 'Admin', processed_at: '2026-03-25T09:00:00', created_at: '2026-03-24' },
  { id: 3, hospital_id: 1, user_id: 1, user_name: 'Kavitha Reddy', payroll_id: null, type: 'ADVANCE', amount: 5000, status: 'PAID', reference_number: 'TXN-2026-0003', payment_mode: 'CASH', notes: 'Medical emergency advance', processed_by: 'Admin', processed_at: '2026-03-10T14:00:00', created_at: '2026-03-10' },
];

let nextPayrollId = 9;
let nextPayoutId  = 4;

export const getPayrollStats = async () => {
  await delay(300);
  const month3 = PAYROLLS.filter(p => p.month === 3 && p.year === 2026);
  const pending = month3.filter(p => p.status === 'PENDING').length;
  const paid    = month3.filter(p => p.status === 'PAID').length;
  const totalPaid = month3.filter(p => p.status === 'PAID').reduce((s, p) => s + p.net_salary, 0);
  const totalPending = month3.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.net_salary, 0);
  return { pending, paid, totalPaid, totalPending, total: month3.length };
};

export const getAllPayrolls = async (month, year) => {
  await delay(400);
  let result = [...PAYROLLS];
  if (month) result = result.filter(p => p.month === Number(month));
  if (year)  result = result.filter(p => p.year  === Number(year));
  return result;
};

export const createPayroll = async (data) => {
  await delay(500);
  const existing = PAYROLLS.find(p => p.user_id === Number(data.user_id) && p.month === Number(data.month) && p.year === Number(data.year));
  if (existing) throw new Error('Payroll already exists for this staff member this month.');
  const user = STAFF_USERS.find(u => u.user_id === Number(data.user_id));
  const rec = {
    id: nextPayrollId, hospital_id: 1,
    user_name: user?.name || '',
    role: user?.role || '',
    status: 'PENDING',
    processed_by: null, processed_at: null, paid_at: null,
    created_at: new Date().toISOString().split('T')[0],
    ...data,
  };
  PAYROLLS.push(rec);
  nextPayrollId++;
  return rec;
};

export const updatePayroll = async (id, data) => {
  await delay(400);
  PAYROLLS = PAYROLLS.map(p => p.id === Number(id) ? { ...p, ...data } : p);
  return PAYROLLS.find(p => p.id === Number(id));
};

export const processPayroll = async (id) => {
  await delay(500);
  return updatePayroll(id, { status: 'PROCESSING', processed_by: 'Admin', processed_at: new Date().toISOString() });
};

export const markPayrollPaid = async (id, paymentMode, reference) => {
  await delay(500);
  const payroll = PAYROLLS.find(p => p.id === Number(id));
  if (!payroll) throw new Error('Payroll not found');
  await updatePayroll(id, { status: 'PAID', paid_at: new Date().toISOString() });
  // Create payout record
  const payout = {
    id: nextPayoutId, hospital_id: 1,
    user_id: payroll.user_id, user_name: payroll.user_name,
    payroll_id: id, type: 'SALARY',
    amount: payroll.net_salary, status: 'PAID',
    reference_number: reference || `TXN-${Date.now()}`,
    payment_mode: paymentMode,
    notes: `${getMonthName(payroll.month)} ${payroll.year} salary`,
    processed_by: 'Admin', processed_at: new Date().toISOString(),
    created_at: new Date().toISOString().split('T')[0],
  };
  PAYOUTS.push(payout);
  nextPayoutId++;
  return payout;
};

export const getAllPayouts = async () => { await delay(400); return [...PAYOUTS]; };

export const createPayout = async (data) => {
  await delay(500);
  const user = STAFF_USERS.find(u => u.user_id === Number(data.user_id));
  const rec = {
    id: nextPayoutId, hospital_id: 1,
    user_name: user?.name || '',
    payroll_id: null, status: 'PAID',
    processed_by: 'Admin', processed_at: new Date().toISOString(),
    created_at: new Date().toISOString().split('T')[0],
    ...data,
  };
  PAYOUTS.push(rec);
  nextPayoutId++;
  return rec;
};
