// ─── Payment Service — exact PostgreSQL schema alignment ─────────────────────
// payments table + doctor_payouts table

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema CHECK constraint values — UPPERCASE
export const PAYMENT_METHODS  = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'INSURANCE'];
export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
export const PAYOUT_METHODS   = ['BANK_TRANSFER', 'CASH', 'CHEQUE'];
export const PAYOUT_STATUSES  = ['PENDING', 'PROCESSED', 'PAID', 'CANCELLED'];
export const GATEWAY_NAMES    = ['STRIPE', 'PAYPAL', 'RAZORPAY', 'SSLCOMMERZ', 'CASH'];

let nextPayNum = 6;
const padPayNum = (n) => `PAY-2026-${String(n).padStart(4, '0')}`;
let nextPayoutNum = 5;
const padPayoutNum = (n) => `POUT-2026-${String(n).padStart(4, '0')}`;

// payments table — exact column names
let PAYMENTS = [
  {
    id: 1, hospital_id: 1,
    payment_number: 'PAY-2026-0001',
    appointment_id: 1, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 1, paid_by: 1,
    amount: 800, tax_amount: 0, discount_amount: 0,
    // total_amount is GENERATED ALWAYS AS (amount + tax_amount - discount_amount)
    payment_method: 'UPI',
    gateway_id: null, transaction_id: 'UPI-REF-2026-001', gateway_response: null,
    status: 'SUCCESS',
    payment_date: '2026-03-18 09:35:00',
    hospital_share: 640, doctor_share: 144, platform_fee: 16,
    notes: null, created_by: 1,
    created_at: '2026-03-18', updated_at: '2026-03-18',
    // JOIN display
    patient_name: 'Aisha Nair', doctor_name: 'Dr. Priya Sharma', type: 'appointment',
  },
  {
    id: 2, hospital_id: 1,
    payment_number: 'PAY-2026-0002',
    appointment_id: 3, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 3, paid_by: 3,
    amount: 800, tax_amount: 0, discount_amount: 0,
    payment_method: 'UPI',
    gateway_id: null, transaction_id: 'UPI-REF-2026-002', gateway_response: null,
    status: 'SUCCESS',
    payment_date: '2026-03-18 11:05:00',
    hospital_share: 640, doctor_share: 144, platform_fee: 16,
    notes: null, created_by: 1,
    created_at: '2026-03-18', updated_at: '2026-03-18',
    patient_name: 'Sunita Verma', doctor_name: 'Dr. Priya Sharma', type: 'appointment',
  },
  {
    id: 3, hospital_id: 1,
    payment_number: 'PAY-2026-0003',
    appointment_id: 5, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 5, paid_by: 5,
    amount: 600, tax_amount: 0, discount_amount: 0,
    payment_method: 'CARD',
    gateway_id: null, transaction_id: 'CARD-REF-2026-003', gateway_response: null,
    status: 'SUCCESS',
    payment_date: '2026-03-19 15:45:00',
    hospital_share: 480, doctor_share: 108, platform_fee: 12,
    notes: null, created_by: 1,
    created_at: '2026-03-19', updated_at: '2026-03-19',
    patient_name: 'Deepak Singh', doctor_name: 'Dr. Arjun Patel', type: 'appointment',
  },
  {
    id: 4, hospital_id: 1,
    payment_number: 'PAY-2026-0004',
    appointment_id: 9, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 2, paid_by: 2,
    amount: 450, tax_amount: 0, discount_amount: 0,
    payment_method: 'CASH',
    gateway_id: null, transaction_id: null, gateway_response: null,
    status: 'SUCCESS',
    payment_date: '2026-03-22 14:55:00',
    hospital_share: 360, doctor_share: 81, platform_fee: 9,
    notes: null, created_by: 1,
    created_at: '2026-03-22', updated_at: '2026-03-22',
    patient_name: 'Ravi Mehta', doctor_name: 'Dr. Vikram Shah', type: 'appointment',
  },
  {
    id: 5, hospital_id: 1,
    payment_number: 'PAY-2026-0005',
    appointment_id: null, bed_allocation_id: null, ambulance_trip_id: 2, prescription_id: null,
    patient_id: null, paid_by: null,
    amount: 855, tax_amount: 0, discount_amount: 0,
    payment_method: 'CASH',
    gateway_id: null, transaction_id: null, gateway_response: null,
    status: 'SUCCESS',
    payment_date: '2026-03-19 15:15:00',
    hospital_share: 770, doctor_share: 0, platform_fee: 85,
    notes: 'Ambulance trip TRIP-2026-0002', created_by: 1,
    created_at: '2026-03-19', updated_at: '2026-03-19',
    patient_name: 'Geeta Pillai', doctor_name: null, type: 'ambulance',
  },
  // Pending payments
  {
    id: 6, hospital_id: 1,
    payment_number: 'PAY-2026-0006',
    appointment_id: 2, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 2, paid_by: null,
    amount: 600, tax_amount: 0, discount_amount: 0,
    payment_method: 'UPI',
    gateway_id: null, transaction_id: null, gateway_response: null,
    status: 'PENDING',
    payment_date: '2026-03-18 10:30:00',
    hospital_share: 480, doctor_share: 108, platform_fee: 12,
    notes: null, created_by: 1,
    created_at: '2026-03-18', updated_at: '2026-03-18',
    patient_name: 'Ravi Mehta', doctor_name: 'Dr. Arjun Patel', type: 'appointment',
  },
  {
    id: 7, hospital_id: 1,
    payment_number: 'PAY-2026-0007',
    appointment_id: 6, bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    patient_id: 6, paid_by: null,
    amount: 450, tax_amount: 0, discount_amount: 0,
    payment_method: 'CASH',
    gateway_id: null, transaction_id: null, gateway_response: null,
    status: 'PENDING',
    payment_date: '2026-03-20 09:30:00',
    hospital_share: 360, doctor_share: 81, platform_fee: 9,
    notes: null, created_by: 1,
    created_at: '2026-03-20', updated_at: '2026-03-20',
    patient_name: 'Pooja Das', doctor_name: 'Dr. Vikram Shah', type: 'appointment',
  },
];

