// ─── Reports Service (Mock) ───────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const getMonthlyRevenue = async () => {
  await delay(400);
  return [
    { month: 'Oct', revenue: 198000, appointments: 186, target: 220000 },
    { month: 'Nov', revenue: 224000, appointments: 201, target: 220000 },
    { month: 'Dec', revenue: 215000, appointments: 195, target: 220000 },
    { month: 'Jan', revenue: 241000, appointments: 218, target: 240000 },
    { month: 'Feb', revenue: 268000, appointments: 243, target: 250000 },
    { month: 'Mar', revenue: 284600, appointments: 267, target: 260000 },
  ];
};

export const getDoctorPerformance = async () => {
  await delay(400);
  return [
    { name: 'Dr. Priya Sharma',  specialization: 'Cardiology',  appointments: 62, revenue: 49600, rating: 4.9, satisfaction: 96 },
    { name: 'Dr. Arjun Patel',   specialization: 'Neurology',   appointments: 48, revenue: 28800, rating: 4.7, satisfaction: 91 },
    { name: 'Dr. Meena Reddy',   specialization: 'Orthopedics', appointments: 55, revenue: 27500, rating: 4.8, satisfaction: 94 },
    { name: 'Dr. Vikram Shah',   specialization: 'Dermatology', appointments: 41, revenue: 18450, rating: 4.6, satisfaction: 89 },
    { name: 'Dr. Suresh Kumar',  specialization: 'General',     appointments: 78, revenue: 27300, rating: 4.9, satisfaction: 97 },
    { name: 'Dr. Anita Bose',    specialization: 'Gynecology',  appointments: 44, revenue: 26400, rating: 4.7, satisfaction: 92 },
  ];
};

export const getAppointmentTypeBreakdown = async () => {
  await delay(300);
  return [
    { type: 'Online',  count: 142, percentage: 53 },
    { type: 'Offline', count: 125, percentage: 47 },
  ];
};

export const getServiceBreakdown = async () => {
  await delay(300);
  return [
    { service: 'Cardiology',      count: 62, revenue: 49600 },
    { service: 'General Medicine',count: 78, revenue: 27300 },
    { service: 'Gynecology',      count: 44, revenue: 26400 },
    { service: 'Orthopedics',     count: 55, revenue: 27500 },
    { service: 'Neurology',       count: 48, revenue: 28800 },
    { service: 'Dermatology',     count: 41, revenue: 18450 },
  ];
};

export const getPatientGrowth = async () => {
  await delay(350);
  return [
    { month: 'Oct', new: 28, returning: 158 },
    { month: 'Nov', new: 34, returning: 167 },
    { month: 'Dec', new: 31, returning: 164 },
    { month: 'Jan', new: 42, returning: 176 },
    { month: 'Feb', new: 48, returning: 195 },
    { month: 'Mar', new: 56, returning: 211 },
  ];
};

export const getBedOccupancyTrend = async () => {
  await delay(350);
  return [
    { month: 'Oct', occupancy: 64 },
    { month: 'Nov', occupancy: 71 },
    { month: 'Dec', occupancy: 68 },
    { month: 'Jan', occupancy: 74 },
    { month: 'Feb', occupancy: 79 },
    { month: 'Mar', occupancy: 76 },
  ];
};

export const getKPISummary = async () => {
  await delay(300);
  return {
    monthRevenue:       284600,
    revenueGrowth:      6.2,
    totalAppointments:  267,
    appointmentGrowth:  9.9,
    newPatients:        56,
    patientGrowth:      16.7,
    avgBedOccupancy:    76,
    bedOccupancyChange: -3,
    avgRating:          4.78,
    npsScore:           72,
  };
};
