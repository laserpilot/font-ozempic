# SVG Font Converter Tool - Project Context

## Overview
A web-based tool that converts SVG files containing regular fonts to single-line vector fonts suitable for plotting. Features transform-aware positioning, individual alignment controls, and enhanced visualization with proper zoom/pan functionality.

## Current State (Working)

### Key Features
- **Left sidebar UI** with Ubuntu font, organized into sections
- **File loading** via standard HTML file input (fixed from p5.js base64 issue)
- **Font conversion** with 14 single-line font options (EMS, Hershey, Relief families)
- **Transform-aware positioning** with coordinate space scaling for nested SVG groups
- **Individual alignment controls** (Left/Center/Right sliders replace character threshold)
- **Length Scale factor** for text-length-dependent positioning adjustments
- **Enhanced zoom/pan** with proper SVG viewBox manipulation and click-drag panning
- **Stroke customization** with adjustable width and color for better visibility
- **Export** maintains original SVG group structure with converted paths in master-text-labels-layer

### Default Settings
- X Offset: 9, Y Offset: 0, Font Scale: 100%
- Left Align: 0, Center Align: 0, Right Align: 0
- Length Scale: 1.0, Letter Spacing: 1.0x, Line Spacing: 1.0x
- Stroke Width: 0.5, Stroke Color: #ff0000 (red for preview)
- Zoom: 100%, Keep Original Text: false

### Positioning Logic (Transform-Aware)
- **Base Formula**: `finalX = originalX + xOffset + alignmentOffset`
- **Alignment offset**: `calculateAlignmentOffset()` uses individual Left/Center/Right sliders
- **Length scaling**: `Math.pow(textLength / 10, horizontalScaleFactor - 1.0)` for text-length-dependent adjustments
- **Coordinate space scaling**: `1.0 / textEl.scaleX` compensates for nested group transforms
- **Text-anchor detection**: Skips center alignment if text already has `text-anchor="middle"`

## File Structure
- `sketch.js` - Main application (1000+ lines)
  - Left column UI with organized sections
  - Transform-aware text parsing with `getCombinedTransform()`
  - Individual alignment sliders replacing character threshold system
  - Enhanced zoom/pan with proper SVG viewBox manipulation
- `svg-font.js` - SvgFont class for parsing single-line fonts
- `index.html` - Basic HTML wrapper
- Test files: `simple_text.svg`, `alignment_test.svg`, `Radiohead - OK Computer_composite.svg`

## Technical Details

### Text Parsing & Transform Handling
- **Handles deeply nested groups** with complex transforms (e.g., composite music visualizations)
- **Combines transforms** from entire parent chain using `getCombinedTransform()`
- **Coordinate space scaling** accounts for nested group scale factors
- **Text-anchor awareness** prevents double-centering when SVG already has text-anchor="middle"
- **Extracts font sizes** from style attributes for proportional scaling
- **Processes tspan elements** within text nodes

### Transform System
Uses `getCombinedTransform()` function that walks up DOM tree to collect:
- Translation values from parent groups: `translateX`, `translateY`
- Scale values from parent groups: `scaleX`, `scaleY`
- Applies combined transform with coordinate space compensation
- Handles complex nested scenarios like composite SVGs with multiple transform layers

### Font System
- **14 single-line fonts** from EMS, Hershey, and Relief families
- **Percentage-based scaling** maintains relative font sizes across documents
- **Length Scale factor** provides exponential-like scaling based on text length
- **Individual alignment controls** replace confusing character threshold system

### Zoom & Pan System
- **Proper SVG viewBox manipulation** instead of container scaling
- **Click-and-drag panning** with mouse tracking (`isPanning`, `lastMouseX/Y`)
- **Zoom range**: 50%-300% for precise alignment checking
- **Maintains aspect ratio** and proper coordinate mapping

## Recent Major Improvements
1. **Individual alignment sliders**: Replaced confusing character threshold with separate Left/Center/Right controls
2. **Transform-aware positioning**: Added coordinate space scaling for nested group transforms
3. **Text-anchor detection**: Prevents double-centering when SVG already has text-anchor="middle"
4. **Enhanced zoom/pan**: Proper SVG viewBox manipulation with click-drag panning
5. **Stroke customization**: Adjustable width and color for better single-line text visibility
6. **Length Scale factor**: Exponential-like scaling based on text length for fine-tuned positioning

## Known Working Files
- **Simple text**: Works well with basic SVG text elements
- **Composite visualizations**: Handles complex nested transforms from music visualization SVGs
- **Mixed content**: Successfully processes files with varied text lengths and font sizes
- **Alignment test**: Comprehensive test file with systematic text variations

## UI Organization
Left sidebar sections:
1. **View Mode** (Original/Converted toggle)
2. **Font Selection** (14 single-line fonts dropdown)
3. **Position Adjustments** (X/Y offset, font scale)
4. **Alignment Controls** (Left/Center/Right individual sliders)
5. **Length & Spacing** (Length Scale, letter/line spacing)
6. **Display Controls** (zoom, stroke width/color)
7. **Export Options** (keep original text checkbox)
8. **Actions** (load/save buttons)

## Usage Notes
- **Individual alignment**: Use Left/Center/Right sliders independently for precise control
- **Length Scale**: Values > 1.0 increase spacing for longer text, < 1.0 decrease spacing
- **Zoom for precision**: Use zoom and pan for checking alignment on small text elements
- **Stroke visualization**: Red stroke in preview, black in export for plotter compatibility
- **Transform handling**: Tool automatically compensates for nested group transforms
- **Export structure**: Maintains original SVG hierarchy with converted paths in master-text-labels-layer