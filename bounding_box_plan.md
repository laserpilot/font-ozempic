# Refactoring Plan: Bounding Box Alignment for SVG Font Converter

This plan outlines the steps to refactor the text alignment logic to be more robust and predictable by using a bounding box-based approach. This will separate the complex transformation logic of the source SVG from the user-facing adjustments.

---

## Phase 1: Core Implementation - Bounding Box Alignment

This phase focuses on implementing the fundamental logic of aligning the generated single-line text to the original text's calculated bounding box.

### ☑ Step 1: Isolate Text Element Processing
- [x] Identify the main loop or function in `sketch.js` that iterates through each `<text>` element from the source SVG.
- [x] Create a dedicated function, e.g., `processTextElement(textElement)`, to encapsulate all the logic for a single element. This will make the code cleaner and easier to manage.
- [x] Ensure this new function has access to the currently selected single-line font and all GUI adjustment values (offsets, scale, etc.).

### ☑ Step 2: Get the "True" Bounding Box of the Original Text
- [x] Inside `processTextElement`, for the given `textElement`, call the standard DOM method `textElement.getBBox()`. This gives you the `(x, y, width, height)` of the text in its own local coordinate space.
- [x] Use your existing `getCombinedTransform(textElement)` function to get the cumulative transformation matrix of the text element's parents.
- [x] Apply this combined transform to the `(x, y)` coordinates of the bounding box returned by `getBBox()`. This will give you the final, on-screen position and size of the text in the root SVG's coordinate space. Store this as `targetBox`.
- [ ] **Verification:** Temporarily draw a semi-transparent rectangle using the `targetBox` coordinates to visually confirm that it perfectly outlines the original text on screen, regardless of nested transforms or `text-anchor` properties.

### ☑ Step 3: Render the Single-Line Font Independently
- [x] Create a new `<g>` element in your SVG canvas to hold the generated single-line paths.
- [x] Using the selected single-line font, generate the paths for the text string.
- [x] **Crucially:** Add these paths to the new `<g>` element at an untransformed origin (i.e., as if you were drawing them at `(0,0)`).
- [x] Call `getBBox()` on this new group to get its dimensions. Store this as `generatedBox`.

