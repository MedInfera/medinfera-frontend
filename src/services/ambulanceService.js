// ─── Ambulance Service — exact PostgreSQL schema alignment ────────────────────
// ambulances + ambulance_trips + ambulance_drivers tables

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema CHECK constraint values — UPPERCASE
export const AMBULANCE_TYPES   = ['BLS', 'ALS', 'PATIENT_TRANSPORT', 'ICU_AMBULANCE'];
export const AMBULANCE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'OFF_DUTY'];
export const TRIP_REQUEST_TYPES = ['EMERGENCY', 'TRANSFER', 'DISCHARGE'];
export const TRIP_STATUSES     = ['REQUESTED','DISPATCHED','ARRIVED','PICKED_UP','TRANSPORTING','COMPLETED','CANCELLED'];
export const TRIP_PAYMENT_STATUSES = ['PENDING', 'PAID', 'INSURANCE'];

// ambulances table
let AMBULANCES = [
  {
    id: 1, hospital_id: 1,
    vehicle_number: 'DL-01-CA-0001',
    type: 'ALS',
    has_ventilator: true, has_defibrillator: true, has_oxygen: true,
    equipment_list: ['Defibrillator', 'Ventilator', 'Oxygen Cylinder', 'IV Stand', 'Cardiac Monitor'],
    status: 'AVAILABLE',
    current_latitude: null, current_longitude: null, last_location_update: null,
    make_model: 'Force Traveller 4020',
    year_of_manufacture: 2023,
    insurance_expiry: '2027-03-31',
    permit_expiry: '2026-09-30',
    base_charge: 500,
    per_km_charge: 25,
    waiting_charge_per_hour: 100,
    created_at: '2025-01-10',
  },
  {
    id: 2, hospital_id: 1,
    vehicle_number: 'DL-01-CA-0002',
    type: 'BLS',
    has_ventilator: false, has_defibrillator: false, has_oxygen: true,
    equipment_list: ['First Aid Kit', 'Oxygen Cylinder', 'Stretcher', 'BP Monitor'],
    status: 'ON_TRIP',
    current_latitude: 28.6139, current_longitude: 77.2090, last_location_update: '2026-03-20 09:30:00',
    make_model: 'TATA Winger Ambulance',
    year_of_manufacture: 2022,
    insurance_expiry: '2026-12-31',
    permit_expiry: '2026-06-30',
    base_charge: 500,
    per_km_charge: 25,
    waiting_charge_per_hour: 100,
    created_at: '2025-02-15',
  },
  {
    id: 3, hospital_id: 1,
    vehicle_number: 'DL-01-CA-0003',
    type: 'BLS',
    has_ventilator: false, has_defibrillator: false, has_oxygen: true,
    equipment_list: ['First Aid Kit', 'Oxygen Cylinder', 'Wheelchair', 'Stretcher'],
    status: 'AVAILABLE',
    current_latitude: null, current_longitude: null, last_location_update: null,
    make_model: 'Force Traveller 4020',
    year_of_manufacture: 2022,
    insurance_expiry: '2027-01-31',
    permit_expiry: '2026-07-31',
    base_charge: 500,
    per_km_charge: 25,
    waiting_charge_per_hour: 100,
    created_at: '2025-03-01',
  },
  {
    id: 4, hospital_id: 1,
    vehicle_number: 'DL-01-CA-0004',
    type: 'ALS',
    has_ventilator: true, has_defibrillator: true, has_oxygen: true,
    equipment_list: ['Defibrillator', 'IV Equipment', 'Cardiac Monitor', 'Suction Unit'],
    status: 'MAINTENANCE',
    current_latitude: null, current_longitude: null, last_location_update: null,
    make_model: 'Mercedes Sprinter Ambulance',
    year_of_manufacture: 2021,
    insurance_expiry: '2026-08-31',
    permit_expiry: '2026-05-31',
    base_charge: 750,
    per_km_charge: 35,
    waiting_charge_per_hour: 150,
    created_at: '2024-12-01',
  },
  {
    id: 5, hospital_id: 1,
    vehicle_number: 'DL-01-CA-0005',
    type: 'ICU_AMBULANCE',
    has_ventilator: true, has_defibrillator: true, has_oxygen: true,
    equipment_list: ['Portable Ventilator', 'Incubator', 'NICU Kit', 'Cardiac Monitor', 'Infusion Pump'],
    status: 'AVAILABLE',
    current_latitude: null, current_longitude: null, last_location_update: null,
    make_model: 'TATA Winger ICU',
    year_of_manufacture: 2024,
    insurance_expiry: '2027-06-30',
    permit_expiry: '2027-03-31',
    base_charge: 1000,
    per_km_charge: 45,
    waiting_charge_per_hour: 200,
    created_at: '2025-06-01',
  },
];

