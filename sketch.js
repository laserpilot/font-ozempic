// SVG Font Converter Tool
// Load SVG files with regular fonts and replace text with single-line fonts
// Based on p5.js SVG font renderer by Golan Levin

let targetSvg;
let targetSvgData;
let svgFonts = {};
let currentFont;
let fontSelector;
let originalSvgDiv;
let previewMode = "original"; // "original" or "converted"
let textElements = [];
let modeSelector;

// Positioning controls
let xOffsetSlider, yOffsetSlider, fontSizeSlider, letterSpacingSlider, lineSpacingSlider;
let xOffset = 0, yOffset = 0, fontScale = 1.0; // Scale factor as percentage
let letterSpacing = 1.0, lineSpacing = 1.0; // Multipliers for spacing
let strokeWidth = 0.5; // Stroke width for single-line text
let strokeColor = '#ff0000'; // Stroke color for single-line text (red for preview, black for export)
let zoomLevel = 1.0; // SVG zoom level
let panX = 0, panY = 0; // Pan offset for viewBox
let isPanning = false; // Track if user is currently panning
let lastMouseX = 0, lastMouseY = 0; // Last mouse position for pan calculations
let keepOriginalText = false; // Whether to keep original text visible in export
let showGuideBounds = true; // Whether to show debug bounding boxes
let showOriginalText = true; // Whether to show original text in preview mode
let zoomSlider, strokeWidthSlider, strokeColorPicker, keepOriginalTextCheckbox, showGuideBoundsCheckbox, showOriginalTextCheckbox;

// Available single-line fonts
const fontPaths = {
  "EMS Readability": "single_line_svg_fonts/EMS/EMSReadability.svg",
  "EMS Readability Cyrillic": "single_line_svg_fonts/EMS/EMSReadabilityCyrillic.svg", 
  "EMS Readability Italic": "single_line_svg_fonts/EMS/EMSReadabilityItalic.svg",
  "EMS Allure": "single_line_svg_fonts/EMS/EMSAllure.svg",
  "EMS Bird": "single_line_svg_fonts/EMS/EMSBird.svg",
  "EMS Capitol": "single_line_svg_fonts/EMS/EMSCapitol.svg",
  "EMS Casual Hand": "single_line_svg_fonts/EMS/EMSCasualHand.svg",
  "EMS Felix": "single_line_svg_fonts/EMS/EMSFelix.svg",
  "EMS Swiss": "single_line_svg_fonts/EMS/EMSSwiss.svg",
  "EMS Tech": "single_line_svg_fonts/EMS/EMSTech.svg",
  "Hershey Sans": "single_line_svg_fonts/Hershey/HersheySans1.svg",
  "Hershey Script": "single_line_svg_fonts/Hershey/HersheyScript1.svg",
  "Hershey Serif": "single_line_svg_fonts/Hershey/HersheySerifMed.svg",
  "Relief Single Line": "single_line_svg_fonts/Relief/ReliefSingleLine-Regular.svg"
};

function preload() {
  loadStrings("enhanced_alignment_test.svg", (strings) => {
    targetSvgData = strings.join("\n");
    console.log(`Loaded SVG data: ${targetSvgData.length} characters`);
    parseTargetSvg();
    // Trigger display once data is loaded
    setTimeout(() => {
      if (originalSvgDiv) {
        displayOriginalSvg();
      }
    }, 100);
  }, (error) => {
    console.error("Failed to load target SVG:", error);
  });
  
  // Load default font
  console.log("Loading default font...");
  currentFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadability.svg");
  svgFonts["EMS Readability"] = currentFont;
  
  // Check if default font loads
  setTimeout(() => {
    if (currentFont.isReady()) {
      console.log("Default font loaded successfully");
    } else {
      console.log("Default font still loading...");
    }
  }, 1000);
}

