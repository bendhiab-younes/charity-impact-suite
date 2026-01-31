# Charity Impact Suite - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Application<br/>React + Vite + TypeScript]
        Mobile[Mobile App<br/>React Native / Flutter]
    end
    
    subgraph "API Gateway"
        API[REST API<br/>NestJS + Express]
    end
    
    subgraph "Authentication"
        Auth[Auth Module<br/>JWT Strategy]
        Guards[Guards & Decorators<br/>Role-based Access]
    end
    
    subgraph "Core Modules"
        Assoc[Associations Module]
        Users[Users Module]
        Benef[Beneficiaries Module]
        Fam[Families Module]
        Don[Donations Module]
        Rules[Rules Module]
        MobileAPI[Mobile Module<br/>Public & Member APIs]
    end
    
    subgraph "Cross-Cutting"
        Prisma[Prisma Service<br/>ORM Layer]
        Logger[Activity Logs]
        Validation[DTO Validation]
    end
    
    subgraph "Data Layer"
        DB[(SQLite Database<br/>dev.db)]
    end
    
    Web -->|HTTP/REST| API
    Mobile -->|HTTP/REST| API
    
    API --> Auth
    Auth --> Guards
    
    API --> Assoc
    API --> Users
    API --> Benef
    API --> Fam
    API --> Don
    API --> Rules
    API --> MobileAPI
    
    Assoc --> Prisma
    Users --> Prisma
    Benef --> Prisma
    Fam --> Prisma
    Don --> Prisma
    Rules --> Prisma
    MobileAPI --> Prisma
    
    Prisma --> DB
    
    Assoc --> Logger
    Users --> Logger
    Benef --> Logger
    Fam --> Logger
    Don --> Logger
    Rules --> Logger
    MobileAPI --> Logger
    
    Logger --> Prisma
    
    Guards --> Validation
```

## Component Diagram

```mermaid
graph LR
    subgraph "Frontend - React Application"
        Pages[Pages Layer]
        Hooks[Custom Hooks]
        Components[UI Components]
        Context[Auth Context]
        API_Client[API Client]
    end
    
    subgraph "Backend - NestJS API"
        Controllers[Controllers]
        Services[Business Logic]
        DTOs[Data Transfer Objects]
        Entities[Domain Models]
    end
    
    subgraph "Database"
        Schema[Prisma Schema]
        Migrations[Migrations]
    end
    
    Pages --> Hooks
    Pages --> Components
    Pages --> Context
    Hooks --> API_Client
    Context --> API_Client
    
    API_Client -->|REST API| Controllers
    Controllers --> Services
    Controllers --> DTOs
    Services --> Entities
    Services --> Schema
    Schema --> Migrations
```

## Module Dependencies

```mermaid
graph TB
    subgraph "NestJS Application Structure"
        App[App Module]
        
        subgraph "Authentication & Authorization"
            AuthModule[Auth Module]
            JWTStrategy[JWT Strategy]
            RolesGuard[Roles Guard]
        end
        
        subgraph "Domain Modules"
            AssocModule[Associations Module]
            UsersModule[Users Module]
            BenefModule[Beneficiaries Module]
            FamModule[Families Module]
            DonModule[Donations Module]
            RulesModule[Rules Module]
            MobileModule[Mobile Module]
        end
        
        subgraph "Infrastructure"
            PrismaModule[Prisma Module]
            PrismaService[Prisma Service]
        end
    end
    
    App --> AuthModule
    App --> AssocModule
    App --> UsersModule
    App --> BenefModule
    App --> FamModule
    App --> DonModule
    App --> RulesModule
    App --> MobileModule
    App --> PrismaModule
    
    AuthModule --> JWTStrategy
    AuthModule --> RolesGuard
    AuthModule --> PrismaModule
    
    AssocModule --> PrismaModule
    UsersModule --> PrismaModule
    BenefModule --> PrismaModule
    FamModule --> PrismaModule
    DonModule --> PrismaModule
    RulesModule --> PrismaModule
    MobileModule --> PrismaModule
    MobileModule --> DonModule
    MobileModule --> BenefModule
    MobileModule --> RulesModule
    
    PrismaModule --> PrismaService
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
        App[Mobile App]
    end
    
    subgraph "Web Server"
        Static[Static Files<br/>Vite Build]
    end
    
    subgraph "Application Server"
        API_Server[NestJS API<br/>Port 3001]
        Node[Node.js Runtime]
    end
    
    subgraph "Data Storage"
        SQLite[SQLite Database<br/>File-based]
    end
    
    Browser -->|HTTP| Static
    Browser -->|HTTP/REST| API_Server
    App -->|HTTP/REST| API_Server
    
    API_Server --> Node
    API_Server --> SQLite
```

## PlantUML Scripts

### 1. System Architecture - PlantUML

```plantuml
@startuml System Architecture

!define RECTANGLE class

skinparam componentStyle rectangle

package "Client Layer" {
    [Web Application\nReact + Vite + TypeScript] as Web
    [Mobile App\nReact Native / Flutter] as Mobile
}

package "API Gateway" {
    [REST API\nNestJS + Express] as API
}

package "Authentication" {
    [Auth Module\nJWT Strategy] as Auth
    [Guards & Decorators\nRole-based Access] as Guards
}

