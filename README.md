# 🌟 Charity Impact Suite

> *Empowering charitable giving through transparency, accountability, and technology.*

**Charity Impact Suite** is a full-stack donation management platform built for charity associations in Tunisia. It helps organizations manage beneficiaries, track donations, enforce fair distribution rules, and provide complete transparency to donors.

Whether you're running a small local charity or managing a larger humanitarian organization, this platform gives you the tools to make every donation count.

---

## 🎯 What Problem Does This Solve?

Many charitable organizations struggle with:
- **Tracking beneficiaries** and ensuring aid reaches those who need it most
- **Preventing duplicate donations** to the same families within short periods
- **Maintaining transparency** for donors who want to see their impact
- **Managing volunteers and staff** with appropriate access levels
- **Enforcing fair distribution rules** to maximize reach

This platform addresses all of these challenges with a modern, easy-to-use interface.

---

## ✨ Key Features

### For Donors
- 🔍 Browse verified charity associations
- 💳 Make one-time or recurring donations
- 📊 Track your donation history and impact
- 🔔 See exactly where your money goes

### For Association Staff
- 👥 Manage beneficiaries and their families
- ✅ Process donation approvals with rule enforcement
- 📈 View real-time statistics and reports
- 📱 Mobile-friendly dispatch system for field workers

### For Administrators
- 🛡️ Role-based access control (Admin, Member, Donor)
- ⚙️ Configurable donation rules (cooldowns, amount limits, eligibility)
- 📋 Complete audit trail of all actions
- 📤 Export data to CSV for reporting

---

## 🛠️ Tech Stack

### Frontend
| Technology | Why We Chose It |
|------------|-----------------|
| **React 18** | Modern UI with hooks and concurrent features |
| **TypeScript** | Catch bugs before they reach production |
| **Vite** | Lightning-fast development experience |
| **Tailwind CSS** | Rapid, consistent styling |
| **shadcn/ui** | Beautiful, accessible components |
| **React Router** | Seamless navigation |
| **Lucide Icons** | Clean, consistent iconography |

### Backend
| Technology | Why We Chose It |
|------------|-----------------|
| **NestJS** | Enterprise-grade Node.js framework |
| **TypeScript** | End-to-end type safety |
| **Prisma ORM** | Type-safe database queries |
| **SQLite** | Zero-config database (perfect for development) |
| **JWT + Passport** | Industry-standard authentication |
| **Swagger** | Auto-generated API documentation |

### Mobile API
A dedicated set of endpoints optimized for mobile applications, enabling:
- Anonymous and authenticated donations
- Field worker dispatch functionality
- Real-time dashboard statistics

---

## 📁 Project Structure

```
charity-impact-suite/
│
├── 📂 src/                      # Frontend (React + TypeScript)
│   ├── components/              # Reusable UI components
│   │   ├── layout/              # Layout components (Sidebar, Header)
│   │   ├── modals/              # Dialog modals for CRUD operations
│   │   ├── beneficiaries/       # Beneficiary-specific components
│   │   ├── donations/           # Donation tables and cards
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/                # React Context (Authentication)
│   ├── hooks/                   # Custom hooks for data fetching
│   ├── lib/                     # API client and utilities
│   ├── pages/                   # Route page components
│   └── types/                   # TypeScript type definitions
│
├── 📂 api/                      # Backend (NestJS + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   ├── seed.ts              # Demo data seeder
│   │   └── dev.db               # SQLite database file
│   └── src/
│       ├── auth/                # JWT authentication & guards
│       ├── users/               # User management
│       ├── associations/        # Charity associations
│       ├── beneficiaries/       # Beneficiary management
│       ├── families/            # Family groupings
│       ├── donations/           # Donation workflow
│       ├── rules/               # Donation rules engine
│       ├── mobile/              # Mobile API endpoints
│       └── prisma/              # Database service
│
└── 📄 Configuration files       # package.json, tsconfig, etc.
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd charity-impact-suite

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### Step 2: Set Up the Database

```bash
cd api

# Generate the Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Load demo data
npx ts-node prisma/seed.ts
```

### Step 3: Start the Application

You'll need **two terminal windows**:

**Terminal 1 — Start the Backend:**
```bash
cd api
npm run start:dev
```
✅ API running at `http://localhost:3001`

**Terminal 2 — Start the Frontend:**
```bash
npm run dev
```
✅ App running at `http://localhost:5173`

### Step 4: Explore!

| What | Where |
|------|-------|
| 🌐 Web Application | http://localhost:5173 |
| 📡 API Server | http://localhost:3001 |
| 📚 API Documentation | http://localhost:3001/api |

---

## 🔐 Demo Accounts

The seeded database includes these test accounts:

| Role | Email | Password | What They Can Do |
|------|-------|----------|------------------|
| **Super Admin** | admin@charity.tn | password123 | Everything — manage all associations |
| **Association Admin** | admin@espoir-tunisie.org | password123 | Manage their association's data |
| **Association Member** | membre@espoir-tunisie.org | password123 | Process donations, view reports |
| **Donor** | donateur@email.tn | password123 | Make donations, track history |

---

## 📋 Features Overview

### ✅ What's Working

#### Backend API
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based login/register with secure password hashing |
| 👥 **User Management** | Full CRUD with role-based permissions |
| 🏢 **Associations** | Create and manage charity organizations |
| 👤 **Beneficiaries** | Track recipients with eligibility status |
| 👨‍👩‍👧‍👦 **Families** | Group beneficiaries with cooldown tracking |
| 💰 **Donations** | Complete workflow (create → approve → dispatch → complete) |
| ⚙️ **Rules Engine** | Configurable donation rules that auto-enforce |
| 📱 **Mobile API** | Optimized endpoints for mobile apps |
| 📚 **Swagger Docs** | Auto-generated API documentation |