// ambulance_drivers table (joined with users table)
let DRIVERS = [
  {
    id: 1, hospital_id: 1, user_id: 101,
    license_number: 'DL-HR-2015-12345',
    license_expiry: '2028-06-30',
    experience_years: 8,
    is_active: true,
    // from users JOIN
    first_name: 'Ramesh', last_name: 'Yadav',
    phone: '+91 98111 10001',
    shift: 'Day',
    status: 'active',
  },
  {
    id: 2, hospital_id: 1, user_id: 102,
    license_number: 'DL-UP-2018-23456',
    license_expiry: '2027-12-31',
    experience_years: 5,
    is_active: true,
    first_name: 'Sunil', last_name: 'Chauhan',
    phone: '+91 98111 10002',
    shift: 'Night',
    status: 'on-trip',
  },
  {
    id: 3, hospital_id: 1, user_id: 103,
    license_number: 'DL-DL-2016-34567',
    license_expiry: '2028-03-31',
    experience_years: 7,
    is_active: true,
    first_name: 'Vinod', last_name: 'Tiwari',
    phone: '+91 98111 10003',
    shift: 'Day',
    status: 'active',
  },
  {
    id: 4, hospital_id: 1, user_id: 104,
    license_number: 'DL-RJ-2019-45678',
    license_expiry: '2027-09-30',
    experience_years: 4,
    is_active: true,
    first_name: 'Anil', last_name: 'Saxena',
    phone: '+91 98111 10004',
    shift: 'Day',
    status: 'active',
  },
];

// ambulance_trips table
let TRIPS = [
  {
    id: 1, hospital_id: 1,
    trip_number: 'TRIP-2026-0001',
    ambulance_id: 2, driver_id: 2,
    patient_id: 5, attendant_id: null,
    request_type: 'EMERGENCY',
    request_datetime: '2026-03-20 09:15:00',
    requested_by: 'Rekha Singh',
    pickup_location: 'Saket, Block B, New Delhi 110017',
    pickup_latitude: 28.5275, pickup_longitude: 77.2210,
    pickup_datetime: '2026-03-20 09:38:00',
    destination_location: 'Medinfera General Hospital, 123 MG Road, New Delhi',
    destination_latitude: 28.6315, destination_longitude: 77.2167,
    destination_datetime: null,
    distance_km: 8.4,
    waiting_minutes: 0,
    status: 'TRANSPORTING',
    base_charge: 500, distance_charge: 210, waiting_charge: 0, additional_charges: 0,
    payment_status: 'PENDING',
    notes: 'Cardiac emergency. Patient conscious.',
    created_by: 4, created_at: '2026-03-20 09:10:00',
  },
  {
    id: 2, hospital_id: 1,
    trip_number: 'TRIP-2026-0002',
    ambulance_id: 1, driver_id: 1,
    patient_id: null, attendant_id: null,
    request_type: 'TRANSFER',
    request_datetime: '2026-03-19 14:30:00',
    requested_by: 'Geeta Pillai (self)',
    pickup_location: 'Greater Kailash, New Delhi 110048',
    pickup_latitude: 28.5485, pickup_longitude: 77.2382,
    pickup_datetime: '2026-03-19 14:48:00',
    destination_location: 'Medinfera General Hospital, 123 MG Road, New Delhi',
    destination_latitude: 28.6315, destination_longitude: 77.2167,
    destination_datetime: '2026-03-19 15:10:00',
    distance_km: 12.2,
    waiting_minutes: 30,
    status: 'COMPLETED',
    base_charge: 500, distance_charge: 305, waiting_charge: 50, additional_charges: 0,
    payment_status: 'PAID',
    notes: null,
    created_by: 4, created_at: '2026-03-19 14:25:00',
  },
  {
    id: 3, hospital_id: 1,
    trip_number: 'TRIP-2026-0003',
    ambulance_id: 3, driver_id: 3,
    patient_id: 4, attendant_id: null,
    request_type: 'DISCHARGE',
    request_datetime: '2026-03-18 08:00:00',
    requested_by: 'Meena Joshi',
    pickup_location: 'Medinfera General Hospital, 123 MG Road, New Delhi',
    pickup_latitude: 28.6315, pickup_longitude: 77.2167,
    pickup_datetime: '2026-03-18 08:12:00',
    destination_location: 'Dwarka Sector 6, New Delhi 110075',
    destination_latitude: 28.5921, destination_longitude: 77.0543,
    destination_datetime: '2026-03-18 09:00:00',
    distance_km: 18.5,
    waiting_minutes: 0,
    status: 'COMPLETED',
    base_charge: 500, distance_charge: 462, waiting_charge: 0, additional_charges: 0,
    payment_status: 'PAID',
    notes: 'Patient discharged post knee surgery.',
    created_by: 4, created_at: '2026-03-18 07:55:00',
  },
];

let nextTripId = 4;
let nextAmbId  = 6;
let nextDrvId  = 5;
let nextTripNum = 4;

