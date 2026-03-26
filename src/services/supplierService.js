// ─── Supplier & Purchase Order Service — aligned to Prisma schema ─────────────
// Models: Supplier, PurchaseOrder, PurchaseOrderItem

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const PO_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];

let SUPPLIERS = [
  { id: 1, hospital_id: 1, name: 'Sun Pharma Distributors', contact_person: 'Ramesh Gupta', phone: '+91 98200 11001', email: 'ramesh@sunpharma.com', address: '14, Industrial Area, Phase II', city: 'Mumbai', state: 'Maharashtra', gst_number: '27AAECS1234F1ZS', drug_license: 'MH-DL-20456', payment_terms: 30, credit_limit: 500000, is_active: true, created_at: '2025-08-01' },
  { id: 2, hospital_id: 1, name: 'Cipla Healthcare Ltd', contact_person: 'Neeta Sharma', phone: '+91 98200 22002', email: 'neeta@cipla.com', address: '7, Cipla House, Andheri', city: 'Mumbai', state: 'Maharashtra', gst_number: '27AABCC5678G1ZR', drug_license: 'MH-DL-30789', payment_terms: 45, credit_limit: 750000, is_active: true, created_at: '2025-09-10' },
  { id: 3, hospital_id: 1, name: 'Abbott India Ltd', contact_person: 'Sandeep Nair', phone: '+91 98200 33003', email: 'sandeep@abbott.com', address: '221, Powai Business Centre', city: 'Mumbai', state: 'Maharashtra', gst_number: '27AAACA9012H1ZQ', drug_license: 'MH-DL-41234', payment_terms: 30, credit_limit: 400000, is_active: true, created_at: '2025-10-05' },
  { id: 4, hospital_id: 1, name: 'Micro Labs Limited', contact_person: 'Priya Menon', phone: '+91 98200 44004', email: 'priya@microlabs.com', address: 'No. 93, Hosur Road', city: 'Bengaluru', state: 'Karnataka', gst_number: '29AABCM3456I1ZP', drug_license: 'KA-DL-50678', payment_terms: 21, credit_limit: 300000, is_active: true, created_at: '2025-11-20' },
  { id: 5, hospital_id: 1, name: 'Alkem Laboratories', contact_person: 'Vikash Tiwari', phone: '+91 98200 55005', email: 'vikash@alkem.com', address: '75, Senapati Bapat Marg', city: 'Mumbai', state: 'Maharashtra', gst_number: '27AABCA7890J1ZO', drug_license: 'MH-DL-61890', payment_terms: 30, credit_limit: 600000, is_active: false, created_at: '2026-01-08' },
];

let nextSuppId = 6;

let PURCHASE_ORDERS = [
  {
    id: 1, hospital_id: 1, supplier_id: 1, supplier_name: 'Sun Pharma Distributors',
    order_number: 'PO-2026-0001', status: 'RECEIVED',
    subtotal: 24500, discount_amount: 500, gst_amount: 2880, net_amount: 26880,
    ordered_at: '2026-03-01T10:00:00', expected_delivery_at: '2026-03-07', received_at: '2026-03-06T14:00:00',
    notes: 'Monthly restocking order', ordered_by: 'Pharmacist Dinesh', approved_by: 'Admin',
    created_at: '2026-03-01',
    items: [
      { id: 1, medicine_id: 1, medicine_name: 'Amlodipine 5mg', batch_number: 'BCH-2026-001', expiry_date: '2027-06-30', quantity_ordered: 500, quantity_received: 500, unit_price: 35, gst_rate: 12, gst_amount: 2100, total_price: 19600 },
      { id: 2, medicine_id: 8, medicine_name: 'Paracetamol 500mg', batch_number: 'BCH-2026-003', expiry_date: '2028-01-31', quantity_ordered: 1000, quantity_received: 1000, unit_price: 8, gst_rate: 12, gst_amount: 960, total_price: 8960 },
    ],
  },
  {
    id: 2, hospital_id: 1, supplier_id: 2, supplier_name: 'Cipla Healthcare Ltd',
    order_number: 'PO-2026-0002', status: 'APPROVED',
    subtotal: 18200, discount_amount: 0, gst_amount: 2184, net_amount: 20384,
    ordered_at: '2026-03-10T11:00:00', expected_delivery_at: '2026-03-20', received_at: null,
    notes: null, ordered_by: 'Pharmacist Dinesh', approved_by: 'Admin',
    created_at: '2026-03-10',
    items: [
      { id: 3, medicine_id: 2, medicine_name: 'Metoprolol 50mg', batch_number: 'BCH-2026-009', expiry_date: '2027-09-30', quantity_ordered: 300, quantity_received: 0, unit_price: 48, gst_rate: 12, gst_amount: 1728, total_price: 15936 },
      { id: 4, medicine_id: 7, medicine_name: 'Ibuprofen 400mg', batch_number: 'BCH-2026-010', expiry_date: '2027-12-31', quantity_ordered: 200, quantity_received: 0, unit_price: 12, gst_rate: 12, gst_amount: 288, total_price: 2688 },
    ],
  },
  {
    id: 3, hospital_id: 1, supplier_id: 3, supplier_name: 'Abbott India Ltd',
    order_number: 'PO-2026-0003', status: 'SUBMITTED',
    subtotal: 9500, discount_amount: 200, gst_amount: 1116, net_amount: 10416,
    ordered_at: '2026-03-18T09:00:00', expected_delivery_at: '2026-03-25', received_at: null,
    notes: 'Urgent — ICU supplies low', ordered_by: 'Pharmacist Seema', approved_by: null,
    created_at: '2026-03-18',
    items: [
      { id: 5, medicine_id: 5, medicine_name: 'Cefixime 200mg', batch_number: null, expiry_date: null, quantity_ordered: 100, quantity_received: 0, unit_price: 75, gst_rate: 12, gst_amount: 900, total_price: 8400 },
      { id: 6, medicine_id: 6, medicine_name: 'Azithromycin 500mg', batch_number: null, expiry_date: null, quantity_ordered: 50, quantity_received: 0, unit_price: 85, gst_rate: 12, gst_amount: 510, total_price: 4760 },
    ],
  },
  {
    id: 4, hospital_id: 1, supplier_id: 1, supplier_name: 'Sun Pharma Distributors',
    order_number: 'PO-2026-0004', status: 'DRAFT',
    subtotal: 5600, discount_amount: 0, gst_amount: 672, net_amount: 6272,
    ordered_at: null, expected_delivery_at: null, received_at: null,
    notes: null, ordered_by: 'Pharmacist Dinesh', approved_by: null,
    created_at: '2026-03-24',
    items: [
      { id: 7, medicine_id: 11, medicine_name: 'Metformin 500mg', batch_number: null, expiry_date: null, quantity_ordered: 400, quantity_received: 0, unit_price: 15, gst_rate: 12, gst_amount: 720, total_price: 6720 },
    ],
  },
];

