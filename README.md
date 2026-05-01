# LoanFlow — Loan Management System

A full-stack MERN + Next.js loan management platform with borrower portal and operations dashboard.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **File Storage**: Cloudinary

---

## Login Credentials (after seeding)

| Role         | Email                 | Password       |
|--------------|-----------------------|----------------|
| Admin        | admin@lms.com         | Admin@123      |
| Sales        | sales@lms.com         | Sales@123      |
| Sanction     | sanction@lms.com      | Sanction@123   |
| Disbursement | disburse@lms.com      | Disburse@123   |
| Collection   | collection@lms.com    | Collect@123    |
| Borrower     | borrower@lms.com      | Borrower@123   |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI
- Cloudinary account (free tier works)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run seed    # Creates all role accounts
npm run dev     # Starts on port 5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev     # Starts on port 3000
```

---

## Deployment

### Backend → Railway / Render

1. Push to GitHub
2. Create new service on Railway/Render pointing to `/backend`
3. Set all environment variables from `.env.example`
4. Build command: `npm run build`
5. Start command: `npm start`
6. After deploy, run seed: `npm run seed` (or use Railway's run command)

### Frontend → Vercel

1. Import repo on Vercel
2. Set root to `/frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
4. Deploy

---

## Architecture

### Collections
- **users** — all roles (borrower, admin, sales, sanction, disbursement, collection)
- **applications** — loan applications with full lifecycle
- **payments** — payment records with unique UTR numbers

### Loan Status Flow
```
incomplete → applied → sanctioned → disbursed → closed
                    ↘ rejected
```

### Role Access
| Role         | Module Access          |
|--------------|------------------------|
| borrower     | Borrower portal only   |
| sales        | Sales dashboard        |
| sanction     | Sanction dashboard     |
| disbursement | Disbursement dashboard |
| collection   | Collection dashboard   |
| admin        | All modules            |

### BRE Rules (server-side)
- Age: 23–50 years
- Monthly salary: ≥ ₹25,000
- PAN: valid format (ABCDE1234F)
- Employment: not unemployed

### Loan Formula
```
SI = (P × R × T) / (365 × 100)
Interest Rate = 12% p.a. (fixed)
Total Repayment = Principal + SI
```

### API Routes
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/application/my
POST   /api/application/personal
POST   /api/application/upload
POST   /api/application/loan
GET    /api/application/:id

GET    /api/dashboard/sales/leads
GET    /api/dashboard/sanction/queue
PATCH  /api/dashboard/sanction/:id
GET    /api/dashboard/disbursement/queue
PATCH  /api/dashboard/disbursement/:id/disburse
GET    /api/dashboard/collection/queue
POST   /api/dashboard/collection/:id/payment
GET    /api/dashboard/admin/all
```
