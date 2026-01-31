# Mobile API Documentation# Mobile API Documentation



Base URL: `http://localhost:3001/api/mobile`Base URL: `http://localhost:3001/api/mobile`



## Overview## Overview



The mobile API is designed for two primary user types:The Mobile API provides endpoints for:

1. **Donors** - Make donations (anonymous or authenticated)1. **Public donors** to browse associations and make donations

2. **Staff** (Members/Admins) - Approve donations and dispatch aid to beneficiaries2. **Association members/admins** to dispatch donations to beneficiaries



---All endpoints respect the same business rules as the web application (cooldown periods, amount limits, eligibility requirements).



## 🔓 PUBLIC ENDPOINTS (No Auth Required)---



### List Associations## Public Endpoints (No Authentication Required)

Browse all active associations to choose where to donate.

### GET /mobile/associations

```Get all active associations for public browsing.

GET /associations

```**Response:**

```json

**Response:**[

```json  {

[    "id": "string",

  {    "name": "string",

    "id": "cml...",    "description": "string",

    "name": "Association Espoir Tunisie",    "logo": "string | null",

    "description": "Aide aux familles...",    "email": "string",

    "email": "contact@espoir-tunisie.org",    "phone": "string | null",

    "phone": "+216 71 000 001",    "website": "string | null",

    "_count": {    "_count": {

      "beneficiaries": 4,      "beneficiaries": 0,

      "contributions": 4,      "donations": 0

      "dispatches": 3    }

    }  }

  }]

]```

```

### GET /mobile/associations/:id

### Get Association DetailsGet detailed information about a specific association.

Get detailed information about a specific association.

**Response:**

``````json

GET /associations/:id{

```  "id": "string",

  "name": "string",

---  "description": "string",

  "logo": "string | null",

## 💰 DONOR ENDPOINTS  "email": "string",

  "phone": "string | null",

### Make a Donation (Anonymous)  "website": "string | null",

Create a donation without logging in. The donation will be PENDING until approved by staff.  "stats": {

    "totalDonations": 0,

```    "donationCount": 0,

POST /donate    "beneficiaryCount": 0,

Content-Type: application/json    "familyCount": 0

  }

{}

  "associationId": "cml...",```

  "amount": 100,

  "donorName": "Your Name",      // Optional### POST /mobile/donate

  "donorEmail": "you@email.com", // OptionalCreate an anonymous donation (no authentication required).

  "type": "ONE_TIME",            // Optional: ONE_TIME, RECURRING

  "method": "CARD",              // Optional: CARD, BANK_TRANSFER, CASH, CHECK**Request Body:**

  "notes": "For families"        // Optional```json

}{

```  "associationId": "string (required)",

  "amount": 100,

**Response:**  "type": "ONE_TIME | RECURRING (optional, default: ONE_TIME)",

```json  "method": "CARD | BANK_TRANSFER | CASH (optional, default: CARD)",

{  "notes": "string (optional)"

  "id": "cml...",}

  "amount": 100,```

  "status": "PENDING",

  "message": "Donation submitted successfully. Awaiting approval."**Response:**

}```json

```{

  "id": "string",

### Make a Donation (Authenticated)  "amount": 100,

Create a donation as a logged-in user. Tracks in your donation history.  "status": "PENDING",

  "message": "Donation submitted successfully. Awaiting approval."

```}

POST /donate/auth```

Authorization: Bearer <token>

Content-Type: application/json---



{## Donor Endpoints (Authentication Required)

  "associationId": "cml...",

  "amount": 100### POST /mobile/donate/auth

}Create a donation as an authenticated user (tracks donor history).

```

**Headers:** `Authorization: Bearer <token>`

### Get My Donations

Get all donations made by the logged-in user.**Request Body:** Same as `/mobile/donate`



```**Response:** Same as `/mobile/donate`

GET /my-donations

Authorization: Bearer <token>### GET /mobile/my-donations

```Get donation history for the authenticated donor.



---**Headers:** `Authorization: Bearer <token>`



## 👨‍💼 STAFF ENDPOINTS (Requires Auth + Role)**Response:**

```json

Requires: `ASSOCIATION_ADMIN`, `ASSOCIATION_MEMBER`, or `SUPER_ADMIN` role.[

  {

### Get Pending Contributions    "id": "string",

View donations waiting for approval.    "amount": 100,

    "status": "PENDING | APPROVED | COMPLETED | REJECTED",

```    "type": "ONE_TIME | RECURRING",