function setup() {
  // No canvas needed - we're using HTML elements only
  
  // Create title header
  let headerDiv = createDiv('');
  headerDiv.style('width', '100%');
  headerDiv.style('text-align', 'center');
  headerDiv.style('background', '#f8f9fa');
  headerDiv.style('padding', '10px 0');
  headerDiv.style('border-bottom', '1px solid #dee2e6');
  headerDiv.style('margin-bottom', '20px');
  
  let titleH1 = createElement('h1', 'Font Ozempic');
  titleH1.parent(headerDiv);
  titleH1.style('margin', '0');
  titleH1.style('font-size', '24px');
  titleH1.style('color', '#333');
  titleH1.style('font-family', 'Ubuntu, sans-serif');
  titleH1.style('font-weight', 'bold');
  
  let subtitle = createElement('p', 'Plot Singles In Your Area - This tool converts regular SVG text (like Arial, Times New Roman) into single-line vector fonts that are ideal for pen plotters, laser cutters, and other drawing machines.');
  subtitle.parent(headerDiv);
  subtitle.style('margin', '5px 0 0 0');
  subtitle.style('font-size', '14px');
  subtitle.style('color', '#666');
  subtitle.style('font-family', 'Ubuntu, sans-serif');
  
  // How To button
  let howToBtn = createButton('How To Use This Tool');
  howToBtn.parent(headerDiv);
  howToBtn.style('margin', '8px 0 0 0');
  howToBtn.style('padding', '4px 12px');
  howToBtn.style('font-size', '12px');
  howToBtn.style('background-color', '#007bff');
  howToBtn.style('color', 'white');
  howToBtn.style('border', 'none');
  howToBtn.style('border-radius', '4px');
  howToBtn.style('cursor', 'pointer');
  
  // How To content (initially hidden)
  let howToContent = createDiv('');
  howToContent.parent(headerDiv);
  howToContent.style('display', 'none');
  howToContent.style('margin', '10px auto');
  howToContent.style('max-width', '800px');
  howToContent.style('background-color', '#f8f9fa');
  howToContent.style('padding', '15px');
  howToContent.style('border-radius', '4px');
  howToContent.style('border', '1px solid #dee2e6');
  howToContent.style('text-align', 'left');
  howToContent.style('font-size', '14px');
  howToContent.style('line-height', '1.5');
  
  howToContent.html(`
    <h3 style="margin: 0 0 10px 0; color: #333;">What Font Ozempic Does</h3>
    <p>Font Ozempic helps your chunky fonts lose weight! It converts regular SVG text (like Arial, Times New Roman) into single-line vector fonts that are ideal for pen plotters, laser cutters, and other drawing machines.</p>
    
    <h3 style="margin: 15px 0 10px 0; color: #333;">How To Use</h3>
    <ol>
      <li><strong>Load SVG:</strong> Click "Load New SVG File" and select an SVG containing text</li>
      <li><strong>Choose Font:</strong> Select from 14 single-line fonts (EMS, Hershey, Relief families)</li>
      <li><strong>Adjust Position:</strong> Use X/Y Offset and Font Scale to fine-tune positioning</li>
      <li><strong>Preview:</strong> Toggle between Original and Converted views</li>
      <li><strong>Navigate:</strong> Use scroll wheel to zoom, click and drag to pan</li>
      <li><strong>Export:</strong> Click "Save SVG" to download the converted file</li>
    </ol>
    
    <h3 style="margin: 15px 0 10px 0; color: #333;">Best Results</h3>
    <ul>
      <li>Works with any SVG containing text elements</li>
      <li>Automatically detects text-anchor attributes (left, center, right alignment)</li>
      <li>Handles complex nested transforms and scaling</li>
      <li>Supports CSS-styled text and composite SVG files</li>
      <li>Rotation transforms show warnings but positioning may be inaccurate</li>
    </ul>
    
    <h3 style="margin: 15px 0 10px 0; color: #333;">Export Options</h3>
    <p>Exported SVG files contain single-line vector paths perfect for plotting. Choose to keep original text visible (light gray) for reference or hide it completely.</p>
    
    <h3 style="margin: 15px 0 10px 0; color: #333;">Credits & Attribution</h3>
    <p style="font-size: 12px; line-height: 1.4;">
      <strong>Built with:</strong><br>
      • <a href="https://p5js.org/" target="_blank" style="color: #007bff;">p5.js</a> - Creative coding library by the Processing Foundation<br>
      • <a href="https://github.com/zenozeng/p5.js-svg" target="_blank" style="color: #007bff;">p5.js-svg</a> - SVG renderer by Zeno Zeng<br><br>
      
      <strong>Single-line fonts:</strong><br>
      • <strong>EMS Fonts</strong> - Emergency Medical Services single-line fonts<br>
      • <strong>Hershey Fonts</strong> - Dr. A.V. Hershey's original vector fonts (1967)<br>
      • <strong>Relief Fonts</strong> - Single-line relief engraving fonts<br><br>
      
      <strong>Inspiration & Community:</strong><br>
      • <a href="https://github.com/golanlevin/p5-single-line-font-resources" target="_blank" style="color: #007bff;">p5-single-line-font-resources</a> - Comprehensive single-line font collection by Golan Levin<br>
      • <a href="https://github.com/cadin/plotter-text" target="_blank" style="color: #007bff;">plotter-text</a> - Processing library for single-stroke text by Cadin Batrack<br>
      • The broader pen plotting and creative coding community<br><br>
      
      <strong>Additional Font Resources:</strong><br>
      • <a href="https://gitlab.com/oskay/svg-fonts" target="_blank" style="color: #007bff;">Evil Mad Scientist SVG Fonts</a> - Extended collection of single-line fonts by Windell Oskay<br><br>
      
      <em>These fonts are specifically designed for pen plotters, laser engravers, and CNC machines that require single-line vector paths.</em>
    </p>
  `);
  
  let howToVisible = false;
  howToBtn.mousePressed(() => {
    howToVisible = !howToVisible;
    howToContent.style('display', howToVisible ? 'block' : 'none');
    howToBtn.html(howToVisible ? 'Hide Instructions' : 'How To Use This Tool');
  });
  
  // Create main layout container
  let mainContainer = createDiv('');
  mainContainer.style('display', 'flex');
  mainContainer.style('font-family', 'Ubuntu, sans-serif');
  mainContainer.style('gap', '20px');
  
  // Create left column for controls
  let controlsDiv = createDiv('');
  controlsDiv.style('width', '280px');
  controlsDiv.style('padding', '15px');
  controlsDiv.style('background-color', '#f8f8f8');
  controlsDiv.style('border-radius', '8px');
  controlsDiv.style('border', '1px solid #ddd');
  controlsDiv.style('height', 'fit-content');
  controlsDiv.parent(mainContainer);
  
  // Load New SVG button (moved to top)
  let loadButton = createButton('Load New SVG File');
  loadButton.parent(controlsDiv);
  loadButton.mousePressed(() => {
    // Create a traditional file input element
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = function(e) {
      let file = e.target.files[0];
      if (file && file.name.toLowerCase().endsWith('.svg')) {
        console.log("Loading new SVG file:", file.name);
        
        let reader = new FileReader();
        reader.onload = function(event) {
          let svgContent = event.target.result;
          console.log(`Loaded new SVG data: ${svgContent.length} characters`);
          
          // Use the same method as initial load
          targetSvgData = svgContent;
          parseTargetSvg();
          
          // Update display
          if (originalSvgDiv) {
            displayOriginalSvg();
          }
          updateDisplay();
        };
        reader.readAsText(file);
      } else {
        alert('Please select a valid SVG file.');
      }
    };
    input.click();
  });
  loadButton.style('width', '100%');
  loadButton.style('margin-bottom', '15px');
  loadButton.style('padding', '8px');
  loadButton.style('background-color', '#007bff');
  loadButton.style('color', 'white');
  loadButton.style('border', 'none');
  loadButton.style('border-radius', '4px');
  loadButton.style('cursor', 'pointer');
  
  // View mode selector
  let modeLabel = createP('View Mode:');
  modeLabel.parent(controlsDiv);
  modeLabel.style('margin', '0 0 5px 0');
  modeLabel.style('font-weight', 'bold');
  
  modeSelector = createSelect();
  modeSelector.parent(controlsDiv);
  modeSelector.option('Original SVG', 'original');
  modeSelector.option('With Single-Line Font', 'converted');
  modeSelector.selected('original');
  modeSelector.changed(modeChanged);
  modeSelector.style('width', '100%');
  modeSelector.style('margin-bottom', '15px');
  
  // Font selector
  let fontLabel = createP('Single-Line Font:');
  fontLabel.parent(controlsDiv);
  fontLabel.style('margin', '0 0 5px 0');
  fontLabel.style('font-weight', 'bold');
  
  fontSelector = createSelect();
  fontSelector.parent(controlsDiv);
  
  Object.keys(fontPaths).forEach(fontName => {
    fontSelector.option(fontName);
  });
  fontSelector.selected("EMS Readability");
  fontSelector.changed(fontChanged);
  fontSelector.style('width', '100%');
  fontSelector.style('margin-bottom', '15px');
  
  // Position Adjustments section
  let positionSectionLabel = createP('Position Adjustments:');
  positionSectionLabel.parent(controlsDiv);
  positionSectionLabel.style('margin', '0 0 10px 0');
  positionSectionLabel.style('font-weight', 'bold');
  
  
  // Helper function to create labeled slider with text input
  function createLabeledSlider(parent, label, min, max, defaultVal, step, updateFunc) {
    let container = createDiv('');
    container.parent(parent);
    container.style('margin-bottom', '8px');
    
    let labelSpan = createSpan(label + ': ');
    labelSpan.parent(container);
    labelSpan.style('display', 'inline-block');
    labelSpan.style('width', '80px');
    labelSpan.style('font-size', '13px');
    
    let slider = createSlider(min, max, defaultVal, step);
    slider.parent(container);
    slider.style('width', '100px');
    slider.style('margin', '0 5px');
    
    let textInput = createInput(defaultVal.toString());
    textInput.parent(container);
    textInput.style('width', '50px');
    textInput.style('font-size', '12px');
    textInput.style('text-align', 'center');
    textInput.style('margin', '0 5px');
    
    // Update from slider
    slider.input(() => {
      const val = slider.value();
      textInput.value(val);
      updateFunc(slider, {html: () => {}});
    });
    
    // Update from text input (allows going beyond slider range)
    textInput.input(() => {
      const val = parseFloat(textInput.value());
      if (!isNaN(val)) {
        // Only update slider if value is within range
        if (val >= min && val <= max) {
          slider.value(val);
        }
        // Always update the display and trigger update function
        updateFunc({value: () => val}, {html: () => {}});
      }
    });
    
    return slider;
  }
  
  
  // X Offset slider
  xOffsetSlider = createLabeledSlider(controlsDiv, 'X Offset', -10, 10, 0, 0.1, (slider, value) => {
    xOffset = slider.value();
    value.html(xOffset);
    updateDisplay();
  });
  
  // Y Offset slider  
  yOffsetSlider = createLabeledSlider(controlsDiv, 'Y Offset', -10, 10, 0, 0.1, (slider, value) => {
    yOffset = slider.value();
    value.html(yOffset);
    updateDisplay();
  });
  
  // Font Scale slider
  fontSizeSlider = createLabeledSlider(controlsDiv, 'Font Scale', 0.1, 2.0, 1.0, 0.01, (slider, value) => {
    fontScale = slider.value();
    value.html((fontScale * 100).toFixed(2) + '%');
    updateDisplay();
  });
  
  // Spacing section
  let spacingLabel = createP('Spacing:');
  spacingLabel.parent(controlsDiv);
  spacingLabel.style('margin', '15px 0 10px 0');
  spacingLabel.style('font-weight', 'bold');

  // Letter and Line spacing (part of typography)
  
  // Letter Spacing slider
  letterSpacingSlider = createLabeledSlider(controlsDiv, 'Letter Space', 0.5, 3.0, 1.0, 0.01, (slider, value) => {
    letterSpacing = slider.value();
    value.html(letterSpacing.toFixed(2) + 'x');
    updateDisplay();
  });
  
  // Line Spacing slider
  lineSpacingSlider = createLabeledSlider(controlsDiv, 'Line Space', 0.5, 3.0, 1.0, 0.1, (slider, value) => {
    lineSpacing = slider.value();
    value.html(lineSpacing.toFixed(1) + 'x');
    updateDisplay();
  });
  
  // Single-Line Text Appearance section
  let appearanceLabel = createP('Single-Line Text Appearance:');
  appearanceLabel.parent(controlsDiv);
  appearanceLabel.style('margin', '15px 0 10px 0');
  appearanceLabel.style('font-weight', 'bold');
  
  // Stroke Width slider
  strokeWidthSlider = createLabeledSlider(controlsDiv, 'Stroke Width', 0.01, 3.0, 0.02, 0.01, (slider, value) => {
    strokeWidth = slider.value();
    value.html(strokeWidth.toFixed(3) + 'px');
    updateDisplay();
  });
  
  // Stroke Color picker
  let colorContainer = createDiv('');
  colorContainer.parent(controlsDiv);
  colorContainer.style('margin-bottom', '8px');
  
  let colorLabel = createSpan('Stroke Color: ');
  colorLabel.parent(colorContainer);
  colorLabel.style('display', 'inline-block');
  colorLabel.style('width', '80px');
  colorLabel.style('font-size', '13px');
  
  strokeColorPicker = createColorPicker('#ff0000');
  strokeColorPicker.parent(colorContainer);
  strokeColorPicker.style('margin', '0 8px');
  strokeColorPicker.input(() => {
    strokeColor = strokeColorPicker.value();
    updateDisplay();
  });
  
  let colorValue = createSpan(strokeColor);
  colorValue.parent(colorContainer);
  colorValue.style('font-size', '13px');
  colorValue.style('font-weight', 'bold');
  
  // Update color value display when color changes
  strokeColorPicker.input(() => {
    strokeColor = strokeColorPicker.value();
    colorValue.html(strokeColor);
    updateDisplay();
  });
  
  // Remove advanced controls section since we simplified the interface

  // Display controls section
  let displayLabel = createP('Display Controls:');
  displayLabel.parent(controlsDiv);
  displayLabel.style('margin', '15px 0 10px 0');
  displayLabel.style('font-weight', 'bold');
  
  // Show Guide Bounding Boxes checkbox
  let guideBoundsContainer = createDiv('');
  guideBoundsContainer.parent(controlsDiv);
  guideBoundsContainer.style('margin-bottom', '15px');
  guideBoundsContainer.style('display', 'flex');
  guideBoundsContainer.style('align-items', 'center');
  
  showGuideBoundsCheckbox = createCheckbox('', showGuideBounds);
  showGuideBoundsCheckbox.parent(guideBoundsContainer);
  showGuideBoundsCheckbox.changed(() => {
    showGuideBounds = showGuideBoundsCheckbox.checked();
    updateDisplay();
  });
  showGuideBoundsCheckbox.style('margin-right', '8px');
  
  let guideBoundsLabel = createSpan('Show guide bounding boxes');
  guideBoundsLabel.parent(guideBoundsContainer);
  guideBoundsLabel.style('font-size', '13px');
  guideBoundsLabel.style('color', '#333');
  guideBoundsLabel.style('cursor', 'pointer');
  
  // Make label clickable to toggle checkbox
  guideBoundsLabel.mousePressed(() => {
    showGuideBounds = !showGuideBounds;
    showGuideBoundsCheckbox.checked(showGuideBounds);
    updateDisplay();
  });
  
  let guideBoundsInfo = createP('(Shows red=target, blue=generated, green=final alignment boxes)');
  guideBoundsInfo.parent(controlsDiv);
  guideBoundsInfo.style('font-size', '11px');
  guideBoundsInfo.style('color', '#666');
  guideBoundsInfo.style('margin', '0 0 10px 0');
  guideBoundsInfo.style('line-height', '1.3');
  
  // Show Original Text checkbox
  let originalTextContainer = createDiv('');
  originalTextContainer.parent(controlsDiv);
  originalTextContainer.style('margin-bottom', '15px');
  originalTextContainer.style('display', 'flex');
  originalTextContainer.style('align-items', 'center');
  
  showOriginalTextCheckbox = createCheckbox('', showOriginalText);
  showOriginalTextCheckbox.parent(originalTextContainer);
  showOriginalTextCheckbox.changed(() => {
    showOriginalText = showOriginalTextCheckbox.checked();
    updateDisplay();
  });
  showOriginalTextCheckbox.style('margin-right', '8px');
  
  let originalTextLabel = createSpan('Show original text in preview');
  originalTextLabel.parent(originalTextContainer);
  originalTextLabel.style('font-size', '13px');
  originalTextLabel.style('color', '#333');
  originalTextLabel.style('cursor', 'pointer');
  
  // Make label clickable to toggle checkbox
  originalTextLabel.mousePressed(() => {
    showOriginalText = !showOriginalText;
    showOriginalTextCheckbox.checked(showOriginalText);
    updateDisplay();
  });
  
  let originalTextInfo = createP('(Shows original text underneath single-line converted text)');
  originalTextInfo.parent(controlsDiv);
  originalTextInfo.style('font-size', '11px');
  originalTextInfo.style('color', '#666');
  originalTextInfo.style('margin', '0 0 10px 0');
  originalTextInfo.style('line-height', '1.3');
  
  // Debug info display
  let debugInfoDiv = createDiv('');
  debugInfoDiv.parent(controlsDiv);
  debugInfoDiv.id('debug-info');
  debugInfoDiv.style('margin', '0 0 15px 0');
  debugInfoDiv.style('padding', '8px');
  debugInfoDiv.style('background-color', '#f0f0f0');
  debugInfoDiv.style('border', '1px solid #ccc');
  debugInfoDiv.style('border-radius', '4px');
  debugInfoDiv.style('font-size', '11px');
  debugInfoDiv.style('line-height', '1.3');
  debugInfoDiv.style('color', '#333');
  debugInfoDiv.html('<strong>Debug Info:</strong><br>Text elements: 0<br>Font ready: No<br>Conversion paths: 0');

  // Export Options section
  let exportLabel = createP('Export Options:');
  exportLabel.parent(controlsDiv);
  exportLabel.style('margin', '20px 0 10px 0');
  exportLabel.style('font-weight', 'bold');
  
  // Keep Original Text checkbox
  let checkboxContainer = createDiv('');
  checkboxContainer.parent(controlsDiv);
  checkboxContainer.style('margin-bottom', '15px');
  checkboxContainer.style('display', 'flex');
  checkboxContainer.style('align-items', 'center');
  
  keepOriginalTextCheckbox = createCheckbox('', keepOriginalText);
  keepOriginalTextCheckbox.parent(checkboxContainer);
  keepOriginalTextCheckbox.changed(() => {
    keepOriginalText = keepOriginalTextCheckbox.checked();
  });
  keepOriginalTextCheckbox.style('margin-right', '8px');
  
  let checkboxLabel = createSpan('Keep original text visible in export');
  checkboxLabel.parent(checkboxContainer);
  checkboxLabel.style('font-size', '13px');
  checkboxLabel.style('color', '#333');
  checkboxLabel.style('cursor', 'pointer');
  
  // Make label clickable to toggle checkbox
  checkboxLabel.mousePressed(() => {
    keepOriginalText = !keepOriginalText;
    keepOriginalTextCheckbox.checked(keepOriginalText);
  });
  
  let checkboxInfo = createP('(When checked, original text remains visible alongside single-line converted text)');
  checkboxInfo.parent(controlsDiv);
  checkboxInfo.style('font-size', '11px');
  checkboxInfo.style('color', '#666');
  checkboxInfo.style('margin', '0 0 15px 0');
  checkboxInfo.style('line-height', '1.3');
  
  // Warning messages section
  let warningDiv = createDiv('');
  warningDiv.parent(controlsDiv);
  warningDiv.id('warning-messages');
  warningDiv.style('margin', '0 0 20px 0');
  warningDiv.style('padding', '10px');
  warningDiv.style('background-color', '#fff3cd');
  warningDiv.style('border', '1px solid #ffeaa7');
  warningDiv.style('border-radius', '4px');
  warningDiv.style('color', '#856404');
  warningDiv.style('font-size', '12px');
  warningDiv.style('line-height', '1.4');
  warningDiv.style('display', 'none'); // Hidden by default
  
  // Action buttons section
  let actionsLabel = createP('Actions:');
  actionsLabel.parent(controlsDiv);
  actionsLabel.style('margin', '0 0 10px 0');
  actionsLabel.style('font-weight', 'bold');
  
  let saveButton = createButton('Save SVG with Single-Line Font');
  saveButton.parent(controlsDiv);
  saveButton.mousePressed(saveSvgWithFont);
  saveButton.style('width', '100%');
  saveButton.style('padding', '8px');
  saveButton.style('background-color', '#28a745');
  saveButton.style('color', 'white');
  saveButton.style('border', 'none');
  saveButton.style('border-radius', '4px');
  saveButton.style('cursor', 'pointer');
  
  // Create right column for SVG display
  let contentDiv = createDiv('');
  contentDiv.style('flex', '1');
  contentDiv.style('min-width', '0'); // Allow shrinking
  contentDiv.parent(mainContainer);
  
  // Create zoom controls above the SVG
  let zoomControlDiv = createDiv('');
  zoomControlDiv.parent(contentDiv);
  zoomControlDiv.style('margin-bottom', '10px');
  zoomControlDiv.style('padding', '8px');
  zoomControlDiv.style('background-color', '#f8f9fa');
  zoomControlDiv.style('border-radius', '4px');
  zoomControlDiv.style('border', '1px solid #dee2e6');
  zoomControlDiv.style('display', 'flex');
  zoomControlDiv.style('align-items', 'center');
  zoomControlDiv.style('gap', '10px');
  
  let zoomLabel = createSpan('Zoom: ');
  zoomLabel.parent(zoomControlDiv);
  zoomLabel.style('font-weight', 'bold');
  zoomLabel.style('min-width', '50px');
  
  zoomSlider = createSlider(0.1, 10.0, 1.0, 0.1);
  zoomSlider.parent(zoomControlDiv);
  zoomSlider.style('flex', '1');
  zoomSlider.style('margin', '0 10px');
  
  let zoomValue = createSpan('100%');
  zoomValue.parent(zoomControlDiv);
  zoomValue.style('min-width', '50px');
  zoomValue.style('font-weight', 'bold');
  zoomValue.style('text-align', 'right');
  zoomValue.attribute('data-zoom-value', 'true');
  
  zoomSlider.input(() => {
    zoomLevel = zoomSlider.value();
    const zoomText = (zoomLevel * 100).toFixed(0) + '%';
    zoomValue.html(zoomText);
    updateDisplay();
  });
  
  let zoomInfo = createSpan('Use scroll wheel over SVG to zoom, click and drag to pan');
  zoomInfo.parent(zoomControlDiv);
  zoomInfo.style('font-size', '11px');
  zoomInfo.style('color', '#666');
  zoomInfo.style('margin-left', '10px');
  
  // Create div for displaying the SVG
  originalSvgDiv = createDiv('');
  originalSvgDiv.parent(contentDiv);
  originalSvgDiv.style('border', '2px solid #ddd');
  originalSvgDiv.style('border-radius', '8px');
  originalSvgDiv.style('padding', '15px');
  originalSvgDiv.style('background-color', 'white');
  originalSvgDiv.style('overflow', 'auto');
  
  // Display the original SVG once it's loaded
  if (targetSvgData) {
    displayOriginalSvg();
  }
}