// doctor_payouts table — exact column names
let DOCTOR_PAYOUTS = [
  {
    id: 1, hospital_id: 1,
    payout_number: 'POUT-2026-0001',
    doctor_id: 1, amount: 24000,
    period_start: '2026-03-01', period_end: '2026-03-15',
    consultation_count: 30,
    appointment_ids: [1, 3, 10],
    payment_method: 'BANK_TRANSFER',
    bank_account_details: { bank: 'HDFC Bank', account_number: '****5432', ifsc: 'HDFC0001234' },
    transaction_reference: 'NEFT-2026-03-15-001',
    status: 'PAID',
    processed_at: '2026-03-15 10:00:00',
    paid_at: '2026-03-15 14:30:00',
    notes: null, created_by: 2,
    created_at: '2026-03-15', updated_at: '2026-03-15',
    // JOIN display
    doctor_name: 'Dr. Priya Sharma', specialization: 'Cardiology',
  },
  {
    id: 2, hospital_id: 1,
    payout_number: 'POUT-2026-0002',
    doctor_id: 2, amount: 18000,
    period_start: '2026-03-01', period_end: '2026-03-15',
    consultation_count: 24,
    appointment_ids: [2, 5],
    payment_method: 'BANK_TRANSFER',
    bank_account_details: { bank: 'SBI', account_number: '****7890', ifsc: 'SBIN0005678' },
    transaction_reference: 'NEFT-2026-03-15-002',
    status: 'PAID',
    processed_at: '2026-03-15 10:00:00',
    paid_at: '2026-03-15 14:35:00',
    notes: null, created_by: 2,
    created_at: '2026-03-15', updated_at: '2026-03-15',
    doctor_name: 'Dr. Arjun Patel', specialization: 'Neurology',
  },
  {
    id: 3, hospital_id: 1,
    payout_number: 'POUT-2026-0003',
    doctor_id: 3, amount: 22500,
    period_start: '2026-03-01', period_end: '2026-03-15',
    consultation_count: 27,
    appointment_ids: [4, 7],
    payment_method: 'BANK_TRANSFER',
    bank_account_details: { bank: 'ICICI Bank', account_number: '****2345', ifsc: 'ICIC0003456' },
    transaction_reference: null,
    status: 'PENDING',
    processed_at: null, paid_at: null,
    notes: null, created_by: 2,
    created_at: '2026-03-20', updated_at: '2026-03-20',
    doctor_name: 'Dr. Meena Reddy', specialization: 'Orthopedics',
  },
  {
    id: 4, hospital_id: 1,
    payout_number: 'POUT-2026-0004',
    doctor_id: 4, amount: 13500,
    period_start: '2026-03-01', period_end: '2026-03-15',
    consultation_count: 18,
    appointment_ids: [6, 9],
    payment_method: 'BANK_TRANSFER',
    bank_account_details: { bank: 'Axis Bank', account_number: '****6789', ifsc: 'UTIB0007890' },
    transaction_reference: null,
    status: 'PENDING',
    processed_at: null, paid_at: null,
    notes: null, created_by: 2,
    created_at: '2026-03-20', updated_at: '2026-03-20',
    doctor_name: 'Dr. Vikram Shah', specialization: 'Dermatology',
  },
];

