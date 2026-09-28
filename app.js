/**
 * CampusMarket — Integrated Client-side Logic (Weeks 1 to 4)
 * File: app.js
 * Standard: Modern ECMAScript (strictly using let and const for predictable scoping)
 * 
 * ==========================================================================
 * INTEGRATION ARCHITECTURE (WEEKS 1 - 4):
 * ==========================================================================
 * 1. Filtered Results Drive the Showcase Gallery (Week 2 + Week 4 Integration):
 *    - The product filter (filterProducts) collects matching products into a
 *      shared dataset: 'activeFilteredProducts'.
 *    - This shared dataset directly drives the Interactive Showcase Gallery
 *      (updateShowcaseGallery), so filtering down to a category or searching
 *      immediately updates the carousel slides to only display matching items.
 * 
 * 2. Calculations Respond Exclusively to Validated Input (Week 2 + Week 3 Integration):
 *    - calculateProductTotal validates input: checks for empty strings, NaN,
 *      negative/zero values, non-integers, and excessive numbers.
 *    - If invalid, the running total excludes the item (displays 'KSh —'),
 *      highlights the input with .is-invalid, and displays an animated error.
 *    - Only valid inputs update the running calculation.
 * 
 * 3. Animated Confirmation on Valid Form Submit (Week 3 + Week 4 Integration):
 *    - On validated registration submit, an interactive @keyframes animation
 *      ('animate-success') is triggered via classList.add (zero alert() calls).
 * 
 * 4. Specific Validation Feedback with CSS Transitions (Week 3 + Week 4 Integration):
 *    - Every validation rule names the exact problem (e.g. missing '@', domain).
 *    - Error messages smoothly fade and slide in/out using CSS transitions.
 * 
 * 5. Clean Event Listener Architecture (Week 3 Requirement):
 *    - All interactions are wired via addEventListener (zero inline onclick/oninput).
 */

// Track the currently selected category (default: 'all')
let currentCategory = 'all';

// Shared state: array of currently filtered product objects (Integration Requirement 1)
let activeFilteredProducts = [];
let currentSlideIndex = 0;

/**
 * Debounce helper: delays execution until 'wait' ms have passed.
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Milliseconds to wait
 */
function debounce(fn, wait) {
  let timer;
  return function() {
    const args = arguments;
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(ctx, args);
    }, wait);
  };
}

/* ============================================================
   PART 1: FILTER & SEARCH (WEEK 2) + SHARED DATA INTEGRATION
   ============================================================ */

/**
 * Filter products by category when a chip is clicked
 * @param {string} category - Category slug ('all', 'textbooks', 'electronics', etc.)
 * @param {HTMLElement} [btnElement] - The button that was clicked
 */
function filterCategory(category, btnElement) {
  currentCategory = (category || 'all').toLowerCase();

  // Update active styling on filter chips using a loop
  const chips = document.querySelectorAll('.chip');
  for (let i = 0; i < chips.length; i++) {
    chips[i].classList.remove('active');
  }

  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    // If called programmatically, find matching button
    const matchingChip = document.querySelector('[data-filter="' + currentCategory + '"]');
    if (matchingChip) {
      matchingChip.classList.add('active');
    } else {
      const allChip = document.getElementById('filter-all');
      if (allChip) allChip.classList.add('active');
    }
  }

  // Reset showcase slide index to 0 whenever category changes
  currentSlideIndex = 0;

  // Re-run filtering across all products
  filterProducts();
}

/**
 * Filter product grid based on search query & category.
 * INTEGRATION REQUIREMENT 1:
 * - Collects matching products into 'activeFilteredProducts'.
 * - Shares this data with updateShowcaseGallery so the slideshow mirrors the filtered set.
 */
function filterProducts() {
  const searchInput = document.getElementById('catalog-search');
  let query = '';
  if (searchInput && searchInput.value) {
    query = searchInput.value.toLowerCase().trim();
  }

  const productCards = document.querySelectorAll('.product-card');
  let visibleCount = 0;
  activeFilteredProducts = []; // Reset shared filtered dataset

  // Requirement: Function uses a loop to traverse product list
  for (let i = 0; i < productCards.length; i++) {
    const card = productCards[i];

    // Read category from data attribute
    let cardCat = card.getAttribute('data-category') || '';
    if (!cardCat) {
      const catEl = card.querySelector('.product-category');
      cardCat = catEl ? catEl.textContent : '';
    }
    cardCat = cardCat.toLowerCase().trim();

    // Read product name and description
    const nameEl = card.querySelector('.product-name');
    const descEl = card.querySelector('.product-desc');
    const imgEl = card.querySelector('.product-img');
    const sellerEl = card.querySelector('.product-seller span');
    const priceAttr = card.getAttribute('data-price');

    const productName = nameEl ? nameEl.textContent.toLowerCase() : '';
    const productDesc = descEl ? descEl.textContent.toLowerCase() : '';

    // Requirement: Uses if / else decision logic
    let matchesCategory = false;
    if (currentCategory === 'all') {
      matchesCategory = true;
    } else if (cardCat.indexOf(currentCategory) !== -1 || currentCategory.indexOf(cardCat) !== -1) {
      matchesCategory = true;
    } else {
      matchesCategory = false;
    }

    let matchesSearch = false;
    if (query === '') {
      matchesSearch = true;
    } else {
      if (productName.indexOf(query) !== -1 || productDesc.indexOf(query) !== -1 || cardCat.indexOf(query) !== -1) {
        matchesSearch = true;
      } else {
        matchesSearch = false;
      }
    }

    // Final visibility decision
    if (matchesCategory && matchesSearch) {
      card.style.display = '';
      visibleCount++;

      // Populate shared filtered dataset for the showcase gallery
      activeFilteredProducts.push({
        id: card.id,
        name: nameEl ? nameEl.textContent.trim() : 'Product',
        desc: descEl ? descEl.textContent.trim() : '',
        price: parseFloat(priceAttr) || 0,
        category: cardCat,
        image: imgEl ? imgEl.getAttribute('src') : 'images/calculus textbook.jpg',
        alt: imgEl ? imgEl.getAttribute('alt') : 'Product photo',
        seller: sellerEl ? sellerEl.textContent.trim() : 'Student'
      });
    } else {
      card.style.display = 'none';
    }
  }

  // Update results counter & empty state
  updateResultsBar(visibleCount, query);

  // INTEGRATION REQUIREMENT 1: Update the Showcase Gallery with shared filtered data
  updateShowcaseGallery(activeFilteredProducts);
}