function fontChanged() {
  let selectedFont = fontSelector.value();
  console.log(`Changing to font: ${selectedFont}`);
  
  if (!svgFonts[selectedFont]) {
    // Show loading state immediately
    if (previewMode === "converted") {
      originalSvgDiv.html('<h3>Loading font...</h3><p>Please wait while the single-line font loads.</p>');
    }
    
    // Create new font and check periodically if it's ready
    svgFonts[selectedFont] = new SvgFont(fontPaths[selectedFont]);
    currentFont = svgFonts[selectedFont];
    
    // Check if font is ready every 100ms
    let checkInterval = setInterval(() => {
      if (currentFont.isReady()) {
        clearInterval(checkInterval);
        console.log(`Font ${selectedFont} loaded successfully`);
        // Warm up font metrics cache to ensure consistent calculations
        warmupFontMetrics();
        // Add a longer delay to ensure font metrics are fully processed and cached
        setTimeout(() => {
          // Force a second warmup to ensure consistency
          warmupFontMetrics();
          updateDisplay();
        }, 200);
      }
    }, 100);
    
    // Safety timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!currentFont.isReady()) {
        console.error(`Font ${selectedFont} failed to load after 5 seconds`);
        originalSvgDiv.html('<h3>Error loading font</h3><p>Failed to load the selected font. Please try another.</p>');
      }
    }, 5000);
    
  } else {
    currentFont = svgFonts[selectedFont];
    console.log(`Using cached font: ${selectedFont}`);
    updateDisplay();
  }
}

