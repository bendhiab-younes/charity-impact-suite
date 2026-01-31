# Charity Impact Suite

A donation management platform for charity associations in Tunisia. It helps organizations manage beneficiaries, track donations, and ensure fair distribution of aid.

## 🚀 Quick Start

```bash
# Start the backend API
cd api && npm run start:dev

# Start the frontend (in another terminal)
npm run dev
```

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 👥 User Roles

### 🔴 Super Admin
- Manages the entire platform
- Can view and manage all associations
- Creates users of any role
- Not tied to any specific association
- Full access to all features

### 🔵 Association Admin
- Manages their own association
- **Creates and adds members** to their association (members cannot self-register)
- Approves/rejects pending donations
- Configures donation rules
- Manages beneficiaries and families

### 🟢 Association Member
- **Cannot create their own account** - must be added by an Association Admin
- Works within their assigned association
- Records pending donations
- Dispatches approved donations to beneficiaries
- Views reports and statistics

### 🟣 Donor
- Independent user (not tied to any association)
- Can self-register through the signup page
- Browses all available associations
- Makes donations to any association
- Tracks their personal donation history

## 🔐 Account Creation Rules

| Role | How to Get an Account |
|------|----------------------|
| **Donor** | Self-register on signup page |
| **Association Admin** | Self-register on signup page |
| **Association Member** | **Added by Association Admin only** |
| **Super Admin** | Created in database/seed |

## ✨ Main Features

### For Donors
- Browse and discover charity associations
- Make donations directly from association pages
- View donation history and track impact
- See donation status (pending → approved → completed)

### For Association Staff
- **Beneficiary Management**: Add and manage aid recipients
- **Family Grouping**: Group beneficiaries into families
- **Donation Processing**: Record, approve, and dispatch donations
- **Rules Engine**: Set cooldown periods, amount limits, and eligibility rules
- **Reports**: View statistics and export data

### For Administrators
- **User Management**: Add/remove association members
- **Association Settings**: Configure organization details
- **Audit Trail**: Track all platform activity

## 📊 Donation Workflow

```
Donor makes donation → Pending
       ↓
Admin approves → Approved
       ↓
Member dispatches to beneficiary → Completed
```

## 🔧 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Prisma, SQLite
- **Auth**: JWT tokens

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@charity.tn | password123 |
| Association Admin | admin@espoir-tunisie.org | password123 |
| Member | membre@espoir-tunisie.org | password123 |
| Donor | donateur@email.tn | password123 |

## 📁 Project Structure

```
charity-impact-suite/
├── src/           # Frontend (React)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── contexts/
│
└── api/           # Backend (NestJS)
    ├── src/
    └── prisma/    # Database schema
```

---

Built for charitable giving in Tunisia 🇹🇳