/**
 * Updates the catalog results bar message and toggles empty state
 * @param {number} count - Number of currently visible products
 * @param {string} query - Current search term
 */
function updateResultsBar(count, query) {
  const resultsBar = document.querySelector('.catalog-results-bar');
  let emptyState = document.getElementById('catalog-empty-state');
  const grid = document.getElementById('products-grid');

  if (resultsBar) {
    const textP = resultsBar.querySelector('p');
    if (textP) {
      if (count === 1) {
        textP.innerHTML = 'Showing <strong>1 listing</strong>';
      } else if (count > 1) {
        textP.innerHTML = 'Showing <strong>' + count + ' listings</strong>';
      } else {
        textP.innerHTML = 'Showing <strong>0 listings</strong>';
      }
    }
  }

  // If no products match, show empty-state message
  if (count === 0) {
    if (!emptyState && grid) {
      emptyState = document.createElement('div');
      emptyState.id = 'catalog-empty-state';
      emptyState.className = 'catalog-empty-state';
      grid.parentNode.insertBefore(emptyState, grid.nextSibling);
    }
    if (emptyState) {
      emptyState.style.display = 'block';
      const hint = query ? 'matching "' + escapeHTML(query) + '"' : 'in this category';
      emptyState.innerHTML = 
        '<div class="empty-icon">🔍</div>' +
        '<h3>No listings found</h3>' +
        '<p>We couldn\'t find any products ' + hint + '. Try another search or filter.</p>' +
        '<button type="button" class="btn btn-secondary" id="btn-reset-filters">Reset All Filters</button>';
      
      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
      }
    }
  } else {
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
}

/**
 * Resets search input and category filter back to 'all'
 */
function resetFilters() {
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.value = '';
  }
  filterCategory('all');
}

/* ============================================================
   PART 2: INTERACTIVE SHOWCASE GALLERY (WEEK 4)
   Driven by Filtered Data with Correct Wraparound at Both Ends
   ============================================================ */

/**
 * Updates the Showcase Gallery view using the shared filtered products array.
 * @param {Array} productsList - Filtered products from filterProducts()
 */
function updateShowcaseGallery(productsList) {
  const showcase = document.getElementById('catalog-showcase');
  if (!showcase) return; // Not on catalog page

  const counterEl = document.getElementById('showcase-counter');
  const countTextEl = document.getElementById('showcase-count-text');
  const statusEl = document.getElementById('showcase-status');
  const stageEl = document.getElementById('showcase-active-card');
  const dotsEl = document.getElementById('showcase-dots');

  if (!productsList || productsList.length === 0) {
    if (stageEl) {
      stageEl.innerHTML = 
        '<div class="showcase-empty">' +
          '<h3>No matching showcase items</h3>' +
          '<p>No items in this category or matching your search. Reset filters to view products.</p>' +
        '</div>';
    }
    if (counterEl) counterEl.textContent = '0 items';
    if (dotsEl) dotsEl.innerHTML = '';
    return;
  }

  // Wraparound bounds check: clamp slide index if out of range
  if (currentSlideIndex >= productsList.length) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = productsList.length - 1;
  }

  const currentItem = productsList[currentSlideIndex];

  // Update slide counter (e.g. "Slide 1 of 4")
  if (counterEl) {
    counterEl.textContent = 'Slide ' + (currentSlideIndex + 1) + ' of ' + productsList.length;
  }
  if (countTextEl) {
    countTextEl.textContent = productsList.length + (productsList.length === 1 ? ' item' : ' items') + ' in rotation';
  }
  if (statusEl) {
    const catLabel = currentCategory === 'all' ? 'All Products' : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    statusEl.innerHTML = 'Filtered to: <strong>' + escapeHTML(catLabel) + '</strong> (' + productsList.length + ' in rotation)';
  }

  // Render active slide with CSS entrance transition
  if (stageEl) {
    stageEl.classList.remove('slide-transition');
    void stageEl.offsetWidth; // Force DOM reflow to retrigger animation
    stageEl.classList.add('slide-transition');

    stageEl.innerHTML = 
      '<div class="showcase-img-wrap">' +
        '<img src="' + escapeHTML(currentItem.image) + '" alt="' + escapeHTML(currentItem.alt || currentItem.name) + '" width="400" height="300" />' +
      '</div>' +
      '<div class="showcase-info">' +
        '<span class="showcase-cat-tag">' + escapeHTML(currentItem.category) + '</span>' +
        '<h3 class="showcase-item-title">' + escapeHTML(currentItem.name) + '</h3>' +
        '<p class="showcase-item-desc">' + escapeHTML(currentItem.desc) + '</p>' +
        '<div class="showcase-price-row">' +
          '<span class="showcase-price">KSh ' + currentItem.price.toLocaleString() + '</span>' +
          '<span class="showcase-seller-tag">Seller: ' + escapeHTML(currentItem.seller) + '</span>' +
        '</div>' +
        '<div class="showcase-btn-row">' +
          '<button type="button" class="btn-add-to-cart" data-product="' + escapeHTML(currentItem.id) + '">🛒 Add to Cart</button>' +
          '<a href="#' + escapeHTML(currentItem.id) + '" class="btn-showcase-jump">Jump to Listing ↓</a>' +
        '</div>' +
      '</div>';
  }

  // Render slide indicator dots
  if (dotsEl) {
    let dotsHtml = '';
    for (let d = 0; d < productsList.length; d++) {
      const activeClass = d === currentSlideIndex ? ' active' : '';
      dotsHtml += '<button type="button" class="showcase-dot' + activeClass + '" data-slide-index="' + d + '" aria-label="Go to slide ' + (d + 1) + '"></button>';
    }
    dotsEl.innerHTML = dotsHtml;
  }
}

/**
 * Slide forward with wraparound at the end
 */
function nextSlide() {
  if (!activeFilteredProducts || activeFilteredProducts.length === 0) return;
  // Wraparound: last slide wraps back to 0
  currentSlideIndex = (currentSlideIndex + 1) % activeFilteredProducts.length;
  updateShowcaseGallery(activeFilteredProducts);
}

/**
 * Slide backward with wraparound at the start
 */
