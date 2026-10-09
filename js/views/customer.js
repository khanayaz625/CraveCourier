/**
 * FeastFlow - Customer View Module
 * Renders restaurant listings, food catalog, live search/filters,
 * dish customization modal, and interactive live order tracker.
 */

const CustomerView = {
  currentCategory: 'All',
  searchQuery: '',
  filterVegOnly: false,
  activeTrackingOrderId: null,
  mapAnimInterval: null,

  init() {
    this.bindEvents();
    this.renderCategories();
    this.renderRestaurants();
    this.renderDishes();
    this.renderCustomerOrders();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('search-food-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderDishes();
      });
    }

    // Pure Veg Toggle
    const vegToggle = document.getElementById('toggle-veg-only');
    if (vegToggle) {
      vegToggle.addEventListener('change', (e) => {
        this.filterVegOnly = e.target.checked;
        this.renderDishes();
      });
    }

    // Modal close listeners
    const dishModal = document.getElementById('dish-detail-modal');
    if (dishModal) {
      dishModal.addEventListener('click', (e) => {
        if (e.target === dishModal) this.closeDishModal();
      });
    }

    const orderModal = document.getElementById('order-tracking-modal');
    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) this.closeOrderTracker();
      });
    }

    // Listen for DB updates
    window.addEventListener('dishes-updated', () => this.renderDishes());
    window.addEventListener('orders-updated', () => {
      this.renderCustomerOrders();
      if (this.activeTrackingOrderId) {
        this.updateTrackingModalContent(this.activeTrackingOrderId);
      }
    });
  },

  renderCategories() {
    const categories = ['All', 'Burgers', 'Pizza', 'Asian', 'Biryani', 'Healthy', 'Pasta', 'Desserts', 'Beverages'];
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
      <button class="category-chip ${this.currentCategory === cat ? 'active' : ''}" onclick="CustomerView.setCategory('${cat}')">
        <span>${this.getCategoryEmoji(cat)}</span>
        <span>${cat}</span>
      </button>
    `).join('');
  },

  getCategoryEmoji(cat) {
    const map = {
      All: '🍽️',
      Burgers: '🍔',
      Pizza: '🍕',
      Asian: '🍱',
      Biryani: '🍛',
      Healthy: '🥗',
      Pasta: '🍝',
      Desserts: '🍰',
      Beverages: '🥤'
    };
    return map[cat] || '🍴';
  },

  setCategory(cat) {
    this.currentCategory = cat;
    this.renderCategories();
    this.renderDishes();
  },

  renderRestaurants() {
    const container = document.getElementById('restaurants-grid');
    if (!container) return;

    const restaurants = window.db.restaurants;
    container.innerHTML = restaurants.map(rest => `
      <div class="restaurant-card" onclick="CustomerView.filterByRestaurant('${rest.id}')">
        <div class="rest-image-wrap">
          <img src="${rest.image}" alt="${rest.name}" loading="lazy" class="rest-img" />
          <span class="rest-badge">${rest.badge}</span>
          <div class="rest-meta-overlay">
            <span>⏱️ ${rest.deliveryTime}</span>
            <span>🛵 $${rest.deliveryFee.toFixed(2)} delivery</span>
          </div>
        </div>
        <div class="rest-info">
          <div class="rest-header">
            <h3 class="rest-name">${rest.name}</h3>
            <span class="rating-badge">★ ${rest.rating}</span>
          </div>
          <p class="rest-cuisine">${rest.cuisine}</p>
        </div>
      </div>
    `).join('');
  },

  filterByRestaurant(restId) {
    const rest = window.db.restaurants.find(r => r.id === restId);
    if (rest) {
      window.showToast(`Showing popular specials from ${rest.name}`, 'info');
      const dishesSec = document.getElementById('dishes-section');
      if (dishesSec) dishesSec.scrollIntoView({ behavior: 'smooth' });
    }
  },

  renderDishes() {
    const container = document.getElementById('dishes-grid');
    if (!container) return;

    let dishes = window.db.dishes;

    // Filter by Category
    if (this.currentCategory !== 'All') {
      dishes = dishes.filter(d => d.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Filter by Search Query
    if (this.searchQuery) {
      dishes = dishes.filter(d => 
        d.name.toLowerCase().includes(this.searchQuery) || 
        d.description.toLowerCase().includes(this.searchQuery) ||
        d.restaurantName.toLowerCase().includes(this.searchQuery)
      );
    }

    // Filter by Veg
    if (this.filterVegOnly) {
      dishes = dishes.filter(d => d.isVeg);
    }

    if (dishes.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full">
          <div class="empty-icon">🔍</div>
          <h3>No dishes found</h3>
          <p>Try searching for burgers, pizza, pasta or reset your dietary filters.</p>
          <button class="btn btn-outline mt-2" onclick="CustomerView.resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = dishes.map(dish => `
      <div class="food-card ${!dish.inStock ? 'out-of-stock' : ''}">
        <div class="food-img-wrap" onclick="CustomerView.openDishModal('${dish.id}')">
          <img src="${dish.image}" alt="${dish.name}" loading="lazy" class="food-img" />
          <div class="food-tags">
            <span class="diet-tag ${dish.isVeg ? 'veg' : 'non-veg'}">
              <span class="diet-dot"></span> ${dish.isVeg ? 'VEG' : 'NON-VEG'}
            </span>
            ${dish.badge ? `<span class="popular-tag">${dish.badge}</span>` : ''}
          </div>
          ${!dish.inStock ? '<div class="stock-overlay">Out of Stock</div>' : ''}
        </div>
        <div class="food-content">
          <div class="food-header">
            <span class="food-restaurant">📍 ${dish.restaurantName}</span>
            <span class="food-rating">★ ${dish.rating} (${dish.ratingCount})</span>
          </div>
          <h4 class="food-title" onclick="CustomerView.openDishModal('${dish.id}')">${dish.name}</h4>
          <p class="food-desc">${dish.description}</p>
          <div class="food-footer">
            <div class="food-pricing">
              <span class="current-price">$${dish.price.toFixed(2)}</span>
              ${dish.originalPrice ? `<span class="original-price">$${dish.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            ${dish.inStock ? `
              <button class="btn btn-primary btn-sm add-cart-btn" onclick="CustomerView.quickAddToCart('${dish.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>Add</span>
              </button>
            ` : `
              <button class="btn btn-disabled btn-sm" disabled>Unavailable</button>
            `}
          </div>
        </div>
      </div>
    `).join('');
  },

  resetFilters() {
    this.currentCategory = 'All';
    this.searchQuery = '';
    this.filterVegOnly = false;
    const searchInput = document.getElementById('search-food-input');
    if (searchInput) searchInput.value = '';
    const vegToggle = document.getElementById('toggle-veg-only');
    if (vegToggle) vegToggle.checked = false;
    this.renderCategories();
    this.renderDishes();
  },

  quickAddToCart(dishId) {
    const dish = window.db.dishes.find(d => d.id === dishId);
    if (dish && dish.inStock) {
      window.Cart.addItem(dish, 1);
    }
  },

  openDishModal(dishId) {
    const dish = window.db.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const modal = document.getElementById('dish-detail-modal');
    const content = document.getElementById('dish-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="dish-modal-grid">
        <div class="dish-modal-media">
          <img src="${dish.image}" alt="${dish.name}" class="dish-modal-img" />
          <div class="modal-tags-overlay">
            <span class="diet-tag ${dish.isVeg ? 'veg' : 'non-veg'}">
              <span class="diet-dot"></span> ${dish.isVeg ? 'Pure Veg' : 'Non-Vegetarian'}
            </span>
            <span class="calorie-badge">🔥 ${dish.calories || '550 kcal'}</span>
            <span class="prep-badge">⏱️ ${dish.prepTime || '20 min'}</span>
          </div>
        </div>
        <div class="dish-modal-info">
          <div class="dish-modal-header">
            <span class="dish-brand">From: ${dish.restaurantName}</span>
            <span class="star-rating">★ ${dish.rating} (${dish.ratingCount} foodies rated)</span>
          </div>
          <h2 class="dish-modal-title">${dish.name}</h2>
          <p class="dish-modal-desc">${dish.description}</p>
          
          <div class="customization-section">
            <label class="customization-title">Special Instructions / Preferences:</label>
            <input type="text" id="dish-custom-note" class="form-input" placeholder="e.g. Less spicy, dressing on the side, no onions" />
          </div>

          <div class="dish-modal-actions">
            <div class="modal-quantity-stepper">
              <button class="stepper-btn" onclick="CustomerView.modalStep(-1)">−</button>
              <span id="modal-qty-val" class="stepper-count">1</span>
              <button class="stepper-btn" onclick="CustomerView.modalStep(1)">+</button>
            </div>
            <button class="btn btn-primary btn-block" onclick="CustomerView.submitModalCart('${dish.id}')">
              <span>Add to Cart • </span>
              <span id="modal-add-total">$${dish.price.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  modalStep(val) {
    const qtyEl = document.getElementById('modal-qty-val');
    const totalEl = document.getElementById('modal-add-total');
    if (!qtyEl) return;

    let current = parseInt(qtyEl.textContent) || 1;
    current = Math.max(1, current + val);
    qtyEl.textContent = current;

    // Update dynamic price if active
    const dish = window.db.dishes.find(d => d.id === this._modalDishId);
    if (dish && totalEl) {
      totalEl.textContent = `$${(dish.price * current).toFixed(2)}`;
    }
  },

  submitModalCart(dishId) {
    const dish = window.db.dishes.find(d => d.id === dishId);
    const qtyEl = document.getElementById('modal-qty-val');
    const noteEl = document.getElementById('dish-custom-note');

    if (dish) {
      const qty = parseInt(qtyEl ? qtyEl.textContent : 1) || 1;
      const note = noteEl ? noteEl.value.trim() : '';
      window.Cart.addItem(dish, qty, note);
      this.closeDishModal();
    }
  },

  closeDishModal() {
    const modal = document.getElementById('dish-detail-modal');
    if (modal) modal.classList.remove('active');
  },

  renderCustomerOrders() {
    const container = document.getElementById('customer-orders-list');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    const orders = window.db.orders.filter(o => o.customerId === (user ? user.id : 'u1'));

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">📦</div>
          <h4>No orders yet</h4>
          <p>Order your favorite meal now to see live tracking updates here!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card" onclick="CustomerView.openOrderTracker('${order.id}')">
        <div class="order-card-header">
          <div>
            <span class="order-id">#${order.id}</span>
            <span class="order-timestamp">• ${order.orderTime}</span>
          </div>
          <span class="status-tag status-${order.status}">
            ${this.formatStatus(order.status)}
          </span>
        </div>
        <div class="order-restaurant-info">
          <strong>${order.restaurantName}</strong>
          <span class="order-item-summary">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
        </div>
        <div class="order-card-footer">
          <span class="order-total-price">Total: $${order.total.toFixed(2)}</span>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); CustomerView.openOrderTracker('${order.id}')">
            ${order.status === 'delivered' ? 'Receipt Details' : 'Track Live 🛵'}
          </button>
        </div>
      </div>
    `).join('');
  },

  formatStatus(status) {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'preparing': return 'Kitchen Cooking 🔥';
      case 'ready': return 'Ready for Pickup';
      case 'out_for_delivery': return 'On The Way 🛵';
      case 'delivered': return 'Delivered ✅';
      default: return status;
    }
  },

  openOrderTracker(orderId) {
    this.activeTrackingOrderId = orderId;
    const modal = document.getElementById('order-tracking-modal');
    if (modal) {
      modal.classList.add('active');
      this.updateTrackingModalContent(orderId);
      this.startSimulatedMapCanvas();
    }
  },

  updateTrackingModalContent(orderId) {
    const order = window.db.orders.find(o => o.id === orderId);
    const body = document.getElementById('order-tracking-body');
    if (!order || !body) return;

    const stages = [
      { key: 'pending', label: 'Order Confirmed', icon: '📝' },
      { key: 'preparing', label: 'Kitchen Preparing', icon: '🍳' },
      { key: 'out_for_delivery', label: 'Rider on the Way', icon: '🛵' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const getStageIndex = (st) => {
      if (st === 'pending') return 0;
      if (st === 'preparing') return 1;
      if (st === 'ready' || st === 'out_for_delivery') return 2;
      if (st === 'delivered') return 3;
      return 0;
    };

    const currentStageIdx = getStageIndex(order.status);

    body.innerHTML = `
      <div class="tracking-content">
        <div class="tracking-top-bar">
          <div>
            <span class="badge-pill">Order ID: #${order.id}</span>
            <h2 class="tracking-status-headline">${this.formatStatus(order.status)}</h2>
            <p class="tracking-eta-text">Estimated Arrival: <strong>${order.status === 'delivered' ? 'Arrived!' : order.eta || '18-25 mins'}</strong></p>
          </div>
          <div class="status-indicator-badge pulse-${order.status}">
            ${stages[currentStageIdx].icon}
          </div>
        </div>

        <!-- Interactive Stepper -->
        <div class="stepper-horizontal">
          ${stages.map((st, idx) => `
            <div class="step-node ${idx <= currentStageIdx ? 'completed' : ''} ${idx === currentStageIdx ? 'current' : ''}">
              <div class="step-circle">${idx < currentStageIdx ? '✓' : st.icon}</div>
              <span class="step-label">${st.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- Simulated Live GPS Map Canvas -->
        <div class="live-map-card">
          <div class="map-header">
            <span class="live-pulse-dot"></span>
            <span>Live GPS Courier Telemetry</span>
            <span class="live-speed">Speed: ${order.status === 'delivered' ? '0 km/h' : '28 km/h'}</span>
          </div>
          <div class="canvas-container">
            <canvas id="rider-simulation-canvas" width="600" height="200"></canvas>
          </div>
          <div class="map-addresses">
            <div><strong>From:</strong> ${order.restaurantName}</div>
            <div><strong>To:</strong> ${order.deliveryAddress}</div>
          </div>
        </div>

        <!-- Rider & Contact Card -->
        <div class="rider-contact-card">
          <img src="${order.riderId ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}" class="rider-photo" />
          <div class="rider-info">
            <h4>${order.riderName || 'FastDrop Dispatch'}</h4>
            <p class="rider-vehicle">Honda PCX 150 (Silver) • 4.95 ⭐</p>
          </div>
          <div class="rider-call-actions">
            <button class="btn btn-outline btn-sm" onclick="window.showToast('Calling rider Alex Swift...', 'info')">📞 Call</button>
            <button class="btn btn-outline btn-sm" onclick="window.showToast('Message sent to rider!', 'info')">💬 Message</button>
          </div>
        </div>

        <!-- Order Items Breakdown -->
        <div class="tracking-items-summary">
          <h4>Items Ordered (${order.items.length})</h4>
          ${order.items.map(item => `
            <div class="summary-item-row">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="summary-total-row">
            <strong>Total Paid</strong>
            <strong>$${order.total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `;
  },

  startSimulatedMapCanvas() {
    const canvas = document.getElementById('rider-simulation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.mapAnimInterval) clearInterval(this.mapAnimInterval);

    let progress = 0.2;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark map background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Map grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Route path (Smooth curve from restaurant at (60, 100) to customer at (540, 100))
      const startX = 60, startY = 100;
      const cp1X = 200, cp1Y = 40;
      const cp2X = 380, cp2Y = 160;
      const endX = 540, endY = 100;

      // Glow route path
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.strokeStyle = '#ff5722';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#ff5722';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Restaurant marker (Start)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(startX, startY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText('🍳 Kitchen', startX - 24, startY - 14);

      // Customer marker (Destination)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(endX, endY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🏠 Home', endX - 16, endY - 14);

      // Rider animated position along bezier curve
      progress += 0.005;
      if (progress > 1) progress = 0.1;

      const t = progress;
      const riderX = Math.pow(1 - t, 3) * startX + 3 * Math.pow(1 - t, 2) * t * cp1X + 3 * (1 - t) * Math.pow(t, 2) * cp2X + Math.pow(t, 3) * endX;
      const riderY = Math.pow(1 - t, 3) * startY + 3 * Math.pow(1 - t, 2) * t * cp1Y + 3 * (1 - t) * Math.pow(t, 2) * cp2Y + Math.pow(t, 3) * endY;

      // Pulse ring around rider
      ctx.strokeStyle = 'rgba(255, 87, 34, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(riderX, riderY, 16 + Math.sin(Date.now() / 200) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Bike marker
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(riderX, riderY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '12px sans-serif';
      ctx.fillText('🛵', riderX - 7, riderY + 4);
    };

    this.mapAnimInterval = setInterval(draw, 40);
  },

  closeOrderTracker() {
    if (this.mapAnimInterval) clearInterval(this.mapAnimInterval);
    this.activeTrackingOrderId = null;
    const modal = document.getElementById('order-tracking-modal');
    if (modal) modal.classList.remove('active');
  }
};

window.CustomerView = CustomerView;
