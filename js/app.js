/**
 * FeastFlow - Core App Orchestrator & Responsive Bottom Navigation
 * Controls view transitions, role contexts, bottom navigation rendering, and notifications.
 */

// Toast notification helper
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-up`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'warning') icon = '🔔';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};

const Navigation = {
  activeTab: 'home',

  // Config for each role's bottom navigation
  navConfigs: {
    customer: [
      { id: 'customer-home', label: 'Explore', icon: '🍽️', targetView: 'view-customer', subSection: 'explore' },
      { id: 'customer-search', label: 'Search', icon: '🔍', targetView: 'view-customer', subSection: 'search' },
      { id: 'customer-cart', label: 'Cart', icon: '🛍️', isAction: true, action: () => window.Cart.openCart(), hasBadge: true },
      { id: 'customer-orders', label: 'Orders', icon: '📦', targetView: 'view-customer', subSection: 'orders' },
      { id: 'profile-tab', label: 'Account', icon: '👤', isAction: true, action: () => App.openProfileModal() }
    ],
    restaurant: [
      { id: 'rest-orders', label: 'Tickets', icon: '📋', targetView: 'view-restaurant', subSection: 'kot' },
      { id: 'rest-menu', label: 'Menu Stock', icon: '🍽️', targetView: 'view-restaurant', subSection: 'menu' },
      { id: 'rest-add', label: 'Add Dish', icon: '➕', isAction: true, action: () => window.RestaurantView.openAddDishModal() },
      { id: 'profile-tab', label: 'Kitchen Acc', icon: '👨‍🍳', isAction: true, action: () => App.openProfileModal() }
    ],
    rider: [
      { id: 'rider-orders', label: 'Deliveries', icon: '📍', targetView: 'view-rider', subSection: 'pool' },
      { id: 'rider-active', label: 'Active Trip', icon: '🛵', targetView: 'view-rider', subSection: 'trip' },
      { id: 'rider-wallet', label: 'Earnings', icon: '💰', targetView: 'view-rider', subSection: 'wallet' },
      { id: 'profile-tab', label: 'Profile', icon: '👤', isAction: true, action: () => App.openProfileModal() }
    ],
    admin: [
      { id: 'admin-dash', label: 'Dashboard', icon: '📊', targetView: 'view-admin', subSection: 'overview' },
      { id: 'admin-orders', label: 'All Orders', icon: '🛒', targetView: 'view-admin', subSection: 'orders' },
      { id: 'admin-users', label: 'Users & Roles', icon: '👥', targetView: 'view-admin', subSection: 'users' },
      { id: 'profile-tab', label: 'Admin', icon: '👑', isAction: true, action: () => App.openProfileModal() }
    ]
  },

  renderBottomNav(role = 'customer') {
    const bottomNav = document.getElementById('bottom-nav-bar');
    if (!bottomNav) return;

    const items = this.navConfigs[role] || this.navConfigs.customer;

    bottomNav.innerHTML = items.map((item, index) => {
      const isCart = item.hasBadge;
      const count = window.Cart ? window.Cart.getItemCount() : 0;
      const isActive = index === 0;

      return `
        <button class="bottom-nav-item ${isActive ? 'active' : ''}" id="nav-btn-${item.id}" onclick="Navigation.handleNavClick('${role}', '${item.id}')">
          <div class="nav-icon-wrap">
            <span class="nav-icon">${item.icon}</span>
            ${isCart ? `<span class="nav-badge cart-count-badge" style="display: ${count > 0 ? 'inline-flex' : 'none'}">${count}</span>` : ''}
          </div>
          <span class="nav-label">${item.label}</span>
          <span class="active-indicator"></span>
        </button>
      `;
    }).join('');
  },

  handleNavClick(role, navId) {
    const items = this.navConfigs[role] || this.navConfigs.customer;
    const targetItem = items.find(i => i.id === navId);
    if (!targetItem) return;

    if (targetItem.isAction && typeof targetItem.action === 'function') {
      targetItem.action();
      return;
    }

    // Set Active State
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.id === `nav-btn-${navId}`);
    });

    if (targetItem.subSection) {
      this.scrollToSubSection(targetItem.targetView, targetItem.subSection);
    }
  },

  scrollToSubSection(viewId, subSection) {
    const view = document.getElementById(viewId);
    if (!view) return;

    if (subSection === 'search') {
      const searchBox = document.getElementById('search-food-input');
      if (searchBox) {
        searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchBox.focus();
      }
    } else if (subSection === 'orders') {
      const ordersSec = document.getElementById('customer-orders-section');
      if (ordersSec) ordersSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subSection === 'explore') {
      const catSec = document.getElementById('categories-container');
      if (catSec) catSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subSection === 'menu') {
      const menuSec = document.getElementById('rest-menu-section');
      if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subSection === 'kot') {
      const kotSec = document.getElementById('kot-orders-grid');
      if (kotSec) kotSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subSection === 'trip') {
      const tripSec = document.getElementById('rider-active-trip-view');
      if (tripSec) tripSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subSection === 'users') {
      const userSec = document.getElementById('admin-users-table');
      if (userSec) userSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

const App = {
  currentRole: 'customer',

  init() {
    // Initialize sub-modules
    window.Auth.init();
    window.Cart.init();
    window.CustomerView.init();
    window.RestaurantView.init();
    window.RiderView.init();
    window.AdminView.init();

    this.bindEvents();
    
    // Set initial role view from current user
    const initialUser = window.Auth.getCurrentUser();
    this.switchRoleView(initialUser ? initialUser.role : 'customer');
  },

  switchRoleView(role) {
    this.currentRole = role;

    // Toggle Role Screens
    const views = ['view-customer', 'view-restaurant', 'view-rider', 'view-admin'];
    const activeViewId = `view-${role}`;

    views.forEach(vId => {
      const el = document.getElementById(vId);
      if (el) {
        el.classList.toggle('hidden', vId !== activeViewId);
      }
    });

    // Toggle Greeting & Promotional Hero (shown mainly in customer mode)
    const greetingHero = document.getElementById('greeting-hero-section');
    if (greetingHero) {
      greetingHero.classList.toggle('hidden', role !== 'customer');
    }

    // Update Bottom Navigation
    Navigation.renderBottomNav(role);

    // Sync header dropdown
    const select = document.getElementById('header-role-select');
    if (select) select.value = role;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openProfileModal() {
    const user = window.Auth.getCurrentUser();
    const modal = document.getElementById('profile-modal');
    const content = document.getElementById('profile-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="profile-card">
        <div class="profile-header">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="profile-avatar" />
          <div class="profile-meta">
            <h3>${user.name}</h3>
            <span class="role-badge badge-${user.role}">${window.Auth.formatRoleName(user.role)}</span>
            <div class="text-sm text-muted mt-1">📧 ${user.email}</div>
            <div class="text-sm text-muted">📱 ${user.phone || '+1 (555) 019-2834'}</div>
          </div>
        </div>

        <div class="profile-section-divider"></div>

        <div class="profile-details-group">
          <label class="font-semibold block mb-1">Active Role Switcher:</label>
          <div class="role-switch-grid">
            <button class="role-option-btn ${user.role === 'customer' ? 'active' : ''}" onclick="window.Auth.loginDemo('customer'); App.closeProfileModal();">
              <span class="role-icon">👤</span>
              <span class="role-title">Customer</span>
              <small>Browse & Order</small>
            </button>
            <button class="role-option-btn ${user.role === 'restaurant' ? 'active' : ''}" onclick="window.Auth.loginDemo('restaurant'); App.closeProfileModal();">
              <span class="role-icon">🍳</span>
              <span class="role-title">Restaurant</span>
              <small>Kitchen & Menu</small>
            </button>
            <button class="role-option-btn ${user.role === 'rider' ? 'active' : ''}" onclick="window.Auth.loginDemo('rider'); App.closeProfileModal();">
              <span class="role-icon">🛵</span>
              <span class="role-title">Rider Partner</span>
              <small>GPS & Deliver</small>
            </button>
            <button class="role-option-btn ${user.role === 'admin' ? 'active' : ''}" onclick="window.Auth.loginDemo('admin'); App.closeProfileModal();">
              <span class="role-icon">👑</span>
              <span class="role-title">Super Admin</span>
              <small>Platform Control</small>
            </button>
          </div>
        </div>

        <div class="profile-section-divider"></div>

        <div class="profile-action-links">
          <button class="btn btn-outline btn-block" onclick="App.closeProfileModal(); window.Auth.openAuthModal('login')">
            🔑 Switch Account / Login with Email
          </button>
          <button class="btn btn-danger-outline btn-block mt-2" onclick="App.closeProfileModal(); window.Auth.logout()">
            🚪 Sign Out Session
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  },

  bindEvents() {
    // Profile modal backdrop
    const profModal = document.getElementById('profile-modal');
    if (profModal) {
      profModal.addEventListener('click', (e) => {
        if (e.target === profModal) this.closeProfileModal();
      });
    }

    // Mobile device preview toggle (lets desktop users toggle mobile frame mode)
    const mobileToggleBtn = document.getElementById('toggle-mobile-mode-btn');
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-simulator-active');
        const isActive = document.body.classList.contains('mobile-simulator-active');
        window.showToast(isActive ? '📱 Mobile Simulator View Enabled' : '🖥️ Standard Responsive View Enabled', 'info');
      });
    }
  }
};

window.Navigation = Navigation;
window.App = App;

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