function prevSlide() {
  if (!activeFilteredProducts || activeFilteredProducts.length === 0) return;
  // Wraparound: slide 0 wraps to last slide
  currentSlideIndex = (currentSlideIndex - 1 + activeFilteredProducts.length) % activeFilteredProducts.length;
  updateShowcaseGallery(activeFilteredProducts);
}

/* ============================================================
   PART 3: LIVE RUNNING CALCULATIONS & VALIDATION (WEEKS 2 & 3)
   ============================================================ */

/**
 * Calculates live running total for a product based on validated quantity.
 * INTEGRATION REQUIREMENT 2:
 * - Only updates using data that has passed validation.
 * - If quantity fails validation (empty, zero, negative, non-numeric, decimal),
 *   the total is EXCLUDED from calculation (shows 'KSh — (Invalid Qty)')
 *   and an animated error message is displayed naming the specific reason.
 * 
 * @param {HTMLInputElement} inputEl - The quantity input element
 * @param {number} unitPrice - The unit price of the item in KSh
 * @param {string} outputElId - ID of the element displaying total
 * @param {string} [errorElId] - ID of the element displaying error feedback
 * @returns {boolean} Whether validation passed
 */
function calculateProductTotal(inputEl, unitPrice, outputElId, errorElId) {
  if (!inputEl) return false;

  const outputEl = document.getElementById(outputElId);
  const errorEl = errorElId ? document.getElementById(errorElId) : null;
  const rawVal = inputEl.value;
  const trimmed = rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : '';

  let errorMessage = '';

  // Validation rules:
  if (trimmed === '') {
    errorMessage = 'Quantity cannot be empty. Please enter a number (1–99).';
  } else {
    const num = Number(trimmed);
    if (isNaN(num)) {
      errorMessage = 'Quantity must be a valid numeric digit.';
    } else if (num <= 0) {
      errorMessage = 'Quantity must be at least 1 whole item (cannot be 0 or negative).';
    } else if (!Number.isInteger(num)) {
      errorMessage = 'Quantity must be a whole integer without decimals.';
    } else if (num > 99) {
      errorMessage = 'Maximum allowed quantity is 99 items per listing.';
    }
  }

  // Handle validation outcome using if / else
  if (errorMessage !== '') {
    // FAILED VALIDATION:
    inputEl.classList.remove('is-valid');
    inputEl.classList.add('is-invalid');

    if (errorEl) {
      errorEl.textContent = '⚠️ ' + errorMessage;
      errorEl.classList.add('visible'); // Trigger CSS transition
    }

    if (outputEl) {
      // Excluded from total calculation!
      outputEl.textContent = 'KSh — (Invalid Qty)';
      outputEl.classList.add('is-invalid');
    }
    return false;
  } else {
    // PASSED VALIDATION:
    const validQty = parseInt(trimmed, 10);
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible'); // Trigger CSS transition out
    }

    if (outputEl) {
      const calculatedTotal = validQty * unitPrice;
      outputEl.textContent = 'KSh ' + calculatedTotal.toLocaleString();
      outputEl.classList.remove('is-invalid');
    }
    return true;
  }
}

/**
 * Adjust quantity with +/- stepper buttons and run validation
 * @param {string} inputId - ID of quantity input
 * @param {number} delta - Amount to adjust (+1 or -1)
 * @param {number} unitPrice - Item unit price
 * @param {string} outputId - Output total ID
 * @param {string} errorId - Error message element ID
 */
function changeQty(inputId, delta, unitPrice, outputId, errorId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  let currentVal = parseInt(inputEl.value, 10);
  if (isNaN(currentVal) || currentVal < 1) {
    currentVal = 1;
  }

  let newVal = currentVal + delta;
  if (newVal < 1) {
    newVal = 1;
  } else if (newVal > 99) {
    newVal = 99;
  }

  inputEl.value = newVal;
  calculateProductTotal(inputEl, unitPrice, outputId, errorId);
}

/**
 * Sort products by price or default order
 */
function sortProducts() {
  const sortSelect = document.getElementById('sort-select');
  const grid = document.getElementById('products-grid');
  if (!sortSelect || !grid) return;

  const sortVal = sortSelect.value;
  const cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));

  // Sort based on selected option using if / else
  if (sortVal === 'price-asc') {
    cards.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      return priceA - priceB;
    });
  } else if (sortVal === 'price-desc') {
    cards.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      return priceB - priceA;
    });
  }

  requestAnimationFrame(function() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < cards.length; i++) {
      fragment.appendChild(cards[i]);
    }
    grid.appendChild(fragment);

    // Re-synchronize showcase gallery with new sort order
    filterProducts();
  });
}

/**
 * Utility: Escape HTML for safe rendering
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, function(tag) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag;
  });
}

/**
 * Handle initial URL hash on page load (e.g. catalog.html#books)
 */
function handleUrlHash() {
  const hash = window.location.hash.toLowerCase().replace('#', '');
  if (!hash) return;

  const hashToCat = {
    'books': 'textbooks',
    'textbooks': 'textbooks',
    'electronics': 'electronics',
    'clothing': 'clothing',
    'clothes': 'clothing',
    'furniture': 'furniture',
    'sports': 'sports',
    'stationery': 'stationery'
  };

  if (hashToCat[hash]) {
    const targetCat = hashToCat[hash];
    const chip = document.querySelector('[data-filter="' + targetCat + '"]');
    filterCategory(targetCat, chip);
  }
}

/* ============================================================
   PART 4: REGISTRATION FORM VALIDATION & ANIMATIONS (WEEKS 3 & 4)
   ============================================================ */

