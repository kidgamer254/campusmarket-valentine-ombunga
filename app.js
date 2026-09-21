/**
 * CampusMarket — Client-side Behavior (Part 2)
 * File: app.js
 * 
 * Features:
 * 1. Live Filtering & Search:
 *    - Real-time text search across product names, categories, and descriptions.
 *    - Category filter chips (All, Textbooks, Electronics, Clothing, Furniture, Sports, Stationery).
 *    - URL hash support (e.g. #books, #electronics) for smooth category links from home page.
 *    - Uses a `for` loop to inspect every product card.
 *    - Uses `if / else` decision logic to determine visibility.
 * 
 * 2. Live Price & Quantity Calculation:
 *    - Quantity input multiplied live by item price.
 *    - Real-time running subtotal display as quantity changes.
 *    - Uses `if / else` decision logic to validate inputs and handle edge cases.
 */

// Track the currently selected category (default: 'all')
var currentCategory = 'all';

/**
 * Filter products by category when a chip is clicked
 * @param {string} category - Category slug ('all', 'textbooks', 'electronics', etc.)
 * @param {HTMLElement} [btnElement] - The button that was clicked
 */
function filterCategory(category, btnElement) {
  currentCategory = (category || 'all').toLowerCase();

  // Update active styling on filter chips using a loop
  var chips = document.querySelectorAll('.chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.remove('active');
  }

  if (btnElement) {
    btnElement.classList.add('active');
  } else {
    // If called programmatically, find the matching button
    var matchingChip = document.querySelector('[data-filter="' + currentCategory + '"]');
    if (matchingChip) {
      matchingChip.classList.add('active');
    } else {
      var allChip = document.getElementById('filter-all');
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
  var searchInput = document.getElementById('catalog-search');
  var query = '';
  if (searchInput && searchInput.value) {
    query = searchInput.value.toLowerCase().trim();
  }

  var productCards = document.querySelectorAll('.product-card');
  var visibleCount = 0;

  // Requirement: At least one function uses a loop to go through the product list
  for (var i = 0; i < productCards.length; i++) {
    var card = productCards[i];

    // Read category from data attribute or fallback to inner category element
    var cardCat = card.getAttribute('data-category') || '';
    if (!cardCat) {
      var catEl = card.querySelector('.product-category');
      cardCat = catEl ? catEl.textContent : '';
    }
    cardCat = cardCat.toLowerCase().trim();

    // Read product name and description for text search
    var nameEl = card.querySelector('.product-name');
    var descEl = card.querySelector('.product-desc');
    var productName = nameEl ? nameEl.textContent.toLowerCase() : '';
    var productDesc = descEl ? descEl.textContent.toLowerCase() : '';

    // Requirement: At least one function uses if / else to make a decision
    var matchesCategory = false;
    if (currentCategory === 'all') {
      matchesCategory = true;
    } else if (cardCat.indexOf(currentCategory) !== -1 || currentCategory.indexOf(cardCat) !== -1) {
      matchesCategory = true;
    } else {
      matchesCategory = false;
    }

    var matchesSearch = false;
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
  var resultsBar = document.querySelector('.catalog-results-bar');
  var emptyState = document.getElementById('catalog-empty-state');
  var grid = document.getElementById('products-grid');

  if (resultsBar) {
    var textP = resultsBar.querySelector('p');
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

  // If no products match, show a helpful empty-state message
  if (count === 0) {
    if (!emptyState && grid) {
      emptyState = document.createElement('div');
      emptyState.id = 'catalog-empty-state';
      emptyState.className = 'catalog-empty-state';
      grid.parentNode.insertBefore(emptyState, grid.nextSibling);
    }
    if (emptyState) {
      emptyState.style.display = 'block';
      var hint = query ? 'matching "' + escapeHTML(query) + '"' : 'in this category';
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
  var searchInput = document.getElementById('catalog-search');
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
  var inputEl;
  if (typeof inputElementOrId === 'string') {
    inputEl = document.getElementById(inputElementOrId);
  } else {
    inputEl = inputElementOrId;
  }

  var outputEl = document.getElementById(outputElementId);
  if (!inputEl || !outputEl) {
    return;
  }

  var qty = parseInt(inputEl.value, 10);

  // Requirement: uses if / else to make a decision
  if (isNaN(qty) || qty <= 0) {
    outputEl.textContent = 'KSh 0';
    outputEl.style.color = '#dc2626'; // Highlight error
  } else if (qty > 99) {
    // Cap quantity if unreasonably high
    inputEl.value = 99;
    var maxTotal = 99 * unitPrice;
    outputEl.textContent = 'KSh ' + maxTotal.toLocaleString();
    outputEl.style.color = '';
  } else {
    var total = qty * unitPrice;
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
  var inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  var currentVal = parseInt(inputEl.value, 10);
  if (isNaN(currentVal)) {
    currentVal = 1;
  }

  var newVal = currentVal + delta;
  if (newVal < 1) {
    newVal = 1;
  }

  inputEl.value = newVal;
  calculateProductTotal(inputEl, unitPrice, outputId);
}

/**
 * Utility: Escape HTML for safe rendering in empty state message
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
  var hash = window.location.hash.toLowerCase().replace('#', '');
  if (!hash) return;

  // Map hash aliases to category names
  var hashToCat = {
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
    var targetCat = hashToCat[hash];
    var chip = document.querySelector('[data-filter="' + targetCat + '"]');
    filterCategory(targetCat, chip);
  }
}

/**
 * Sort products by price (Low to High, High to Low) or original order
 */
function sortProducts() {
  var sortSelect = document.getElementById('sort-select');
  var grid = document.getElementById('products-grid');
  if (!sortSelect || !grid) return;

  var sortVal = sortSelect.value;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));

  // Sort based on selected option using if / else
  if (sortVal === 'price-asc') {
    cards.sort(function(a, b) {
      var priceA = parseFloat(a.getAttribute('data-price')) || 0;
      var priceB = parseFloat(b.getAttribute('data-price')) || 0;
      return priceA - priceB;
    });
  } else if (sortVal === 'price-desc') {
    cards.sort(function(a, b) {
      var priceA = parseFloat(a.getAttribute('data-price')) || 0;
      var priceB = parseFloat(b.getAttribute('data-price')) || 0;
      return priceB - priceA;
    });
  }

  // Re-append cards to grid in sorted order using a loop
  for (var i = 0; i < cards.length; i++) {
    grid.appendChild(cards[i]);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // 1. Hook up live search input
  var searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
    searchInput.addEventListener('search', filterProducts);
  }

  // 2. Hook up filter chips
  var chips = document.querySelectorAll('.chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function() {
      var cat = this.getAttribute('data-filter') || 'all';
      filterCategory(cat, this);
    });
  }

  // 3. Hook up sort select
  var sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', sortProducts);
  }

  // 4. Hook up initial URL hash (e.g. #books)
  handleUrlHash();
  window.addEventListener('hashchange', handleUrlHash);
});