GET /contributions/pending    "method": "CARD | BANK_TRANSFER | CASH",

Authorization: Bearer <token>    "createdAt": "2024-01-01T00:00:00.000Z",

```    "association": {

      "id": "string",

**Response:**      "name": "string",

```json      "logo": "string | null"

[    }

  {  }

    "id": "cml...",]

    "amount": 50,```

    "status": "PENDING",

    "donorName": "Test Donor",---

    "donorEmail": "test@example.com",

    "createdAt": "2026-01-31T23:41:17.838Z"## Association Member/Admin Endpoints

  }

]These endpoints require authentication with role: `SUPER_ADMIN`, `ASSOCIATION_ADMIN`, or `ASSOCIATION_MEMBER`.

```

### GET /mobile/dashboard

### Approve or Reject ContributionGet association dashboard statistics.

Admin approves or rejects a pending donation. Approved donations are added to the budget.

**Headers:** `Authorization: Bearer <token>`

```

PATCH /contributions/approve**Response:**

Authorization: Bearer <token>```json

Content-Type: application/json{

  "donations": {

{    "totalAmount": 5000,

  "contributionId": "cml...",    "totalCount": 50,

  "action": "APPROVE",         // APPROVE or REJECT    "pendingCount": 5,

  "reason": "Invalid data"     // Required if REJECT    "completedCount": 45

}  },

```  "beneficiaries": {

    "total": 100,

**Response (Approved):**    "eligible": 85

```json  },

{  "families": {

  "id": "cml...",    "total": 30

  "status": "COMPLETED",  }

  "amount": 50,}

  "message": "Contribution approved and added to budget"```

}

```### GET /mobile/dispatch/donations

Get pending/approved donations available for dispatch.

### Get Budget

Check the available budget for dispatching.**Headers:** `Authorization: Bearer <token>`



```**Response:**

GET /budget```json