/**
 * Initializes registration form validation and interactive behaviors.
 * INTEGRATION REQUIREMENTS 3 & 4:
 * - Specific, naming-the-problem feedback for each field.
 * - CSS transitions on error appearance.
 * - Meaningful @keyframes animation confirmation on success.
 * - Attached exclusively via addEventListener (zero inline handlers).
 */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const campusSelect = document.getElementById('reg-campus');
  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm-password');
  const termsCheckbox = document.getElementById('reg-terms');
  const togglePwBtn = document.getElementById('toggle-pw-btn');
  const feedbackEl = document.getElementById('form-feedback');

  // Helper to show field error with smooth CSS transition
  function setError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (inputEl) {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '⚠️ ' + message;
      errorEl.classList.add('visible'); // Trigger CSS transition
    }
    return false;
  }

  // Helper to clear field error with smooth CSS transition
  function setValid(inputEl, errorId) {
    const errorEl = document.getElementById(errorId);
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible'); // Trigger CSS transition
    }
    return true;
  }

  // Rule 1 (Required Rule): Full Name validation
  function validateName() {
    const val = nameInput ? nameInput.value.trim() : '';
    if (val === '') {
      return setError(nameInput, 'name-error', 'Full Name is required and cannot be empty.');
    } else if (val.length < 2) {
      return setError(nameInput, 'name-error', 'Name must be at least 2 characters long.');
    } else if (!/^[a-zA-Zs'-]+$/.test(val)) {
      return setError(nameInput, 'name-error', 'Name should only contain letters, spaces, or hyphens.');
    } else {
      return setValid(nameInput, 'name-error');
    }
  }

  // Rule 2 (Format Rule): Email validation naming specific errors
  function validateEmail() {
    const val = emailInput ? emailInput.value.trim() : '';
    if (val === '') {
      return setError(emailInput, 'email-error', 'University email address is required.');
    } else if (val.indexOf('@') === -1) {
      // Specific requirement check
      return setError(emailInput, 'email-error', 'Email address must contain an "@" symbol.');
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        return setError(emailInput, 'email-error', 'Email must include a valid domain (e.g. student@university.ac.ke).');
      } else {
        return setValid(emailInput, 'email-error');
      }
    }
  }

  // Campus selection required check
  function validateCampus() {
    const val = campusSelect ? campusSelect.value : '';
    if (val === '') {
      return setError(campusSelect, 'campus-error', 'Please choose your university campus from the dropdown list.');
    } else {
      return setValid(campusSelect, 'campus-error');
    }
  }

  // Password length requirement
  function validatePassword() {
    const val = passwordInput ? passwordInput.value : '';
    if (val === '') {
      return setError(passwordInput, 'password-error', 'Password is required to secure your student account.');
    } else if (val.length < 6) {
      return setError(passwordInput, 'password-error', 'Password must be at least 6 characters long.');
    } else {
      return setValid(passwordInput, 'password-error');
    }
  }

  // Rule 3 (Custom Rule): Passwords must match
  function validateConfirmPassword() {
    const pwVal = passwordInput ? passwordInput.value : '';
    const confirmVal = confirmInput ? confirmInput.value : '';
    if (confirmVal === '') {
      return setError(confirmInput, 'confirm-error', 'Please re-enter your password to confirm.');
    } else if (confirmVal !== pwVal) {
      return setError(confirmInput, 'confirm-error', 'Passwords do not match. Please re-enter matching passwords.');
    } else {
      return setValid(confirmInput, 'confirm-error');
    }
  }

  // Terms and conditions acceptance
  function validateTerms() {
    if (termsCheckbox && !termsCheckbox.checked) {
      return setError(termsCheckbox, 'terms-error', 'You must agree to the Campus Safety Guidelines and Community Rules.');
    } else {
      return setValid(termsCheckbox, 'terms-error');
    }
  }

  // Live input validation listeners
  if (nameInput) nameInput.addEventListener('input', validateName);
  if (emailInput) emailInput.addEventListener('input', validateEmail);
  if (campusSelect) campusSelect.addEventListener('change', validateCampus);
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      validatePassword();
      if (confirmInput && confirmInput.value !== '') validateConfirmPassword();
    });
  }
  if (confirmInput) confirmInput.addEventListener('input', validateConfirmPassword);
  if (termsCheckbox) termsCheckbox.addEventListener('change', validateTerms);

  // Show / Hide Password toggle
  if (togglePwBtn && passwordInput) {
    togglePwBtn.addEventListener('click', function() {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (confirmInput) {
        confirmInput.setAttribute('type', isPassword ? 'text' : 'password');
      }
      this.textContent = isPassword ? '🙈 Hide' : '👁️ Show';
      this.setAttribute('aria-label', isPassword ? 'Hide password characters' : 'Show password characters');
    });
  }

  // Form submission handler
  form.addEventListener('submit', function(e) {
    // Requirement: event.preventDefault() used on form submit
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isCampusValid = validateCampus();
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();
    const isTermsValid = validateTerms();

    const isFormValid = isNameValid && isEmailValid && isCampusValid && isPasswordValid && isConfirmValid && isTermsValid;

    if (isFormValid) {
      const studentName = nameInput ? nameInput.value.trim() : 'Student';

      // INTEGRATION REQUIREMENT 3: Trigger meaningful @keyframes animation via classList.add
      feedbackEl.className = 'form-feedback success visible animate-success';
      feedbackEl.innerHTML = 
        '<div class="success-check-badge" aria-hidden="true">✓</div>' +
        '<h3>Account Created Successfully!</h3>' +
        '<p>Welcome to CampusMarket, <strong>' + escapeHTML(studentName) + '</strong>! Your student account is now verified and active.</p>' +
        '<p style="margin-top:0.5rem; font-size:0.86rem; color:#065f46;">You can now list items, browse catalog listings, and trade safely on campus.</p>';

      // Reset form fields and remove validation classes
      form.reset();
      const validInputs = form.querySelectorAll('.is-valid');
      for (let i = 0; i < validInputs.length; i++) {
        validInputs[i].classList.remove('is-valid');
      }
    } else {
      // INTEGRATION REQUIREMENT 4: Specific failure feedback
      feedbackEl.className = 'form-feedback error visible';
      feedbackEl.innerHTML = 
        '⚠️ <strong>Please correct the highlighted fields before submitting.</strong><br />' +
        'Ensure all required fields are filled, your email includes an @ symbol, and your passwords match.';

      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });
}

/* ============================================================
   PART 5: SHOPPING CART MODULE & CAMPUS CHECKOUT
   ============================================================ */

const CART_STORAGE_KEY = 'campusmarket_cart_v1';

