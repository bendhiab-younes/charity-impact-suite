# Charity Impact Suite - Diagrams Overview

This document provides an overview of all system diagrams with both Mermaid and PlantUML implementations.

## Available Diagrams

### 1. Class Diagram (`class-diagram.md`)
**Purpose**: Shows the domain model with classes, attributes, methods, and relationships.

**Contents**:
- 7 core domain classes (User, Association, Beneficiary, Family, Donation, DonationRule, ActivityLog)
- Class attributes and methods
- Relationships and cardinalities
- Both Mermaid and PlantUML versions

**Key Insights**:
- Users can have multiple roles (SUPER_ADMIN, ASSOCIATION_ADMIN, ASSOCIATION_MEMBER, DONOR)
- Associations manage multiple beneficiaries, families, donations, and rules
- Beneficiaries belong to families and can receive donations
- ActivityLog tracks all system actions for audit purposes

---

### 2. Use Case Diagram (`use-case-diagram.md`)
**Purpose**: Illustrates system functionality from different user perspectives.

**Contents**:
- 5 actor types (Public User, Donor, Association Member, Association Admin, Super Admin)
- 14 use cases covering all major functionality
- Actor-to-use-case relationships
- Use case dependencies and validations

**Key Insights**:
- Public users can browse and donate anonymously
- Role-based access controls what each user can do
- Donation dispatch enforces rules and cooldowns
- Activity tracking for accountability

---

### 3. Entity Relationship Diagram (`er-diagram.md`)
**Purpose**: Database schema with tables, fields, and relationships.

**Contents**:
- 7 database entities with all fields
- Primary keys (PK) and foreign keys (FK)
- Unique constraints (UK)
- Relationship cardinalities
- SQLite-specific implementation notes

**Key Insights**:
- Cascade deletes protect data integrity
- Enums stored as strings (SQLite limitation)
- Timestamps for audit trail
- Optional relationships for flexibility

---

### 4. Sequence Diagrams (`sequence-diagrams.md`)
**Purpose**: Shows interaction flows between components over time.

**Contents**:
- 5 key workflow diagrams:
  1. Anonymous Donation Flow
  2. Donation Dispatch Flow (with rule validation)
  3. User Authentication Flow (register & login)
  4. Beneficiary Management Flow
  5. Rule Validation Flow

**Key Insights**:
- Request/response patterns
- Service interactions
- Error handling paths
- Database operations sequence

---

### 5. Architecture Diagram (`architecture-diagram.md`)
**Purpose**: System architecture and component organization.

**Contents**:
- System architecture overview
- Component diagram (frontend + backend)
- Module dependencies
- Deployment architecture
- Technology stack details
- Security architecture

**Key Insights**:
- Layered architecture (Client, API, Services, Data)
- NestJS modular structure
- Prisma ORM for data access
- JWT authentication flow
- Role-based authorization

---

## Diagram Formats

All diagrams are provided in two formats:

### Mermaid
- Embedded in markdown files
- Renders directly in GitHub, VS Code, and many documentation tools
- Syntax: \`\`\`mermaid ... \`\`\`

### PlantUML
- Industry-standard UML format
- Can be rendered with PlantUML tools, IDE plugins, or online services
- Higher quality output for professional documentation
- Syntax: \`\`\`plantuml @startuml ... @enduml \`\`\`

## How to Use

### Viewing Mermaid Diagrams

**In VS Code**:
1. Install "Markdown Preview Mermaid Support" extension
2. Open any diagram file
3. Use "Markdown: Open Preview" (Cmd/Ctrl + Shift + V)

**Online**:
- [Mermaid Live Editor](https://mermaid.live/)

### Viewing PlantUML Diagrams

**In VS Code**:
1. Install "PlantUML" extension
2. Copy PlantUML code from any diagram file
3. Create a `.puml` file or use Alt+D to preview

**Online**:
- [PlantUML Web Server](http://www.plantuml.com/plantuml/)
- Copy/paste PlantUML code and click "Submit"

**Command Line** (requires Java + GraphViz):
```bash
# Install PlantUML
brew install plantuml

# Generate PNG
plantuml diagram.puml

# Generate SVG
plantuml -tsvg diagram.puml
```

## Diagram Files Summary

| File | Type | Purpose | Actors/Entities |
|------|------|---------|----------------|
| `class-diagram.md` | Class Diagram | Domain model | 7 classes |
| `use-case-diagram.md` | Use Case Diagram | Functional requirements | 5 actors, 14 use cases |
| `er-diagram.md` | ER Diagram | Database schema | 7 tables |
| `sequence-diagrams.md` | Sequence Diagrams | Process flows | 5 workflows |
| `architecture-diagram.md` | Architecture Diagram | System structure | 4 layers |

## Updating Diagrams

When updating the system, remember to update the relevant diagrams:

### Code Changes → Diagram Updates

| Change Type | Update These Diagrams |
|-------------|----------------------|
| New entity/model | Class Diagram, ER Diagram |
| New API endpoint | Use Case Diagram, Sequence Diagrams |
| New user role | Use Case Diagram, Architecture Diagram |
| New module | Architecture Diagram |
| Database schema change | ER Diagram, Class Diagram |
| New workflow | Sequence Diagrams |

### Best Practices

1. **Keep diagrams simple**: Focus on key components and relationships
2. **Update regularly**: Diagrams should match current code
3. **Use both formats**: Mermaid for quick edits, PlantUML for formal docs
4. **Add descriptions**: Each diagram should have explanatory text
5. **Version control**: Commit diagram changes with related code

## Related Documentation

- **README.md**: Project overview and setup instructions
- **AUDIT_FINDINGS.md**: Security and code quality analysis
- **api/MOBILE_API.md**: Mobile API documentation
- **prisma/schema.prisma**: Database schema definition

## Tools and Resources

### Diagram Tools
- [Mermaid Documentation](https://mermaid.js.org/)
- [PlantUML Documentation](https://plantuml.com/)
- [VS Code Mermaid Extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- [VS Code PlantUML Extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

### UML Resources
- [UML Class Diagram Tutorial](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagram-tutorial/)
- [UML Use Case Diagram](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-use-case-diagram/)
- [ER Diagram Best Practices](https://www.lucidchart.com/pages/er-diagrams)
- [Sequence Diagram Guidelines](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-sequence-diagram/)

## Generating Exports

### Export Mermaid to PNG/SVG

Using [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli):
```bash
# Install
npm install -g @mermaid-js/mermaid-cli

# Export to PNG
mmdc -i class-diagram.md -o class-diagram.png

# Export to SVG
mmdc -i class-diagram.md -o class-diagram.svg
```

### Export PlantUML to Images

```bash
# PNG (default)
plantuml class-diagram.puml

# SVG
plantuml -tsvg class-diagram.puml

# PDF (requires additional tools)
plantuml -tpdf class-diagram.puml
```

## Contributing

When contributing new features:

1. ✅ Update code implementation
2. ✅ Update relevant diagrams
3. ✅ Update API documentation
4. ✅ Add comments to PlantUML scripts
5. ✅ Test diagram rendering
6. ✅ Commit all changes together

## License

These diagrams are part of the Charity Impact Suite project and follow the same license as the main codebase.
