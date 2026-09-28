Ombunga Valentine Omung'ala
CIT-227-089/2024
https://kidgamer254.github.io/campusmarket-valentine-ombunga/

# CampusMarket — Student-to-Student Campus Marketplace

A responsive, accessible, interactive web application built across Weeks 1 to 4 for campus trade.

## Assignment 4: Weeks 1–4 Integration Highlights

### 1. Filtered Results Drive the Gallery / Slideshow (Part 1.1)
- The catalog search and category filter (`filterProducts` in [app.js](file:///c:/Users/CLIFFORD%20MEROKA/OneDrive/Desktop/campusmarket-valentine-ombunga/app.js)) directly updates the shared in-memory dataset `activeFilteredProducts`.
- The showcase gallery (`updateShowcaseGallery`) renders items exclusively from `activeFilteredProducts`.
- Filtering down to a specific category (e.g. *Textbooks*, *Electronics*, *Stationery*, or *Services*) dynamically re-indexes the slideshow to display only those products, their images, prices, and statuses.
- Full wraparound navigation is implemented at both ends using modular arithmetic `(currentIndex ± 1 + length) % length`.

### 2. Calculations Respond Exclusively to Validated Input (Part 1.2)
- The running quantity & total calculator validates all input before computation.
- Values that are empty, zero, negative, non-numeric, or fractional are rejected.
- When an invalid quantity is entered, the input turns red, a clear error message transitions into view explaining the reason, and the calculation outputs `KSh — (Invalid Qty)` without corrupting totals or crashing.

### 3. Meaningful CSS Animation on Valid Form Submission (Part 1.3)
- When the registration form passes all validation rules, `event.preventDefault()` intercepts the submit event.
- JavaScript triggers a success state via `classList.add('form-success-active')`, executing a `@keyframes formSuccessPulse` ring ripple and a `@keyframes checkmarkPop` SVG checkmark animation.
- No `alert()` dialogs are used.

### 4. Specific Validation Feedback with Smooth CSS Transitions (Part 1.4)
- Form validation tests 3+ distinct rules:
  1. **Required rule**: Checks for presence of values.
  2. **Format rule**: Validates university email domain syntax (`name@student.edu` or valid email structure).
  3. **Custom rules**: Password complexity (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number) and phone number format (valid Kenyan/international digits).
- Each invalid field reveals an explicit, user-friendly error message that transitions smoothly into view using CSS `opacity`, `transform: translateY()`, and `max-height`.

### 5. Meaningful Alt Text Across All Images (Part 1.5)
- Every single image across `index.html`, `catalog.html`, and `register.html` includes comprehensive, descriptive `alt` text describing the product, condition, and visual characteristics.

### 6. Architecture & Code Quality Checklist (Part 2)
- **Zero inline event handlers**: All event interactions use `addEventListener` and event delegation; no `onclick`, `onchange`, or `oninput` attributes exist in the HTML.
- **External JavaScript**: All logic is strictly encapsulated in [app.js](file:///c:/Users/CLIFFORD%20MEROKA/OneDrive/Desktop/campusmarket-valentine-ombunga/app.js).
- **Responsive Media**: Viewport scales smoothly across mobile, tablet, and desktop viewports with zero horizontal overflow.
