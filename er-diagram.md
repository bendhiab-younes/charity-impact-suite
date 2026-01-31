# Charity Impact Suite - Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Donation : "makes"
    User ||--o{ ActivityLog : "creates"
    User }o--|| Association : "belongs to"
    
    Association ||--o{ User : "has members"
    Association ||--o{ Beneficiary : "manages"
    Association ||--o{ Family : "serves"
    Association ||--o{ Donation : "receives"
    Association ||--o{ DonationRule : "defines"
    Association ||--o{ ActivityLog : "tracks"
    
    Family ||--o{ Beneficiary : "contains"
    Family ||--o{ Donation : "receives"
    
    Beneficiary }o--|| Family : "member of"
    Beneficiary ||--o{ Donation : "receives"
    
    Donation }o--o| User : "donor"
    Donation }o--o| Beneficiary : "for"
    Donation }o--o| Family : "for"
    Donation }o--|| Association : "to"
    
    User {
        string id PK
        string email UK
        string password
        string name
        string role
        string associationId FK
        string avatar
        datetime createdAt
        datetime updatedAt
    }
    
    Association {
        string id PK
        string name
        string description
        string logo
        string website
        string email
        string phone
        string address
        string status
        datetime createdAt
        datetime updatedAt
    }
    
    Beneficiary {
        string id PK
        string associationId FK
        string familyId FK
        string firstName
        string lastName
        string email
        string phone
        string address
        string status
        float totalReceived
        datetime lastDonationDate
        string eligibilityNotes
        datetime createdAt
        datetime updatedAt
    }
    
    Family {
        string id PK
        string associationId FK
        string name
        int memberCount
        string address
        string status
        float totalReceived
        datetime lastDonationDate
        datetime createdAt
        datetime updatedAt
    }
    
    Donation {
        string id PK
        string associationId FK
        string donorId FK
        string beneficiaryId FK
        string familyId FK
        float amount
        string currency
        string status
        string type
        string method
        string notes
        datetime processedAt
        datetime createdAt
        datetime updatedAt
    }
    
    DonationRule {
        string id PK
        string associationId FK
        string name
        string description
        string type
        float value
        string unit
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    ActivityLog {
        string id PK
        string associationId FK
        string userId FK
        string action
        string details
        string entityType
        string entityId
        datetime createdAt
    }
```

## Entity Descriptions

### User
Represents all system users with different roles (SUPER_ADMIN, ASSOCIATION_ADMIN, ASSOCIATION_MEMBER, DONOR).
- **Roles**: Controls access to different features
- **Association Link**: Members belong to one association (optional for donors)

### Association
Charity organizations that manage beneficiaries and receive donations.
- **Status**: ACTIVE, PENDING, SUSPENDED
- **Aggregates**: Tracks total donations, beneficiaries, and members

### Beneficiary
Individual recipients who receive donations through their family.
- **Status**: ELIGIBLE, INELIGIBLE, PENDING_REVIEW
- **Tracking**: Records total received amount and last donation date

### Family
Groups of beneficiaries with collective donation tracking.
- **Status**: ELIGIBLE, INELIGIBLE, COOLDOWN
- **Cooldown**: Enforces waiting periods between donations

### Donation
Monetary contributions from donors to associations for beneficiaries/families.
- **Status**: PENDING, APPROVED, REJECTED, COMPLETED
- **Type**: ONE_TIME, RECURRING
- **Method**: CARD, BANK_TRANSFER, CASH, CHECK

### DonationRule
Business rules that govern donation eligibility and limits.
- **Type**: FREQUENCY, AMOUNT, ELIGIBILITY
- **Value & Unit**: Configurable thresholds (days, weeks, months, currency)

### ActivityLog
Audit trail of all actions performed in the system.
- **EntityType**: DONATION, BENEFICIARY, FAMILY, RULE, MEMBER
- **Tracking**: Who did what, when, and on which entity

## PlantUML Script

```plantuml
@startuml Charity Impact Suite - ER Diagram

' Define entities
entity "User" as user {
  * id : String <<PK>>
  --
  * email : String <<UK>>
  * password : String
  * name : String
  * role : String
    associationId : String <<FK>>
    avatar : String
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Association" as association {
  * id : String <<PK>>
  --
  * name : String
  * description : String
    logo : String
    website : String
  * email : String
    phone : String
    address : String
  * status : String
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Beneficiary" as beneficiary {
  * id : String <<PK>>
  --
  * associationId : String <<FK>>
  * familyId : String <<FK>>
  * firstName : String
  * lastName : String
    email : String
    phone : String
    address : String
  * status : String
  * totalReceived : Float
    lastDonationDate : DateTime
    eligibilityNotes : String
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Family" as family {
  * id : String <<PK>>
  --
  * associationId : String <<FK>>
  * name : String
  * memberCount : Int
    address : String
  * status : String
  * totalReceived : Float
    lastDonationDate : DateTime
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "Donation" as donation {
  * id : String <<PK>>
  --
  * associationId : String <<FK>>
    donorId : String <<FK>>
    beneficiaryId : String <<FK>>
    familyId : String <<FK>>
  * amount : Float
  * currency : String
  * status : String
  * type : String
  * method : String
    notes : String
    processedAt : DateTime
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "DonationRule" as rule {
  * id : String <<PK>>
  --
  * associationId : String <<FK>>
  * name : String
  * description : String
  * type : String
  * value : Float
    unit : String
  * isActive : Boolean
  * createdAt : DateTime
  * updatedAt : DateTime
}

entity "ActivityLog" as log {
  * id : String <<PK>>
  --
  * associationId : String <<FK>>
  * userId : String <<FK>>
  * action : String
  * details : String
  * entityType : String
  * entityId : String
  * createdAt : DateTime
}

' Define relationships
user }o--|| association : "belongs to"
user ||--o{ donation : "makes"
user ||--o{ log : "creates"

association ||--o{ user : "has members"
association ||--o{ beneficiary : "manages"
association ||--o{ family : "serves"
association ||--o{ donation : "receives"
association ||--o{ rule : "defines"
association ||--o{ log : "tracks"

family ||--o{ beneficiary : "contains"
family ||--o{ donation : "receives"

beneficiary }o--|| family : "member of"
beneficiary ||--o{ donation : "receives"

donation }o--o| user : "donor"
donation }o--o| beneficiary : "for"
donation }o--o| family : "for"
donation }o--|| association : "to"

@enduml
```

## Database Schema Notes

### SQLite Implementation
The current implementation uses SQLite with Prisma ORM:
- **Enums as Strings**: SQLite doesn't support native enums, so enum values are stored as strings
- **Cascade Deletes**: Beneficiaries, families, donations, rules, and logs cascade when associations are deleted
- **Default Values**: Status fields have default values (e.g., PENDING, ELIGIBLE)
- **Timestamps**: Automatic tracking with `createdAt` and `updatedAt`

### Key Constraints
- **User.email**: Unique constraint for authentication
- **Foreign Keys**: All relationships enforced with foreign key constraints
- **Cascade Rules**: Child entities deleted when parent is removed
- **Optional Fields**: Nullable fields marked with `?` in schema