let nextPoNum  = 5;
let nextPoItemId = 8;
const padPo    = (n) => `PO-2026-${String(n).padStart(4, '0')}`;

export const getSupplierStats = async () => {
  await delay(300);
  const active = SUPPLIERS.filter(s => s.is_active).length;
  const pending = PURCHASE_ORDERS.filter(p => ['SUBMITTED', 'APPROVED'].includes(p.status)).length;
  const totalValue = PURCHASE_ORDERS.reduce((sum, p) => sum + p.net_amount, 0);
  return { total: SUPPLIERS.length, active, pending, totalValue };
};

export const getAllSuppliers = async () => { await delay(400); return [...SUPPLIERS]; };

export const createSupplier = async (data) => {
  await delay(500);
  const rec = { id: nextSuppId, hospital_id: 1, is_active: true, created_at: new Date().toISOString().split('T')[0], ...data };
  SUPPLIERS.push(rec);
  nextSuppId++;
  return rec;
};

export const updateSupplier = async (id, data) => {
  await delay(400);
  SUPPLIERS = SUPPLIERS.map(s => s.id === Number(id) ? { ...s, ...data } : s);
  return SUPPLIERS.find(s => s.id === Number(id));
};

export const deleteSupplier = async (id) => {
  await delay(300);
  SUPPLIERS = SUPPLIERS.filter(s => s.id !== Number(id));
  return { success: true };
};

export const getAllPurchaseOrders = async (filter = 'all') => {
  await delay(400);
  if (filter === 'all') return [...PURCHASE_ORDERS];
  return PURCHASE_ORDERS.filter(p => p.status === filter);
};

export const getPurchaseOrderById = async (id) => {
  await delay(200);
  return PURCHASE_ORDERS.find(p => p.id === Number(id)) || null;
};

export const createPurchaseOrder = async (data) => {
  await delay(500);
  const supplier = SUPPLIERS.find(s => s.id === Number(data.supplier_id));
  const items = (data.items || []).map((item, idx) => ({
    id: nextPoItemId + idx,
    quantity_received: 0,
    ...item,
  }));
  nextPoItemId += items.length;

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity_ordered, 0);
  const gstAmount = items.reduce((s, i) => s + (i.gst_amount || 0), 0);

  const rec = {
    id: nextPoNum, hospital_id: 1,
    order_number: padPo(nextPoNum),
    supplier_name: supplier?.name || '',
    status: 'DRAFT',
    subtotal, discount_amount: data.discount_amount || 0,
    gst_amount: gstAmount,
    net_amount: subtotal - (data.discount_amount || 0) + gstAmount,
    ordered_at: null, received_at: null,
    created_at: new Date().toISOString().split('T')[0],
    ordered_by: 'Current User',
    approved_by: null,
    ...data,
    items,
  };
  PURCHASE_ORDERS.push(rec);
  nextPoNum++;
  return rec;
};

export const updatePurchaseOrderStatus = async (id, status) => {
  await delay(400);
  const updates = { status };
  if (status === 'SUBMITTED') updates.ordered_at = new Date().toISOString();
  if (status === 'RECEIVED') updates.received_at = new Date().toISOString();
  PURCHASE_ORDERS = PURCHASE_ORDERS.map(p => p.id === Number(id) ? { ...p, ...updates } : p);
  return PURCHASE_ORDERS.find(p => p.id === Number(id));
};

export const deletePurchaseOrder = async (id) => {
  await delay(300);
  PURCHASE_ORDERS = PURCHASE_ORDERS.filter(p => p.id !== Number(id));
  return { success: true };
};