// Fallback catalog registry
const CATALOG_REGISTRY = {
  'product-calculus': { name: 'Calculus: Early Transcendentals 9e', price: 1200, category: 'Textbooks', image: 'images/calculus textbook.jpg', seller: 'Alice K.' },
  'product-calculus-textbook': { name: 'Calculus: Early Transcendentals 9e', price: 1200, category: 'Textbooks', image: 'images/calculus textbook.jpg', seller: 'Alice K.' },
  'product-lenovo': { name: 'Lenovo IdeaPad 3 — 8GB / 512GB', price: 28000, category: 'Electronics', image: 'images/lenovo.jpg', seller: 'James O.' },
  'product-laptop': { name: 'Lenovo IdeaPad 3 — 8GB / 512GB', price: 28000, category: 'Electronics', image: 'images/lenovo.jpg', seller: 'James O.' },
  'product-hoodie': { name: 'University Branded Hoodie — Size M', price: 850, category: 'Clothing', image: 'images/uni hoodie.jpg', seller: 'Naomi M.' },
  'product-biology': { name: 'Campbell Biology (11th Edition)', price: 1500, category: 'Textbooks', image: 'images/textbooks.jpg', seller: 'David K.' },
  'product-headphones': { name: 'Sony WH-CH520 Wireless Headphones', price: 12500, category: 'Electronics', image: 'images/electronics.jpg', seller: 'Eva N.' },
  'product-chair': { name: 'Ergonomic Study Desk Chair', price: 3200, category: 'Furniture', image: 'images/furniture.jpg', seller: 'Francis M.' },
  'product-football': { name: 'Nike Pitch Football — Size 5', price: 700, category: 'Sports', image: 'images/sports.jpg', seller: 'George T.' },
  'product-calculator': { name: 'Casio fx-991EX ClassWiz Calculator', price: 1100, category: 'Stationery', image: 'images/stationery.jpg', seller: 'Hellen A.' },
  'product-jeans': { name: 'Levi\'s 511 Slim Jeans — Size 32', price: 1800, category: 'Clothing', image: 'images/clothing.jpg', seller: 'Ian M.' },
  'product-tablet': { name: 'Samsung Galaxy Tab A8 64GB', price: 14000, category: 'Electronics', image: 'images/samsung.jpg', seller: 'Jane D.' },
  'product-physics': { name: 'University Physics with Modern Physics 14e', price: 1000, category: 'Textbooks', image: 'images/physics.jpg', seller: 'Kevin B.' },
  'product-desk-lamp': { name: 'LED Desk Lamp with USB Charging Port', price: 600, category: 'Furniture', image: 'images/furniture.jpg', seller: 'Laura M.' }
};

/**
 * Retrieve current cart from localStorage
 */
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save cart to localStorage and update UI
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
  renderCartUI();
}

/**
 * Add product to cart with chosen quantity
 */
function addToCart(productId, qtyOrInputId) {
  let qty = 1;

  if (typeof qtyOrInputId === 'number') {
    qty = qtyOrInputId;
  } else if (typeof qtyOrInputId === 'string') {
    const inputEl = document.getElementById(qtyOrInputId);
    if (inputEl) {
      qty = parseInt(inputEl.value, 10);
    } else {
      const parsed = parseInt(qtyOrInputId, 10);
      if (!isNaN(parsed)) qty = parsed;
    }
  }

  if (isNaN(qty) || qty <= 0) qty = 1;

  let itemData = CATALOG_REGISTRY[productId] || null;
  const card = document.getElementById(productId);

  if (card) {
    const nameEl = card.querySelector('.product-name');
    const priceAttr = card.getAttribute('data-price');
    const imgEl = card.querySelector('.product-img');
    const catEl = card.querySelector('.product-category');
    const sellerEl = card.querySelector('.product-seller span');

    itemData = {
      id: productId,
      name: nameEl ? nameEl.textContent.trim() : (itemData ? itemData.name : 'Campus Listing'),
      price: priceAttr ? parseFloat(priceAttr) : (itemData ? itemData.price : 0),
      category: catEl ? catEl.textContent.trim() : (itemData ? itemData.category : 'General'),
      image: imgEl ? imgEl.getAttribute('src') : (itemData ? itemData.image : 'images/calculus textbook.jpg'),
      seller: sellerEl ? sellerEl.textContent.trim() : (itemData ? itemData.seller : 'Student Seller')
    };
  } else if (!itemData) {
    itemData = {
      id: productId,
      name: 'Campus Listing',
      price: 1000,
      category: 'General',
      image: 'images/calculus textbook.jpg',
      seller: 'Student Seller'
    };
  }

  const cart = getCart();
  const existingIdx = cart.findIndex(function(item) {
    return item.id === productId || (item.name === itemData.name);
  });

  if (existingIdx > -1) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: productId,
      name: itemData.name,
      price: itemData.price,
      category: itemData.category,
      image: itemData.image,
      seller: itemData.seller,
      qty: qty
    });
  }

  saveCart(cart);

  // Bounce animation on cart badge
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(function(badge) {
    badge.classList.remove('cart-badge-bounce');
    void badge.offsetWidth;
    badge.classList.add('cart-badge-bounce');
  });

  showCartToast(
    'Added to Cart! 🛒',
    qty + '× ' + itemData.name + ' (KSh ' + (itemData.price * qty).toLocaleString() + ')'
  );
}

/**
 * Adjust cart quantity (+1 or -1)
 */
function updateCartQty(productId, delta) {
  const cart = getCart();
  const idx = cart.findIndex(function(item) { return item.id === productId; });
  if (idx > -1) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    }
    saveCart(cart);
  }
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
  let cart = getCart();
  const removed = cart.find(function(item) { return item.id === productId; });
  cart = cart.filter(function(item) { return item.id !== productId; });
  saveCart(cart);

  if (removed) {
    showCartToast('Item Removed', removed.name + ' was removed from your cart.');
  }
}

/**
 * Clear entire cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    saveCart([]);
    showCartToast('Cart Cleared', 'All items have been removed.');
  }
}

/**
 * Calculate totals
 */
function getCartTotals() {
  const cart = getCart();
  let totalCount = 0;
  let totalPrice = 0;

  for (let i = 0; i < cart.length; i++) {
    totalCount += cart[i].qty;
    totalPrice += cart[i].qty * cart[i].price;
  }

  return { totalCount: totalCount, totalPrice: totalPrice };
}

/**
 * Open cart drawer
 */
function openCart() {
  ensureCartDOM();
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('cart-open');
  }
}

/**
 * Close cart drawer
 */
function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('cart-open');
  }
}

/**
 * Toggle cart drawer
 */
function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer && drawer.classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
}