#### Frontend Web App
| Feature | Description |
|---------|-------------|
| 🏠 **Public Pages** | Landing page, association browser, impact stats |
| 📊 **Dashboard** | Real-time stats for your association |
| 📝 **CRUD Modals** | Add/Edit/View for all entities |
| 🔍 **Search & Filter** | Find what you need quickly |
| 📤 **CSV Export** | Download data for offline analysis |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🔔 **Toast Notifications** | Instant feedback on all actions |

---

## 🔒 Role-Based Permissions

Different users have different capabilities:

| Action | Super Admin | Association Admin | Member | Donor |
|--------|:-----------:|:-----------------:|:------:|:-----:|
| View all associations | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Add beneficiaries | ✅ | ✅ | ✅ | ❌ |
| Add families | ✅ | ✅ | ✅ | ❌ |
| Configure rules | ✅ | ✅ | ❌ | ❌ |
| Approve donations | ✅ | ✅ | ❌ | ❌ |
| Dispatch donations | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ✅ | ❌ |
| Make donations | ✅ | ✅ | ✅ | ✅ |
| View own history | ✅ | ✅ | ✅ | ✅ |

---

## ⚙️ Donation Rules System

One of the key features is the **Rules Engine** — configurable constraints that ensure fair distribution:

### Rule Types

| Type | What It Does | Example |
|------|--------------|---------|
| **Frequency** | Prevents duplicate donations to same family | "30 days between donations" |
| **Amount** | Caps maximum donation size | "Max 500 TND per donation" |
| **Eligibility** | Sets minimum requirements | "Family must have 3+ members" |

Rules are enforced automatically when dispatching donations. Admins can toggle rules on/off as needed.

---

## 📡 API Reference

### Core Endpoints

```
Authentication
  POST   /api/auth/register     Create new account
  POST   /api/auth/login        Sign in
  GET    /api/auth/me           Get current user profile

Associations
  GET    /api/associations      List all associations
  GET    /api/associations/:id  Get single association
  POST   /api/associations      Create association

Beneficiaries
  GET    /api/beneficiaries     List beneficiaries
  POST   /api/beneficiaries     Add beneficiary
  PATCH  /api/beneficiaries/:id/status  Update eligibility

Families
  GET    /api/families          List families
  POST   /api/families          Add family
  GET    /api/families/:id/cooldown  Check donation eligibility

Donations
  GET    /api/donations         List donations
  POST   /api/donations         Create donation
  PATCH  /api/donations/:id/approve   Approve donation
  PATCH  /api/donations/:id/reject    Reject donation
  PATCH  /api/donations/:id/complete  Mark as completed

Rules
  GET    /api/rules             List rules
  POST   /api/rules             Create rule
  PATCH  /api/rules/:id/toggle  Enable/disable rule
```

### Mobile API Endpoints

```
Public (No Auth)
  GET    /api/mobile/associations      Browse charities
  GET    /api/mobile/associations/:id  Get charity details
  POST   /api/mobile/donate            Make anonymous donation

Authenticated
  POST   /api/mobile/donate/auth       Make tracked donation
  GET    /api/mobile/my-donations      View donation history

Staff Only
  GET    /api/mobile/dashboard         Association statistics
  GET    /api/mobile/dispatch/donations    Pending donations
  GET    /api/mobile/dispatch/beneficiaries  Eligible recipients
  POST   /api/mobile/dispatch          Assign donation to beneficiary
```

📖 **Full interactive documentation** available at `http://localhost:3001/api` when running locally.

---

## �️ Database Schema

The application uses these main entities:

```
User ─────────────┬─────────────── Association
                  │                     │
                  │    ┌────────────────┼────────────────┐
                  │    │                │                │
                  ▼    ▼                ▼                ▼
              Donation          Beneficiary          Family
                  │                │                    │
                  └────────────────┴────────────────────┘
                                   │
                                   ▼
                            DonationRule
```

- **User**: Anyone who uses the platform (donors, staff, admins)
- **Association**: Charity organization
- **Family**: Household unit (can have multiple beneficiaries)
- **Beneficiary**: Individual who receives aid
- **Donation**: Money given by a donor
- **DonationRule**: Constraints on how donations are distributed

---

## 🚧 Future Improvements

Things we'd love to add:

- [ ] **Email notifications** — Alert donors when their donation is dispatched
- [ ] **Payment integration** — Accept online payments (Stripe, etc.)
- [ ] **Multi-language** — French and Arabic support
- [ ] **Dark mode** — Easy on the eyes
- [ ] **Mobile app** — Native iOS/Android apps using the Mobile API
- [ ] **Advanced analytics** — Charts and trend visualization
- [ ] **Document uploads** — Store receipts and ID documents
- [ ] **Audit logs** — Complete activity history

---

## 🤝 Contributing

This is a school project, but contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project was created for educational purposes as part of a school curriculum. Feel free to use it as a learning resource or starting point for your own projects.

---

## 💬 Questions?

If you run into issues or have questions:

1. Check the [API documentation](http://localhost:3001/api) first
2. Look through existing code — it's well-commented
3. Open an issue on GitHub

---

<p align="center">
  <strong>Built with ❤️ for charitable giving</strong><br>
  <em>Making every donation count.</em>
</p>