const padTripNum = (n) => `TRIP-2026-${String(n).padStart(4, '0')}`;

// ─── Getters ─────────────────────────────────────────────────────────────────
export const getAmbulances      = async () => { await delay(350); return AMBULANCES.map((a) => ({ ...a, name: `${a.vehicle_number} — ${a.type}` })); };
export const getDrivers         = async () => { await delay(300); return DRIVERS.map((d) => ({ ...d, name: `${d.first_name} ${d.last_name}` })); };
export const getTrips           = async () => { await delay(400); return [...TRIPS]; };
export const getAvailableAmbs   = async () => { await delay(250); return AMBULANCES.filter((a) => a.status === 'AVAILABLE'); };

export const getAmbulanceSummary = async () => {
  await delay(300);
  return {
    total:        AMBULANCES.length,
    available:    AMBULANCES.filter((a) => a.status === 'AVAILABLE').length,
    on_trip:      AMBULANCES.filter((a) => a.status === 'ON_TRIP').length,
    maintenance:  AMBULANCES.filter((a) => a.status === 'MAINTENANCE').length,
    off_duty:     AMBULANCES.filter((a) => a.status === 'OFF_DUTY').length,
    active_trips: TRIPS.filter((t) => !['COMPLETED','CANCELLED'].includes(t.status)).length,
    total_revenue: TRIPS.filter((t) => t.status === 'COMPLETED').reduce((s, t) => s + t.base_charge + t.distance_charge + t.waiting_charge + t.additional_charges, 0),
  };
};

// ─── Mutations ────────────────────────────────────────────────────────────────
export const dispatchAmbulance = async ({
  ambulance_id, driver_id, patient_id = null, attendant_id = null,
  request_type, requested_by, pickup_location, destination_location, notes = null,
}) => {
  await delay(700);
  const amb = AMBULANCES.find((a) => a.id === Number(ambulance_id));
  if (!amb) throw new Error('Ambulance not found');
  if (amb.status !== 'AVAILABLE') throw new Error('Ambulance is not available');
  amb.status = 'ON_TRIP';
  const drv = DRIVERS.find((d) => d.id === Number(driver_id));
  if (drv) drv.status = 'on-trip';
  const trip = {
    id: nextTripId++, hospital_id: 1,
    trip_number: padTripNum(nextTripNum++),
    ambulance_id: Number(ambulance_id), driver_id: Number(driver_id),
    patient_id: patient_id ? Number(patient_id) : null,
    attendant_id: attendant_id ? Number(attendant_id) : null,
    request_type, requested_by,
    request_datetime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    pickup_location, pickup_latitude: null, pickup_longitude: null, pickup_datetime: null,
    destination_location, destination_latitude: null, destination_longitude: null, destination_datetime: null,
    distance_km: null, waiting_minutes: 0,
    status: 'DISPATCHED',
    base_charge: amb.base_charge,
    distance_charge: 0, waiting_charge: 0, additional_charges: 0,
    payment_status: 'PENDING',
    notes, created_by: 1,
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  TRIPS.push(trip);
  return trip;
};

export const completeTrip = async (tripId, { distance_km, waiting_minutes = 0, additional_charges = 0, notes = null }) => {
  await delay(500);
  const trip = TRIPS.find((t) => t.id === Number(tripId));
  if (!trip) throw new Error('Trip not found');
  const amb = AMBULANCES.find((a) => a.id === trip.ambulance_id);
  if (amb) amb.status = 'AVAILABLE';
  const drv = DRIVERS.find((d) => d.id === trip.driver_id);
  if (drv) drv.status = 'active';
  trip.status = 'COMPLETED';
  trip.distance_km = distance_km;
  trip.waiting_minutes = waiting_minutes;
  trip.distance_charge = distance_km * (amb?.per_km_charge || 25);
  trip.waiting_charge  = Math.round(waiting_minutes / 60) * (amb?.waiting_charge_per_hour || 100);
  trip.additional_charges = additional_charges;
  trip.destination_datetime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  if (notes) trip.notes = notes;
  return trip;
};

export const cancelTrip = async (tripId) => {
  await delay(400);
  const trip = TRIPS.find((t) => t.id === Number(tripId));
  if (!trip) throw new Error('Trip not found');
  trip.status = 'CANCELLED';
  const amb = AMBULANCES.find((a) => a.id === trip.ambulance_id);
  if (amb) amb.status = 'AVAILABLE';
  const drv = DRIVERS.find((d) => d.id === trip.driver_id);
  if (drv) drv.status = 'active';
  return trip;
};

// Compat alias
export const calculateBill = (distanceKm, waitingHours = 0, baseCharge = 500, perKmCharge = 25, waitingChargePerHour = 100) =>
  baseCharge + (distanceKm * perKmCharge) + (waitingHours * waitingChargePerHour);
