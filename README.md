Ombunga Valentine Omung'ala
CIT-227-089/2024
https://kidgamer254.github.io/campusmarket-valentine-ombunga/

# CampusMarket — Student-to-Student Campus Marketplace

**CampusMarket** is a responsive, accessible, interactive web application built across Weeks 1 through 4. It enables university students to buy, sell, and discover campus essentials (textbooks, calculators, electronics, lab coats, and tutoring services) with real-time filtering, interactive galleries, live price calculations, an integrated shopping cart drawer, and robust form validation.

---

## 📖 Simple & Detailed Overview of the Website

### What the Website Does
CampusMarket provides a complete end-to-end marketplace experience tailored for university campuses:
1. **Home Page (`index.html`):**
   - Features a hero banner with quick call-to-actions.
   - Showcases featured products and popular categories.
   - Displays real-time campus statistics (active listings, verified students, trusted transactions).
   - Global shopping cart toggle with an interactive badge showing total items in cart.
2. **Product Catalog & Interactive Showcase (`catalog.html`):**
   - **Showcase Gallery / Slideshow:** Displays featured item images, titles, prices, and availability with previous/next controls, dot indicators, and automatic wraparound.
   - **Real-Time Search & Category Filters:** Instantly filters products as the user types or selects category buttons (*All*, *Textbooks*, *Electronics*, *Stationery*, *Services*).
   - **Integrated Gallery Link:** The slideshow updates in real time to reflect whatever category or keyword the user filters down to.
   - **Order Calculator:** Allows students to select an item and enter a quantity to view a live running total with strict input validation.
   - **Add to Cart & Quick View:** Interactive cards allow buyers to view product details in a modal or add items directly to their cart.
3. **Student Registration & Verification (`register.html`):**
   - Secure student registration form featuring real-time input validation.
   - Validates student ID, campus email address, phone number, and password complexity.
   - Displays animated CSS success confirmations upon valid submission without disruptive pop-up alerts.
4. **Persistent Shopping Cart & Checkout:**
   - Slide-in side drawer available across all pages.
   - Allows students to adjust quantities, remove items, clear the cart, and proceed to checkout with order summaries saved to `localStorage`.

---

## 💻 Code Structure & Technical Explanation

The codebase is organized cleanly into modular, standards-compliant web technologies without unnecessary third-party dependencies:

```text
campusmarket-valentine-ombunga/
├── index.html          # Landing page with hero, categories, and featured listings
├── catalog.html        # Interactive catalog, dynamic slideshow, and order calculator
├── register.html       # Student sign-up form with comprehensive input validation
├── styles.css          # Central stylesheet: CSS Grid/Flexbox, transitions, keyframes, theme tokens
├── app.js              # Core JavaScript application: state management, DOM logic, validation
├── images/             # Optimized web-ready JPEG images (compressed for fast loading)
└── README.md           # Project documentation and assignment submission metadata
```

### 1. HTML Architecture (Week 1 — Semantic & Accessible)
- **Semantic Tags:** Uses `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` elements throughout to provide meaningful structure for screen readers and search engines.
- **Accessible Attributes:** Form elements include explicitly linked `<label for="...">` tags and descriptive `aria-live` and `aria-label` tags for screen reader announcements.
- **Descriptive Alt Text:** Every image contains meaningful `alt` text detailing the product name, visual condition, and context (Part 1.5 compliance).

