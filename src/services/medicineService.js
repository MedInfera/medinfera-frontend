// ─── Medicine Service (Mock) ──────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const MEDICINES = [
  { id: 1,  brandName: 'Amlodipine',    genericName: 'Amlodipine Besylate',  strength: '5mg',    form: 'Tablet',  manufacturer: 'Sun Pharma',     category: 'Antihypertensive', contraindications: ['Severe hypotension'], commonDose: '1 tablet OD', price: 45  },
  { id: 2,  brandName: 'Metoprolol',    genericName: 'Metoprolol Tartrate',  strength: '50mg',   form: 'Tablet',  manufacturer: 'Cipla',          category: 'Beta Blocker',     contraindications: ['Bradycardia','Asthma'], commonDose: '1 tablet BD', price: 62  },
  { id: 3,  brandName: 'Atorvastatin',  genericName: 'Atorvastatin Calcium', strength: '10mg',   form: 'Tablet',  manufacturer: 'Lupin',          category: 'Statin',           contraindications: ['Liver disease'], commonDose: '1 tablet OD at night', price: 38  },
  { id: 4,  brandName: 'Pantoprazole',  genericName: 'Pantoprazole Sodium',  strength: '40mg',   form: 'Tablet',  manufacturer: 'Dr. Reddys',     category: 'PPI',              contraindications: [], commonDose: '1 tablet OD before meals', price: 28  },
  { id: 5,  brandName: 'Cefixime',      genericName: 'Cefixime Trihydrate',  strength: '200mg',  form: 'Capsule', manufacturer: 'Alkem',          category: 'Antibiotic',       contraindications: ['Penicillin allergy'], commonDose: '1 capsule BD x 5 days', price: 95  },
  { id: 6,  brandName: 'Azithromycin',  genericName: 'Azithromycin',         strength: '500mg',  form: 'Tablet',  manufacturer: 'Pfizer',         category: 'Antibiotic',       contraindications: ['Liver disease'], commonDose: '1 tablet OD x 3 days', price: 110 },
  { id: 7,  brandName: 'Ibuprofen',     genericName: 'Ibuprofen',            strength: '400mg',  form: 'Tablet',  manufacturer: 'Abbott',         category: 'NSAID',            contraindications: ['Peptic ulcer','Kidney disease','Aspirin allergy'], commonDose: '1 tablet TDS after meals', price: 18  },
  { id: 8,  brandName: 'Paracetamol',   genericName: 'Acetaminophen',        strength: '500mg',  form: 'Tablet',  manufacturer: 'Micro Labs',     category: 'Analgesic',        contraindications: ['Liver disease'], commonDose: '1–2 tablets TDS', price: 12  },
  { id: 9,  brandName: 'Montair',       genericName: 'Montelukast',          strength: '10mg',   form: 'Tablet',  manufacturer: 'Cipla',          category: 'Antiasthmatic',    contraindications: [], commonDose: '1 tablet OD at night', price: 75  },
  { id: 10, brandName: 'Levothyroxine', genericName: 'Levothyroxine Sodium', strength: '50mcg',  form: 'Tablet',  manufacturer: 'GSK',            category: 'Thyroid hormone',  contraindications: ['Adrenal insufficiency'], commonDose: '1 tablet OD empty stomach', price: 55  },
  { id: 11, brandName: 'Metformin',     genericName: 'Metformin HCl',        strength: '500mg',  form: 'Tablet',  manufacturer: 'USV',            category: 'Antidiabetic',     contraindications: ['Renal failure','Heart failure'], commonDose: '1 tablet BD with meals', price: 22  },
  { id: 12, brandName: 'Glimepiride',   genericName: 'Glimepiride',          strength: '2mg',    form: 'Tablet',  manufacturer: 'Sanofi',         category: 'Antidiabetic',     contraindications: ['Sulfa allergy','Type 1 DM'], commonDose: '1 tablet OD before breakfast', price: 48  },
  { id: 13, brandName: 'Telmisartan',   genericName: 'Telmisartan',          strength: '40mg',   form: 'Tablet',  manufacturer: 'Glenmark',       category: 'ARB',              contraindications: ['Pregnancy','Bilateral renal stenosis'], commonDose: '1 tablet OD', price: 65  },
  { id: 14, brandName: 'Amoxicillin',   genericName: 'Amoxicillin Trihydrate', strength: '500mg', form: 'Capsule', manufacturer: 'Ranbaxy',       category: 'Antibiotic',       contraindications: ['Penicillin allergy'], commonDose: '1 capsule TDS x 5–7 days', price: 42  },
  { id: 15, brandName: 'Omeprazole',    genericName: 'Omeprazole',           strength: '20mg',   form: 'Capsule', manufacturer: 'AstraZeneca',    category: 'PPI',              contraindications: [], commonDose: '1 capsule OD 30 min before breakfast', price: 32  },
  { id: 16, brandName: 'Cetirizine',    genericName: 'Cetirizine HCl',       strength: '10mg',   form: 'Tablet',  manufacturer: 'UCB',            category: 'Antihistamine',    contraindications: ['Renal impairment'], commonDose: '1 tablet OD at night', price: 15  },
  { id: 17, brandName: 'Diclofenac',    genericName: 'Diclofenac Sodium',    strength: '50mg',   form: 'Tablet',  manufacturer: 'Novartis',       category: 'NSAID',            contraindications: ['Peptic ulcer','Heart failure'], commonDose: '1 tablet BD after meals', price: 20  },
  { id: 18, brandName: 'Alprazolam',    genericName: 'Alprazolam',           strength: '0.25mg', form: 'Tablet',  manufacturer: 'Pfizer',         category: 'Benzodiazepine',   contraindications: ['Respiratory depression','Pregnancy'], commonDose: '1 tablet OD at night', price: 35  },
  { id: 19, brandName: 'Vitamin D3',    genericName: 'Cholecalciferol',      strength: '60000IU',form: 'Sachet',  manufacturer: 'Elder Pharma',   category: 'Vitamin',          contraindications: ['Hypercalcemia'], commonDose: '1 sachet per week x 8 weeks', price: 28  },
  { id: 20, brandName: 'Salbutamol',    genericName: 'Albuterol',            strength: '100mcg', form: 'Inhaler', manufacturer: 'GSK',            category: 'Bronchodilator',   contraindications: ['Tachyarrhythmia'], commonDose: '2 puffs SOS', price: 145 },
];