### ☑ Step 4: Align the New Text to the Original Bounding Box
- [x] Now you have two rectangles: `targetBox` and `generatedBox`. Calculate the transformation needed to map the `generatedBox` onto the `targetBox`.
- [x] **Calculate Scale:**
    - [x] `scaleX = targetBox.width / generatedBox.width`
    - [x] `scaleY = targetBox.height / generatedBox.height` (You'll likely use the X-scale for both to maintain aspect ratio, so `finalScale = scaleX`).
- [x] **Calculate Translation (based on text-anchor or a GUI toggle):**
    - [x] **Left Align:** `translateX = targetBox.x - generatedBox.x * finalScale`
    - [x] **Center Align:** `translateX = (targetBox.x + targetBox.width / 2) - (generatedBox.x + generatedBox.width / 2) * finalScale`
    - [x] **Right Align:** `translateX = (targetBox.x + targetBox.width) - (generatedBox.x + generatedBox.width) * finalScale`
    - [x] **Vertical Align:** `translateY = (targetBox.y + targetBox.height / 2) - (generatedBox.y + generatedBox.height / 2) * finalScale` (Center alignment is usually best for vertical).
- [x] Apply this calculated scale and translation to the `<g>` element containing your generated paths. The transform attribute will look like: `transform="translate(translateX, translateY) scale(finalScale)"`.

### ☑ Step 5: Apply Universal GUI Adjustments
- [x] The final step is to apply the user's adjustments from the GUI. These should be applied *outside* the alignment transform calculated in Step 4.
- [x] Wrap the generated `<g>` element in another `<g>` element.
- [x] Apply the GUI adjustments to this *outer* group. The transform would be `transform="translate(gui_x_offset, gui_y_offset) scale(gui_font_scale)"`.
- [x] The final structure will be: `<g transform="translate(gui...) scale(gui...)"> <g transform="translate(align...) scale(align...)"> ...paths... </g> </g>`.
- [x] **Result:** A 10px GUI offset will now move the text by exactly 10 pixels on screen, making adjustments predictable.

---

## Phase 2: Integrating Spacing Controls

With the core alignment working, re-integrate letter and line spacing controls in a way that complements the new model.

### ☑ Step 1: Implement Letter Spacing
- [x] Modify the logic in **Phase 1, Step 3** where you generate the single-line paths.
- [x] When placing characters side-by-side, add the `letter_spacing_adjustment` from your GUI to the x-position of each subsequent character.
- [x] The `getBBox()` call on the generated group will now correctly measure the total width of the text *with* the custom letter spacing included. The alignment logic from Phase 1 will handle the rest automatically.

### ☑ Step 2: Implement Line Spacing
- [x] This requires processing text on a line-by-line basis (e.g., for each `<tspan>`).
- [x] Adapt the logic from **Phase 1** to run for each line individually.
- [x] After each line's generated paths are aligned to their corresponding original line's bounding box, apply an additional vertical translation.
- [x] The formula will be `final_line_Y = aligned_line_Y + (line_index * line_spacing_adjustment)`. This pushes each subsequent line down, creating the desired spacing effect.

---

## Phase 3: Refinement and Verification

### ☑ Step 1: Code Cleanup and Refactoring
- [x] Remove the old positioning and alignment code that is now obsolete.
- [x] Ensure all variables are clearly named (`targetBox`, `generatedBox`, `alignTransform`, `userTransform`, etc.).
- [x] Add comments to the new `processTextElement` function explaining the multi-stage transformation process.

### ☑ Step 2: Testing with Edge Cases
- [x] Use `alignment_test.svg` to verify that all alignment modes (left, center, right) work as expected.
- [x] Use `enhanced_alignment_test.svg` for comprehensive text-anchor alignment testing.
- [x] Use `Radiohead - OK Computer_composite.svg` to test deeply nested transforms.
- [x] Test with text elements that have zero width or height.
- [x] Test with text that is scaled non-uniformly (e.g., `scale(2, 1)`).

### ☑ Step 3: Final UI/UX Review
- [x] Confirm that all GUI sliders behave intuitively. Does a positive "X Offset" always move the text right? Does increasing "Font Scale" always make the text bigger?
- [x] Check that the zoom and pan functionality still works correctly with the new rendering logic.
- [x] Added edge case handling for invalid bounding boxes and extreme scaling values.

---

## Phase 4: Bug Fixes and Refinements (In Progress)

### Issues Identified During Testing:

#### ✅ FIXED: Major Scaling Issues
- [x] Font scale now scales in place instead of to top-left corner
- [x] Stroke color fixed (red in preview mode)
- [x] Letter spacing no longer affected by double scaling
- [x] Tiny text scaling corrected (0.08x instead of 1.02x)
- [x] Target bounding box calculation fixed for heavily scaled text

#### 🔄 IN PROGRESS: Remaining Issues
- [ ] **Initial positioning offset**: Text appears 1-2px left on first load, snaps to correct position when any slider is moved
- [ ] **Tiny text bounding box height**: Red debug boxes are 6-7x taller than actual text height
- [ ] **Tiny text Y positioning**: Vertical alignment is off, requires +5.7 Y offset for proper alignment
- [ ] **Tiny text font scaling**: Requires 63% font scale (down 37%) for proper size matching

#### 🎯 Root Causes Identified:
1. **Baseline calculation errors**: Text baseline adjustment (-fontSize * 0.8) may be incorrect for tiny scaled text
2. **Height estimation issues**: Target bounding box height calculation doesn't account for scale transforms
3. **Initial render timing**: Positioning calculations may be affected by font loading or initial render state

### Current Status:
- **Normal text**: Working correctly
- **Tiny scaled text**: Horizontal alignment ✅, Vertical alignment ❌, Height calculation ❌
- **Visual debugging**: Red/blue/green rectangles helping identify specific issues