/**
 * Render cart drawer UI and badges
 */
function renderCartUI() {
  ensureCartDOM();
  const cart = getCart();
  const totals = getCartTotals();

  // Update badge counters across page
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(function(badge) {
    badge.textContent = totals.totalCount;
    if (totals.totalCount > 0) {
      badge.style.display = 'inline-flex';
    } else {
      badge.textContent = '0';
    }
  });

  const countHeader = document.getElementById('cart-header-count');
  if (countHeader) {
    countHeader.textContent = totals.totalCount + (totals.totalCount === 1 ? ' item' : ' items');
  }

  const itemsContainer = document.getElementById('cart-items-container');
  const emptyView = document.getElementById('cart-empty-view');
  const footerView = document.getElementById('cart-footer-view');
  const subtotalEl = document.getElementById('cart-subtotal-price');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    if (emptyView) emptyView.style.display = 'flex';
    if (itemsContainer) itemsContainer.style.display = 'none';
    if (footerView) footerView.style.display = 'none';
  } else {
    if (emptyView) emptyView.style.display = 'none';
    if (itemsContainer) itemsContainer.style.display = 'block';
    if (footerView) footerView.style.display = 'block';

    if (subtotalEl) {
      subtotalEl.textContent = 'KSh ' + totals.totalPrice.toLocaleString();
    }

    // Build items using DOM-safe construction
    let html = '';
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const itemTotal = item.price * item.qty;
      html += 
        '<div class="cart-item" data-id="' + escapeHTML(item.id) + '">' +
          '<div class="cart-item-img-wrap">' +
            '<img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.name) + '" loading="lazy" />' +
          '</div>' +
          '<div class="cart-item-details">' +
            '<div class="cart-item-cat">' + escapeHTML(item.category) + '</div>' +
            '<h4 class="cart-item-name">' + escapeHTML(item.name) + '</h4>' +
            '<div class="cart-item-seller">Seller: ' + escapeHTML(item.seller || 'Student') + '</div>' +
            '<div class="cart-item-price">KSh ' + item.price.toLocaleString() + '</div>' +
            '<div class="cart-item-bottom">' +
              '<div class="cart-qty-stepper">' +
                '<button type="button" class="btn-step btn-step-dec" data-id="' + escapeHTML(item.id) + '" aria-label="Decrease quantity">−</button>' +
                '<span class="qty-number">' + item.qty + '</span>' +
                '<button type="button" class="btn-step btn-step-inc" data-id="' + escapeHTML(item.id) + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<div class="cart-item-total">KSh ' + itemTotal.toLocaleString() + '</div>' +
              '<button type="button" class="btn-remove-item" data-id="' + escapeHTML(item.id) + '" aria-label="Remove item" title="Remove listing">🗑️</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    itemsContainer.innerHTML = html;
  }
}

/**
 * Toast notifications
 */
function showCartToast(title, message) {
  const container = document.getElementById('cart-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.innerHTML = 
    '<div class="toast-content">' +
      '<div class="toast-title">' + escapeHTML(title) + '</div>' +
      '<div class="toast-msg">' + escapeHTML(message) + '</div>' +
    '</div>' +
    '<div class="toast-actions">' +
      '<button type="button" class="btn-toast-view">View Cart</button>' +
      '<button type="button" class="btn-toast-close" aria-label="Close">✕</button>' +
    '</div>';

  container.appendChild(toast);

  const viewBtn = toast.querySelector('.btn-toast-view');
  if (viewBtn) {
    viewBtn.addEventListener('click', openCart);
  }

  let dismissTimer = setTimeout(function() {
    removeToast(toast);
  }, 4500);

  const closeBtn = toast.querySelector('.btn-toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      clearTimeout(dismissTimer);
      removeToast(toast);
    });
  }

  function removeToast(t) {
    t.classList.add('hiding');
    setTimeout(function() {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 300);
  }
}

/**
 * Campus Checkout modal
 */
function openCheckoutModal() {
  closeCart();
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  const cart = getCart();
  const totals = getCartTotals();

  if (cart.length === 0) {
    showCartToast('Cart Empty', 'Please add items to your cart before proceeding to checkout.');
    return;
  }

  if (modalOverlay) {
    const summaryEl = document.getElementById('checkout-summary-list');
    const totalEl = document.getElementById('checkout-total-price');

    if (summaryEl) {
      let listHtml = '';
      cart.forEach(function(item) {
        listHtml += 
          '<div class="checkout-summary-row">' +
            '<span>' + item.qty + '× ' + escapeHTML(item.name) + '</span>' +
            '<strong>KSh ' + (item.price * item.qty).toLocaleString() + '</strong>' +
          '</div>';
      });
      summaryEl.innerHTML = listHtml;
    }

    if (totalEl) {
      totalEl.textContent = 'KSh ' + totals.totalPrice.toLocaleString();
    }

    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
  }
}

function closeCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

