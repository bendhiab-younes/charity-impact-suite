# Charity Impact Suite

A comprehensive donation management platform for charity associations, designed to ensure transparency, prevent fraud, and maximize the impact of charitable giving.

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI component library |
| **React Router DOM** | Client-side routing |
| **TanStack React Query** | Data fetching & caching |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS** | Node.js framework |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database ORM |
| **SQLite** | Database (file-based, no setup required) |
| **JWT + Passport** | Authentication |
| **bcrypt** | Password hashing |
| **class-validator** | Request validation |
| **Swagger** | API documentation |

### Database
The project uses **SQLite** - a lightweight, file-based database that requires no external setup. The database file is stored at `api/prisma/dev.db`.

## Project Structure

```
charity-impact-suite/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API client
│   ├── pages/              # Page components
│   └── types/              # TypeScript types
│
├── api/                    # Backend NestJS application
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.ts         # Demo data seeder
│   │   └── dev.db          # SQLite database file
│   └── src/
│       ├── auth/           # Authentication module
│       ├── users/          # Users module
│       ├── associations/   # Associations module
│       ├── beneficiaries/  # Beneficiaries module
│       ├── families/       # Families module
│       ├── donations/      # Donations module
│       ├── rules/          # Donation rules module
│       └── prisma/         # Database service
```

## How to Run the Project

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd charity-impact-suite

# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
```

### 2. Set Up the Database

```bash
# From the api/ directory
npx prisma generate      # Generate Prisma client
npx prisma db push       # Create database tables
npx ts-node prisma/seed.ts  # Seed demo data
```

### 3. Start the Servers

**Terminal 1 - Backend API:**
```bash
cd api
npm run start:dev
```
The API will run at http://localhost:3001

**Terminal 2 - Frontend:**
```bash
# From root directory
npm run dev
```
The frontend will run at http://localhost:5173

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| API Documentation (Swagger) | http://localhost:3001/api/docs |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@charity.tn | password123 |
| Association Admin | admin@espoir-tunisie.org | password123 |
| Association Member | membre@espoir-tunisie.org | password123 |
| Donor | donateur@email.tn | password123 |

## Implemented Features

### Backend (API)
- [x] **Authentication** - JWT-based login/register with role-based access
- [x] **User Management** - CRUD operations for users
- [x] **Associations** - Create, read, update associations
- [x] **Beneficiaries** - Manage beneficiaries with eligibility status
- [x] **Families** - Family management with cooldown tracking
- [x] **Donations** - Full donation workflow (create, approve, reject, complete)
- [x] **Donation Rules** - Configurable rules (frequency, amount, eligibility)
- [x] **API Documentation** - Swagger/OpenAPI docs

### Frontend
- [x] **Public Landing Page** - Hero, features, association listing from API
- [x] **Authentication Pages** - Login and registration with role selection
- [x] **Dashboard** - Stats overview connected to real API data
- [x] **Association Cards** - Display associations from database
- [x] **Associations Listing** - Public page with real API data
- [x] **Association Detail** - Individual association pages from API
- [x] **Donations Management** - List, approve, reject donations (persists to DB)
- [x] **Beneficiaries Management** - List beneficiaries with status filtering
- [x] **Families Management** - List families with real statistics
- [x] **Rules Configuration** - Toggle rules (persists to DB)
- [x] **New Donation Form** - Creates real donations via API
- [x] **Reports Page** - Real statistics and monthly breakdown
- [x] **Settings Page** - Shows real user profile data
- [x] **Responsive Design** - Mobile-friendly UI
- [x] **API Integration** - Custom hooks for each resource

## Features Not Yet Implemented

### Backend
- [ ] Activity logging/audit trails
- [ ] Email notifications
- [ ] File uploads (logos, documents)
- [ ] Advanced search and filtering
- [ ] Data export (CSV, PDF reports)
- [ ] Rate limiting
- [ ] Profile update endpoint

### Frontend
- [ ] Add Beneficiary modal/form
- [ ] Add Family modal/form
- [ ] Create Rule modal/form
- [ ] Real-time notifications
- [ ] Dark mode toggle
- [ ] Multi-language support (French/Arabic)
- [ ] Data visualization charts

### General
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Production deployment configuration
- [ ] Payment integration (demo)

## Known Issues & Bugs

### Fixed Issues
- **Status case mismatch** - Fixed: DonationsTable now handles both uppercase (API) and lowercase status values
- **Dashboard error for users without association** - Fixed: Shows friendly message for donors/super admins
- **All pages connected to API** - All management pages now fetch real data from the database

### Current Limitations
1. **Donors and Super Admins** - Dashboard shows "No Association Linked" message since they're not tied to a specific association. This is expected behavior.
2. **Frontend type definitions** - Types in `src/types/index.ts` use lowercase enum values while API returns uppercase. Components handle this with case-insensitive comparisons.
3. **No logout redirect** - After logout, user stays on current page instead of redirecting to home.
4. **Create modals not implemented** - Add Beneficiary/Family/Rule buttons show UI but don't have working modals yet.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/associations | List associations |
| GET | /api/beneficiaries | List beneficiaries |
| GET | /api/families | List families |
| GET | /api/donations | List donations |
| GET | /api/rules | List donation rules |

For full API documentation, visit http://localhost:3001/api/docs when the backend is running.

## License

This project is for educational purposes (school project).