function modeChanged() {
  previewMode = modeSelector.value();
  updateDisplay();
}

// Store event handler functions to enable removal
let panHandlers = new Map();

// Function to add pan listeners to the SVG elements
function addPanListeners() {
  // Find all SVG elements in the display div
  setTimeout(() => {
    const svgElements = originalSvgDiv.elt.querySelectorAll('svg');
  
  svgElements.forEach(svg => {
    // Remove existing event listeners if they exist
    if (panHandlers.has(svg)) {
      const handlers = panHandlers.get(svg);
      svg.removeEventListener('mousedown', handlers.mousedown);
      svg.removeEventListener('mousemove', handlers.mousemove);
      svg.removeEventListener('mouseup', handlers.mouseup);
      svg.removeEventListener('mouseleave', handlers.mouseleave);
      svg.removeEventListener('wheel', handlers.wheel);
      document.removeEventListener('mouseup', handlers.globalMouseup);
    }
    
    // Set cursor style
    svg.style.cursor = 'grab';
    
    // Create handler functions
    const mousedownHandler = (e) => {
      isPanning = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    };
    
    const mousemoveHandler = (e) => {
      if (isPanning) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        // Convert screen pixels to SVG coordinates based on zoom level
        const panSensitivity = 1 / zoomLevel;
        panX -= deltaX * panSensitivity;
        panY -= deltaY * panSensitivity;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        updateDisplay();
      }
    };
    
    const mouseupHandler = () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    };
    
    const mouseleaveHandler = () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    };
    
    // Global mouseup handler to ensure panning stops even if mouse leaves the SVG
    const globalMouseupHandler = () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    };
    
    const wheelHandler = (e) => {
      e.preventDefault();
      
      // Determine zoom direction
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(10.0, zoomLevel + zoomDelta));
      
      if (newZoom !== zoomLevel) {
        zoomLevel = newZoom;
        zoomSlider.value(zoomLevel);
        
        // Update the zoom value display
        const zoomValueSpan = document.querySelector('[data-zoom-value]');
        if (zoomValueSpan) {
          zoomValueSpan.textContent = (zoomLevel * 100).toFixed(0) + '%';
        }
        
        updateDisplay();
      }
    };
    
    // Add event listeners
    svg.addEventListener('mousedown', mousedownHandler);
    svg.addEventListener('mousemove', mousemoveHandler);
    svg.addEventListener('mouseup', mouseupHandler);
    svg.addEventListener('mouseleave', mouseleaveHandler);
    svg.addEventListener('wheel', wheelHandler);
    document.addEventListener('mouseup', globalMouseupHandler);
    
    // Store handlers for later removal
    panHandlers.set(svg, {
      mousedown: mousedownHandler,
      mousemove: mousemoveHandler,
      mouseup: mouseupHandler,
      mouseleave: mouseleaveHandler,
      wheel: wheelHandler,
      globalMouseup: globalMouseupHandler
    });
  });
  }, 100); // Wait for DOM to update
}

// Removed updateAlignmentButtons function - no longer needed with sliders

function updateDisplay() {
  updateDebugInfo();
  if (previewMode === "original") {
    displayOriginalSvg();
  } else {
    displayConvertedSvg();
  }
}

function displayOriginalSvg() {
  if (targetSvgData) {
    // Parse SVG to manipulate viewBox for proper zooming
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(targetSvgData, "image/svg+xml");
    const svgRoot = svgDoc.documentElement;
    
    // Get original dimensions
    const originalWidth = parseFloat(svgRoot.getAttribute("width")) || 842;
    const originalHeight = parseFloat(svgRoot.getAttribute("height")) || 595;
    
    // Set larger display size for better interaction
    const displayWidth = 800;
    const displayHeight = Math.round((originalHeight / originalWidth) * displayWidth);
    
    // Calculate viewBox for zoom (zoom in by reducing viewBox size)
    const viewBoxWidth = originalWidth / zoomLevel;
    const viewBoxHeight = originalHeight / zoomLevel;
    
    // Apply pan offsets to viewBox position
    const viewBoxX = (originalWidth - viewBoxWidth) / 2 + panX;
    const viewBoxY = (originalHeight - viewBoxHeight) / 2 + panY;
    
    // Apply zoom via viewBox manipulation
    svgRoot.setAttribute("width", displayWidth);
    svgRoot.setAttribute("height", displayHeight);
    svgRoot.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    svgRoot.setAttribute("style", "max-width: 100%; border: 1px solid #ddd;");
    
    const serializer = new XMLSerializer();
    const scaledSvg = serializer.serializeToString(svgDoc);
    
    originalSvgDiv.html(`
      <h3>Loaded SVG (${textElements.length} text elements found) - Zoom: ${(zoomLevel * 100).toFixed(0)}% - Pan: ${panX.toFixed(0)}, ${panY.toFixed(0)}</h3>
      <div style="overflow: auto; max-height: 80vh; border: 1px solid #ddd;">
        ${scaledSvg}
      </div>
      <p><small>Original SVG with text elements. Click and drag to pan.</small></p>
    `);
    
    // Add pan functionality to the SVG
    addPanListeners();
  }
}

function displayConvertedSvg() {
  if (!currentFont || !currentFont.isReady()) {
    originalSvgDiv.html('<h3>Loading font...</h3><p>Please wait while the single-line font loads.</p>');
    return;
  }
  
  console.log("=== DISPLAY CONVERTED SVG START ===");
  console.log(`Current font ready: ${currentFont.isReady()}`);
  console.log(`Glyphs available: ${Object.keys(currentFont.glyphs).length}`);
  console.log(`letterSpacing: ${letterSpacing}`);
  
  // Generate SVG with converted paths
  let svgContent = generateConvertedSvg();
  
  if (!svgContent || svgContent.length < 100) {
    originalSvgDiv.html(`
      <h3>Conversion Issue</h3>
      <p>Unable to generate converted SVG. Check console for details.</p>
      <p>Font: ${fontSelector.value()}</p>
      <p>Text elements: ${textElements.length}</p>
      <p>Font glyphs: ${currentFont ? Object.keys(currentFont.glyphs).length : 0}</p>
    `);
    return;
  }
  
  originalSvgDiv.html(`
    <h3>Converted with ${fontSelector.value()} - Zoom: ${(zoomLevel * 100).toFixed(0)}% - Pan: ${panX.toFixed(0)}, ${panY.toFixed(0)}</h3>
    <div style="overflow: auto; max-height: 80vh; border: 1px solid #ddd; display: inline-block; background: white;">
      ${svgContent}
    </div>
    <p>Text converted to single-line vector paths. Ready for plotting!</p>
    <p><small>Converted ${textElements.length} text elements using ${Object.keys(currentFont.glyphs).length} glyphs. Click and drag to pan.</small></p>
  `);
  
  // Add pan functionality to the SVG
  addPanListeners();
}

