# Medinfera ERP — Hospital Management System

A full-featured Hospital ERP frontend built with React + Vite + Tailwind CSS.
All forms and services are aligned to the PostgreSQL database schema.

## ⚠️ Project Status (Demo Version)

This repository contains the **frontend demo version** of Medinfera ERP.

- Uses **mock/hardcoded data**
- Backend APIs are **not fully integrated**
- Some features (like hospital creation & admin setup) are under development

This version is intended for:
- UI/UX demonstration
- Role-based dashboard flows
- System architecture showcase

Backend integration will be completed in the next phase.
## Quick Start

```bash
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## Demo Credentials

| Role         | Email                        | Password      | Route         |
|--------------|------------------------------|---------------|---------------|
| Super Admin  | superadmin@medinfera.com     | super@2026    | /superadmin   |
| Admin        | admin@medinfera.com          | admin@2026    | /admin        |
| Doctor       | doctor@medinfera.com         | doctor@2026   | /doctor       |
| Staff        | staff@medinfera.com          | staff@2026    | /staff        |
| Pharmacist   | pharmacist@medinfera.com     | pharma@2026   | /pharmacist   |
| Patient      | patient@medinfera.com        | patient@2026  | /patient      |

---

## Database Schema Alignment

All forms and services are aligned to the PostgreSQL schema.

### `users` table
- `first_name`, `last_name` (NOT a single `name` field)
- `email`, `phone`, `alternate_phone`
- `profile_photo` (file upload)
- `preferred_language` (dropdown: en/hi/ta/te/bn/mr)
- `is_active`, `role_id`

### `patients` table (joined with users via user_id)
- `date_of_birth` DATE NOT NULL
- `gender`: `MALE | FEMALE | OTHER` (uppercase CHECK constraint)
- `blood_group`: `A+ | A- | B+ | B- | AB+ | AB- | O+ | O- | UNKNOWN`
- `allergies` jsonb DEFAULT []
- `chronic_diseases` jsonb DEFAULT []
- `current_medications` jsonb DEFAULT []
- `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`

### `doctors` table (joined with users via user_id)
- `registration_number` varchar(100) NOT NULL
- `specialization`, `qualification` NOT NULL
- `experience_years` numeric(3,1)
- `consultation_fee`, `followup_fee`
- `available_days` jsonb DEFAULT ["MON","TUE","WED","THU","FRI"]
- `slot_duration` integer DEFAULT 15
- `max_appointments_per_day` integer DEFAULT 20
- `is_online_available` boolean
- `video_consultation_link`, `meeting_provider`: ZOOM | GOOGLE_MEET
- `is_active`, `is_verified`

### Fields NOT in schema (removed from all forms)
The following fields were found in old forms but do NOT exist in any
database table — they have been completely removed:
- `address` (not in users or patients table)
- `aadhaar_number` (not in any table)
- `pan_number` (not in any table)
- `medical_history` (use `chronic_diseases` jsonb instead)
- `salary`, `joining_date`, `shift` (not in any table)
- `department`, `staff_role` (not in any table — role via role_id FK)
- `pharmacy_name` (not in any table)
- `employee_id` (not in any table)
- `qualification`, `experience_years` for staff/pharmacist (not in users table)

---

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS 3
- React Router 6
- Axios (for future API integration)

## Architecture
- Role-based routing with 6 dashboard contexts
- All API calls use delay-simulated mock services
- Pure inline SVG charts — no chart library dependency
- ErrorBoundary wraps all dashboard route content

