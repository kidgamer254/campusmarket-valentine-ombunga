/**
 * CampusMarket — Client-side Behavior
 * File: app.js
 * Standard: Modern ECMAScript (Strictly using 'let' and 'const' for predictable block scoping)
 * 
 * Features:
 * 1. Live Filtering & Search:
 *    - Real-time text search across product names, categories, and descriptions.
 *    - Category filter chips (All, Textbooks, Electronics, Clothing, Furniture, Sports, Stationery).
 *    - URL hash navigation (e.g. #books, #electronics) for links from the home page.
 *    - Uses a `for` loop to inspect every product card.
 *    - Uses `if / else` decision logic to determine visibility.
 * 
 * 2. Live Price & Quantity Calculation:
 *    - Quantity input multiplied live by item price.
 *    - Real-time running subtotal display as quantity changes.
 *    - Uses `if / else` decision logic to validate inputs and handle edge cases.
 * 
 * 3. Registration Form Validation & Interactive UI:
 *    - Attached exclusively with `addEventListener` (no inline onclick).
 *    - Prevents page reload with `event.preventDefault()`.
 *    - Validates required fields, email format regex, and password matching rule.
 *    - Interactive show/hide password toggle.
 *    - Real-time feedback messages.
 */

// Track the currently selected category (default: 'all')
let currentCategory = 'all';

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
    // If called programmatically, find the matching button
    const matchingChip = document.querySelector('[data-filter="' + currentCategory + '"]');
    if (matchingChip) {
      matchingChip.classList.add('active');
    } else {
      const allChip = document.getElementById('filter-all');
      if (allChip) {
        allChip.classList.add('active');
      }
    }
  }

  // Re-run filtering across all products
  filterProducts();
}

/**
 * Filter the product grid based on the current search query and selected category.
 * Demonstrates:
 * 1. A loop traversing the product list.
 * 2. if / else decision logic.
 */
function filterProducts() {
  const searchInput = document.getElementById('catalog-search');
  let query = '';
  if (searchInput && searchInput.value) {
    query = searchInput.value.toLowerCase().trim();
  }

  const productCards = document.querySelectorAll('.product-card');
  let visibleCount = 0;

  // Requirement: At least one function uses a loop to go through the product list
  for (let i = 0; i < productCards.length; i++) {
    const card = productCards[i];

    // Read category from data attribute or fallback to inner category element
    let cardCat = card.getAttribute('data-category') || '';
    if (!cardCat) {
      const catEl = card.querySelector('.product-category');
      cardCat = catEl ? catEl.textContent : '';
    }
    cardCat = cardCat.toLowerCase().trim();

    // Read product name and description for text search
    const nameEl = card.querySelector('.product-name');
    const descEl = card.querySelector('.product-desc');
    const productName = nameEl ? nameEl.textContent.toLowerCase() : '';
    const productDesc = descEl ? descEl.textContent.toLowerCase() : '';

    // Requirement: At least one function uses if / else to make a decision
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
    } else {
      card.style.display = 'none';
    }
  }

  // Update results counter & empty state
  updateResultsBar(visibleCount, query);
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

  // If no products match, show an informative empty-state message
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
        '<button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>';
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

/**
 * Calculates live running total for a product based on quantity
 * Requirement:
 * - Multiplied live by its price, showing a running total as the quantity changes
 * - Uses if / else to make decisions
 * 
 * @param {string|HTMLInputElement} inputElementOrId - The input element or its ID
 * @param {number} unitPrice - The unit price of the item
 * @param {string} outputElementId - The ID of the element to display the total
 */