function handleCheckoutSubmit(e) {
  if (e) e.preventDefault();

  const phoneInput = document.getElementById('checkout-phone');
  const pickupSelect = document.getElementById('checkout-location');

  const phone = phoneInput ? phoneInput.value.trim() : '';
  const pickup = pickupSelect ? pickupSelect.value : 'Student Center Plaza';

  if (!phone || phone.length < 8) {
    alert('Please enter a valid student phone or WhatsApp number so sellers can coordinate meetup timing.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const orderNum = 'CM-' + Math.floor(10000 + Math.random() * 90000);
  const cart = getCart();
  const totals = getCartTotals();

  const modalBody = document.getElementById('checkout-modal-body');
  if (modalBody) {
    modalBody.innerHTML = 
      '<div class="checkout-success-view">' +
        '<div class="success-icon-badge">🎉</div>' +
        '<h2>Order Reserved Successfully!</h2>' +
        '<p class="order-code">Reservation ID: <strong>#' + orderNum + '</strong></p>' +
        '<p class="order-intro">Your items have been reserved. The student sellers have been notified via the CampusMarket dispatch system.</p>' +
        '<div class="order-receipt-card">' +
          '<div class="receipt-row"><span>Pickup Location:</span><strong>' + escapeHTML(pickup) + '</strong></div>' +
          '<div class="receipt-row"><span>Contact Phone:</span><strong>' + escapeHTML(phone) + '</strong></div>' +
          '<div class="receipt-row"><span>Total Due at Meetup:</span><strong>KSh ' + totals.totalPrice.toLocaleString() + '</strong></div>' +
          '<div class="receipt-row"><span>Payment:</span><strong>Cash / M-Pesa on Delivery</strong></div>' +
        '</div>' +
        '<p class="safety-tip">💡 <strong>Safety Tip:</strong> Always meet in public campus zones during daylight hours (e.g. Library foyer, Student Center). Inspect items before completing payment.</p>' +
        '<button type="button" class="btn btn-primary btn-block" id="btn-finish-order">Done &amp; Continue Browsing</button>' +
      '</div>';
    
    const finishBtn = document.getElementById('btn-finish-order');
    if (finishBtn) {
      finishBtn.addEventListener('click', finishOrder);
    }
  }

  saveCart([]);
}

function finishOrder() {
  closeCheckoutModal();
  setTimeout(function() {
    const modalBody = document.getElementById('checkout-modal-body');
    if (modalBody) {
      modalBody.innerHTML = buildCheckoutModalTemplate();
      bindCheckoutForm();
    }
  }, 400);
}

function buildCheckoutModalTemplate() {
  return (
    '<div class="checkout-modal-header">' +
      '<h3>Campus Meetup &amp; Checkout</h3>' +
      '<button type="button" class="btn-modal-close" id="btn-modal-close-x" aria-label="Close checkout">✕</button>' +
    '</div>' +
    '<form id="checkout-form">' +
      '<div class="checkout-summary-box">' +
        '<div class="summary-label">Order Items:</div>' +
        '<div id="checkout-summary-list" class="checkout-summary-list"></div>' +
        '<div class="checkout-total-row">' +
          '<span>Total Amount:</span>' +
          '<strong id="checkout-total-price">KSh 0</strong>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="checkout-location">Campus Meetup Location *</label>' +
        '<select id="checkout-location" class="form-control" required>' +
          '<option value="Student Center Plaza">Student Center Plaza (Main Entrance)</option>' +
          '<option value="University Main Library">University Main Library Foyer</option>' +
          '<option value="Science Complex Quad">Science Complex Quad</option>' +
          '<option value="Hostels / Residence Hall 1 Gate">Hostels / Hall 1 Main Gate</option>' +
          '<option value="Cafeteria Courtyard">Campus Cafeteria Courtyard</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="checkout-phone">Your Phone / WhatsApp Number *</label>' +
        '<input type="tel" id="checkout-phone" class="form-control" placeholder="e.g. 0712 345 678" required />' +
        '<small class="form-hint">Sellers will text or call you to coordinate meetup timing.</small>' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="checkout-notes">Special Instructions (Optional)</label>' +
        '<input type="text" id="checkout-notes" class="form-control" placeholder="e.g. Available after 3:00 PM outside library" />' +
      '</div>' +
      '<div class="checkout-actions">' +
        '<button type="submit" class="btn btn-primary btn-block">Confirm Reservation &amp; Meetup →</button>' +
        '<button type="button" class="btn btn-secondary btn-block" id="btn-modal-cancel">Cancel</button>' +
      '</div>' +
    '</form>'
  );
}

function bindCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleCheckoutSubmit);
  }
  const closeX = document.getElementById('btn-modal-close-x');
  if (closeX) {
    closeX.addEventListener('click', closeCheckoutModal);
  }
  const cancelBtn = document.getElementById('btn-modal-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeCheckoutModal);
  }
}

/**
 * Ensures Cart Drawer, Toast Container, and Checkout Modal elements exist in DOM
 */
function ensureCartDOM() {
  if (document.getElementById('cart-drawer')) return;

  // 1. Toast Container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'cart-toast-container';
  toastContainer.className = 'cart-toast-container';
  toastContainer.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastContainer);

  // 2. Cart Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'cart-backdrop';
  backdrop.className = 'cart-backdrop';
  backdrop.addEventListener('click', closeCart);
  document.body.appendChild(backdrop);

  // 3. Cart Drawer
  const drawer = document.createElement('aside');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-label', 'Shopping Cart');
  drawer.innerHTML = 
    '<div class="cart-drawer-header">' +
      '<div class="cart-title-row">' +
        '<h3>🛒 Your Cart</h3>' +
        '<span class="cart-header-count" id="cart-header-count">0 items</span>' +
      '</div>' +
      '<button type="button" class="btn-drawer-close" id="btn-drawer-close" aria-label="Close Cart">✕</button>' +
    '</div>' +
    '<div class="cart-drawer-body">' +
      '<div id="cart-empty-view" class="cart-empty-view">' +
        '<div class="empty-cart-icon">🛒</div>' +
        '<h4>Your cart is currently empty</h4>' +
        '<p>Explore the student marketplace to find textbooks, electronics, clothing, and gear.</p>' +
        '<a href="catalog.html" class="btn btn-primary" id="btn-empty-browse">Browse Listings →</a>' +
      '</div>' +
      '<div id="cart-items-container" class="cart-items-container"></div>' +
    '</div>' +
    '<div id="cart-footer-view" class="cart-drawer-footer">' +
      '<div class="cart-perks-badge">' +
        '<span>🎓 Free On-Campus Meetup</span>' +
        '<span>🤝 Pay on Delivery</span>' +
      '</div>' +
      '<div class="cart-subtotal-row">' +
        '<span>Subtotal:</span>' +
        '<strong id="cart-subtotal-price" class="cart-subtotal-price">KSh 0</strong>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-block btn-checkout" id="btn-proceed-checkout">' +
        'Proceed to Meetup Checkout →' +
      '</button>' +
      '<div class="cart-footer-actions">' +
        '<button type="button" class="btn-cart-clear" id="btn-clear-cart">Empty Cart</button>' +
        '<button type="button" class="btn-cart-continue" id="btn-continue-shopping">Continue Shopping</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(drawer);

  // Bind drawer buttons via addEventListener
  const drawerCloseBtn = document.getElementById('btn-drawer-close');
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeCart);

  const emptyBrowseBtn = document.getElementById('btn-empty-browse');
  if (emptyBrowseBtn) emptyBrowseBtn.addEventListener('click', closeCart);

  const checkoutBtn = document.getElementById('btn-proceed-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

  const clearCartBtn = document.getElementById('btn-clear-cart');
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

  const continueBtn = document.getElementById('btn-continue-shopping');
  if (continueBtn) continueBtn.addEventListener('click', closeCart);

  // 4. Floating Cart Button
  if (!document.getElementById('floating-cart-btn')) {
    const floatBtn = document.createElement('button');
    floatBtn.type = 'button';
    floatBtn.id = 'floating-cart-btn';
    floatBtn.className = 'btn-floating-cart';
    floatBtn.setAttribute('aria-label', 'Open Shopping Cart');
    floatBtn.setAttribute('title', 'View Cart');
    floatBtn.innerHTML = 
      '<span class="float-cart-icon">🛒</span>' +
      '<span class="cart-badge float-badge">0</span>';
    floatBtn.addEventListener('click', toggleCart);
    document.body.appendChild(floatBtn);
  }

  // 5. Checkout Modal Overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'checkout-modal-overlay';
  modalOverlay.className = 'checkout-modal-overlay';
  modalOverlay.innerHTML = 
    '<div class="checkout-modal-card" id="checkout-modal-body">' +
      buildCheckoutModalTemplate() +
    '</div>';
  
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      closeCheckoutModal();
    }
  });

  document.body.appendChild(modalOverlay);
  bindCheckoutForm();

  // Keyboard shortcut: Escape key closes active overlays
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeCart();
      closeCheckoutModal();
    }
  });
}

