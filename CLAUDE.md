# SVG Font Converter Tool - Project Context

## Overview
A web-based tool that converts SVG files containing regular fonts to single-line vector fonts suitable for plotting. Processes grouped text elements with complex transforms and provides real-time preview with alignment controls.

## Current State (Working)

### Key Features
- **Left sidebar UI** with Ubuntu font, organized into sections
- **File loading** via standard HTML file input (fixed from p5.js base64 issue)
- **Font conversion** with 14 single-line font options (EMS, Hershey, Relief families)
- **Smart positioning** with character-count-based offset logic
- **Zoom controls** (50%-300%) for checking small text alignment
- **Export** maintains original SVG group structure (master-text-labels-layer)

### Default Settings
- X Offset: 9, Y Offset: 0, Font Scale: 100%
- Character Offset: -2.5, Character Threshold: 10 chars
- Letter Spacing: 1.0x, Line Spacing: 1.0x, Zoom: 100%

### Positioning Logic (Simplified)
- **Formula**: `finalX = originalX + xOffset + characterOffset`
- **Character offset**: Only applied if `text.length > characterThreshold`, otherwise 0
- **Works well**: Time labels (4 chars) get minimal offset, song names (30+ chars) get large centering offset

## File Structure
- `sketch.js` - Main application (700+ lines)
  - Left column UI with organized sections
  - Text parsing with combined parent group transforms
  - Smart positioning logic with character-based offsets
- `svg-font.js` - SvgFont class for parsing single-line fonts
- `index.html` - Basic HTML wrapper
- Test files: `simple_text.svg`, `Radiohead - OK Computer_composite.svg`

## Technical Details

### Text Parsing
- **Handles nested groups** with transforms (e.g., song-specific text layers)
- **Combines transforms** from parent groups and text elements
- **Extracts font sizes** from style attributes for proportional scaling
- **Processes tspan elements** within text nodes

### Transform Handling
Uses `getCombinedTransform()` function that walks up DOM tree to collect:
- Translation values from parent groups
- Scale values from parent groups
- Applies combined transform: `finalX = translateX + (localX * scaleX)`

### Font System
- **14 single-line fonts** from EMS, Hershey, and Relief families
- **Percentage-based scaling** (maintains relative font sizes in document)
- **Character-based centering** (longer text gets more leftward offset)

## Recent Fixes & Changes
1. **File loading**: Changed from p5.js `createFileInput()` to native HTML input (fixed base64 issue)
2. **UI redesign**: Moved from horizontal top bar to organized left sidebar
3. **Positioning logic**: Simplified from complex conditional behavior to consistent formula
4. **Transform parsing**: Added support for nested group transforms (crucial for song visualization files)

## Known Working Files
- Works well with music visualization SVGs that have grouped text layers
- Handles files with `master-text-labels-layer` containing song-specific groups
- Successfully processes time labels vs song title labels with different positioning needs

## UI Organization
Left sidebar sections:
1. **View Mode** (Original/Converted)
2. **Font Selection** (dropdown)
3. **Position Adjustments** (X/Y offset, font scale)
4. **Spacing Controls** (letter/line spacing, char offset)
5. **Advanced Controls** (character threshold)
6. **Display Controls** (zoom)
7. **Actions** (load/save buttons)

## Usage Notes
- Set character threshold around 8-12 to separate time labels from song titles
- Use zoom for precise alignment checking on small text
- Character offset should be negative (typically -2 to -4) for centering longer text
- Export maintains all original SVG structure with converted paths added to master-text-labels-layer