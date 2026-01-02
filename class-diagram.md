# Charity Impact Suite - Class Diagram (Simplified)

```mermaid
classDiagram
    %% Core Domain Classes
    class User {
        -string id
        -string email
        -string name
        -string role
        -string associationId
        +login()
        +updateProfile()
    }
    
    class Association {
        -string id
        -string name
        -string description
        -string status
        -number totalDonations
        -number totalBeneficiaries
        +register()
        +update()
    }
    
    class Beneficiary {
        -string id
        -string firstName
        -string lastName
        -string status
        -number totalReceived
        +checkEligibility()
        +updateStatus()
    }
    
    class Family {
        -string id
        -string name
        -number memberCount
        -string status
        -number totalReceived
        +checkCooldown()
        +addBeneficiary()
    }
    
    class Donation {
        -string id
        -number amount
        -string status
        -string type
        -string method
        +create()
        +approve()
        +reject()
    }
    
    class DonationRule {
        -string id
        -string name
        -string type
        -number value
        -boolean isActive
        +validate()
        +apply()
    }
    
    %% Relationships
    User "0..*" --> "0..1" Association : belongs to
    Association "1" --> "0..*" User : has members
    Association "1" --> "0..*" Beneficiary : manages
    Association "1" --> "0..*" Family : serves
    Association "1" --> "0..*" Donation : receives
    Association "1" --> "0..*" DonationRule : defines
    
    Family "1" --> "0..*" Beneficiary : contains
    Family "1" --> "0..*" Donation : receives
    
    Beneficiary "1" --> "1" Family : member of
    Beneficiary "1" --> "0..*" Donation : receives
    
    Donation "0..*" --> "0..1" User : made by
    Donation "0..*" --> "0..1" Beneficiary : for
    Donation "0..*" --> "0..1" Family : for
```

## Core Classes

**User**: System users with roles (admin, member, donor) belonging to associations

**Association**: Charity organizations managing beneficiaries and donations

**Beneficiary**: Individual recipients linked to families with eligibility tracking

**Family**: Groups of beneficiaries with cooldown periods and donation limits

**Donation**: Monetary contributions with approval workflow and status tracking

**DonationRule**: Business rules for eligibility, frequency, and amount limits
