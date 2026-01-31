# Charity Impact Suite - Sequence Diagrams

## 1. Donation Flow (Anonymous)

```mermaid
sequenceDiagram
    actor Public as Public User
    participant Mobile as Mobile API
    participant Donation as Donation Service
    participant Rule as Rule Service
    participant DB as Database
    
    Public->>Mobile: POST /mobile/donate
    activate Mobile
    Mobile->>Rule: Validate donation rules
    activate Rule
    Rule->>DB: Get active rules for association
    DB-->>Rule: Rules data
    Rule-->>Mobile: Validation result
    deactivate Rule
    
    alt Rules violated
        Mobile-->>Public: 400 - Rule violation error
    else Rules passed
        Mobile->>Donation: Create donation (PENDING)
        activate Donation
        Donation->>DB: Insert donation record
        DB-->>Donation: Donation created
        Donation-->>Mobile: Donation data
        deactivate Donation
        Mobile-->>Public: 201 - Donation created
    end
    deactivate Mobile
```

## 2. Donation Dispatch Flow

```mermaid
sequenceDiagram
    actor Member as Association Member
    participant Mobile as Mobile API
    participant Service as Mobile Service
    participant Rule as Rule Service
    participant Beneficiary as Beneficiary Service
    participant Family as Family Service
    participant DB as Database
    participant Log as Activity Log
    
    Member->>Mobile: POST /mobile/dispatch
    activate Mobile
    Mobile->>Service: dispatchDonation()
    activate Service
    
    Service->>DB: Get donation
    DB-->>Service: Donation data
    Service->>DB: Get beneficiary
    DB-->>Service: Beneficiary data
    Service->>DB: Get family
    DB-->>Service: Family data
    
    Service->>Rule: Validate eligibility rules
    activate Rule
    Rule-->>Service: Validation result
    deactivate Rule
    
    Service->>Family: Check cooldown
    activate Family
    Family-->>Service: Cooldown check
    deactivate Family
    
    alt Rules violated or cooldown active
        Service-->>Mobile: 400 - Cannot dispatch
        Mobile-->>Member: Error message
    else All checks passed
        Service->>DB: Update donation (COMPLETED)
        Service->>DB: Assign beneficiary to donation
        Service->>DB: Update beneficiary.totalReceived
        Service->>DB: Update beneficiary.lastDonationDate
        Service->>DB: Update family.totalReceived
        Service->>DB: Update family.lastDonationDate
        DB-->>Service: Success
        
        Service->>Log: Create activity log
        activate Log
        Log->>DB: Insert log entry
        deactivate Log
        
        Service-->>Mobile: Dispatch successful
        deactivate Service
        Mobile-->>Member: 200 - Success
    end
    deactivate Mobile
```

## 3. User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Auth as Auth Controller
    participant Service as Auth Service
    participant DB as Database
    participant JWT as JWT Strategy
    
    User->>Auth: POST /auth/register
    activate Auth
    Auth->>Service: register(dto)
    activate Service
    Service->>DB: Check if email exists
    DB-->>Service: Email available
    Service->>Service: Hash password
    Service->>DB: Create user
    DB-->>Service: User created
    Service->>JWT: Generate token
    JWT-->>Service: JWT token
    Service-->>Auth: User + token
    Auth-->>User: 201 - Registration successful
    deactivate Service
    deactivate Auth
    
    Note over User,JWT: Login Flow
    
    User->>Auth: POST /auth/login
    activate Auth
    Auth->>Service: login(credentials)
    activate Service
    Service->>DB: Find user by email
    DB-->>Service: User data
    Service->>Service: Verify password
    
    alt Invalid credentials
        Service-->>Auth: Unauthorized
        Auth-->>User: 401 - Invalid credentials
    else Valid credentials
        Service->>JWT: Generate token
        JWT-->>Service: JWT token
        Service-->>Auth: User + token
        Auth-->>User: 200 - Login successful
    end
    deactivate Service
    deactivate Auth