/**
 * Initializes cart buttons and renders saved cart data
 */
function initCartSystem() {
  ensureCartDOM();
  renderCartUI();

  // Cart item delegation (+, -, remove)
  document.addEventListener('click', function(e) {
    const stepDec = e.target.closest('.btn-step-dec');
    const stepInc = e.target.closest('.btn-step-inc');
    const removeBtn = e.target.closest('.btn-remove-item');

    if (stepDec) {
      const id = stepDec.getAttribute('data-id');
      if (id) updateCartQty(id, -1);
    } else if (stepInc) {
      const id = stepInc.getAttribute('data-id');
      if (id) updateCartQty(id, 1);
    } else if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      if (id) removeFromCart(id);
    }
  });
}

/* ============================================================
   PART 6: DOM CONTENT LOADED - GLOBAL EVENT ATTACHMENT
   Zero inline handlers anywhere in HTML (Week 3 Requirement)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  // 1. Live search input (debounced to avoid thread lag)
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    const debouncedFilter = debounce(filterProducts, 180);
    searchInput.addEventListener('input', debouncedFilter);
    searchInput.addEventListener('search', filterProducts);
  }

  // 2. Filter category chips
  const chips = document.querySelectorAll('.chip');
  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      const cat = this.getAttribute('data-filter') || 'all';
      filterCategory(cat, this);
    });
  });

  // 3. Sort selector
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortProducts);
  }

  // 4. Showcase Gallery navigation buttons (Week 4 Slideshow)
  const prevBtn = document.getElementById('showcase-prev-btn');
  const nextBtn = document.getElementById('showcase-next-btn');
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Showcase gallery keyboard arrows
  const showcaseStage = document.getElementById('showcase-stage');
  if (showcaseStage) {
    showcaseStage.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
  }

  // Showcase dots delegation
  const dotsContainer = document.getElementById('showcase-dots');
  if (dotsContainer) {
    dotsContainer.addEventListener('click', function(e) {
      const dot = e.target.closest('.showcase-dot');
      if (dot) {
        const slideIdx = parseInt(dot.getAttribute('data-slide-index'), 10);
        if (!isNaN(slideIdx) && activeFilteredProducts && activeFilteredProducts.length > 0) {
          currentSlideIndex = slideIdx;
          updateShowcaseGallery(activeFilteredProducts);
        }
      }
    });
  }

  // 5. Quantity Steppers and Live Calculations (Weeks 2 & 3 Integration)
  document.addEventListener('click', function(e) {
    const decBtn = e.target.closest('.btn-qty-dec');
    const incBtn = e.target.closest('.btn-qty-inc');
    if (decBtn) {
      const targetId = decBtn.getAttribute('data-target');
      const price = parseFloat(decBtn.getAttribute('data-price')) || 0;
      const outputId = decBtn.getAttribute('data-output');
      const errorId = decBtn.getAttribute('data-error');
      changeQty(targetId, -1, price, outputId, errorId);
    } else if (incBtn) {
      const targetId = incBtn.getAttribute('data-target');
      const price = parseFloat(incBtn.getAttribute('data-price')) || 0;
      const outputId = incBtn.getAttribute('data-output');
      const errorId = incBtn.getAttribute('data-error');
      changeQty(targetId, 1, price, outputId, errorId);
    }
  });

  // Quantity input real-time validation & calculation
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('calc-qty-input')) {
      const price = parseFloat(e.target.getAttribute('data-price')) || 0;
      const outputId = e.target.getAttribute('data-output');
      const errorId = e.target.getAttribute('data-error');
      calculateProductTotal(e.target, price, outputId, errorId);
    }
  });

  // 6. Add to Cart & Buy Now Buttons (Pure addEventListener via delegation)
  document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.btn-add-to-cart');
    const buyBtn = e.target.closest('.btn-buy-now');
    const headerCartBtn = e.target.closest('#header-cart-btn, .btn-cart-header, [data-cart-toggle]');

    if (addBtn) {
      const productId = addBtn.getAttribute('data-product');
      const qtyInputId = addBtn.getAttribute('data-qty-input');
      const staticQty = addBtn.getAttribute('data-qty');
      const qty = qtyInputId ? qtyInputId : (staticQty ? parseInt(staticQty, 10) : 1);
      if (productId) addToCart(productId, qty);
    } else if (buyBtn) {
      const productId = buyBtn.getAttribute('data-product');
      const qtyInputId = buyBtn.getAttribute('data-qty-input');
      if (productId) {
        addToCart(productId, qtyInputId || 1);
        openCheckoutModal();
      }
    } else if (headerCartBtn) {
      toggleCart();
    }
  });

  // 7. Initial hash handling
  handleUrlHash();
  window.addEventListener('hashchange', handleUrlHash);

  // 8. Initialize Registration Form Validation
  initRegistrationForm();

  // 9. Initialize Shopping Cart System
  initCartSystem();

  // 10. Initial Gallery Synchronization on Catalog Page
  if (document.getElementById('products-grid')) {
    filterProducts();
  }
});
