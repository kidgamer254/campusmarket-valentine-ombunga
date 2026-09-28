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
 * Debounce: delays execution until `wait` ms have passed since last call.
 * Prevents the search filter from running on every single keystroke.
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
 * Sort products by price (Low to High, High to Low) or original order.
 * Uses requestAnimationFrame to batch DOM writes and avoid jank.
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

  // Batch all DOM writes into a single rAF to avoid layout thrashing
  requestAnimationFrame(function() {
    // Use a DocumentFragment so we only trigger one reflow
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < cards.length; i++) {
      fragment.appendChild(cards[i]);
    }
    grid.appendChild(fragment);
  });
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
  // 1. Hook up live search input — debounced to 200ms to avoid lag on every keystroke
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    const debouncedFilter = debounce(filterProducts, 200);
    searchInput.addEventListener('input', debouncedFilter);
    searchInput.addEventListener('search', filterProducts); // instant on clear/Enter
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

  // 6. Initialize Shopping Cart System
  initCartSystem();
});

/* ============================================================
   CAMPUSMARKET SHOPPING CART SYSTEM
   ============================================================ */

const CART_STORAGE_KEY = 'campusmarket_cart_v1';

// Fallback catalog registry for consistent item metadata
const CATALOG_REGISTRY = {
  'product-calculus': { name: 'Calculus: Early Transcendentals 9e', price: 1200, category: 'Textbooks', image: 'images/calculus textbook.jpg', seller: 'Alice K.' },
  'product-calculus-textbook': { name: 'Calculus: Early Transcendentals 9e', price: 1200, category: 'Textbooks', image: 'images/calculus textbook.jpg', seller: 'Alice K.' },
  'product-lenovo': { name: 'Lenovo IdeaPad 3 — 8GB RAM, 512GB SSD', price: 28000, category: 'Electronics', image: 'images/lenovo.jpg', seller: 'Brian M.' },
  'product-laptop': { name: 'Lenovo IdeaPad 3 — 8GB RAM, 512GB SSD', price: 28000, category: 'Electronics', image: 'images/lenovo.jpg', seller: 'Brian M.' },
  'product-hoodie': { name: 'University Branded Hoodie (Size M)', price: 850, category: 'Clothing', image: 'images/uni hoodie.jpg', seller: 'Carol W.' },
  'product-biology': { name: 'Campbell Biology (11th Edition)', price: 1500, category: 'Textbooks', image: 'images/calculus textbook.jpg', seller: 'David O.' },
  'product-headphones': { name: 'Sony WH-CH520 Wireless Headphones', price: 12500, category: 'Electronics', image: 'images/electronics.jpg', seller: 'Eva N.' },
  'product-chair': { name: 'Ergonomic Study Desk Chair', price: 3200, category: 'Furniture', image: 'images/furniture.jpg', seller: 'Francis K.' },
  'product-football': { name: 'Nike Pitch Football (Size 5)', price: 700, category: 'Sports', image: 'images/sports.jpg', seller: 'George T.' },
  'product-calculator': { name: 'Casio fx-991EX Scientific Calculator', price: 1100, category: 'Stationery', image: 'images/stationery.jpg', seller: 'Hellen A.' },
  'product-jeans': { name: 'Slim-Fit Denim Jeans (Size 32)', price: 1800, category: 'Clothing', image: 'images/clothing.jpg', seller: 'Ian M.' },
  'product-tablet': { name: 'Samsung Galaxy Tab A8 64GB', price: 14000, category: 'Electronics', image: 'images/samsung.jpg', seller: 'Jane D.' },
  'product-physics': { name: 'University Physics with Modern Physics 14e', price: 1000, category: 'Textbooks', image: 'images/physics.jpg', seller: 'Kevin B.' },
  'product-desk-lamp': { name: 'LED Desk Lamp with USB Charging Port', price: 600, category: 'Furniture', image: 'images/furniture.jpg', seller: 'Laura M.' }
};

/**
 * Retrieve current cart from localStorage
 * @returns {Array} List of cart item objects
 */
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse cart storage:', e);
    return [];
  }
}

/**
 * Save cart to localStorage and update UI
 * @param {Array} cart - Updated cart array
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart storage:', e);
  }
  renderCartUI();
}

/**
 * Add product to cart with chosen quantity
 * @param {string} productId - Product card ID or registry key
 * @param {string|number} [qtyOrInputId=1] - Quantity value or input element ID
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

  // Extract metadata from DOM card if present, otherwise fallback to registry
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
      name: 'Campus Item',
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

  // Trigger bounce animation on cart badges
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(function(badge) {
    badge.classList.remove('cart-badge-bounce');
    // Force reflow
    void badge.offsetWidth;
    badge.classList.add('cart-badge-bounce');
  });

  // Display user feedback toast
  showCartToast(
    'Added to Cart! 🛒',
    qty + '× ' + itemData.name + ' (KSh ' + (itemData.price * qty).toLocaleString() + ')'
  );
}

/**
 * Adjust quantity of an item in the cart (+1 or -1)
 * @param {string} productId - Product ID
 * @param {number} delta - Change in quantity
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
 * Remove an item completely from the cart
 * @param {string} productId - Product ID
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
 * Empty the entire cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    saveCart([]);
    showCartToast('Cart Cleared', 'All items have been removed.');
  }
}

/**
 * Calculate total cart price and total item count
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
 * Open the cart drawer
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
 * Close the cart drawer
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
 * Toggle cart drawer state
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
 * Render the cart drawer UI and update all badges
 */