```

## 4. Beneficiary Management Flow

```mermaid
sequenceDiagram
    actor Admin as Association Admin
    participant Controller as Beneficiary Controller
    participant Service as Beneficiary Service
    participant Family as Family Service
    participant DB as Database
    participant Log as Activity Log
    
    Admin->>Controller: POST /beneficiaries
    activate Controller
    Controller->>Controller: Verify JWT & Role
    Controller->>Service: create(dto)
    activate Service
    
    Service->>Family: Check if family exists
    activate Family
    Family->>DB: Get family
    DB-->>Family: Family data
    Family-->>Service: Family exists
    deactivate Family
    
    Service->>DB: Create beneficiary (PENDING_REVIEW)
    DB-->>Service: Beneficiary created
    
    Service->>Log: Log creation
    activate Log
    Log->>DB: Insert activity log
    deactivate Log
    
    Service-->>Controller: Beneficiary data
    deactivate Service
    Controller-->>Admin: 201 - Beneficiary created
    deactivate Controller
    
    Note over Admin,Log: Update Status
    
    Admin->>Controller: PATCH /beneficiaries/:id/status
    activate Controller
    Controller->>Service: updateStatus(id, status)
    activate Service
    Service->>DB: Update beneficiary status
    DB-->>Service: Updated beneficiary
    Service->>Log: Log status change
    Service-->>Controller: Updated beneficiary
    deactivate Service
    Controller-->>Admin: 200 - Status updated
    deactivate Controller
```

## 5. Rule Validation Flow

```mermaid
sequenceDiagram
    participant Donation as Donation Service
    participant Rule as Rule Service
    participant DB as Database
    
    Donation->>Rule: Validate donation
    activate Rule
    Rule->>DB: Get active rules for association
    DB-->>Rule: Rules list
    
    loop For each rule
        alt Rule type: AMOUNT
            Rule->>Rule: Check amount <= max
        else Rule type: FREQUENCY
            Rule->>DB: Get beneficiary last donation
            DB-->>Rule: Last donation date
            Rule->>Rule: Check cooldown period
        else Rule type: ELIGIBILITY
            Rule->>DB: Get beneficiary status
            DB-->>Rule: Status
            Rule->>Rule: Check if ELIGIBLE
        end
    end
    
    Rule-->>Donation: Validation result + violations
    deactivate Rule
```

## PlantUML Scripts

### 1. Donation Flow (Anonymous) - PlantUML

```plantuml
@startuml Anonymous Donation Flow

actor "Public User" as Public
participant "Mobile API" as Mobile
participant "Donation Service" as Donation
participant "Rule Service" as Rule
database "Database" as DB

Public -> Mobile: POST /mobile/donate
activate Mobile

Mobile -> Rule: Validate donation rules
activate Rule
Rule -> DB: Get active rules for association
DB --> Rule: Rules data
Rule --> Mobile: Validation result
deactivate Rule

alt Rules violated
    Mobile --> Public: 400 - Rule violation error
else Rules passed
    Mobile -> Donation: Create donation (PENDING)
    activate Donation
    Donation -> DB: Insert donation record
    DB --> Donation: Donation created
    Donation --> Mobile: Donation data
    deactivate Donation
    Mobile --> Public: 201 - Donation created
end

deactivate Mobile

@enduml
```

### 2. Donation Dispatch Flow - PlantUML

```plantuml
@startuml Donation Dispatch Flow

actor "Association\nMember" as Member
participant "Mobile API" as Mobile
participant "Mobile Service" as Service
participant "Rule Service" as Rule
participant "Beneficiary\nService" as Beneficiary
participant "Family Service" as Family
database "Database" as DB
participant "Activity Log" as Log

Member -> Mobile: POST /mobile/dispatch
activate Mobile
Mobile -> Service: dispatchDonation()
activate Service

Service -> DB: Get donation
DB --> Service: Donation data
Service -> DB: Get beneficiary
DB --> Service: Beneficiary data
Service -> DB: Get family
DB --> Service: Family data

Service -> Rule: Validate eligibility rules
activate Rule
Rule --> Service: Validation result
deactivate Rule

Service -> Family: Check cooldown
activate Family
Family --> Service: Cooldown check
deactivate Family

alt Rules violated or cooldown active
    Service --> Mobile: 400 - Cannot dispatch
    Mobile --> Member: Error message