function calculateProductTotal(inputElementOrId, unitPrice, outputElementId) {
  let inputEl;
  if (typeof inputElementOrId === 'string') {
    inputEl = document.getElementById(inputElementOrId);
  } else {
    inputEl = inputElementOrId;
  }

  const outputEl = document.getElementById(outputElementId);
  if (!inputEl || !outputEl) {
    return;
  }

  const qty = parseInt(inputEl.value, 10);

  // Requirement: uses if / else to make a decision
  if (isNaN(qty) || qty <= 0) {
    outputEl.textContent = 'KSh 0';
    outputEl.style.color = '#dc2626'; // Highlight error
  } else if (qty > 99) {
    // Cap quantity if unreasonably high
    inputEl.value = 99;
    const maxTotal = 99 * unitPrice;
    outputEl.textContent = 'KSh ' + maxTotal.toLocaleString();
    outputEl.style.color = '';
  } else {
    const total = qty * unitPrice;
    outputEl.textContent = 'KSh ' + total.toLocaleString();
    outputEl.style.color = '';
  }
}

/**
 * Helper to adjust quantity with +/- buttons
 * @param {string} inputId - ID of the quantity input
 * @param {number} delta - Amount to change (+1 or -1)
 * @param {number} unitPrice - Unit price of the item
 * @param {string} outputId - ID of the total display element
 */
function changeQty(inputId, delta, unitPrice, outputId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  let currentVal = parseInt(inputEl.value, 10);
  if (isNaN(currentVal)) {
    currentVal = 1;
  }

  let newVal = currentVal + delta;
  if (newVal < 1) {
    newVal = 1;
  }

  inputEl.value = newVal;
  calculateProductTotal(inputEl, unitPrice, outputId);
}

/**
 * Utility: Escape HTML for safe rendering in messages
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, function(tag) {
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

  // Map hash aliases to category names
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

/**
 * Sort products by price (Low to High, High to Low) or original order
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

  // Re-append cards to grid in sorted order using a loop
  for (let i = 0; i < cards.length; i++) {
    grid.appendChild(cards[i]);
  }
}

/* ============================================================
   REGISTRATION FORM VALIDATION & INTERACTIVE UI (PART 3)
   ============================================================ */