function generateConvertedSvg() {
  if (!currentFont || !currentFont.isReady()) return "";
  
  console.log("Generating converted SVG for preview...");
  
  // Start with the original SVG structure 
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(targetSvgData, "image/svg+xml");
  const svgRoot = svgDoc.documentElement;
  
  // Show/hide original text based on user preference
  const textNodes = svgDoc.querySelectorAll("text");
  textNodes.forEach((textNode) => {
    if (showOriginalText) {
      textNode.setAttribute("style", "fill: #000000; opacity: 0.8;");
    } else {
      textNode.setAttribute("style", "display: none;");
    }
  });
  
  // Create a new group for converted text paths
  const convertedGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  convertedGroup.setAttribute("id", "preview-converted-text");
  convertedGroup.setAttribute("stroke", strokeColor);
  convertedGroup.setAttribute("stroke-width", strokeWidth);
  convertedGroup.setAttribute("fill", "none");
  
  // Generate paths for each text element using new processTextElement function
  let pathsGenerated = 0;
  console.log(`Processing ${textElements.length} text elements for conversion:`);
  textElements.forEach((textEl, index) => {
    console.log(`Element ${index}: "${textEl.content}" fontSize:${textEl.fontSize} scale:${textEl.scaleX} textAnchor:${textEl.textAnchor}`);
    const result = processTextElement(textEl, svgDoc, convertedGroup, true);
    if (result) {
      pathsGenerated++;
      console.log(`  ✓ Generated path for: "${textEl.content}"`);
    } else {
      console.log(`  ✗ Failed to generate path for: "${textEl.content}"`);
    }
  });
  
  // Add the converted group to the SVG
  svgRoot.appendChild(convertedGroup);
  
  console.log(`Generated ${pathsGenerated} paths for preview`);
  console.log("=== DISPLAY CONVERTED SVG END ===");
  
  // Apply zoom via viewBox manipulation for proper zooming
  const originalWidth = parseFloat(svgRoot.getAttribute("width")) || 842;
  const originalHeight = parseFloat(svgRoot.getAttribute("height")) || 595;
  
  // Set larger display size for better interaction  
  const displayWidth = 800;
  const displayHeight = Math.round((originalHeight / originalWidth) * displayWidth);
  
  // Calculate viewBox for zoom
  const viewBoxWidth = originalWidth / zoomLevel;
  const viewBoxHeight = originalHeight / zoomLevel;
  const viewBoxX = (originalWidth - viewBoxWidth) / 2 + panX;
  const viewBoxY = (originalHeight - viewBoxHeight) / 2 + panY;
  
  svgRoot.setAttribute("width", displayWidth);
  svgRoot.setAttribute("height", displayHeight);
  svgRoot.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
  svgRoot.setAttribute("style", "max-width: 100%; border: 2px solid #333;");
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgDoc);
}

// NEW: Process a single text element with bounding box alignment
// This function implements the multi-stage transformation process:
// 1. Calculate target bounding box (where original text appears on screen)
// 2. Generate single-line text at origin and get its bounding box
// 3. Calculate alignment transform to map generated text to target position
// 4. Apply user GUI adjustments (X/Y offset, font scale) as outer transforms
// 5. Apply line spacing as additional vertical offset
function processTextElement(textElement, svgDoc, parentGroup, isPreview = false) {
  if (!textElement.content || textElement.content.trim() === "") {
    return null;
  }
  
  // Step 2: Get the "true" bounding box of the original text
  // This accounts for transforms and text-anchor properties
  const targetBox = getTransformedBoundingBox(textElement);
  console.log(`  Target box for "${textElement.content}": x=${targetBox.x.toFixed(2)}, y=${targetBox.y.toFixed(2)}, w=${targetBox.width.toFixed(2)}, h=${targetBox.height.toFixed(2)}`);
  
  // DEBUG: Add visual debugging rectangles (only in preview mode when enabled)
  if (isPreview && showGuideBounds) {
    addDebugRectangle(svgDoc, parentGroup, targetBox, "red", `target-${textElement.content.replace(/\s+/g, '_')}`);
  }
  
  // Step 3: Render the single-line font independently at origin
  // This creates paths at (0,0) with proper letter spacing
  const generatedGroup = renderSingleLineTextAtOrigin(textElement, svgDoc);
  if (!generatedGroup) {
    console.warn(`Failed to generate single-line text for: "${textElement.content}"`);
    return null;
  }
  
  // Get the bounding box of the generated text
  const generatedBox = getGroupBoundingBox(generatedGroup);
  console.log(`  Generated box for "${textElement.content}": x=${generatedBox.x.toFixed(2)}, y=${generatedBox.y.toFixed(2)}, w=${generatedBox.width.toFixed(2)}, h=${generatedBox.height.toFixed(2)}`);
  
  // DEBUG: Add visual debugging rectangles (only in preview mode when enabled)
  if (isPreview && showGuideBounds) {
    // The generated box is at origin, so we need to show it there
    //addDebugRectangle(svgDoc, parentGroup, generatedBox, "blue", `generated-${textElement.content.replace(/\s+/g, '_')}`);
  }
  
  // Step 4: Align the new text to the original bounding box
  // Calculate scale and translation to map generated text to target position
  const alignTransform = calculateAlignmentTransform(targetBox, generatedBox, textElement);
  
  console.log(`  Align transform for "${textElement.content}": scale=${alignTransform.scale.toFixed(4)}, translate=(${alignTransform.translateX.toFixed(2)}, ${alignTransform.translateY.toFixed(2)})`);
  
  // WARN if scale seems extreme (but allow for heavily scaled text)
  if (alignTransform.scale > 5 || alignTransform.scale < 0.05) {
    console.warn(`EXTREME SCALE DETECTED for "${textElement.content}": ${alignTransform.scale}`);
  }
  
  // Apply the alignment transform to the generated group
  const alignedGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  alignedGroup.setAttribute("transform", 
    `translate(${alignTransform.translateX}, ${alignTransform.translateY}) scale(${alignTransform.scale})`
  );
  alignedGroup.appendChild(generatedGroup);
  
  // Step 5: Apply universal GUI adjustments as outer transforms
  // This ensures that GUI adjustments are predictable (10px offset = 10px on screen)
  const outerGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // Calculate line spacing offset for multi-line text
  const lineSpacingOffset = calculateLineSpacingOffset(textElement);
  
  // Calculate center point for scaling in place
  const centerX = targetBox.x + targetBox.width / 2;
  const centerY = targetBox.y + targetBox.height / 2;
  
  // Apply GUI adjustments: translate to center, scale, translate back, then apply offsets
  outerGroup.setAttribute("transform", 
    `translate(${centerX + xOffset}, ${centerY + yOffset + lineSpacingOffset}) scale(${fontScale}) translate(${-centerX}, ${-centerY})`
  );
  
  // Add the aligned group to the outer group for GUI adjustments
  outerGroup.appendChild(alignedGroup);
  
  // Add the final group to the parent
  parentGroup.appendChild(outerGroup);
  
  // DEBUG: Add final position rectangle (only in preview mode when enabled)
  if (isPreview && showGuideBounds) {
    // The final box should account for the complex transform chain
    const finalBox = {
      x: centerX + xOffset - (targetBox.width * fontScale) / 2,
      y: centerY + yOffset + lineSpacingOffset - (targetBox.height * fontScale) / 2,
      width: targetBox.width * fontScale,
      height: targetBox.height * fontScale
    };
    addDebugRectangle(svgDoc, parentGroup, finalBox, "green", `final-${textElement.content.replace(/\s+/g, '_')}`);
  }
  
  // Add class and data attributes for compatibility
  const pathElement = generatedGroup.querySelector("path");
  if (pathElement) {
    const index = textElements.indexOf(textElement);
    if (isPreview) {
      pathElement.setAttribute("class", `preview-converted-${index}`);
    } else {
      pathElement.setAttribute("class", `converted-text-${index}`);
      pathElement.setAttribute("data-original-text", textElement.content);
      pathElement.setAttribute("data-adjustments", `x:${xOffset},y:${yOffset},scale:${fontScale},letterSpacing:${letterSpacing},lineSpacing:${lineSpacing},strokeWidth:${strokeWidth},strokeColor:${strokeColor},keepOriginalText:${keepOriginalText}`);
    }
  }
  
  return outerGroup;
}

// Helper function to get the transformed bounding box of a text element
function getTransformedBoundingBox(textElement) {
  // PURE COORDINATE SYSTEM: Use original fontSize and apply transform scaling
  // This eliminates the double scaling issue completely
  
  const originalFontSize = textElement.fontSize || 14; // Now the original, unscaled fontSize
  const transformScaleX = textElement.transformScaleX || textElement.scaleX || 1;
  const transformScaleY = textElement.transformScaleY || textElement.scaleY || 1;
  
  
  // Calculate width using original fontSize, then apply transform scaling
  let textWidth;
  if (currentFont && currentFont.isReady()) {
    textWidth = estimateTextWidth(textElement.content, originalFontSize);
  } else {
    // Fallback to simple estimation
    textWidth = textElement.content.length * originalFontSize * 0.6;
  }
  
  // Apply transform scaling to get final visual size
  textWidth = textWidth * transformScaleX;
  
  // Calculate height using original fontSize, then apply transform scaling
  let textHeight = originalFontSize * transformScaleY;
  
  // Handle text-anchor alignment
  let anchorOffsetX = 0;
  if (textElement.textAnchor === "middle") {
    anchorOffsetX = -textWidth / 2;
  } else if (textElement.textAnchor === "end") {
    anchorOffsetX = -textWidth;
  }
  
  // Calculate Y position with baseline adjustment (also scaled)
  const baselineAdjustment = (originalFontSize * 0.8) * transformScaleY;
  
  const bbox = {
    x: textElement.x + anchorOffsetX,
    y: textElement.y - baselineAdjustment, // Adjust for text baseline
    width: textWidth,
    height: textHeight
  };
  
  return bbox;
}

// Helper function to estimate text width using actual font metrics
function estimateTextWidth(text, fontSize) {
  if (!currentFont || !currentFont.isReady()) {
    console.log(`Font not ready, using fallback width for "${text}"`);
    return text.length * fontSize * 0.6; // Fallback
  }
  
  const scaleFactor = fontSize / currentFont.unitsPerEm;
  let totalWidth = 0;
  
  for (const char of text) {
    const glyph = currentFont.glyphs[char];
    if (glyph && glyph.horizAdvX) {
      totalWidth += glyph.horizAdvX * scaleFactor * letterSpacing;
    } else {
      // Fallback for missing glyphs
      totalWidth += (300 * scaleFactor * letterSpacing);
    }
  }
  
  return totalWidth;
}

