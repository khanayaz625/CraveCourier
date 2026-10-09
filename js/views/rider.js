/**
 * FeastFlow - Delivery Partner / Rider View Module
 * Manages Rider Online status, available trip orders pool, live trip execution,
 * simulated GPS navigation, and shift earnings calculations.
 */

const RiderView = {
  isOnline: true,
  activeOrderId: null,
  mapInterval: null,

  init() {
    this.bindEvents();
    this.syncActiveTrip();
    this.renderStats();
    this.renderAvailableTrips();
  },

  bindEvents() {
    window.addEventListener('orders-updated', () => {
      this.syncActiveTrip();
      this.renderStats();
      this.renderAvailableTrips();
    });

    const onlineToggle = document.getElementById('rider-online-toggle');
    if (onlineToggle) {
      onlineToggle.addEventListener('change', (e) => {
        this.isOnline = e.target.checked;
        const statusBadge = document.getElementById('rider-online-status-badge');
        if (statusBadge) {
          statusBadge.textContent = this.isOnline ? 'ONLINE • Ready for Orders' : 'OFFLINE • Resting';
          statusBadge.className = `status-pill ${this.isOnline ? 'status-online' : 'status-offline'}`;
        }
        window.showToast(this.isOnline ? 'You are now ONLINE 🛵' : 'You are now OFFLINE', 'info');
        this.renderAvailableTrips();
      });
    }
  },

  syncActiveTrip() {
    const user = window.Auth.getCurrentUser();
    const riderId = user && user.id ? user.id : 'u3';
    // Look for active trip assigned to this rider
    const active = window.db.orders.find(o => o.riderId === riderId && ['ready', 'out_for_delivery'].includes(o.status));
    this.activeOrderId = active ? active.id : null;
    this.renderActiveTripSection();
  },

  renderStats() {
    const user = window.Auth.getCurrentUser();
    const riderId = user && user.id ? user.id : 'u3';
    const riderOrders = window.db.orders.filter(o => o.riderId === riderId && o.status === 'delivered');

    const totalEarnings = riderOrders.reduce((sum, o) => sum + (o.deliveryFee + 3.50), 0) + (user.todayEarnings || 86.50);
    const completedCount = (user.completedOrders || 12) + riderOrders.length;

    const earnEl = document.getElementById('rider-stat-earnings');
    const tripsEl = document.getElementById('rider-stat-trips');
    const ratingEl = document.getElementById('rider-stat-rating');

    if (earnEl) earnEl.textContent = `$${totalEarnings.toFixed(2)}`;
    if (tripsEl) tripsEl.textContent = completedCount;
    if (ratingEl) ratingEl.textContent = '4.95 ⭐';
  },

  renderAvailableTrips() {
    const container = document.getElementById('rider-available-orders-list');
    if (!container) return;

    if (!this.isOnline) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">💤</div>
          <h4>You are currently Offline</h4>
          <p>Toggle switch above to go online and receive high-paying delivery offers.</p>
        </div>
      `;
      return;
    }

    // Orders waiting for a courier (status is preparing or ready, no rider yet)
    const available = window.db.orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status) && !o.riderId);

    if (available.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">📍</div>
          <h4>Searching for nearby orders...</h4>
          <p>Hang tight! We'll notify you as soon as restaurants pack food in your area.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = available.map(order => `
      <div class="rider-order-card">
        <div class="rider-order-header">
          <div>
            <span class="badge-pill">Est. Earnings: $${(order.deliveryFee + 4.50).toFixed(2)}</span>
            <h4 class="mt-1">${order.restaurantName}</h4>
          </div>
          <span class="est-distance">🛵 2.4 km</span>
        </div>

        <div class="trip-locations">
          <div class="loc-step">
            <span class="loc-dot dot-pickup"></span>
            <div><strong>Pickup:</strong> ${order.restaurantName}</div>
          </div>
          <div class="loc-step">
            <span class="loc-dot dot-drop"></span>
            <div><strong>Dropoff:</strong> ${order.deliveryAddress}</div>
          </div>
        </div>

        <div class="rider-order-footer">
          <div class="order-items-badge">${order.items.length} items (${order.items.map(i => i.name).join(', ').substring(0, 30)}...)</div>
          <button class="btn btn-primary btn-sm" onclick="RiderView.acceptTrip('${order.id}')">
            ⚡ Accept Delivery
          </button>
        </div>
      </div>
    `).join('');
  },

  acceptTrip(orderId) {
    const user = window.Auth.getCurrentUser();
    window.db.updateOrderStatus(orderId, 'ready', {
      riderId: user ? user.id : 'u3',
      riderName: user ? user.name : 'Alex Swift',
      riderPhone: user ? user.phone : '+1 (555) 887-3401'
    });
    this.activeOrderId = orderId;
    this.syncActiveTrip();
    window.showToast(`Trip accepted! Head to restaurant for pickup. 🛵`, 'success');
  },

  renderActiveTripSection() {
    const container = document.getElementById('rider-active-trip-view');
    if (!container) return;

    if (!this.activeOrderId) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🛵</div>
          <h4>No Active Delivery Trip</h4>
          <p>Accept an order from the list below to begin navigation.</p>
        </div>
      `;
      return;
    }

    const order = window.db.orders.find(o => o.id === this.activeOrderId);
    if (!order) return;

    const isPickedUp = order.status === 'out_for_delivery';

    container.innerHTML = `
      <div class="active-trip-panel">
        <div class="trip-banner">
          <div>
            <span class="live-pulse-dot"></span>
            <strong class="text-white">ACTIVE DELIVERY • #${order.id}</strong>
          </div>
          <span class="trip-earning-tag">Payout: $${(order.deliveryFee + 4.50).toFixed(2)}</span>
        </div>

        <!-- Simulated Navigation Canvas -->
        <div class="rider-nav-map">
          <canvas id="rider-nav-canvas" width="560" height="180"></canvas>
          <div class="nav-instruction-overlay">
            <span class="turn-icon">⬆️</span>
            <div>
              <strong>${isPickedUp ? 'In 200m turn right on Main St towards Customer' : 'Head north toward ' + order.restaurantName}</strong>
              <small class="block text-muted">ETA: ${isPickedUp ? '8 mins' : '3 mins'}</small>
            </div>
          </div>
        </div>

        <div class="trip-info-card">
          <div class="info-row">
            <div>
              <small class="text-muted block">RESTAURANT</small>
              <strong>${order.restaurantName}</strong>
            </div>
            <button class="btn btn-outline btn-sm" onclick="window.showToast('Calling restaurant kitchen...', 'info')">📞 Call</button>
          </div>
          <div class="info-row mt-2">
            <div>
              <small class="text-muted block">CUSTOMER</small>
              <strong>${order.customerName}</strong>
              <div class="text-sm">${order.deliveryAddress}</div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="window.showToast('Calling customer ${order.customerName}...', 'info')">📞 Call</button>
          </div>
        </div>

        <div class="trip-controls mt-3">
          ${!isPickedUp ? `
            <button class="btn btn-warning btn-block" onclick="RiderView.markPickedUp('${order.id}')">
              📦 Confirm Pickup & Start Delivery
            </button>
          ` : `
            <button class="btn btn-success btn-block" onclick="RiderView.markDelivered('${order.id}')">
              🎉 Arrived & Confirm Delivered
            </button>
          `}
        </div>
      </div>
    `;

    this.startNavCanvasSimulation();
  },

  startNavCanvasSimulation() {
    const canvas = document.getElementById('rider-nav-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.mapInterval) clearInterval(this.mapInterval);

    let offset = 0;
    this.mapInterval = setInterval(() => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 70, canvas.width, 60);

      // Road dashed lines moving
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 15]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(canvas.width, 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rider bike in middle of canvas
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px sans-serif';
      ctx.fillText('🛵', 180, 110);

      // Delivery Destination icon ahead
      ctx.fillText('🏁', 480, 108);

      offset += 4;
    }, 50);
  },

  markPickedUp(orderId) {
    window.db.updateOrderStatus(orderId, 'out_for_delivery');
    window.showToast('Order Picked Up! Navigating to customer location. 🚀', 'success');
    this.renderActiveTripSection();
  },

  markDelivered(orderId) {
    if (this.mapInterval) clearInterval(this.mapInterval);
    window.db.updateOrderStatus(orderId, 'delivered');
    this.activeOrderId = null;
    this.syncActiveTrip();
    window.showToast('🎉 Delivery Completed! $10.49 credited to your daily wallet.', 'success');
  }
};

window.RiderView = RiderView;