package "Core Modules" {
    [Associations Module] as Assoc
    [Users Module] as Users
    [Beneficiaries Module] as Benef
    [Families Module] as Fam
    [Donations Module] as Don
    [Rules Module] as Rules
    [Mobile Module\nPublic & Member APIs] as MobileAPI
}

package "Cross-Cutting" {
    [Prisma Service\nORM Layer] as Prisma
    [Activity Logs] as Logger
    [DTO Validation] as Validation
}

package "Data Layer" {
    database "SQLite Database\ndev.db" as DB
}

Web -down-> API : HTTP/REST
Mobile -down-> API : HTTP/REST

API -down-> Auth
Auth -down-> Guards

API -down-> Assoc
API -down-> Users
API -down-> Benef
API -down-> Fam
API -down-> Don
API -down-> Rules
API -down-> MobileAPI

Assoc -down-> Prisma
Users -down-> Prisma
Benef -down-> Prisma
Fam -down-> Prisma
Don -down-> Prisma
Rules -down-> Prisma
MobileAPI -down-> Prisma

Prisma -down-> DB

Assoc --> Logger
Users --> Logger
Benef --> Logger
Fam --> Logger
Don --> Logger
Rules --> Logger
MobileAPI --> Logger

Logger --> Prisma
Guards --> Validation

@enduml
```

### 2. Component Diagram - PlantUML

```plantuml
@startuml Component Diagram

skinparam componentStyle rectangle

package "Frontend - React Application" {
    [Pages Layer] as Pages
    [Custom Hooks] as Hooks
    [UI Components] as Components
    [Auth Context] as Context
    [API Client] as APIClient
}

package "Backend - NestJS API" {
    [Controllers] as Controllers
    [Business Logic] as Services
    [Data Transfer Objects] as DTOs
    [Domain Models] as Entities
}

package "Database" {
    [Prisma Schema] as Schema
    [Migrations] as Migrations
}

Pages --> Hooks
Pages --> Components
Pages --> Context
Hooks --> APIClient
Context --> APIClient

APIClient --> Controllers : REST API
Controllers --> Services
Controllers --> DTOs
Services --> Entities
Services --> Schema
Schema --> Migrations

@enduml
```

### 3. Module Dependencies - PlantUML

```plantuml
@startuml Module Dependencies

package "NestJS Application" {
    [App Module] as App
    
    package "Authentication & Authorization" {
        [Auth Module] as AuthModule
        [JWT Strategy] as JWTStrategy
        [Roles Guard] as RolesGuard
    }
    
    package "Domain Modules" {
        [Associations Module] as AssocModule
        [Users Module] as UsersModule
        [Beneficiaries Module] as BenefModule
        [Families Module] as FamModule
        [Donations Module] as DonModule
        [Rules Module] as RulesModule
        [Mobile Module] as MobileModule
    }
    
    package "Infrastructure" {
        [Prisma Module] as PrismaModule
        [Prisma Service] as PrismaService
    }
}

App --> AuthModule
App --> AssocModule
App --> UsersModule
App --> BenefModule
App --> FamModule
App --> DonModule
App --> RulesModule
App --> MobileModule
App --> PrismaModule

AuthModule --> JWTStrategy
AuthModule --> RolesGuard
AuthModule --> PrismaModule

AssocModule --> PrismaModule
UsersModule --> PrismaModule
BenefModule --> PrismaModule
FamModule --> PrismaModule
DonModule --> PrismaModule
RulesModule --> PrismaModule
MobileModule --> PrismaModule
MobileModule --> DonModule
MobileModule --> BenefModule
MobileModule --> RulesModule

PrismaModule --> PrismaService

@enduml
```

### 4. Deployment Architecture - PlantUML

```plantuml
@startuml Deployment Architecture

node "Client" {
    [Web Browser] as Browser
    [Mobile App] as App
}

node "Web Server" {
    [Static Files\nVite Build] as Static
}

node "Application Server" {
    [NestJS API\nPort 3001] as APIServer
    [Node.js Runtime] as Node
}

node "Data Storage" {
    database "SQLite Database\nFile-based" as SQLite
}

Browser -down-> Static : HTTP
Browser -down-> APIServer : HTTP/REST
App -down-> APIServer : HTTP/REST

APIServer --> Node
APIServer -down-> SQLite

@enduml
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Axios (via custom API client)
- **Routing**: React Router

### Backend
- **Framework**: NestJS (Express-based)
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI

### Database
- **Type**: SQLite (development)
- **Migration Tool**: Prisma Migrate
- **Seeding**: Custom seed scripts

### Development
- **Package Manager**: Bun (lockfile: bun.lockb)
- **Linting**: ESLint
- **Container**: Docker (docker-compose.yml)

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Server validates and generates JWT
3. JWT stored in client (localStorage/secure storage)
4. JWT included in Authorization header for protected routes
5. Server validates JWT on each request

### Authorization Levels
- **Public**: Browse associations, anonymous donations
- **Donor**: Make authenticated donations, view history
- **Association Member**: Manage beneficiaries, families, dispatch donations
- **Association Admin**: All member permissions + manage users, rules
- **Super Admin**: Cross-association management, create associations

### API Security
- JWT-based authentication
- Role-based authorization guards
- Input validation with DTOs
- CORS configuration
- SQL injection prevention (Prisma ORM)