// Helper function to warm up font metrics cache
function warmupFontMetrics() {
  if (!currentFont || !currentFont.isReady()) {
    return;
  }
  
  // Pre-calculate some common metrics to ensure consistency
  const testChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";
  for (const char of testChars) {
    const glyph = currentFont.glyphs[char];
    if (glyph) {
      // Just access the metrics to ensure they're cached
      const width = glyph.horizAdvX;
    }
  }
  
  console.log("Font metrics warmed up");
}

// Helper function to render single-line text at origin (0,0)
function renderSingleLineTextAtOrigin(textElement, svgDoc) {
  if (!currentFont || !currentFont.isReady()) {
    console.log("Font not ready for rendering");
    return null;
  }
  
  // Create a group to hold the generated paths
  const group = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // PURE COORDINATE SYSTEM: Generate paths at origin with ORIGINAL font size
  // This creates large, natural-sized text that will be scaled down by calculateAlignmentTransform
  const originalFontSize = textElement.fontSize || 14; // Now the original, unscaled fontSize
  console.log(`  Generating path for "${textElement.content}" with fontSize: ${originalFontSize}`);
  const pathData = generateSvgPathForText(textElement.content, 0, 0, originalFontSize);
  console.log(`  Path data length: ${pathData ? pathData.length : 0}`);
  
  if (pathData && pathData.trim() !== "") {
    const path = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", strokeColor);
    
    // Calculate stroke width compensation based on text element's transform scale
    const transformScale = textElement.transformScaleX || textElement.scaleX || 1;
    const compensatedStrokeWidth = strokeWidth / transformScale;
    path.setAttribute("stroke-width", compensatedStrokeWidth);
    
    group.appendChild(path);
    return group;
  }
  
  return null;
}

// Helper function to get the bounding box of a group element
function getGroupBoundingBox(groupElement) {
  // For now, we'll calculate a rough bounding box based on the path data
  // In a real browser environment, you'd use groupElement.getBBox()
  
  const pathElement = groupElement.querySelector("path");
  if (!pathElement) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  // Parse the path data to get approximate bounds
  const pathData = pathElement.getAttribute("d");
  const coords = extractCoordsFromPath(pathData);
  
  if (coords.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = coords[0].x, maxX = coords[0].x;
  let minY = coords[0].y, maxY = coords[0].y;
  
  coords.forEach(coord => {
    minX = Math.min(minX, coord.x);
    maxX = Math.max(maxX, coord.x);
    minY = Math.min(minY, coord.y);
    maxY = Math.max(maxY, coord.y);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Helper function to extract coordinates from SVG path data
function extractCoordsFromPath(pathData) {
  const coords = [];
  
  // Parse path commands more accurately for single-line fonts
  // Single-line fonts typically use M (move) and L (line) commands
  const commands = pathData.match(/[ML]\s*[-+]?[0-9]*\.?[0-9]+\s*[-+]?[0-9]*\.?[0-9]+/g);
  
  if (commands) {
    commands.forEach(cmd => {
      // Extract the numeric coordinates from each command
      const numbers = cmd.match(/[-+]?[0-9]*\.?[0-9]+/g);
      if (numbers && numbers.length >= 2) {
        coords.push({
          x: parseFloat(numbers[0]),
          y: parseFloat(numbers[1])
        });
      }
    });
  }
  
  // Fallback to the old method if no commands found
  if (coords.length === 0) {
    const matches = pathData.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (matches) {
      for (let i = 0; i < matches.length; i += 2) {
        if (i + 1 < matches.length) {
          coords.push({
            x: parseFloat(matches[i]),
            y: parseFloat(matches[i + 1])
          });
        }
      }
    }
  }
  
  return coords;
}

// DEBUG: Helper function to add visual debugging rectangles
function addDebugRectangle(svgDoc, parentGroup, box, color, id) {
  const rect = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", box.x);
  rect.setAttribute("y", box.y);
  rect.setAttribute("width", box.width);
  rect.setAttribute("height", box.height);
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", color);
  rect.setAttribute("stroke-width", "1");
  rect.setAttribute("stroke-dasharray", "3,3");
  rect.setAttribute("id", `debug-${id}`);
  rect.setAttribute("opacity", "0.7");
  parentGroup.appendChild(rect);
}

// Helper function to calculate alignment transform from generated box to target box
function calculateAlignmentTransform(targetBox, generatedBox, textElement) {
  // Handle edge cases where bounding boxes might be invalid
  if (!targetBox || !generatedBox || generatedBox.width === 0 || generatedBox.height === 0) {
    console.warn("Invalid bounding boxes for alignment calculation");
    return {
      translateX: 0,
      translateY: 0,
      scale: 1
    };
  }
  
  // Calculate scale based on target box dimensions
  // Use X-scale for both dimensions to maintain aspect ratio
  const scaleX = targetBox.width / generatedBox.width;
  const scaleY = targetBox.height / generatedBox.height;
  const finalScale = scaleX; // Use X-scale to maintain aspect ratio
  
  // PURE COORDINATE SYSTEM: The scale should now match the transform scale
  const expectedScale = textElement.transformScaleX || textElement.scaleX || 1;
  
  if (Math.abs(finalScale - expectedScale) > 0.1) {
    console.warn(`  SCALE MISMATCH: calculated ${finalScale} vs expected ${expectedScale}`);
  }
  
  // Ensure scale is reasonable (prevent extreme scaling)
  // Allow small scales for heavily transformed text (e.g., 0.05, 0.08)
  const clampedScale = Math.max(0.01, Math.min(10, finalScale));
  
  // Calculate translation based on text-anchor or default to left alignment
  let translateX, translateY;
  
  // Handle horizontal alignment based on text-anchor
  if (textElement.textAnchor === "middle") {
    // Center align
    translateX = (targetBox.x + targetBox.width / 2) - (generatedBox.x + generatedBox.width / 2) * clampedScale;
  } else if (textElement.textAnchor === "end") {
    // Right align
    translateX = (targetBox.x + targetBox.width) - (generatedBox.x + generatedBox.width) * clampedScale;
  } else {
    // Left align (default)
    translateX = targetBox.x - generatedBox.x * clampedScale;
  }
  
  // Vertical alignment (typically center)
  translateY = (targetBox.y + targetBox.height / 2) - (generatedBox.y + generatedBox.height / 2) * clampedScale;
  
  return {
    translateX: translateX,
    translateY: translateY,
    scale: clampedScale
  };
}

// Helper function to calculate line spacing offset for a text element
function calculateLineSpacingOffset(textElement) {
  // Only apply line spacing to tspan elements (multi-line text)
  if (!textElement.originalNode || !textElement.parentTextNode) {
    return 0; // Single-line text elements are not affected by line spacing
  }
  
  // Find all tspan elements that belong to the same parent text node
  const siblingTspans = textElements.filter(el => 
    el.parentTextNode === textElement.parentTextNode
  );
  
  // If there's only one tspan, no line spacing adjustment needed
  if (siblingTspans.length <= 1) {
    return 0;
  }
  
  // Use the first tspan of this group as the baseline
  const baseY = siblingTspans[0].y;
  
  // Calculate relative position from the first line in this group
  const relativeY = textElement.y - baseY;
  
  // Apply line spacing multiplier to the relative position
  const adjustedRelativeY = relativeY * lineSpacing;
  
  // Return the additional offset (difference from original position)
  return adjustedRelativeY - relativeY;
}

// DEPRECATED: Old alignment calculation function - replaced by bounding box approach
// This function is kept for reference but is no longer used

// DEPRECATED: Old legacy text processing function - replaced by bounding box approach
// This function has been removed as it's no longer needed

// Helper function to display warnings in the UI
function displayWarning(message) {
  const warningDiv = document.getElementById('warning-messages');
  if (warningDiv) {
    warningDiv.style.display = 'block';
    warningDiv.innerHTML += `<div>⚠️ ${message}</div>`;
  }
}

// Helper function to clear warnings
function clearWarnings() {
  const warningDiv = document.getElementById('warning-messages');
  if (warningDiv) {
    warningDiv.style.display = 'none';
    warningDiv.innerHTML = '';
  }
}

// Helper function to update debug info display
function updateDebugInfo() {
  const debugDiv = document.getElementById('debug-info');
  if (debugDiv) {
    const fontReady = currentFont && currentFont.isReady();
    const fontGlyphs = fontReady ? Object.keys(currentFont.glyphs).length : 0;
    debugDiv.innerHTML = `
      <strong>Debug Info:</strong><br>
      Text elements: ${textElements.length}<br>
      Font ready: ${fontReady ? 'Yes' : 'No'}<br>
      Font glyphs: ${fontGlyphs}<br>
      Current font: ${fontSelector ? fontSelector.value() : 'None'}
    `;
  }
}

// Helper function to get combined transform from element and all parent groups
function getCombinedTransform(element) {
  let totalTransform = { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, hasRotation: false };
  let currentElement = element;
  
  // Walk up the DOM tree to collect transforms
  while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
    const transform = currentElement.getAttribute("transform");
    if (transform) {
      // Check for rotation transforms (unsupported)
      if (transform.includes("rotate(")) {
        totalTransform.hasRotation = true;
        const elementId = currentElement.id || currentElement.tagName;
        console.warn(`Warning: Rotation transform detected in element ${elementId}. Text positioning may be inaccurate.`);
        displayWarning(`Rotation transform detected in element "${elementId}". Text positioning may be inaccurate.`);
      }
      
      // Parse translate
      const translateMatch = transform.match(/translate\(([^)]+)\)/);
      if (translateMatch) {
        const translateValues = translateMatch[1].split(/[,\s]+/).map(parseFloat);
        totalTransform.translateX += translateValues[0] || 0;
        totalTransform.translateY += translateValues[1] || 0;
      }
      
      // Parse scale
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        const scaleValues = scaleMatch[1].split(/[,\s]+/).map(parseFloat);
        totalTransform.scaleX *= scaleValues[0] || 1;
        totalTransform.scaleY *= scaleValues[1] || scaleValues[0] || 1;
      }
      
      // Parse matrix transform
      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const matrixValues = matrixMatch[1].split(/[,\s]+/).map(parseFloat);
        // matrix(a, b, c, d, e, f) where a=scaleX, d=scaleY, e=translateX, f=translateY
        if (matrixValues.length >= 6) {
          totalTransform.scaleX *= matrixValues[0]; // a (scaleX)
          totalTransform.scaleY *= matrixValues[3]; // d (scaleY)
          totalTransform.translateX += matrixValues[4]; // e (translateX)
          totalTransform.translateY += matrixValues[5]; // f (translateY)
          console.log(`  Matrix transform: scale(${matrixValues[0]}, ${matrixValues[3]}), translate(${matrixValues[4]}, ${matrixValues[5]})`);
        }
      }
    }
    currentElement = currentElement.parentNode;
  }
  
  return totalTransform;
}

