# SVG Font Converter Tool - Project Context

## Overview
A web-based tool that converts SVG files containing regular fonts to single-line vector fonts suitable for plotting. Features transform-aware positioning, automatic text-anchor detection, and enhanced visualization with dual zoom/pan functionality.

## Current State (Working)

### Key Features
- **Professional header** with title, subtitle, and built-in How To documentation
- **Left sidebar UI** with Ubuntu font, organized into sections
- **File loading** via standard HTML file input (fixed from p5.js base64 issue)
- **Font conversion** with 14 single-line font options (EMS, Hershey, Relief families)
- **Transform-aware positioning** with coordinate space scaling for nested SVG groups
- **CSS-aware font parsing** with priority: CSS styles > inline styles > font-size attributes
- **Rotation transform warnings** for unsupported transform types
- **Dual zoom/pan system** with slider controls and scroll wheel zoom
- **Stroke customization** with adjustable width and color for better visibility
- **Export** maintains original SVG group structure with converted paths in master-text-labels-layer

### Default Settings
- X Offset: 9, Y Offset: 0, Font Scale: 100%
- Letter Spacing: 1.0x, Line Spacing: 1.0x
- Stroke Width: 0.02, Stroke Color: #ff0000 (red for preview)
- Zoom: 100%, Keep Original Text: false

### Positioning Logic (Transform-Aware)
- **Automatic text-anchor detection** respects left/center/right alignment from SVG
- **Bounding box alignment** uses `calculateAlignmentTransform()` for precise positioning
- **Coordinate space scaling** compensates for nested group transforms
- **Pure coordinate system** stores original fontSize separately from transform scales

## File Structure
- `sketch.js` - Main application (1400+ lines)
  - Professional header with How To documentation
  - Left column UI with organized sections
  - Transform-aware text parsing with `getCombinedTransform()`
  - CSS-aware font size parsing with `getFontSize()`
  - Dual zoom/pan system with proper event handling
- `svg-font.js` - SvgFont class for parsing single-line fonts
- `index.html` - Basic HTML wrapper
- Test files: `simple_text.svg`, `alignment_test.svg`, `enhanced_alignment_test.svg`, `scale_test.svg`, `Radiohead - OK Computer_composite.svg`

## Technical Details

### Text Parsing & Transform Handling
- **Handles deeply nested groups** with complex transforms (e.g., composite music visualizations)
- **Combines transforms** from entire parent chain using `getCombinedTransform()`
- **CSS-aware font parsing** with `getFontSize()` prioritizing CSS styles over inline attributes
- **Rotation transform detection** with UI warnings for unsupported transforms
- **Text-anchor awareness** prevents double-centering when SVG already has text-anchor="middle"
- **Processes tspan elements** within text nodes with proper inheritance

### Transform System
Uses `getCombinedTransform()` function that walks up DOM tree to collect:
- Translation values from parent groups: `translateX`, `translateY`
- Scale values from parent groups: `scaleX`, `scaleY`
- Rotation detection with warning system for unsupported transforms
- Proper event listener management to prevent duplicate handlers
- Handles complex nested scenarios like composite SVGs with multiple transform layers

### Font System
- **14 single-line fonts** from EMS, Hershey, and Relief families
- **CSS-aware font size parsing** with proper priority hierarchy
- **Percentage-based scaling** maintains relative font sizes across documents
- **Automatic text-anchor detection** respects SVG alignment attributes

### Zoom & Pan System
- **Dual zoom controls**: Slider in UI + scroll wheel over SVG
- **Proper SVG viewBox manipulation** instead of container scaling
- **Click-and-drag panning** with proper mouseup detection
- **Global mouseup handler** ensures panning stops when mouse leaves SVG
- **Zoom range**: 10%-1000% for precise alignment checking
- **Performance optimized** with reduced debug logging

## Recent Major Improvements
1. **CSS-aware font parsing**: Proper priority hierarchy for font-size detection (CSS > inline > attribute)
2. **Rotation transform warnings**: Visual warnings for unsupported rotation transforms
3. **Professional header**: Clean title, subtitle, and built-in How To documentation
4. **Dual zoom/pan system**: Slider controls + scroll wheel zoom with proper event handling
5. **Performance optimization**: Removed excessive debug logging for better responsiveness
6. **UI reorganization**: Removed deprecated alignment controls, streamlined interface

## Known Working Files
- **Simple text**: Works well with basic SVG text elements
- **Composite visualizations**: Handles complex nested transforms from music visualization SVGs
- **CSS-styled text**: Properly processes enhanced_alignment_test.svg with CSS font definitions
- **Mixed content**: Successfully processes files with varied text lengths and font sizes
- **Scale test**: Handles extreme scaling scenarios with proper warnings

## UI Organization
Professional header with How To documentation, then left sidebar sections:
1. **View Mode** (Original/Converted toggle)
2. **Font Selection** (14 single-line fonts dropdown)
3. **Position Adjustments** (X/Y offset, font scale)
4. **Spacing** (Letter/line spacing)
5. **Display Controls** (stroke width/color)
6. **Export Options** (keep original text checkbox)
7. **Actions** (load/save buttons)

Zoom controls located above SVG for immediate access.

## Usage Notes
- **Automatic alignment**: Tool respects text-anchor attributes (left/center/right) from original SVG
- **Dual zoom system**: Use slider or scroll wheel over SVG for zooming
- **Click-drag panning**: Click and drag to pan, automatically stops on mouseup
- **Stroke visualization**: Red stroke in preview, black in export for plotter compatibility
- **Transform handling**: Tool automatically compensates for nested group transforms
- **CSS support**: Handles CSS-styled text with proper font-size priority detection
- **Rotation warnings**: Visual warnings appear for unsupported rotation transforms
- **Export structure**: Maintains original SVG hierarchy with converted paths in master-text-labels-layer