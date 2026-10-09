/**
 * FeastFlow - Super Admin Control Center Module
 * Executive KPI cards, Orders control desk, User and Role management,
 * analytics bars, and platform settings.
 */

const AdminView = {
  currentTab: 'overview',
  ordersFilter: 'all',

  init() {
    this.bindEvents();
    this.renderKPIs();
    this.renderOrdersTable();
    this.renderUsersTable();
  },

  bindEvents() {
    window.addEventListener('orders-updated', () => {
      this.renderKPIs();
      this.renderOrdersTable();
    });

    window.addEventListener('users-updated', () => {
      this.renderUsersTable();
    });

    const statusFilter = document.getElementById('admin-order-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.ordersFilter = e.target.value;
        this.renderOrdersTable();
      });
    }
  },

  renderKPIs() {
    const orders = window.db.orders;
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0) + 34200.00; // include historical
    const totalOrdersCount = orders.length + 1410;
    const activeRidersCount = window.db.users.filter(u => u.role === 'rider' && u.status === 'active').length + 15;
    const totalRestaurantsCount = window.db.restaurants.length + 32;

    const gmvEl = document.getElementById('admin-kpi-gmv');
    const ordersEl = document.getElementById('admin-kpi-orders');
    const ridersEl = document.getElementById('admin-kpi-riders');
    const restEl = document.getElementById('admin-kpi-restaurants');

    if (gmvEl) gmvEl.textContent = `$${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (ordersEl) ordersEl.textContent = totalOrdersCount.toLocaleString();
    if (ridersEl) ridersEl.textContent = activeRidersCount;
    if (restEl) restEl.textContent = totalRestaurantsCount;
  },

  renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-table-body');
    if (!tbody) return;

    let orders = window.db.orders;
    if (this.ordersFilter !== 'all') {
      orders = orders.filter(o => o.status === this.ordersFilter);
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td><strong class="font-mono">#${order.id}</strong></td>
        <td>
          <div class="user-cell">
            <span>${order.customerName}</span>
            <small class="text-muted block">${order.orderTime}</small>
          </div>
        </td>
        <td>
          <span>${order.restaurantName}</span>
        </td>
        <td>
          <strong>$${order.total.toFixed(2)}</strong>
          <small class="text-muted block">${order.paymentMethod}</small>
        </td>
        <td>
          <span class="status-tag status-${order.status}">
            ${this.formatStatus(order.status)}
          </span>
        </td>
        <td>
          <span>${order.riderName || '<span class="text-muted">Unassigned</span>'}</span>
        </td>
        <td>
          <select class="admin-table-select" onchange="AdminView.quickUpdateStatus('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>In Transit</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `).join('');
  },

  quickUpdateStatus(orderId, newStatus) {
    window.db.updateOrderStatus(orderId, newStatus);
    window.showToast(`Order #${orderId} status changed to ${newStatus}`, 'success');
  },

  renderUsersTable() {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    const users = window.db.users;
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div class="user-profile-cell">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" class="user-avatar-sm" />
            <div>
              <strong>${user.name}</strong>
              <small class="text-muted block">${user.email}</small>
            </div>
          </div>
        </td>
        <td>
          <select class="admin-table-select" onchange="AdminView.changeUserRole('${user.id}', this.value)">
            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
            <option value="restaurant" ${user.role === 'restaurant' ? 'selected' : ''}>Restaurant</option>
            <option value="rider" ${user.role === 'rider' ? 'selected' : ''}>Rider</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>
          <span class="user-status-pill ${user.status === 'active' ? 'status-active' : 'status-suspended'}">
            ${user.status.toUpperCase()}
          </span>
        </td>
        <td>
          <button class="btn ${user.status === 'active' ? 'btn-danger-outline' : 'btn-success-outline'} btn-sm" onclick="AdminView.toggleUserStatus('${user.id}')">
            ${user.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
  },

  changeUserRole(userId, newRole) {
    window.db.updateUserRole(userId, newRole);
    window.showToast(`User role updated to ${newRole.toUpperCase()}`, 'success');
  },

  toggleUserStatus(userId) {
    window.db.toggleUserStatus(userId);
    const user = window.db.users.find(u => u.id === userId);
    window.showToast(`User is now ${user.status}`, 'info');
  },

  formatStatus(status) {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'out_for_delivery': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  }
};

window.AdminView = AdminView;