Authorization: Bearer <token>[

```  {

    "id": "string",

**Response:**    "amount": 100,

```json    "status": "PENDING | APPROVED",

{    "createdAt": "2024-01-01T00:00:00.000Z",

  "associationId": "cml...",    "donor": {

  "associationName": "Association Espoir Tunisie",      "id": "string",

  "budget": 1800,      "name": "string"

  "currency": "TND"    } | null,

}    "beneficiary": null,

```    "family": null

  }

### Lookup Beneficiary by National ID]

Find a beneficiary using their national ID card number (CIN).```



```### GET /mobile/dispatch/beneficiaries

GET /beneficiary/lookup/:nationalIdGet eligible beneficiaries for dispatch.

Authorization: Bearer <token>

```**Headers:** `Authorization: Bearer <token>`



**Example:****Response:**

``````json

GET /beneficiary/lookup/12345678[

```  {

    "id": "string",

**Response:**    "firstName": "string",

```json    "lastName": "string",

{    "status": "ELIGIBLE",

  "id": "cml...",    "family": {

  "nationalId": "12345678",      "id": "string",

  "firstName": "Khaled",      "name": "string",

  "lastName": "Ben Ali",      "memberCount": 4,

  "status": "ELIGIBLE",      "status": "ELIGIBLE | COOLDOWN",

  "totalReceived": 100,      "lastDonationDate": "2024-01-01T00:00:00.000Z" | null

  "family": {    }

    "id": "cml...",  }

    "name": "Famille Ben Ali",]

    "memberCount": 5,```

    "status": "COOLDOWN"

  },### POST /mobile/dispatch

  "canReceive": false,Dispatch a donation to a beneficiary.

  "cooldownEnds": "2026-03-02T00:00:00.000Z",

  "message": "In cooldown until Sat Mar 02 2026"**Headers:** `Authorization: Bearer <token>`

}

```**Request Body:**

```json

### Dispatch Aid by National ID{

Give aid to a beneficiary using their national ID. Deducts from budget.  "donationId": "string (required)",

  "beneficiaryId": "string (required)"

```}

POST /dispatch/by-national-id```

Authorization: Bearer <token>

Content-Type: application/json**Response (Success):**

```json

{{

  "nationalId": "12345678",  "id": "string",

  "amount": 100,  "status": "COMPLETED",

  "aidType": "CASH",           // CASH, FOOD, CLOTHING, MEDICAL, EDUCATION, OTHER  "beneficiaryId": "string",

  "notes": "Monthly assistance"  "amount": 100,

}  "message": "Donation dispatched successfully"

```}

```

**Response:**

```json**Response (Error - Cooldown):**

{```json

  "id": "cml...",{

  "amount": 100,  "statusCode": 400,

  "aidType": "CASH",  "message": "Family is in cooldown period. Wait 30 days between donations."

  "beneficiaryId": "cml...",}

  "beneficiaryName": "Khaled Ben Ali",```

  "beneficiaryNationalId": "12345678",

  "familyId": "cml...",---

  "familyName": "Famille Ben Ali",

  "status": "COMPLETED",## Authentication

  "message": "Aid dispatched successfully"

}Use the existing auth endpoints:

```

### POST /api/auth/login

### Dispatch Aid by Beneficiary ID```json

Alternative to national ID lookup - use internal ID directly.{

  "email": "user@example.com",

```  "password": "password123"

POST /dispatch/by-id}

Authorization: Bearer <token>```

Content-Type: application/json

**Response:**

{```json

  "beneficiaryId": "cml...",{

  "amount": 100,  "access_token": "jwt_token_here",

  "aidType": "FOOD"  "user": {

}    "id": "string",

```    "email": "string",

    "name": "string",

### Get Eligible Beneficiaries    "role": "DONOR | ASSOCIATION_MEMBER | ASSOCIATION_ADMIN | SUPER_ADMIN",

List all beneficiaries who can receive aid (not in cooldown).    "associationId": "string | null"

  }

```}

GET /beneficiaries/eligible```

Authorization: Bearer <token>

```### POST /api/auth/register

```json

### Get Dispatch History{

View all aid dispatches made by the association.  "email": "user@example.com",

  "password": "password123",

```  "name": "John Doe",

GET /dispatch/history  "role": "DONOR (optional, default)"

Authorization: Bearer <token>}

``````



### Get Dashboard Stats---

Get aggregated statistics for the association.

## Business Rules Enforced

```

GET /dashboard1. **Amount Limits**: If an AMOUNT rule is active, donations exceeding the limit are rejected.

Authorization: Bearer <token>2. **Cooldown Periods**: If a FREQUENCY rule is active, families in cooldown cannot receive donations.

```3. **Eligibility Requirements**: If an ELIGIBILITY rule is active, families must meet minimum member requirements.

4. **Status Checks**: Only ELIGIBLE beneficiaries can receive dispatched donations.

**Response:**5. **Association Checks**: Donations can only be made to ACTIVE associations.

```json

{---

  "budget": 1700,

  "contributions": {## Error Responses

    "pendingAmount": 250,

    "pendingCount": 1,All errors follow this format:

    "completedAmount": 2100,```json

    "completedCount": 4{

  },  "statusCode": 400 | 401 | 403 | 404,

  "dispatches": {  "message": "Error description",

    "totalAmount": 400,  "error": "Bad Request | Unauthorized | Forbidden | Not Found"

    "totalCount": 4}

  },```

  "beneficiaries": {
    "total": 4,
    "eligible": 3
  },
  "families": {
    "total": 3
  }
}
```

---

## 🔐 Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@espoir-tunisie.org",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "cml...",
    "email": "admin@espoir-tunisie.org",
    "name": "Ahmed Ben Salah",
    "role": "ASSOCIATION_ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Use the `accessToken` in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📋 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@charity.tn | password123 |
| Association Admin | admin@espoir-tunisie.org | password123 |
| Association Member | membre@espoir-tunisie.org | password123 |
| Donor | donateur@email.tn | password123 |

## 📋 Demo Beneficiaries (National IDs)

| National ID | Name | Family |
|-------------|------|--------|
| 12345678 | Khaled Ben Ali | Famille Ben Ali |
| 23456789 | Amira Ben Ali | Famille Ben Ali |
| 34567890 | Youssef Gharbi | Famille Gharbi |
| 45678901 | Leila Mejri | Famille Mejri |

---

## ⚠️ Error Responses

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Amount must be greater than 0"
}
```

**Insufficient Budget:**
```json
{
  "statusCode": 400,
  "message": "Insufficient budget. Available: 100 TND, Requested: 500 TND"
}
```

**Cooldown Violation:**
```json
{
  "statusCode": 400,
  "message": "Family is in cooldown. Must wait 30 days between dispatches."
}
```

**Not Found:**
```json
{
  "statusCode": 404,
  "message": "Beneficiary with National ID \"99999999\" not found"
}
```