else All checks passed
    Service -> DB: Update donation (COMPLETED)
    Service -> DB: Assign beneficiary to donation
    Service -> DB: Update beneficiary.totalReceived
    Service -> DB: Update beneficiary.lastDonationDate
    Service -> DB: Update family.totalReceived
    Service -> DB: Update family.lastDonationDate
    DB --> Service: Success
    
    Service -> Log: Create activity log
    activate Log
    Log -> DB: Insert log entry
    deactivate Log
    
    Service --> Mobile: Dispatch successful
    deactivate Service
    Mobile --> Member: 200 - Success
end

deactivate Mobile

@enduml
```

### 3. User Authentication Flow - PlantUML

```plantuml
@startuml User Authentication Flow

actor User
participant "Auth Controller" as Auth
participant "Auth Service" as Service
database "Database" as DB
participant "JWT Strategy" as JWT

== Registration ==

User -> Auth: POST /auth/register
activate Auth
Auth -> Service: register(dto)
activate Service
Service -> DB: Check if email exists
DB --> Service: Email available
Service -> Service: Hash password
Service -> DB: Create user
DB --> Service: User created
Service -> JWT: Generate token
JWT --> Service: JWT token
Service --> Auth: User + token
Auth --> User: 201 - Registration successful
deactivate Service
deactivate Auth

== Login ==

User -> Auth: POST /auth/login
activate Auth
Auth -> Service: login(credentials)
activate Service
Service -> DB: Find user by email
DB --> Service: User data
Service -> Service: Verify password

alt Invalid credentials
    Service --> Auth: Unauthorized
    Auth --> User: 401 - Invalid credentials
else Valid credentials
    Service -> JWT: Generate token
    JWT --> Service: JWT token
    Service --> Auth: User + token
    Auth --> User: 200 - Login successful
end

deactivate Service
deactivate Auth

@enduml
```

### 4. Beneficiary Management Flow - PlantUML

```plantuml
@startuml Beneficiary Management Flow

actor "Association\nAdmin" as Admin
participant "Beneficiary\nController" as Controller
participant "Beneficiary\nService" as Service
participant "Family Service" as Family
database "Database" as DB
participant "Activity Log" as Log

== Create Beneficiary ==

Admin -> Controller: POST /beneficiaries
activate Controller
Controller -> Controller: Verify JWT & Role
Controller -> Service: create(dto)
activate Service

Service -> Family: Check if family exists
activate Family
Family -> DB: Get family
DB --> Family: Family data
Family --> Service: Family exists
deactivate Family

Service -> DB: Create beneficiary (PENDING_REVIEW)
DB --> Service: Beneficiary created

Service -> Log: Log creation
activate Log
Log -> DB: Insert activity log
deactivate Log

Service --> Controller: Beneficiary data
deactivate Service
Controller --> Admin: 201 - Beneficiary created
deactivate Controller

== Update Status ==

Admin -> Controller: PATCH /beneficiaries/:id/status
activate Controller
Controller -> Service: updateStatus(id, status)
activate Service
Service -> DB: Update beneficiary status
DB --> Service: Updated beneficiary
Service -> Log: Log status change
Service --> Controller: Updated beneficiary
deactivate Service
Controller --> Admin: 200 - Status updated
deactivate Controller

@enduml
```

### 5. Rule Validation Flow - PlantUML

```plantuml
@startuml Rule Validation Flow

participant "Donation Service" as Donation
participant "Rule Service" as Rule
database "Database" as DB

Donation -> Rule: Validate donation
activate Rule
Rule -> DB: Get active rules for association
DB --> Rule: Rules list

loop For each rule
    alt Rule type: AMOUNT
        Rule -> Rule: Check amount <= max
    else Rule type: FREQUENCY
        Rule -> DB: Get beneficiary last donation
        DB --> Rule: Last donation date
        Rule -> Rule: Check cooldown period
    else Rule type: ELIGIBILITY
        Rule -> DB: Get beneficiary status
        DB --> Rule: Status
        Rule -> Rule: Check if ELIGIBLE
    end
end

Rule --> Donation: Validation result + violations
deactivate Rule

@enduml
```

## Key Flows Summary

1. **Anonymous Donation**: Public users can donate without authentication, but donations require approval
2. **Donation Dispatch**: Members assign approved donations to eligible beneficiaries with rule enforcement
3. **Authentication**: Secure user registration and login with JWT tokens
4. **Beneficiary Management**: Admins create and manage beneficiaries with status tracking
5. **Rule Validation**: Automated checking of donation rules (amount, frequency, eligibility)
