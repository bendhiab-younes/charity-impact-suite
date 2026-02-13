# Frontend Updates Summary

## Overview

The frontend has been updated to align with the simplified backend structure. The key changes involve:
- Using `Donation` model for aid OUT to beneficiaries
- Using `Contribution` model for money IN from donors
- Updated API endpoints and hooks to match the new backend structure

## Files Modified

### 1. `/src/lib/api.ts`
- Removed old donation methods that were intended for approval workflow
- Updated `getDonations()` to work with the new donations (aid OUT) endpoint
- Added `createDonation()` for creating new donations to beneficiaries
- Added `cancelDonation()` for cancelling donations
- Added `getDonationStats()` for getting donation statistics
- Added `getEligibleBeneficiaries()` to get beneficiaries eligible for donations
- Added legacy aliases (`getDispatches`, `createDispatch`, `getDispatchStats`) for backward compatibility

### 2. `/src/hooks/useDonations.ts`
- Updated to handle aid OUT to beneficiaries
- Replaced `approveDonation/rejectDonation/completeDonation` with `createDonation/cancelDonation`
- Updated stats calculation for completed donations

### 3. `/src/hooks/useDispatches.ts`
- Updated interface to include `nationalId` and `canReceive` fields
- Added proper error handling with fallbacks
- Added `cancelDispatch` and `cancelDonation` methods
- Added aliases (`donations`, `createDonation`) for new naming convention

### 4. `/src/hooks/useDonorDashboardData.ts`
- Fixed to use `getMyContributions()` instead of `getMyDonations()`
- Donors now see their contributions (money IN) in their dashboard

### 5. `/src/pages/dashboard/NewDispatch.tsx`
- Updated `EligibleBeneficiary` interface to include optional family and `canReceive` flag
- Updated data loading to use `getDonationStats()` with error handling
- Filtered eligible beneficiaries to only show those who can actually receive aid
- Fixed family display to handle optional family relationships

## API Endpoints Used

### Donations (Aid OUT)
| Frontend Method | Backend Endpoint | Description |
|-----------------|------------------|-------------|
| `getDonations(associationId)` | `GET /api/donations` | Get all donations for association |
| `getDonation(id)` | `GET /api/donations/:id` | Get single donation |
| `createDonation(data)` | `POST /api/donations` | Create new donation to beneficiary |
| `cancelDonation(id)` | `PATCH /api/donations/:id/cancel` | Cancel donation and restore budget |
| `getDonationStats(associationId)` | `GET /api/donations/stats` | Get donation statistics |
| `getEligibleBeneficiaries(associationId)` | `GET /api/donations/eligible-beneficiaries` | Get eligible beneficiaries |

### Contributions (Money IN)
| Frontend Method | Backend Endpoint | Description |
|-----------------|------------------|-------------|
| `getContributions(associationId)` | `GET /api/contributions` | Get all contributions for association |
| `getMyContributions()` | `GET /api/contributions/my-contributions` | Get donor's contributions |
| `createContribution(data)` | `POST /api/contributions` | Create new contribution |
| `approveContribution(id)` | `PUT /api/contributions/:id/approve` | Approve contribution |
| `rejectContribution(id)` | `PUT /api/contributions/:id/reject` | Reject contribution |

## Terminology Mapping

| Old Term | New Term | Description |
|----------|----------|-------------|
| Dispatch | Donation | Aid going OUT to beneficiaries |
| Donation (old) | Contribution | Money coming IN from donors |

## Data Flow

### Money IN (Contributions)
1. Donor makes a contribution via `/api/contributions`
2. Staff approves/rejects via `/api/contributions/:id/approve`
3. On approval, amount is added to association budget

### Aid OUT (Donations)
1. Staff selects eligible beneficiary via `/api/donations/eligible-beneficiaries`
2. Staff creates donation via `/api/donations`
3. Rules are checked (frequency, amount, eligibility)
4. Amount is deducted from association budget
5. Beneficiary and family records are updated

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@espoir-tunisie.org` | `password123` | Association Admin |
| `membre@espoir-tunisie.org` | `password123` | Association Member |
| `donateur@email.tn` | `password123` | Donor |

## Running the Application

```bash
# Start backend (port 3001)
cd api && npm run start:dev

# Start frontend (port 8080 or 8081)
cd .. && npm run dev
```

## Notes

- The frontend still uses "Dispatch" terminology in some components for backward compatibility
- The `useDispatches` hook provides aliases for the new naming convention
- All donation operations now go through the unified `/api/donations` endpoint
- Rules enforcement happens on the backend during donation creation
