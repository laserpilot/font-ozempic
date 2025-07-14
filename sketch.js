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
let textAlignmentSelector, autoCenterStrengthSlider;
let xOffset = 9, yOffset = 0, fontScale = 1.0; // Scale factor as percentage
let letterSpacing = 1.0, lineSpacing = 1.0; // Multipliers for spacing
let textAlignment = 'left'; // 'left', 'center', 'right'
let autoCenterStrength = 50; // 0-100 percentage for alignment strength
let zoomLevel = 1.0; // SVG zoom level
let zoomSlider;

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
  loadStrings("Radiohead - OK Computer_composite.svg", (strings) => {
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
  createCanvas(200, 100); // Smaller canvas for title only
  
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
  
  // Text Alignment section
  let alignmentSectionLabel = createP('Text Alignment:');
  alignmentSectionLabel.parent(controlsDiv);
  alignmentSectionLabel.style('margin', '0 0 10px 0');
  alignmentSectionLabel.style('font-weight', 'bold');
  
  // Text Alignment selector
  let alignmentLabel = createP('Alignment:');
  alignmentLabel.parent(controlsDiv);
  alignmentLabel.style('margin', '0 0 5px 0');
  alignmentLabel.style('font-size', '13px');
  
  textAlignmentSelector = createSelect();
  textAlignmentSelector.parent(controlsDiv);
  textAlignmentSelector.option('Left', 'left');
  textAlignmentSelector.option('Center', 'center');
  textAlignmentSelector.option('Right', 'right');
  textAlignmentSelector.selected('left');
  textAlignmentSelector.changed(() => {
    textAlignment = textAlignmentSelector.value();
    updateDisplay();
  });
  textAlignmentSelector.style('width', '100%');
  textAlignmentSelector.style('margin-bottom', '8px');
  
  // Helper function to create labeled slider
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
    slider.style('width', '120px');
    slider.style('margin', '0 8px');
    
    let value = createSpan(defaultVal);
    value.parent(container);
    value.style('min-width', '40px');
    value.style('font-size', '13px');
    value.style('font-weight', 'bold');
    
    slider.input(() => updateFunc(slider, value));
    
    return slider;
  }
  
  // Auto-Center Strength slider
  autoCenterStrengthSlider = createLabeledSlider(controlsDiv, 'Align Strength', 0, 100, 50, 5, (slider, value) => {
    autoCenterStrength = slider.value();
    value.html(autoCenterStrength + '%');
    updateDisplay();
  });
  
  let alignmentInfo = createP('(Controls how text is positioned relative to its original location)');
  alignmentInfo.parent(controlsDiv);
  alignmentInfo.style('font-size', '11px');
  alignmentInfo.style('color', '#666');
  alignmentInfo.style('margin', '0 0 15px 0');
  alignmentInfo.style('line-height', '1.3');
  
  // Position Fine-tuning section
  let positionLabel = createP('Position Fine-tuning:');
  positionLabel.parent(controlsDiv);
  positionLabel.style('margin', '0 0 10px 0');
  positionLabel.style('font-weight', 'bold');
  
  // X Offset slider
  xOffsetSlider = createLabeledSlider(controlsDiv, 'X Offset', -200, 200, 9, 1, (slider, value) => {
    xOffset = slider.value();
    value.html(xOffset);
    updateDisplay();
  });
  
  // Y Offset slider  
  yOffsetSlider = createLabeledSlider(controlsDiv, 'Y Offset', -200, 200, 0, 1, (slider, value) => {
    yOffset = slider.value();
    value.html(yOffset);
    updateDisplay();
  });
  
  // Typography section
  let typographyLabel = createP('Typography:');
  typographyLabel.parent(controlsDiv);
  typographyLabel.style('margin', '15px 0 10px 0');
  typographyLabel.style('font-weight', 'bold');
  
  // Font Scale slider
  fontSizeSlider = createLabeledSlider(controlsDiv, 'Font Scale', 0.1, 2.0, 1.0, 0.1, (slider, value) => {
    fontScale = slider.value();
    value.html((fontScale * 100).toFixed(0) + '%');
    updateDisplay();
  });

  // Letter and Line spacing (part of typography)
  
  // Letter Spacing slider
  letterSpacingSlider = createLabeledSlider(controlsDiv, 'Letter Space', 0.1, 3.0, 1.0, 0.1, (slider, value) => {
    letterSpacing = slider.value();
    value.html(letterSpacing.toFixed(1) + 'x');
    updateDisplay();
  });
  
  // Line Spacing slider
  lineSpacingSlider = createLabeledSlider(controlsDiv, 'Line Space', 0.5, 3.0, 1.0, 0.1, (slider, value) => {
    lineSpacing = slider.value();
    value.html(lineSpacing.toFixed(1) + 'x');
    updateDisplay();
  });
  
  // Remove advanced controls section since we simplified the interface

  // Display controls section
  let displayLabel = createP('Display Controls:');
  displayLabel.parent(controlsDiv);
  displayLabel.style('margin', '15px 0 10px 0');
  displayLabel.style('font-weight', 'bold');
  
  // Zoom slider
  zoomSlider = createLabeledSlider(controlsDiv, 'Zoom', 0.5, 3.0, 1.0, 0.1, (slider, value) => {
    zoomLevel = slider.value();
    value.html((zoomLevel * 100).toFixed(0) + '%');
    updateDisplay();
  });

  // Action buttons section
  let actionsLabel = createP('Actions:');
  actionsLabel.parent(controlsDiv);
  actionsLabel.style('margin', '20px 0 10px 0');
  actionsLabel.style('font-weight', 'bold');
  
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
          
          console.log(`Successfully loaded ${file.name} with ${textElements.length} text elements`);
        };
        reader.readAsText(file);
      } else {
        alert('Please select a valid SVG file.');
      }
    };
    input.click();
  });
  loadButton.style('width', '100%');
  loadButton.style('margin-bottom', '8px');
  loadButton.style('padding', '8px');
  loadButton.style('background-color', '#007bff');
  loadButton.style('color', 'white');
  loadButton.style('border', 'none');
  loadButton.style('border-radius', '4px');
  loadButton.style('cursor', 'pointer');
  
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
  
  noLoop();
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
        updateDisplay();
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