export const DOSE_FREQUENCIES = [
  { value: 'OD',  label: 'OD — Once Daily'       },
  { value: 'BD',  label: 'BD — Twice Daily'       },
  { value: 'TDS', label: 'TDS — Thrice Daily'     },
  { value: 'QID', label: 'QID — Four Times Daily' },
  { value: 'SOS', label: 'SOS — As Needed'        },
  { value: 'HS',  label: 'HS — At Bedtime'        },
  { value: 'AC',  label: 'AC — Before Meals'      },
  { value: 'PC',  label: 'PC — After Meals'       },
];

export const DURATION_OPTIONS = ['1 day','2 days','3 days','5 days','7 days','10 days','14 days','1 month','Ongoing'];
export const INSTRUCTIONS = ['After meals','Before meals','Empty stomach','At bedtime','With milk','With water only'];

export const searchMedicines = async (query) => {
  await delay(200);
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return MEDICINES.filter(
    (m) => m.brandName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  ).slice(0, 8);
};

export const getMedicineById = async (id) => {
  await delay(150);
  return MEDICINES.find((m) => m.id === Number(id)) || null;
};

export const getAllMedicines = async () => { await delay(400); return [...MEDICINES]; };

export const getMedicinesByCategory = async (category) => {
  await delay(300);
  return category ? MEDICINES.filter((m) => m.category === category) : [...MEDICINES];
};

export const MEDICINE_CATEGORIES = [...new Set(MEDICINES.map((m) => m.category))].sort();
export const MEDICINE_FORMS = [...new Set(MEDICINES.map((m) => m.form))].sort();