function renderCartUI() {
  ensureCartDOM();
  const cart = getCart();
  const totals = getCartTotals();

  // Update all badge elements across headers and floating triggers
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

    // Build items HTML
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
                '<button type="button" class="btn-step" onclick="updateCartQty(\'' + escapeHTML(item.id) + '\', -1)" aria-label="Decrease quantity">−</button>' +
                '<span class="qty-number">' + item.qty + '</span>' +
                '<button type="button" class="btn-step" onclick="updateCartQty(\'' + escapeHTML(item.id) + '\', 1)" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<div class="cart-item-total">KSh ' + itemTotal.toLocaleString() + '</div>' +
              '<button type="button" class="btn-remove-item" onclick="removeFromCart(\'' + escapeHTML(item.id) + '\')" aria-label="Remove item" title="Remove listing">🗑️</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    itemsContainer.innerHTML = html;
  }
}

/**
 * Show a modern floating toast notification
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
      '<button type="button" class="btn-toast-view" onclick="openCart()">View Cart</button>' +
      '<button type="button" class="btn-toast-close" aria-label="Close">✕</button>' +
    '</div>';

  container.appendChild(toast);

  // Auto-dismiss after 4.5 seconds
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
 * Opens the campus checkout modal
 */
function openCheckoutModal() {
  closeCart();
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  const cart = getCart();
  const totals = getCartTotals();

  if (cart.length === 0) {
    alert('Your cart is empty! Add items before checking out.');
    return;
  }

  if (modalOverlay) {
    // Populate order summary in modal
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

/**
 * Closes the campus checkout modal
 */
function closeCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

/**
 * Submits the checkout and displays the order confirmation screen
 */
function handleCheckoutSubmit(e) {
  if (e) e.preventDefault();

  const phoneInput = document.getElementById('checkout-phone');
  const pickupSelect = document.getElementById('checkout-location');
  const notesInput = document.getElementById('checkout-notes');

  const phone = phoneInput ? phoneInput.value.trim() : '';
  const pickup = pickupSelect ? pickupSelect.value : 'Student Center Plaza';

  if (!phone || phone.length < 8) {
    alert('Please enter a valid phone or WhatsApp number so the student sellers can coordinate meetup.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const orderNum = 'CM-' + Math.floor(10000 + Math.random() * 90000);
  const cart = getCart();
  const totals = getCartTotals();

  // Show confirmation view
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
        '<button type="button" class="btn btn-primary btn-block" onclick="finishOrder()">Done &amp; Continue Browsing</button>' +
      '</div>';
  }

  // Clear cart storage
  saveCart([]);
}

/**
 * Resets modal and finishes order
 */
function finishOrder() {
  closeCheckoutModal();
  setTimeout(function() {
    // Rebuild default checkout modal structure
    const modalBody = document.getElementById('checkout-modal-body');
    if (modalBody) {
      modalBody.innerHTML = buildCheckoutModalTemplate();
    }
  }, 400);
}

/**
 * Generates the HTML template for checkout form
 */
function buildCheckoutModalTemplate() {
  return (
    '<div class="checkout-modal-header">' +
      '<h3>Campus Meetup &amp; Checkout</h3>' +
      '<button type="button" class="btn-modal-close" onclick="closeCheckoutModal()" aria-label="Close checkout">✕</button>' +
    '</div>' +
    '<form id="checkout-form" onsubmit="handleCheckoutSubmit(event)">' +
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
        '<button type="button" class="btn btn-secondary btn-block" onclick="closeCheckoutModal()">Cancel</button>' +
      '</div>' +
    '</form>'
  );
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
      '<button type="button" class="btn-drawer-close" onclick="closeCart()" aria-label="Close Cart">✕</button>' +
    '</div>' +
    '<div class="cart-drawer-body">' +
      '<div id="cart-empty-view" class="cart-empty-view">' +
        '<div class="empty-cart-icon">🛒</div>' +
        '<h4>Your cart is currently empty</h4>' +
        '<p>Explore the student marketplace to find textbooks, electronics, clothing, and gear.</p>' +
        '<a href="catalog.html" class="btn btn-primary" onclick="closeCart()">Browse Listings →</a>' +
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
      '<button type="button" class="btn btn-primary btn-block btn-checkout" onclick="openCheckoutModal()">' +
        'Proceed to Meetup Checkout →' +
      '</button>' +
      '<div class="cart-footer-actions">' +
        '<button type="button" class="btn-cart-clear" onclick="clearCart()">Empty Cart</button>' +
        '<button type="button" class="btn-cart-continue" onclick="closeCart()">Continue Shopping</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(drawer);

  // 4. Floating Cart Button (visible on mobile / desktop when scrolled)
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
  
  // Close modal when clicking backdrop
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      closeCheckoutModal();
    }
  });

  document.body.appendChild(modalOverlay);

  // Keyboard shortcut: Escape closes cart or modal
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

  // Attach click listeners to any header cart button elements
  const cartButtons = document.querySelectorAll('.cart-toggle-btn, [data-cart-toggle]');
  cartButtons.forEach(function(btn) {
    btn.addEventListener('click', toggleCart);
  });
}