// Helper function to get font size with CSS-aware priority
function getFontSize(element, svgDoc) {
  let fontSize = 14; // default
  
  // Priority 1: CSS styles (highest priority)
  const className = element.getAttribute("class");
  if (className && svgDoc) {
    const styleElement = svgDoc.querySelector("style");
    if (styleElement) {
      const cssContent = styleElement.textContent || "";
      // Look for CSS rule matching the class
      const classRegex = new RegExp(`\\.${className}\\s*\\{[^}]*font-size:\\s*([0-9.]+)px?[^}]*\\}`, 'i');
      const match = cssContent.match(classRegex);
      if (match) {
        fontSize = parseFloat(match[1]);
        return fontSize;
      }
    }
  }
  
  // Priority 2: Inline style attribute
  const style = element.getAttribute("style") || "";
  if (style.includes("font-size:")) {
    const match = style.match(/font-size:\s*([0-9.]+)px?/);
    if (match) {
      fontSize = parseFloat(match[1]);
      return fontSize;
    }
  }
  
  // Priority 3: font-size attribute (lowest priority)
  const fontSizeAttr = element.getAttribute("font-size");
  if (fontSizeAttr) {
    fontSize = parseFloat(fontSizeAttr);
    return fontSize;
  }
  
  return fontSize;
}

function parseTargetSvg() {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(targetSvgData, "text/xml");
  
  // Clear any previous warnings
  clearWarnings();
  
  textElements = [];
  const textNodes = svgDoc.querySelectorAll("text");
  console.log(`Found ${textNodes.length} text nodes in SVG`);
  
  textNodes.forEach((textNode, index) => {
    // Get combined transform from this element and all parent groups
    const combinedTransform = getCombinedTransform(textNode);
    
    // Get text content from tspan elements if they exist
    const tspans = textNode.querySelectorAll("tspan");
    if (tspans.length > 0) {
      tspans.forEach((tspan, tspanIndex) => {
        const textContent = tspan.textContent || tspan.innerHTML;
        let x = parseFloat(tspan.getAttribute("x") || textNode.getAttribute("x") || 100);
        let y = parseFloat(tspan.getAttribute("y") || textNode.getAttribute("y") || 100);
        const className = textNode.getAttribute("class") || "";
        
        // Extract font size with CSS-aware priority
        const fontSize = getFontSize(tspan, svgDoc) || getFontSize(textNode, svgDoc);
        
        // Apply the combined transform to coordinates
        const finalX = combinedTransform.translateX + (x * combinedTransform.scaleX);
        const finalY = combinedTransform.translateY + (y * combinedTransform.scaleY);
        // PURE COORDINATE SYSTEM: Store original fontSize and transform scales separately
        // const finalFontSize = fontSize * combinedTransform.scaleY; // OLD: Pre-scaling caused double scaling
        
        // Check for existing text-anchor attribute (check style first, then attributes)
        let textAnchor = "start";
        
        // Check tspan style first
        const tspanStyle = tspan.getAttribute("style") || "";
        if (tspanStyle.includes("text-anchor:")) {
          const match = tspanStyle.match(/text-anchor:\s*(start|middle|end)/);
          if (match) {
            textAnchor = match[1];
          }
        }
        // Check parent text node style
        else if (textNode.getAttribute("style") && textNode.getAttribute("style").includes("text-anchor:")) {
          const match = textNode.getAttribute("style").match(/text-anchor:\s*(start|middle|end)/);
          if (match) {
            textAnchor = match[1];
          }
        }
        // Check attributes as fallback
        else {
          textAnchor = tspan.getAttribute("text-anchor") || textNode.getAttribute("text-anchor") || "start";
        }
        
        if (textContent && textContent.trim() !== "") {
          console.log(`Adding tspan: "${textContent.trim()}" at (${finalX}, ${finalY}), fontSize: ${fontSize}, textAnchor: ${textAnchor}`);
          textElements.push({
            content: textContent.trim(),
            x: finalX,
            y: finalY,
            fontSize: fontSize, // Store original, unscaled fontSize
            transformScaleX: combinedTransform.scaleX, // Store transform scales separately
            transformScaleY: combinedTransform.scaleY,
            className: className,
            originalNode: tspan,
            parentTextNode: textNode,
            scaleX: combinedTransform.scaleX, // Keep for backward compatibility during refactor
            scaleY: combinedTransform.scaleY,
            textAnchor: textAnchor
          });
        }
      });
    } else {
      // Handle regular text nodes
      const textContent = textNode.textContent || textNode.innerHTML;
      let x = parseFloat(textNode.getAttribute("x") || 100);
      let y = parseFloat(textNode.getAttribute("y") || 100);
      const className = textNode.getAttribute("class") || "";
      
      // Extract font size with CSS-aware priority
      const fontSize = getFontSize(textNode, svgDoc);
      
      // Apply the combined transform to coordinates
      const finalX = combinedTransform.translateX + (x * combinedTransform.scaleX);
      const finalY = combinedTransform.translateY + (y * combinedTransform.scaleY);
      // PURE COORDINATE SYSTEM: Store original fontSize and transform scales separately
      // const finalFontSize = fontSize * combinedTransform.scaleY; // OLD: Pre-scaling caused double scaling
      
      // Check for existing text-anchor attribute (check style first, then attributes)
      let textAnchor = "start";
      const nodeStyle = textNode.getAttribute("style") || "";
      if (nodeStyle.includes("text-anchor:")) {
        const match = nodeStyle.match(/text-anchor:\s*(start|middle|end)/);
        if (match) {
          textAnchor = match[1];
        }
      } else {
        textAnchor = textNode.getAttribute("text-anchor") || "start";
      }
      
      if (textContent && textContent.trim() !== "") {
        textElements.push({
          content: textContent.trim(),
          x: finalX,
          y: finalY,
          fontSize: fontSize, // Store original, unscaled fontSize
          transformScaleX: combinedTransform.scaleX, // Store transform scales separately
          transformScaleY: combinedTransform.scaleY,
          className: className,
          originalNode: textNode,
          scaleX: combinedTransform.scaleX, // Keep for backward compatibility during refactor
          scaleY: combinedTransform.scaleY,
          textAnchor: textAnchor
        });
      }
    }
  });
  
  updateDebugInfo();
  console.log(`Total text elements parsed: ${textElements.length}`);
}


function draw() {
  // No canvas drawing needed - all UI is HTML elements
}

