/**
 * FeastFlow - Cart & Checkout Engine
 * Manages customer order items, customizations, promo discounts, tax, and order submission.
 */

const Cart = {
  items: [],
  appliedPromo: null,
  tipAmount: 2.00,
  deliveryFee: 2.99,

  init() {
    this.loadCart();
    this.bindEvents();
    this.renderCartUI();
  },

  loadCart() {
    const saved = localStorage.getItem('ff_cart_items');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    } else {
      // Default 1 popular item in cart for quick demonstration
      this.items = [
        {
          id: 'd1',
          name: 'Truffle Mushroom Smash Burger',
          price: 14.99,
          quantity: 1,
          restaurantId: 'r2',
          restaurantName: 'The Burger Foundry',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
          customizations: 'Medium rare, Extra truffle sauce'
        }
      ];
      this.saveCart();
    }
  },

  saveCart() {
    localStorage.setItem('ff_cart_items', JSON.stringify(this.items));
    this.renderCartUI();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: this.items }));
  },

  addItem(dish, quantity = 1, customizations = '') {
    const existing = this.items.find(item => item.id === dish.id && item.customizations === customizations);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: quantity,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
        image: dish.image,
        customizations: customizations
      });
    }
    this.saveCart();
    window.showToast(`Added ${dish.name} to cart! 🍔`, 'success');
  },

  updateQuantity(dishId, change) {
    const index = this.items.findIndex(item => item.id === dishId);
    if (index > -1) {
      this.items[index].quantity += change;
      if (this.items[index].quantity <= 0) {
        this.items.splice(index, 1);
        window.showToast('Item removed from cart', 'info');
      }
      this.saveCart();
    }
  },

  removeItem(dishId) {
    this.items = this.items.filter(item => item.id !== dishId);
    this.saveCart();
    window.showToast('Item removed', 'info');
  },

  clearCart() {
    this.items = [];
    this.appliedPromo = null;
    this.saveCart();
  },

  applyPromo(code) {
    const cleanCode = (code || '').toUpperCase().trim();
    if (!cleanCode) {
      window.showToast('Please enter a coupon code', 'error');
      return false;
    }

    const promo = window.PROMO_CODES[cleanCode];
    if (!promo) {
      window.showToast('Invalid promo code. Try "FEAST30" or "FREESHIP"', 'error');
      return false;
    }

    const subtotal = this.getSubtotal();
    if (promo.minOrder && subtotal < promo.minOrder) {
      window.showToast(`Order must be at least $${promo.minOrder} to apply this code.`, 'error');
      return false;
    }

    this.appliedPromo = { code: cleanCode, ...promo };
    this.renderCartUI();
    window.showToast(`🎉 Coupon "${cleanCode}" applied! ${promo.description}`, 'success');
    return true;
  },

  removePromo() {
    this.appliedPromo = null;
    this.renderCartUI();
    window.showToast('Coupon removed', 'info');
  },

  setTip(amount) {
    this.tipAmount = parseFloat(amount) || 0;
    this.renderCartUI();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDiscount() {
    if (!this.appliedPromo) return 0;
    const subtotal = this.getSubtotal();
    if (this.appliedPromo.discountPercent) {
      return (subtotal * this.appliedPromo.discountPercent) / 100;
    }
    if (this.appliedPromo.discountAmount) {
      return Math.min(this.appliedPromo.discountAmount, subtotal);
    }
    return 0;
  },

  getDeliveryFee() {
    if (this.items.length === 0) return 0;
    if (this.appliedPromo && this.appliedPromo.freeDelivery) return 0;
    return this.deliveryFee;
  },

  getTaxes() {
    const subtotal = this.getSubtotal();
    return subtotal > 0 ? subtotal * 0.08 : 0; // 8% sales & local tax
  },

  getTotal() {
    if (this.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const delivery = this.getDeliveryFee();
    const taxes = this.getTaxes();
    return Math.max(0, subtotal - discount + delivery + taxes + this.tipAmount);
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  renderCartUI() {
    const count = this.getItemCount();
    
    // Update badge counts
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });

    const cartContainer = document.getElementById('cart-items-list');
    const emptyCartEl = document.getElementById('cart-empty-state');
    const checkoutFooter = document.getElementById('cart-checkout-footer');

    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = '';
      if (emptyCartEl) emptyCartEl.classList.remove('hidden');
      if (checkoutFooter) checkoutFooter.classList.add('hidden');
      return;
    }

    if (emptyCartEl) emptyCartEl.classList.add('hidden');
    if (checkoutFooter) checkoutFooter.classList.remove('hidden');

    cartContainer.innerHTML = this.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-restaurant">📍 ${item.restaurantName || 'FeastFlow Kitchen'}</div>
          ${item.customizations ? `<div class="cart-item-note">Note: ${item.customizations}</div>` : ''}
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-stepper">
          <button class="stepper-btn stepper-minus" onclick="Cart.updateQuantity('${item.id}', -1)" aria-label="Decrease">
            ${item.quantity === 1 ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' : '−'}
          </button>
          <span class="stepper-count">${item.quantity}</span>
          <button class="stepper-btn stepper-plus" onclick="Cart.updateQuantity('${item.id}', 1)" aria-label="Increase">+</button>
        </div>
      </div>
    `).join('');

    // Update Price Breakdown
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const delivery = this.getDeliveryFee();
    const taxes = this.getTaxes();
    const total = this.getTotal();

    const subtotalEl = document.getElementById('cart-summary-subtotal');
    const discountEl = document.getElementById('cart-summary-discount');
    const discountRow = document.getElementById('cart-summary-discount-row');
    const deliveryEl = document.getElementById('cart-summary-delivery');
    const taxesEl = document.getElementById('cart-summary-taxes');
    const totalEl = document.getElementById('cart-summary-total');
    const promoBadgeEl = document.getElementById('applied-promo-badge');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`;
    if (taxesEl) taxesEl.textContent = `$${taxes.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    if (discountRow && discountEl) {
      if (discount > 0) {
        discountRow.classList.remove('hidden');
        discountEl.textContent = `-$${discount.toFixed(2)}`;
      } else {
        discountRow.classList.add('hidden');
      }
    }

    if (promoBadgeEl) {
      if (this.appliedPromo) {
        promoBadgeEl.innerHTML = `
          <div class="promo-pill">
            <span>🏷️ ${this.appliedPromo.code} applied (${this.appliedPromo.description})</span>
            <button class="btn-text-danger" onclick="Cart.removePromo()">✕</button>
          </div>
        `;
      } else {
        promoBadgeEl.innerHTML = '';
      }
    }
  },

  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.classList.add('drawer-open');
    }
  },

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('drawer-open');
    }
  },

  checkout() {
    if (this.items.length === 0) {
      window.showToast('Your cart is empty! Add delicious food first.', 'error');
      return;
    }

    const currentUser = window.Auth.getCurrentUser();
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const deliveryFee = this.getDeliveryFee();
    const taxes = this.getTaxes();
    const total = this.getTotal();

    // Create New Order
    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const primaryRestaurant = this.items[0];

    const order = {
      id: newOrderId,
      customerName: currentUser ? currentUser.name : 'Valued Foodie',
      customerId: currentUser ? currentUser.id : 'u_guest',
      restaurantId: primaryRestaurant.restaurantId || 'r1',
      restaurantName: primaryRestaurant.restaurantName || 'Gourmet Kitchen',
      riderId: 'u3', // auto-assign mock rider Alex Swift for demo
      riderName: 'Alex Swift',
      riderPhone: '+1 (555) 887-3401',
      items: [...this.items],
      subtotal: subtotal,
      discount: discount,
      deliveryFee: deliveryFee,
      taxes: taxes,
      total: total,
      status: 'preparing', // simulate active cooking
      deliveryAddress: currentUser && currentUser.address ? currentUser.address : '742 Evergreen Terrace, Springfield',
      orderTime: 'Just now',
      eta: '24 mins',
      paymentMethod: 'Credit Card (•••• 4242)',
      liveProgress: 35
    };

    window.db.addOrder(order);
    this.clearCart();
    this.closeCart();

    // Open Live Order Tracking View
    if (window.CustomerView) {
      window.CustomerView.openOrderTracker(order.id);
    }

    // Trigger celebration effects
    window.showToast(`🎉 Order ${order.id} Placed Successfully! Kitchen is preparing your food.`, 'success');
  },

  bindEvents() {
    // Cart open triggers
    document.querySelectorAll('.open-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', () => this.closeCart());

    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());

    // Promo code apply button
    const promoBtn = document.getElementById('btn-apply-promo');
    const promoInput = document.getElementById('cart-promo-input');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        this.applyPromo(promoInput.value);
        promoInput.value = '';
      });
      promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyPromo(promoInput.value);
          promoInput.value = '';
        }
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('btn-checkout-now');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.checkout());
    }
  }
};

window.Cart = Cart;
