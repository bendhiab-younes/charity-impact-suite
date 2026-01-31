# Charity Impact Suite - PlantUML Diagrams

This directory contains standalone PlantUML (`.puml`) files for all system diagrams.

## Files

1. **class-diagram.puml** - Domain model with classes and relationships
2. **use-case-diagram.puml** - Use cases and actors
3. **er-diagram.puml** - Database entity relationship diagram
4. **architecture.puml** - System architecture overview
5. **sequence-donation-anonymous.puml** - Anonymous donation flow
6. **sequence-dispatch.puml** - Donation dispatch workflow
7. **sequence-auth.puml** - User authentication flow

## How to Use

### Online Rendering

Visit [PlantUML Web Server](http://www.plantuml.com/plantuml/) and paste the content of any `.puml` file.

### VS Code

1. Install the "PlantUML" extension
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Command Line

Generate images using the PlantUML CLI:

```bash
# Install PlantUML (requires Java)
brew install plantuml

# Generate all diagrams as PNG
plantuml diagrams/*.puml

# Generate as SVG
plantuml -tsvg diagrams/*.puml

# Generate specific diagram
plantuml diagrams/class-diagram.puml
```

### Docker

```bash
# Generate all diagrams using Docker
docker run -v $(pwd)/diagrams:/data plantuml/plantuml:latest /data/*.puml

# Generate as SVG
docker run -v $(pwd)/diagrams:/data plantuml/plantuml:latest -tsvg /data/*.puml
```

## Output

Generated images will be created in the same directory as the `.puml` files with extensions:
- `.png` for PNG format
- `.svg` for SVG format
- `.pdf` for PDF format (requires additional tools)

## Integration with Documentation

These PlantUML files correspond to the diagrams in:
- `class-diagram.md`
- `use-case-diagram.md`
- `er-diagram.md`
- `architecture-diagram.md`
- `sequence-diagrams.md`

See `DIAGRAMS.md` in the root directory for the complete documentation overview.