function saveSvgWithFont() {
  if (!currentFont || !currentFont.isReady()) {
    alert("Font not ready yet. Please wait and try again.");
    return;
  }
  
  console.log("Starting SVG export...");
  
  // Parse the original SVG
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(targetSvgData, "image/svg+xml");
  const svgRoot = svgDoc.documentElement;
  
  // Create a new group for all converted text paths
  const convertedGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  convertedGroup.setAttribute("id", "single-line-text-converted");
  // Use black for export (plotting standard) or current color if user prefers
  convertedGroup.setAttribute("stroke", strokeColor === '#ff0000' ? 'black' : strokeColor);
  convertedGroup.setAttribute("stroke-width", strokeWidth);
  convertedGroup.setAttribute("fill", "none");
  
  // Hide or keep original text elements based on user preference
  const textNodes = svgDoc.querySelectorAll("text");
  if (!keepOriginalText) {
    textNodes.forEach((textNode) => {
      textNode.setAttribute("style", "display: none;");
    });
  } else {
    // Keep original text visible but make it lighter for comparison
    textNodes.forEach((textNode) => {
      textNode.setAttribute("style", "fill: #cccccc; opacity: 0.7;");
    });
  }
  
  // Find the master-text-labels-layer group
  let masterTextLayer = svgDoc.querySelector("#master-text-labels-layer");
  if (!masterTextLayer) {
    // If it doesn't exist, create it
    masterTextLayer = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
    masterTextLayer.setAttribute("id", "master-text-labels-layer");
    svgRoot.appendChild(masterTextLayer);
  }
  
  // Generate converted paths for each text element using new processTextElement function
  let pathsCreated = 0;
  textElements.forEach((textEl, index) => {
    console.log(`Converting text element ${index + 1}: "${textEl.content}"`);
    const result = processTextElement(textEl, svgDoc, convertedGroup, false);
    if (result) {
      pathsCreated++;
    }
  });
  
  // Add the converted group to the master text layer to maintain structure
  masterTextLayer.appendChild(convertedGroup);
  
  console.log(`Created ${pathsCreated} converted text paths`);
  
  // Add a comment to the SVG indicating the conversion
  const comment = svgDoc.createComment(
    `\n  Converted to single-line fonts using ${fontSelector.value()}\n  Original text elements hidden, converted paths in group #single-line-text-converted\n  Generated by SVG Font Converter Tool\n`
  );
  svgRoot.insertBefore(comment, svgRoot.firstChild);
  
  // Serialize and save
  const serializer = new XMLSerializer();
  const modifiedSvgString = serializer.serializeToString(svgDoc);
  
  const blob = new Blob([modifiedSvgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fontSelector.value().replace(/\s+/g, '_')}_converted.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log("SVG export completed");
  const exportStrokeColor = strokeColor === '#ff0000' ? 'black' : strokeColor;
  const originalTextStatus = keepOriginalText ? 'kept visible (light gray)' : 'hidden';
  alert(`Exported SVG with ${pathsCreated} converted text elements using ${fontSelector.value()}\nAdjustments: X:${xOffset}, Y:${yOffset}, Scale:${(fontScale * 100).toFixed(0)}%\nSpacing: Letter:${letterSpacing.toFixed(1)}x, Line:${lineSpacing.toFixed(1)}x\nStroke: ${strokeWidth}px width, ${exportStrokeColor} color\nOriginal text: ${originalTextStatus}`);
}

// Helper function to generate SVG path data from text using the current font
function generateSvgPathForText(text, x, y, fontSize) {
  if (!currentFont || !currentFont.isReady()) {
    console.log("Font not ready for path generation");
    return "";
  }
  
  console.log(`    Generating path for "${text}" with fontSize:${fontSize}, scaleFactor:${fontSize / currentFont.unitsPerEm}`);
  
  let pathData = "";
  let cursorX = x;
  const scaleFactor = fontSize / currentFont.unitsPerEm;
  
  for (const char of text) {
    const glyph = currentFont.glyphs[char];
    if (glyph && glyph.d) {
      // Use the proper transformation method from svg-font.js
      const transformedPath = transformGlyphPath(glyph.d, cursorX, y, fontSize, currentFont.unitsPerEm);
      if (transformedPath) {
        pathData += transformedPath + " ";
      }
      // Apply letter spacing multiplier to character advancement
      cursorX += (glyph.horizAdvX * scaleFactor * letterSpacing);
    } else {
      console.log(`    Missing glyph for '${char}' (${char.charCodeAt(0)})`);
      cursorX += (300 * scaleFactor * letterSpacing); // Fallback spacing with letter spacing
    }
  }
  
  console.log(`    Final path data length: ${pathData.length}`);
  
  return pathData.trim();
}

// Helper function to transform glyph path data - based on svg-font.js logic
function transformGlyphPath(pathData, x, y, sca, unitsPerEm) {
  const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
  let transformedPath = "";
  let currentX = x;
  let currentY = y;
  let prevControlX = null;
  let prevControlY = null;
  
  commands.forEach(command => {
    const type = command[0];
    const args = command.slice(1).trim().split(/[ ,]+/).map(parseFloat);
    let px, py;
    
    switch (type) {
      case "M": // Move to (absolute)
        currentX = x + sca * (args[0] / unitsPerEm);
        currentY = y - sca * (args[1] / unitsPerEm);
        transformedPath += `M ${currentX} ${currentY} `;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "m": // Move to (relative)
        currentX += sca * (args[0] / unitsPerEm);
        currentY -= sca * (args[1] / unitsPerEm);
        transformedPath += `M ${currentX} ${currentY} `;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "L": // Line to (absolute)
        px = x + sca * (args[0] / unitsPerEm);
        py = y - sca * (args[1] / unitsPerEm);
        transformedPath += `L ${px} ${py} `;
        currentX = px;
        currentY = py;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "l": // Line to (relative)
        px = currentX + sca * (args[0] / unitsPerEm);
        py = currentY - sca * (args[1] / unitsPerEm);
        transformedPath += `L ${px} ${py} `;
        currentX = px;
        currentY = py;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "H": // Horizontal line to (absolute)
        px = x + sca * (args[0] / unitsPerEm);
        transformedPath += `L ${px} ${currentY} `;
        currentX = px;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "h": // Horizontal line to (relative)
        px = currentX + sca * (args[0] / unitsPerEm);
        transformedPath += `L ${px} ${currentY} `;
        currentX = px;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "V": // Vertical line to (absolute)
        py = y - sca * (args[0] / unitsPerEm);
        transformedPath += `L ${currentX} ${py} `;
        currentY = py;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "v": // Vertical line to (relative)
        py = currentY - sca * (args[0] / unitsPerEm);
        transformedPath += `L ${currentX} ${py} `;
        currentY = py;
        prevControlX = null;
        prevControlY = null;
        break;
        
      case "C": // Cubic Bézier curve (absolute)
        const x1 = currentX;
        const y1 = currentY;
        const x2 = x + sca * (args[0] / unitsPerEm);
        const y2 = y - sca * (args[1] / unitsPerEm);
        const x3 = x + sca * (args[2] / unitsPerEm);
        const y3 = y - sca * (args[3] / unitsPerEm);
        const x4 = x + sca * (args[4] / unitsPerEm);
        const y4 = y - sca * (args[5] / unitsPerEm);
        transformedPath += `C ${x2} ${y2} ${x3} ${y3} ${x4} ${y4} `;
        currentX = x4;
        currentY = y4;
        prevControlX = x3;
        prevControlY = y3;
        break;
        
      case "c": // Cubic Bézier curve (relative)
        const relX1 = currentX;
        const relY1 = currentY;
        const relX2 = currentX + sca * (args[0] / unitsPerEm);
        const relY2 = currentY - sca * (args[1] / unitsPerEm);
        const relX3 = currentX + sca * (args[2] / unitsPerEm);
        const relY3 = currentY - sca * (args[3] / unitsPerEm);
        const relX4 = currentX + sca * (args[4] / unitsPerEm);
        const relY4 = currentY - sca * (args[5] / unitsPerEm);
        transformedPath += `C ${relX2} ${relY2} ${relX3} ${relY3} ${relX4} ${relY4} `;
        currentX = relX4;
        currentY = relY4;
        prevControlX = relX3;
        prevControlY = relY3;
        break;
        
      case "S": // Smooth cubic Bézier curve (absolute)
        const smoothX2 = prevControlX ? 2 * currentX - prevControlX : currentX;
        const smoothY2 = prevControlY ? 2 * currentY - prevControlY : currentY;
        const smoothX3 = x + sca * (args[0] / unitsPerEm);
        const smoothY3 = y - sca * (args[1] / unitsPerEm);
        const smoothX4 = x + sca * (args[2] / unitsPerEm);
        const smoothY4 = y - sca * (args[3] / unitsPerEm);
        transformedPath += `C ${smoothX2} ${smoothY2} ${smoothX3} ${smoothY3} ${smoothX4} ${smoothY4} `;
        currentX = smoothX4;
        currentY = smoothY4;
        prevControlX = smoothX3;
        prevControlY = smoothY3;
        break;
        
      case "s": // Smooth cubic Bézier curve (relative)
        const relSmoothX2 = prevControlX ? 2 * currentX - prevControlX : currentX;
        const relSmoothY2 = prevControlY ? 2 * currentY - prevControlY : currentY;
        const relSmoothX3 = currentX + sca * (args[0] / unitsPerEm);
        const relSmoothY3 = currentY - sca * (args[1] / unitsPerEm);
        const relSmoothX4 = currentX + sca * (args[2] / unitsPerEm);
        const relSmoothY4 = currentY - sca * (args[3] / unitsPerEm);
        transformedPath += `C ${relSmoothX2} ${relSmoothY2} ${relSmoothX3} ${relSmoothY3} ${relSmoothX4} ${relSmoothY4} `;
        currentX = relSmoothX4;
        currentY = relSmoothY4;
        prevControlX = relSmoothX3;
        prevControlY = relSmoothY3;
        break;
        
      default:
        console.warn(`Unsupported SVG command: ${type}`);
        break;
    }
  });
  
  return transformedPath.trim();
}