function updateDisplay() {
  if (previewMode === "original") {
    displayOriginalSvg();
  } else {
    displayConvertedSvg();
  }
}

function displayOriginalSvg() {
  if (targetSvgData) {
    // Apply zoom to SVG dimensions
    const baseWidth = 600;
    const baseHeight = 424;
    const zoomedWidth = Math.round(baseWidth * zoomLevel);
    const zoomedHeight = Math.round(baseHeight * zoomLevel);
    
    let scaledSvg = targetSvgData
      .replace('width="842" height="595"', `width="${zoomedWidth}" height="${zoomedHeight}" style="max-width: 100%;"`)
      .replace('width="420mm" height="297mm"', `width="${zoomedWidth}" height="${zoomedHeight}" style="max-width: 100%;"`);
    
    originalSvgDiv.html(`
      <h3>Loaded SVG (${textElements.length} text elements found) - Zoom: ${(zoomLevel * 100).toFixed(0)}%</h3>
      <div style="overflow: auto; max-height: 80vh; border: 1px solid #ddd;">
        ${scaledSvg}
      </div>
      <p><small>Original SVG with text elements</small></p>
    `);
  }
}

function displayConvertedSvg() {
  if (!currentFont || !currentFont.isReady()) {
    originalSvgDiv.html('<h3>Loading font...</h3><p>Please wait while the single-line font loads.</p>');
    return;
  }
  
  console.log("Displaying converted SVG");
  console.log(`Current font ready: ${currentFont.isReady()}`);
  console.log(`Glyphs available: ${Object.keys(currentFont.glyphs).length}`);
  
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
    <h3>Converted with ${fontSelector.value()} - Zoom: ${(zoomLevel * 100).toFixed(0)}%</h3>
    <div style="overflow: auto; max-height: 80vh; border: 1px solid #ddd; display: inline-block; background: white;">
      ${svgContent}
    </div>
    <p>Text converted to single-line vector paths. Ready for plotting!</p>
    <p><small>Converted ${textElements.length} text elements using ${Object.keys(currentFont.glyphs).length} glyphs</small></p>
  `);
}

function generateConvertedSvg() {
  if (!currentFont || !currentFont.isReady()) return "";
  
  console.log("Generating converted SVG for preview...");
  
  // Start with the original SVG structure 
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(targetSvgData, "image/svg+xml");
  const svgRoot = svgDoc.documentElement;
  
  // Keep original text visible but make it lighter for alignment reference
  const textNodes = svgDoc.querySelectorAll("text");
  textNodes.forEach((textNode) => {
    textNode.setAttribute("style", "fill: #000000; opacity: 0.8;");
  });
  
  // Create a new group for converted text paths
  const convertedGroup = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
  convertedGroup.setAttribute("id", "preview-converted-text");
  convertedGroup.setAttribute("stroke", "red");
  convertedGroup.setAttribute("stroke-width", "0.2");
  convertedGroup.setAttribute("fill", "none");
  
  // Calculate base Y position for line spacing
  let baseY = textElements.length > 0 ? textElements[0].y : 0;
  
  // Generate paths for each text element
  let pathsGenerated = 0;
  textElements.forEach((textEl, index) => {
    if (textEl.content && textEl.content.trim() !== "") {
      // Apply alignment-based positioning
      const alignmentOffset = calculateAlignmentOffset(textEl, textAlignment, autoCenterStrength);
      const adjustedX = textEl.x + xOffset + alignmentOffset;
      
      // Apply line spacing: calculate relative position from first line
      const relativeY = textEl.y - baseY;
      const adjustedY = baseY + yOffset + (relativeY * lineSpacing);
      
      // Calculate font size based on original size and scale factor
      const scaledFontSize = (textEl.fontSize || 14) * fontScale;
      const pathData = generateSvgPathForText(textEl.content, adjustedX, adjustedY, scaledFontSize);
      if (pathData && pathData.trim() !== "") {
        const path = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", `preview-converted-${index}`);
        convertedGroup.appendChild(path);
        pathsGenerated++;
      }
    }
  });
  
  // Add the converted group to the SVG
  svgRoot.appendChild(convertedGroup);
  
  console.log(`Generated ${pathsGenerated} paths for preview`);
  
  // Apply zoom and add styling for visibility
  const originalWidth = parseFloat(svgRoot.getAttribute("width")) || 842;
  const originalHeight = parseFloat(svgRoot.getAttribute("height")) || 595;
  const zoomedWidth = Math.round(originalWidth * zoomLevel);
  const zoomedHeight = Math.round(originalHeight * zoomLevel);
  
  svgRoot.setAttribute("width", zoomedWidth);
  svgRoot.setAttribute("height", zoomedHeight);
  svgRoot.setAttribute("style", "max-width: 100%; border: 2px solid #333;");
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgDoc);
}

// Helper function to calculate alignment offset based on text properties
function calculateAlignmentOffset(textEl, alignment, strength) {
  let alignmentOffset = 0;
  
  if (alignment === 'center') {
    // Estimate text width based on content length and font size
    const estimatedWidth = textEl.content.length * (textEl.fontSize * 0.6);
    alignmentOffset = -(estimatedWidth / 2) * (strength / 100);
  } else if (alignment === 'right') {
    // Estimate text width for right alignment
    const estimatedWidth = textEl.content.length * (textEl.fontSize * 0.6);
    alignmentOffset = -estimatedWidth * (strength / 100);
  }
  // 'left' alignment needs no offset
  
  return alignmentOffset;
}

// Helper function to get combined transform from element and all parent groups
function getCombinedTransform(element) {
  let totalTransform = { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 };
  let currentElement = element;
  
  // Walk up the DOM tree to collect transforms
  while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
    const transform = currentElement.getAttribute("transform");
    if (transform) {
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
    }
    currentElement = currentElement.parentNode;
  }
  
  return totalTransform;
}

function parseTargetSvg() {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(targetSvgData, "text/xml");
  
  textElements = [];
  const textNodes = svgDoc.querySelectorAll("text");
  
  textNodes.forEach((textNode, index) => {
    console.log(`Processing text node ${index}:`, textNode);
    
    // Get combined transform from this element and all parent groups
    const combinedTransform = getCombinedTransform(textNode);
    console.log(`Combined transform:`, combinedTransform);
    
    // Get text content from tspan elements if they exist
    const tspans = textNode.querySelectorAll("tspan");
    if (tspans.length > 0) {
      tspans.forEach((tspan, tspanIndex) => {
        const textContent = tspan.textContent || tspan.innerHTML;
        let x = parseFloat(tspan.getAttribute("x") || textNode.getAttribute("x") || 100);
        let y = parseFloat(tspan.getAttribute("y") || textNode.getAttribute("y") || 100);
        const className = textNode.getAttribute("class") || "";
        
        // Extract font size from style or font-size attribute
        let fontSize = 14; // default
        const style = textNode.getAttribute("style") || tspan.getAttribute("style") || "";
        const fontSizeAttr = textNode.getAttribute("font-size") || tspan.getAttribute("font-size");
        if (fontSizeAttr) {
          fontSize = parseFloat(fontSizeAttr);
        } else if (style.includes("font-size:")) {
          const match = style.match(/font-size:\s*([0-9.]+)/);
          if (match) fontSize = parseFloat(match[1]);
        }
        
        // Apply the combined transform to coordinates
        const finalX = combinedTransform.translateX + (x * combinedTransform.scaleX);
        const finalY = combinedTransform.translateY + (y * combinedTransform.scaleY);
        const finalFontSize = fontSize * combinedTransform.scaleY; // Scale font size too
        
        if (textContent && textContent.trim() !== "") {
          console.log(`Found tspan text: "${textContent}" at (${finalX}, ${finalY}) [with combined transforms]`);
          textElements.push({
            content: textContent.trim(),
            x: finalX,
            y: finalY,
            fontSize: finalFontSize,
            className: className,
            originalNode: tspan,
            parentTextNode: textNode,
            scaleX: combinedTransform.scaleX,
            scaleY: combinedTransform.scaleY
          });
        }
      });
    } else {
      // Handle regular text nodes
      const textContent = textNode.textContent || textNode.innerHTML;
      let x = parseFloat(textNode.getAttribute("x") || 100);
      let y = parseFloat(textNode.getAttribute("y") || 100);
      const className = textNode.getAttribute("class") || "";
      
      // Extract font size from style or font-size attribute
      let fontSize = 14; // default
      const style = textNode.getAttribute("style") || "";
      const fontSizeAttr = textNode.getAttribute("font-size");
      if (fontSizeAttr) {
        fontSize = parseFloat(fontSizeAttr);
      } else if (style.includes("font-size:")) {
        const match = style.match(/font-size:\s*([0-9.]+)/);
        if (match) fontSize = parseFloat(match[1]);
      }
      
      // Apply the combined transform to coordinates
      const finalX = combinedTransform.translateX + (x * combinedTransform.scaleX);
      const finalY = combinedTransform.translateY + (y * combinedTransform.scaleY);
      const finalFontSize = fontSize * combinedTransform.scaleY; // Scale font size too
      
      if (textContent && textContent.trim() !== "") {
        console.log(`Found text: "${textContent}" at (${finalX}, ${finalY}) [with combined transforms]`);
        textElements.push({
          content: textContent.trim(),
          x: finalX,
          y: finalY,
          fontSize: finalFontSize,
          className: className,
          originalNode: textNode,
          scaleX: combinedTransform.scaleX,
          scaleY: combinedTransform.scaleY
        });
      }
    }
  });
  
  console.log(`Found ${textElements.length} text elements in target SVG`);
  textElements.forEach((el, i) => {
    console.log(`Text ${i}: "${el.content}" at (${el.x}, ${el.y})`);
  });
}


function draw() {
  // Simple UI canvas - most display is handled by HTML elements
  background(250);
  fill(0);
  textAlign(CENTER, CENTER);
  text("SVG Font Converter Tool", width/2, height/2);
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
  convertedGroup.setAttribute("stroke", "black");
  convertedGroup.setAttribute("stroke-width", "0.5");
  convertedGroup.setAttribute("fill", "none");
  
  // Hide original text elements (don't delete them)
  const textNodes = svgDoc.querySelectorAll("text");
  textNodes.forEach((textNode) => {
    textNode.setAttribute("style", "display: none;");
  });
  
  // Find the master-text-labels-layer group
  let masterTextLayer = svgDoc.querySelector("#master-text-labels-layer");
  if (!masterTextLayer) {
    // If it doesn't exist, create it
    masterTextLayer = svgDoc.createElementNS("http://www.w3.org/2000/svg", "g");
    masterTextLayer.setAttribute("id", "master-text-labels-layer");
    svgRoot.appendChild(masterTextLayer);
  }
  
  // Calculate base Y position for line spacing (same as preview)
  let baseY = textElements.length > 0 ? textElements[0].y : 0;
  
  // Generate converted paths for each text element
  let pathsCreated = 0;
  textElements.forEach((textEl, index) => {
    if (textEl.content && textEl.content.trim() !== "") {
      console.log(`Converting text element ${index + 1}: "${textEl.content}"`);
      
      // Apply alignment-based positioning (same as preview)
      const alignmentOffset = calculateAlignmentOffset(textEl, textAlignment, autoCenterStrength);
      const adjustedX = textEl.x + xOffset + alignmentOffset;
      
      // Apply line spacing: calculate relative position from first line
      const relativeY = textEl.y - baseY;
      const adjustedY = baseY + yOffset + (relativeY * lineSpacing);
      
      // Generate path data for the text using the current font and adjustments
      const scaledFontSize = (textEl.fontSize || 14) * fontScale;
      const pathData = generateSvgPathForText(textEl.content, adjustedX, adjustedY, scaledFontSize);
      if (pathData && pathData.trim() !== "") {
        const path = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", `converted-text-${index}`);
        path.setAttribute("data-original-text", textEl.content);
        path.setAttribute("data-adjustments", `x:${xOffset},y:${yOffset},scale:${fontScale},letterSpacing:${letterSpacing},lineSpacing:${lineSpacing},alignment:${textAlignment},alignStrength:${autoCenterStrength}`);
        convertedGroup.appendChild(path);
        pathsCreated++;
        console.log(`Created path for: "${textEl.content}" at (${adjustedX}, ${adjustedY})`);
      } else {
        console.warn(`No path data generated for: "${textEl.content}"`);
      }
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
  alert(`Exported SVG with ${pathsCreated} converted text elements using ${fontSelector.value()}\nAdjustments: X:${xOffset}, Y:${yOffset}, Scale:${(fontScale * 100).toFixed(0)}%\nSpacing: Letter:${letterSpacing.toFixed(1)}x, Line:${lineSpacing.toFixed(1)}x\nAlignment: ${textAlignment} at ${autoCenterStrength}% strength`);
}

// Helper function to generate SVG path data from text using the current font
function generateSvgPathForText(text, x, y, fontSize) {
  if (!currentFont || !currentFont.isReady()) {
    console.log("Font not ready for path generation");
    return "";
  }
  
  console.log(`Generating path for: "${text}" at (${x}, ${y}) with fontSize ${fontSize}, letterSpacing ${letterSpacing}`);
  
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
      console.log(`Missing glyph for '${char}' (${char.charCodeAt(0)})`);
      cursorX += (300 * scaleFactor * letterSpacing); // Fallback spacing with letter spacing
    }
  }
  
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



