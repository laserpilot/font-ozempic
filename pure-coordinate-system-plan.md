# Refactoring Plan: Pure Coordinate System Scaling

This document outlines a new, more robust plan to fix the text scaling and alignment issues by adopting a pure coordinate system approach. This plan is based on the analysis that the previous method suffered from a "compounding scale problem" or "double scaling."

---

## The Core Problem with the Previous Approach

The previous implementation had a subtle but critical flaw. It "baked" the SVG's transform scale into the font size at the very beginning (`finalFontSize = fontSize * combinedTransform.scaleY`). This pre-scaled font size was then used to calculate both the target bounding box and the generated single-line text box.

This created a fragile system where the final alignment scale was just a small "fudge factor" trying to correct for differences in font metrics, rather than properly handling the SVG's coordinate transformations. It led to unpredictable results, especially with nested transforms.

## The New Approach: Pure Coordinate System Scaling

The correct and most robust solution is to **work with original, unscaled values for as long as possible**. We will store the original font size and the transform scales as separate pieces of data and only combine them at the final rendering stage. This prevents compounding errors and makes the entire calculation pipeline clean and predictable.

Here are the actionable steps to implement this superior approach:

---

## Implementation Checklist

### ☐ Step 1: Modify `parseTargetSvg`

- [ ] **Stop pre-scaling the font size.** The goal is to keep the original font size and the transform's scale factor as separate, pure values.
- [ ] In the `textElements.push({...})` block, modify the object to store the values separately:
    - [ ] Change `fontSize: finalFontSize` to **`fontSize: fontSize,`** (to store the original, unscaled font size, e.g., `250`).
    - [ ] Add **`transformScaleX: combinedTransform.scaleX,`** (to store the transform's X scale, e.g., `0.08`).
    - [ ] Add **`transformScaleY: combinedTransform.scaleY,`** (to store the transform's Y scale, e.g., `0.08`).
- [ ] Remove the `finalFontSize` variable entirely from this function, as it is the source of the issue.

### ☐ Step 2: Modify `getTransformedBoundingBox`

- [ ] This function should accept the full `textElement` object to access the new properties (`fontSize`, `transformScaleX`, `transformScaleY`).
- [ ] The function should first estimate the text's width and height using the **original, unscaled `textElement.fontSize`**.
- [ ] After estimating the unscaled dimensions (`estimatedWidth`, `estimatedHeight`), it must then apply the stored transform scale to calculate the final on-screen size:
    - [ ] `width: estimatedWidth * textElement.transformScaleX,`
    - [ ] `height: estimatedHeight * textElement.transformScaleY,`
- [ ] The `x` and `y` coordinates of the bounding box are correct as they are already transformed. No changes are needed there.

### ☐ Step 3: Modify `renderSingleLineTextAtOrigin`

- [ ] This function must be updated to use the **original, unscaled `textElement.fontSize`** when it calls `generateSvgPathForText`.
- [ ] This is a critical change. It will now generate the single-line text at its large, "natural" size (e.g., corresponding to a 250px font size), *before* any transforms are applied. The resulting `generatedBox` will be appropriately large and unscaled.

### ☐ Step 4: Review `calculateAlignmentTransform`

- [ ] No changes to the code in this function are likely needed. The core logic (`targetBox.width / generatedBox.width`) is correct.
- [ ] However, it's important to verify that the inputs it receives are now what we expect:
    - `targetBox`: The final, on-screen size (e.g., representing a 20px high letter).
    - `generatedBox`: The large, unscaled, natural size of the single-line font (e.g., representing a 250px high letter).
- [ ] The `scale` factor returned by this function will now correctly and automatically incorporate the entire transformation required, including the original SVG transform scale and any minor font-metric corrections.