let nextPayId = 8;
let nextPayoutId = 5;

// ─── Getters ─────────────────────────────────────────────────────────────────
export const getAllPayments = async () => { await delay(400); return [...PAYMENTS]; };
export const getDoctorPayouts = async () => { await delay(300); return [...DOCTOR_PAYOUTS]; };

export const getPaymentSummary = async () => {
  await delay(300);
  const success = PAYMENTS.filter((p) => p.status === 'SUCCESS');
  const pending  = PAYMENTS.filter((p) => p.status === 'PENDING');
  return {
    total_revenue:       success.reduce((s, p) => s + p.amount, 0),
    pending_amount:      pending.reduce((s, p) => s + p.amount, 0),
    month_revenue:       success.reduce((s, p) => s + p.amount, 0),
    today_revenue:       success.filter((p) => p.payment_date?.startsWith('2026-03-22')).reduce((s, p) => s + p.amount, 0),
    pending_payouts:     DOCTOR_PAYOUTS.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0),
    total_transactions:  PAYMENTS.length,
  };
};

// ─── Mutations ────────────────────────────────────────────────────────────────
export const approvePayment = async (id) => {
  await delay(500);
  const p = PAYMENTS.find((x) => x.id === Number(id));
  if (!p) throw new Error('Payment not found');
  p.status = 'SUCCESS';
  p.transaction_id = `TXN-${String(nextPayId).padStart(4,'0')}-2026`;
  p.payment_date   = new Date().toISOString().replace('T',' ').slice(0,19);
  return p;
};

export const markPayoutPaid = async (id, { payment_method, transaction_reference, bank_account_details } = {}) => {
  await delay(500);
  const p = DOCTOR_PAYOUTS.find((x) => x.id === Number(id));
  if (!p) throw new Error('Payout not found');
  p.status = 'PAID';
  p.payment_method = payment_method || p.payment_method;
  p.transaction_reference = transaction_reference || null;
  p.bank_account_details = bank_account_details || p.bank_account_details;
  p.processed_at = new Date().toISOString().replace('T',' ').slice(0,19);
  p.paid_at      = new Date().toISOString().replace('T',' ').slice(0,19);
  p.updated_at   = new Date().toISOString().split('T')[0];
  return p;
};

export const addPayment = async (data) => {
  await delay(600);
  const payment = {
    id: nextPayId++, hospital_id: 1,
    payment_number: padPayNum(nextPayNum++),
    status: 'SUCCESS',
    payment_date: new Date().toISOString().replace('T',' ').slice(0,19),
    gateway_response: null, gateway_id: null,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0],
    tax_amount: 0, discount_amount: 0,
    bed_allocation_id: null, ambulance_trip_id: null, prescription_id: null,
    ...data,
  };
  PAYMENTS.push(payment);
  return payment;
};