### 2. Styling & Motion Design (`styles.css` — Weeks 1 & 4)
- **Modern Layouts:** Built using CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(...))`) and Flexbox for fully responsive, fluid layouts that never break or overflow horizontally on mobile screens.
- **Transitions & Micro-interactions:** Smooth transitions (`transition: all 0.25s ease`) on buttons, filter tabs, product cards, and modal dialogs.
- **Keyframe Animations:**
  - `@keyframes formSuccessPulse`: Creates an expanding green ripple confirming successful form submission.
  - `@keyframes checkmarkPop`: Scales and bounces an animated SVG checkmark icon.
  - `@keyframes toastSlideIn`: Slides in unobtrusive confirmation notifications when adding items to the cart.
- **Error Feedback Transitions:** `.field-error` and `.calc-error-msg` use CSS `opacity`, `transform: translateY(-4px)`, and `max-height` transitions so error messages smoothly slide into view rather than abruptly snapping into place.

### 3. JavaScript Architecture (`app.js` — Weeks 2, 3 & 4)
The JavaScript logic is contained completely within [app.js](app.js) with **zero inline event handlers** (no `onclick` or `onchange` in HTML files):

- **Shared State Management:**
  - `activeFilteredProducts`: An array containing the current active subset of products matching the user's search query and category filter.
  - `currentShowcaseIndex`: Tracks the active slide in the showcase gallery.
  - `cart`: An array of items persisted in the browser via `localStorage`.
- **Integration 1: Filter Drives Gallery:**
  - When the user searches or clicks a category, `filterProducts()` runs a loop over all catalog cards.
  - Matching cards remain visible, while unmatched cards are hidden (`display: none`).
  - The matching product data is compiled into `activeFilteredProducts`, which is passed directly to `updateShowcaseGallery()`.
  - The slideshow immediately updates its slides, image counters, and dots. Wraparound at both ends is guaranteed using modular arithmetic:
    ```javascript
    // Previous slide with wraparound
    currentShowcaseIndex = (currentShowcaseIndex - 1 + activeFilteredProducts.length) % activeFilteredProducts.length;
    // Next slide with wraparound
    currentShowcaseIndex = (currentShowcaseIndex + 1) % activeFilteredProducts.length;
    ```
- **Integration 2: Validated Input Drives Calculations:**
  - The calculator listens to `input` and `change` events on `#calc-quantity` and `#calc-product`.
  - Validates that quantity is non-empty, numeric, an integer, and strictly greater than zero (`qty > 0`).
  - If validation fails, it applies `.is-invalid` to the input, reveals the descriptive error message, and sets the total to `KSh — (Invalid Qty)`.
  - Only valid numbers calculate `total = price * quantity` and format the currency.
- **Integration 3 & 4: Form Validation & Animated Feedback:**
  - Intercepts form submission using `event.preventDefault()`.
  - Tests 3 distinct validation rules:
    1. **Required rule:** Ensures no fields are left blank.
    2. **Format rule:** Validates valid email syntax using regular expressions (`^[^\s@]+@[^\s@]+\.[^\s@]+$`).
    3. **Custom rules:** Validates password complexity (minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number) and phone number length/format.
  - On failure, specific error messages (naming exactly what is wrong) transition into view.
  - On success, `classList.add('form-success-active')` triggers the CSS `@keyframes` pulse and checkmark animation. No `alert()` dialog is used.
- **Integration 5: Shopping Cart System:**
  - Users can add items from the catalog or quick-view modal.
  - Cart state updates in real time, recalculates subtotals and grand totals, and renders an animated slide-in notification toast.

---

## 🚀 How to Run the Website Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kidgamer254/campusmarket-valentine-ombunga.git
   cd campusmarket-valentine-ombunga
   ```
2. **Open in any modern web browser:**
   - Double-click `index.html` to open it directly in Chrome, Firefox, Safari, or Edge.
   - Or use VS Code's **Live Server** extension for real-time live reloading.
3. **Visit the Live Site:**
   - [https://kidgamer254.github.io/campusmarket-valentine-ombunga/](https://kidgamer254.github.io/campusmarket-valentine-ombunga/)

---

## 📋 Assignment 4: Weeks 1–4 Integration Checklist

| Requirement | Status | Where to Inspect |
| :--- | :---: | :--- |
| **Filtered results drive gallery** | ✅ Complete | `filterProducts()` and `updateShowcaseGallery()` in [app.js](app.js) |
| **Calculations respond only to validated input** | ✅ Complete | `updateCalculator()` in [app.js](app.js), `.calc-error-msg` in [styles.css](styles.css) |
| **Animated confirmation on valid submit** | ✅ Complete | `@keyframes formSuccessPulse` in [styles.css](styles.css), `handleRegisterSubmit()` in [app.js](app.js) |
| **Specific validation error feedback** | ✅ Complete | `validateRegistrationForm()` in [app.js](app.js), `.field-error` transitions in [styles.css](styles.css) |
| **Meaningful alt text across all images** | ✅ Complete | All `<img>` tags across `index.html`, `catalog.html`, `register.html` |
| **Zero inline event handlers** | ✅ Complete | 100% `addEventListener` in [app.js](app.js); no `onclick`/`onchange` attributes |
| **Slideshow wraparound at both ends** | ✅ Complete | Modular arithmetic `(idx ± 1 + len) % len` in [app.js](app.js) |
| **Responsive media without overflow** | ✅ Complete | Fluid media, CSS Grid, and responsive viewports in [styles.css](styles.css) |