/**
 * Initializes registration form validation and interactive behaviors
 * All events are attached exclusively via addEventListener (no onclick).
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

  // Helper to show/clear field error
  function setError(inputEl, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (inputEl) {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    return false;
  }

  function setValid(inputEl, errorId) {
    const errorEl = document.getElementById(errorId);
    if (inputEl) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
    return true;
  }

  // 1. Required Check: Full Name cannot be empty
  function validateName() {
    const val = nameInput ? nameInput.value.trim() : '';
    if (val === '') {
      return setError(nameInput, 'name-error', 'Full Name is required and cannot be empty.');
    } else if (val.length < 2) {
      return setError(nameInput, 'name-error', 'Name must be at least 2 characters.');
    } else {
      return setValid(nameInput, 'name-error');
    }
  }

  // 2. Format Check: Valid Email syntax
  function validateEmail() {
    const val = emailInput ? emailInput.value.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (val === '') {
      return setError(emailInput, 'email-error', 'University email is required.');
    } else if (!emailRegex.test(val)) {
      return setError(emailInput, 'email-error', 'Please enter a valid email format (e.g. name@university.edu).');
    } else {
      return setValid(emailInput, 'email-error');
    }
  }

  // Campus selection required check
  function validateCampus() {
    const val = campusSelect ? campusSelect.value : '';
    if (val === '') {
      return setError(campusSelect, 'campus-error', 'Please select your campus.');
    } else {
      return setValid(campusSelect, 'campus-error');
    }
  }

  // Password requirement (min 6 characters)
  function validatePassword() {
    const val = passwordInput ? passwordInput.value : '';
    if (val === '') {
      return setError(passwordInput, 'password-error', 'Password is required.');
    } else if (val.length < 6) {
      return setError(passwordInput, 'password-error', 'Password must be at least 6 characters long.');
    } else {
      return setValid(passwordInput, 'password-error');
    }
  }

  // 3. Custom Rule: Passwords must match
  function validateConfirmPassword() {
    const pwVal = passwordInput ? passwordInput.value : '';
    const confirmVal = confirmInput ? confirmInput.value : '';
    if (confirmVal === '') {
      return setError(confirmInput, 'confirm-error', 'Please confirm your password.');
    } else if (confirmVal !== pwVal) {
      return setError(confirmInput, 'confirm-error', 'Passwords do not match. Please re-enter.');
    } else {
      return setValid(confirmInput, 'confirm-error');
    }
  }

  // Terms and conditions required checkbox
  function validateTerms() {
    const checked = termsCheckbox ? termsCheckbox.checked : false;
    if (!checked) {
      return setError(null, 'terms-error', 'You must agree to the safety guidelines to register.');
    } else {
      return setValid(null, 'terms-error');
    }
  }

  // ─── INTERACTIVE UI ELEMENT: Show / Hide Password Toggle ───
  // Attached strictly using addEventListener
  if (togglePwBtn && passwordInput) {
    togglePwBtn.addEventListener('click', function() {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      const newType = isPassword ? 'text' : 'password';

      passwordInput.setAttribute('type', newType);
      if (confirmInput) {
        confirmInput.setAttribute('type', newType);
      }

      const iconEl = togglePwBtn.querySelector('.toggle-icon');
      const textEl = togglePwBtn.querySelector('.toggle-text');
      if (iconEl) iconEl.textContent = isPassword ? '🙈' : '👁️';
      if (textEl) textEl.textContent = isPassword ? 'Hide' : 'Show';
    });
  }

  // ─── Real-time Live Validation Listeners (addEventListener) ───
  if (nameInput) {
    nameInput.addEventListener('input', validateName);
    nameInput.addEventListener('blur', validateName);
  }
  if (emailInput) {
    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);
  }
  if (campusSelect) {
    campusSelect.addEventListener('change', validateCampus);
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      validatePassword();
      if (confirmInput && confirmInput.value !== '') {
        validateConfirmPassword();
      }
    });
  }
  if (confirmInput) {
    confirmInput.addEventListener('input', validateConfirmPassword);
    confirmInput.addEventListener('blur', validateConfirmPassword);
  }
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', validateTerms);
  }

  // ─── Form Submission via addEventListener with event.preventDefault() ───
  form.addEventListener('submit', function(event) {
    // Requirement: Use event.preventDefault() so the page does not reload
    event.preventDefault();

    const validName = validateName();
    const validEmail = validateEmail();
    const validCampus = validateCampus();
    const validPassword = validatePassword();
    const validConfirm = validateConfirmPassword();
    const validTerms = validateTerms();

    // Check all rules with if / else
    if (validName && validEmail && validCampus && validPassword && validConfirm && validTerms) {
      // ─── Interactive UI Element: Live Success Message ───
      const studentName = nameInput.value.trim();
      feedbackEl.className = 'form-feedback success';
      feedbackEl.style.display = 'block';
      feedbackEl.innerHTML = 
        '🎉 <strong>Registration Successful!</strong><br />' +
        'Welcome to CampusMarket, <strong>' + escapeHTML(studentName) + '</strong>! ' +
        'Your student account has been created. You can now list items and buy from fellow students.';

      // Clear input fields and validation states
      form.reset();
      [nameInput, emailInput, campusSelect, passwordInput, confirmInput].forEach(function(el) {
        if (el) el.classList.remove('is-valid');
      });

      // Scroll smoothly to confirmation
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // ─── Interactive UI Element: Clear Error Notification ───
      feedbackEl.className = 'form-feedback error';
      feedbackEl.style.display = 'block';
      feedbackEl.innerHTML = 
        '⚠️ <strong>Please correct the errors in the form above.</strong><br />' +
        'All required fields must be completed correctly to proceed.';

      // Focus first invalid element
      const firstInvalid = form.querySelector('.is-invalid, input:invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // 1. Hook up live search input
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
    searchInput.addEventListener('search', filterProducts);
  }

  // 2. Hook up filter chips
  const chips = document.querySelectorAll('.chip');
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function() {
      const cat = this.getAttribute('data-filter') || 'all';
      filterCategory(cat, this);
    });
  }

  // 3. Hook up sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortProducts);
  }

  // 4. Hook up initial URL hash (e.g. #books)
  handleUrlHash();
  window.addEventListener('hashchange', handleUrlHash);

  // 5. Initialize registration form behavior
  initRegistrationForm();
});
