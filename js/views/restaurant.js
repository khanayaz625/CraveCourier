/**
 * FeastFlow - Restaurant & Kitchen Manager View Module
 * Kitchen Order Tickets (KOT), Order Status Transitions, Menu Stock Management, and New Dish Addition.
 */

const RestaurantView = {
  currentTab: 'orders', // 'orders' | 'menu' | 'analytics'
  orderFilter: 'all',

  init() {
    this.bindEvents();
    this.renderStats();
    this.renderKitchenOrders();
    this.renderMenuManager();
  },

  bindEvents() {
    window.addEventListener('orders-updated', () => {
      this.renderStats();
      this.renderKitchenOrders();
    });

    window.addEventListener('dishes-updated', () => {
      this.renderMenuManager();
    });

    // Form submission for adding new dish
    const addDishForm = document.getElementById('form-add-dish');
    if (addDishForm) {
      addDishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddNewDish(e.target);
      });
    }
  },

  renderStats() {
    const user = window.Auth.getCurrentUser();
    const restId = user && user.restaurantId ? user.restaurantId : 'r1';
    const orders = window.db.orders.filter(o => o.restaurantId === restId);

    const todayRev = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;
    const completed = orders.filter(o => o.status === 'delivered').length;

    const revEl = document.getElementById('rest-stat-revenue');
    const activeEl = document.getElementById('rest-stat-active');
    const completedEl = document.getElementById('rest-stat-completed');
    const avgTimeEl = document.getElementById('rest-stat-avgtime');

    if (revEl) revEl.textContent = `$${todayRev.toFixed(2)}`;
    if (activeEl) activeEl.textContent = activeOrders;
    if (completedEl) completedEl.textContent = completed;
    if (avgTimeEl) avgTimeEl.textContent = '16 min';
  },

  setOrderFilter(filter) {
    this.orderFilter = filter;
    document.querySelectorAll('.kot-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.renderKitchenOrders();
  },

  renderKitchenOrders() {
    const container = document.getElementById('kot-orders-grid');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    const restId = user && user.restaurantId ? user.restaurantId : 'r1';
    let orders = window.db.orders.filter(o => o.restaurantId === restId);

    if (this.orderFilter !== 'all') {
      orders = orders.filter(o => o.status === this.orderFilter);
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full">
          <div class="empty-icon">🍳</div>
          <h4>No kitchen orders found</h4>
          <p>Orders matching "${this.orderFilter}" will display here in real time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="kot-ticket ${order.status === 'pending' ? 'urgent' : ''}">
        <div class="kot-header">
          <div>
            <span class="kot-id">#${order.id}</span>
            <span class="kot-time">⏰ ${order.orderTime}</span>
          </div>
          <span class="status-tag status-${order.status}">
            ${this.formatStatus(order.status)}
          </span>
        </div>

        <div class="kot-customer">
          <strong>👤 ${order.customerName}</strong>
          <span>📍 ${order.deliveryAddress}</span>
        </div>

        <div class="kot-items">
          ${order.items.map(item => `
            <div class="kot-item-row">
              <span class="kot-qty">${item.quantity}x</span>
              <span class="kot-name">${item.name}</span>
              ${item.customizations ? `<span class="kot-note">Note: "${item.customizations}"</span>` : ''}
              <span class="kot-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="kot-footer">
          <div class="kot-total">
            <span>Bill: $${order.total.toFixed(2)}</span>
            <span class="kot-payment">${order.paymentMethod}</span>
          </div>
          <div class="kot-actions">
            ${this.renderOrderActionButtons(order)}
          </div>
        </div>
      </div>
    `).join('');
  },

  renderOrderActionButtons(order) {
    if (order.status === 'pending') {
      return `
        <button class="btn btn-primary btn-sm" onclick="RestaurantView.changeStatus('${order.id}', 'preparing')">
          🔥 Accept & Cook
        </button>
      `;
    }
    if (order.status === 'preparing') {
      return `
        <button class="btn btn-warning btn-sm" onclick="RestaurantView.changeStatus('${order.id}', 'ready')">
          🔔 Mark Food Ready
        </button>
      `;
    }
    if (order.status === 'ready') {
      return `
        <button class="btn btn-success btn-sm" onclick="RestaurantView.changeStatus('${order.id}', 'out_for_delivery')">
          🛵 Handover to Rider
        </button>
      `;
    }
    if (order.status === 'out_for_delivery') {
      return `
        <span class="badge-subtle">With Courier (${order.riderName || 'Alex Swift'})</span>
      `;
    }
    return `
      <span class="badge-subtle">Order Completed ✅</span>
    `;
  },

  changeStatus(orderId, nextStatus) {
    window.db.updateOrderStatus(orderId, nextStatus);
    window.showToast(`Order #${orderId} moved to ${this.formatStatus(nextStatus)}`, 'success');
  },

  formatStatus(status) {
    switch (status) {
      case 'pending': return 'New Order';
      case 'preparing': return 'Cooking';
      case 'ready': return 'Ready for Pickup';
      case 'out_for_delivery': return 'Dispatched';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  },

  renderMenuManager() {
    const container = document.getElementById('restaurant-menu-table-body');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    const restId = user && user.restaurantId ? user.restaurantId : 'r1';
    const dishes = window.db.dishes.filter(d => d.restaurantId === restId || !d.restaurantId);

    container.innerHTML = dishes.map(dish => `
      <tr class="menu-row">
        <td>
          <div class="table-dish-item">
            <img src="${dish.image}" alt="${dish.name}" class="table-dish-thumb" />
            <div>
              <strong>${dish.name}</strong>
              <small class="text-muted block">${dish.category} • ${dish.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}</small>
            </div>
          </div>
        </td>
        <td>
          <div class="price-edit-wrap">
            <span>$</span>
            <input type="number" step="0.5" value="${dish.price.toFixed(2)}" class="price-input" 
              onchange="RestaurantView.savePrice('${dish.id}', this.value)" />
          </div>
        </td>
        <td>
          <span class="rating-badge">★ ${dish.rating}</span>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${dish.inStock ? 'checked' : ''} onchange="RestaurantView.toggleStock('${dish.id}')">
            <span class="slider round"></span>
          </label>
          <span class="stock-status-text ${dish.inStock ? 'text-success' : 'text-danger'}">
            ${dish.inStock ? 'In Stock' : 'Sold Out'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  toggleStock(dishId) {
    window.db.toggleDishStock(dishId);
    const dish = window.db.dishes.find(d => d.id === dishId);
    window.showToast(`${dish.name} marked as ${dish.inStock ? 'Available' : 'Out of Stock'}`, 'info');
  },

  savePrice(dishId, newPrice) {
    const priceVal = parseFloat(newPrice);
    if (!isNaN(priceVal) && priceVal > 0) {
      window.db.updateDishPrice(dishId, priceVal);
      window.showToast('Price updated successfully', 'success');
    }
  },

  openAddDishModal() {
    const modal = document.getElementById('add-dish-modal');
    if (modal) modal.classList.add('active');
  },

  closeAddDishModal() {
    const modal = document.getElementById('add-dish-modal');
    if (modal) modal.classList.remove('active');
  },

  handleAddNewDish(form) {
    const user = window.Auth.getCurrentUser();
    const restId = user && user.restaurantId ? user.restaurantId : 'r1';
    const restName = user && user.restaurantName ? user.restaurantName : 'Bella Italia Bistro';

    const name = form.elements['dishName'].value.trim();
    const category = form.elements['dishCategory'].value;
    const price = parseFloat(form.elements['dishPrice'].value);
    const prepTime = form.elements['dishPrepTime'].value || '15 min';
    const isVeg = form.elements['dishIsVeg'].checked;
    const desc = form.elements['dishDesc'].value.trim();
    const imgUrl = form.elements['dishImage'].value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

    if (!name || isNaN(price)) {
      window.showToast('Please fill in dish name and valid price', 'error');
      return;
    }

    const newDish = {
      id: 'd_' + Date.now(),
      restaurantId: restId,
      restaurantName: restName,
      name: name,
      category: category,
      price: price,
      rating: 5.0,
      ratingCount: 1,
      prepTime: prepTime,
      calories: '520 kcal',
      isVeg: isVeg,
      badge: 'Chef Special',
      inStock: true,
      description: desc || 'Handcrafted fresh using chef secret recipe.',
      image: imgUrl
    };

    window.db.addDish(newDish);
    form.reset();
    this.closeAddDishModal();
    window.showToast(`✨ ${newDish.name} added to the menu!`, 'success');
  }
};

window.RestaurantView = RestaurantView;
