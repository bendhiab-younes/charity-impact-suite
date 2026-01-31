# Charity Impact Suite - Class Diagram (Simplified)

```mermaid
classDiagram
    %% Core Domain Classes
    class User {
        -string id
        -string email
        -string password
        -string name
        -string role
        -string associationId
        -string avatar
        -DateTime createdAt
        -DateTime updatedAt
        +login()
        +register()
        +updateProfile()
        +getProfile()
    }
    
    class Association {
        -string id
        -string name
        -string description
        -string logo
        -string website
        -string email
        -string phone
        -string address
        -string status
        -DateTime createdAt
        -DateTime updatedAt
        +create()
        +update()
        +delete()
        +findAll()
        +findOne()
        +getStats()
    }
    
    class Beneficiary {
        -string id
        -string associationId
        -string familyId
        -string firstName
        -string lastName
        -string email
        -string phone
        -string address
        -string status
        -number totalReceived
        -DateTime lastDonationDate
        -string eligibilityNotes
        -DateTime createdAt
        -DateTime updatedAt
        +create()
        +update()
        +updateStatus()
        +delete()
        +checkEligibility()
    }
    
    class Family {
        -string id
        -string associationId
        -string name
        -number memberCount
        -string address
        -string status
        -number totalReceived
        -DateTime lastDonationDate
        -DateTime createdAt
        -DateTime updatedAt
        +create()
        +update()
        +delete()
        +checkCooldown()
        +addBeneficiary()
    }
    
    class Donation {
        -string id
        -string associationId
        -string donorId
        -string beneficiaryId
        -string familyId
        -number amount
        -string currency
        -string status
        -string type
        -string method
        -string notes
        -DateTime processedAt
        -DateTime createdAt
        -DateTime updatedAt
        +create()
        +approve()
        +reject()
        +complete()
        +delete()
        +dispatch()
    }
    
    class DonationRule {
        -string id
        -string associationId
        -string name
        -string description
        -string type
        -number value
        -string unit
        -boolean isActive
        -DateTime createdAt
        -DateTime updatedAt
        +create()
        +update()
        +toggle()
        +delete()
        +validate()
        +apply()
    }
    
    class ActivityLog {
        -string id
        -string associationId
        -string userId
        -string action
        -string details
        -string entityType
        -string entityId
        -DateTime createdAt
        +create()
        +findAll()
    }
    
    %% Relationships
    User "0..*" --> "0..1" Association : belongs to
    User "1" --> "0..*" Donation : makes
    User "1" --> "0..*" ActivityLog : creates
    
    Association "1" --> "0..*" User : has members
    Association "1" --> "0..*" Beneficiary : manages
    Association "1" --> "0..*" Family : serves
    Association "1" --> "0..*" Donation : receives
    Association "1" --> "0..*" DonationRule : defines
    Association "1" --> "0..*" ActivityLog : tracks
    
    Family "1" --> "0..*" Beneficiary : contains
    Family "1" --> "0..*" Donation : receives
    
    Beneficiary "1" --> "1" Family : member of
    Beneficiary "1" --> "0..*" Donation : receives
    
    Donation "0..*" --> "0..1" User : made by
    Donation "0..*" --> "0..1" Beneficiary : for
    Donation "0..*" --> "0..1" Family : for
    Donation "0..*" --> "1" Association : to
```

## Core Classes

**User**: System users with roles (SUPER_ADMIN, ASSOCIATION_ADMIN, ASSOCIATION_MEMBER, DONOR) belonging to associations

**Association**: Charity organizations managing beneficiaries, families, donations, and rules

**Beneficiary**: Individual recipients linked to families with eligibility tracking and status management

**Family**: Groups of beneficiaries with cooldown periods, donation limits, and status tracking

**Donation**: Monetary contributions with approval workflow (PENDING, APPROVED, REJECTED, COMPLETED) and multiple payment methods

**DonationRule**: Business rules for eligibility, frequency, and amount limits (FREQUENCY, AMOUNT, ELIGIBILITY)

**ActivityLog**: Audit trail tracking all actions performed by users on entities within associations

## PlantUML Script

```plantuml
@startuml Charity Impact Suite - Class Diagram

' Define classes
class User {
  - id: String
  - email: String
  - password: String
  - name: String
  - role: String
  - associationId: String
  - avatar: String
  - createdAt: DateTime
  - updatedAt: DateTime
  + login()
  + register()
  + updateProfile()
  + getProfile()
}

class Association {
  - id: String
  - name: String
  - description: String
  - logo: String
  - website: String
  - email: String
  - phone: String
  - address: String
  - status: String
  - createdAt: DateTime
  - updatedAt: DateTime
  + create()
  + update()
  + delete()
  + findAll()
  + findOne()
  + getStats()
}

class Beneficiary {
  - id: String
  - associationId: String
  - familyId: String
  - firstName: String
  - lastName: String
  - email: String
  - phone: String
  - address: String
  - status: String
  - totalReceived: Float
  - lastDonationDate: DateTime
  - eligibilityNotes: String
  - createdAt: DateTime
  - updatedAt: DateTime
  + create()
  + update()
  + updateStatus()
  + delete()
  + checkEligibility()
}

class Family {
  - id: String
  - associationId: String
  - name: String
  - memberCount: Int
  - address: String
  - status: String
  - totalReceived: Float
  - lastDonationDate: DateTime
  - createdAt: DateTime
  - updatedAt: DateTime
  + create()
  + update()
  + delete()
  + checkCooldown()
  + addBeneficiary()
}

class Donation {
  - id: String
  - associationId: String
  - donorId: String
  - beneficiaryId: String
  - familyId: String
  - amount: Float
  - currency: String
  - status: String
  - type: String
  - method: String
  - notes: String
  - processedAt: DateTime
  - createdAt: DateTime
  - updatedAt: DateTime
  + create()
  + approve()
  + reject()
  + complete()
  + delete()
  + dispatch()
}

class DonationRule {
  - id: String
  - associationId: String
  - name: String
  - description: String
  - type: String
  - value: Float
  - unit: String
  - isActive: Boolean
  - createdAt: DateTime
  - updatedAt: DateTime
  + create()
  + update()
  + toggle()
  + delete()
  + validate()
  + apply()
}

class ActivityLog {
  - id: String
  - associationId: String
  - userId: String
  - action: String
  - details: String
  - entityType: String
  - entityId: String
  - createdAt: DateTime
  + create()
  + findAll()
}

' Define relationships
User "0..*" --> "0..1" Association : belongs to
User "1" --> "0..*" Donation : makes
User "1" --> "0..*" ActivityLog : creates

Association "1" --> "0..*" User : has members
Association "1" --> "0..*" Beneficiary : manages
Association "1" --> "0..*" Family : serves
Association "1" --> "0..*" Donation : receives
Association "1" --> "0..*" DonationRule : defines
Association "1" --> "0..*" ActivityLog : tracks

Family "1" --> "0..*" Beneficiary : contains
Family "1" --> "0..*" Donation : receives

Beneficiary "1" --> "1" Family : member of
Beneficiary "1" --> "0..*" Donation : receives

Donation "0..*" --> "0..1" User : made by
Donation "0..*" --> "0..1" Beneficiary : for
Donation "0..*" --> "0..1" Family : for
Donation "0..*" --> "1" Association : to

@enduml
```
