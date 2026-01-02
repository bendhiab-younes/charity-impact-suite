# Charity Impact Suite - Use Case Diagram (Simplified)

```mermaid
graph TB
    subgraph System["Charity Impact Suite"]
        UC1[Login/Sign Up]
        UC2[Browse Associations]
        UC3[Make Donation]
        UC4[Manage Beneficiaries]
        UC5[Manage Families]
        UC6[Process Donations]
        UC7[Configure Rules]
        UC8[View Dashboard & Reports]
        UC9[Manage Users]
        UC10[Manage Association]
    end
    
    %% Actors
    Donor((Donor))
    Member((Association<br/>Member))
    Admin((Association<br/>Admin))
    SuperAdmin((Super Admin))
    
    %% Donor Use Cases
    Donor --> UC1
    Donor --> UC2
    Donor --> UC3
    
    %% Association Member Use Cases
    Member --> UC1
    Member --> UC4
    Member --> UC5
    Member --> UC6
    Member --> UC8
    
    %% Association Admin Use Cases
    Admin --> UC1
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    
    %% Super Admin Use Cases
    SuperAdmin --> UC1
    SuperAdmin --> UC2
    SuperAdmin --> UC8
    SuperAdmin --> UC9
    SuperAdmin --> UC10
    
    %% Key relationships
    UC3 -.->|validates| UC7
    UC6 -.->|checks| UC4
    UC6 -.->|validates| UC7
```

## Core Use Cases

**UC1 - Login/Sign Up**: User authentication and registration with role selection

**UC2 - Browse Associations**: View and search charity associations

**UC3 - Make Donation**: Donors contribute to associations or beneficiaries

**UC4 - Manage Beneficiaries**: Add, review eligibility, and update beneficiary status

**UC5 - Manage Families**: Register and track family units with donation history

**UC6 - Process Donations**: Record, approve/reject, and track donation status

**UC7 - Configure Rules**: Set eligibility, frequency, and amount limit rules

**UC8 - View Dashboard & Reports**: Access analytics, impact metrics, and audit logs

**UC9 - Manage Users**: Add users, assign roles, and manage permissions

**UC10 - Manage Association**: Create, update, and manage association details
```
