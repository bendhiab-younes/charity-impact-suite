# Mobile API Documentation

Base URL: `http://localhost:3001/api/mobile`

## Overview

The Mobile API provides endpoints for:
1. **Public donors** to browse associations and make donations
2. **Association members/admins** to dispatch donations to beneficiaries

All endpoints respect the same business rules as the web application (cooldown periods, amount limits, eligibility requirements).

---

## Public Endpoints (No Authentication Required)

### GET /mobile/associations
Get all active associations for public browsing.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "logo": "string | null",
    "email": "string",
    "phone": "string | null",
    "website": "string | null",
    "_count": {
      "beneficiaries": 0,
      "donations": 0
    }
  }
]
```

### GET /mobile/associations/:id
Get detailed information about a specific association.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "logo": "string | null",
  "email": "string",
  "phone": "string | null",
  "website": "string | null",
  "stats": {
    "totalDonations": 0,
    "donationCount": 0,
    "beneficiaryCount": 0,
    "familyCount": 0
  }
}
```

### POST /mobile/donate
Create an anonymous donation (no authentication required).

**Request Body:**
```json
{
  "associationId": "string (required)",
  "amount": 100,
  "type": "ONE_TIME | RECURRING (optional, default: ONE_TIME)",
  "method": "CARD | BANK_TRANSFER | CASH (optional, default: CARD)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "amount": 100,
  "status": "PENDING",
  "message": "Donation submitted successfully. Awaiting approval."
}
```

---

## Donor Endpoints (Authentication Required)

### POST /mobile/donate/auth
Create a donation as an authenticated user (tracks donor history).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as `/mobile/donate`

**Response:** Same as `/mobile/donate`

### GET /mobile/my-donations
Get donation history for the authenticated donor.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "string",
    "amount": 100,
    "status": "PENDING | APPROVED | COMPLETED | REJECTED",
    "type": "ONE_TIME | RECURRING",
    "method": "CARD | BANK_TRANSFER | CASH",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "association": {
      "id": "string",
      "name": "string",
      "logo": "string | null"
    }
  }
]
```

---

## Association Member/Admin Endpoints

These endpoints require authentication with role: `SUPER_ADMIN`, `ASSOCIATION_ADMIN`, or `ASSOCIATION_MEMBER`.

### GET /mobile/dashboard
Get association dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "donations": {
    "totalAmount": 5000,
    "totalCount": 50,
    "pendingCount": 5,
    "completedCount": 45
  },
  "beneficiaries": {
    "total": 100,
    "eligible": 85
  },
  "families": {
    "total": 30
  }
}
```

### GET /mobile/dispatch/donations
Get pending/approved donations available for dispatch.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "string",
    "amount": 100,
    "status": "PENDING | APPROVED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "donor": {
      "id": "string",
      "name": "string"
    } | null,
    "beneficiary": null,
    "family": null
  }
]
```

### GET /mobile/dispatch/beneficiaries
Get eligible beneficiaries for dispatch.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "ELIGIBLE",
    "family": {
      "id": "string",
      "name": "string",
      "memberCount": 4,
      "status": "ELIGIBLE | COOLDOWN",
      "lastDonationDate": "2024-01-01T00:00:00.000Z" | null
    }
  }
]
```

### POST /mobile/dispatch
Dispatch a donation to a beneficiary.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "donationId": "string (required)",
  "beneficiaryId": "string (required)"
}
```

**Response (Success):**
```json
{
  "id": "string",
  "status": "COMPLETED",
  "beneficiaryId": "string",
  "amount": 100,
  "message": "Donation dispatched successfully"
}
```

**Response (Error - Cooldown):**
```json
{
  "statusCode": 400,
  "message": "Family is in cooldown period. Wait 30 days between donations."
}
```

---

## Authentication

Use the existing auth endpoints:

### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "DONOR | ASSOCIATION_MEMBER | ASSOCIATION_ADMIN | SUPER_ADMIN",
    "associationId": "string | null"
  }
}
```

### POST /api/auth/register
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "DONOR (optional, default)"
}
```

---

## Business Rules Enforced

1. **Amount Limits**: If an AMOUNT rule is active, donations exceeding the limit are rejected.
2. **Cooldown Periods**: If a FREQUENCY rule is active, families in cooldown cannot receive donations.
3. **Eligibility Requirements**: If an ELIGIBILITY rule is active, families must meet minimum member requirements.
4. **Status Checks**: Only ELIGIBLE beneficiaries can receive dispatched donations.
5. **Association Checks**: Donations can only be made to ACTIVE associations.

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400 | 401 | 403 | 404,
  "message": "Error description",
  "error": "Bad Request | Unauthorized | Forbidden | Not Found"
}
```
