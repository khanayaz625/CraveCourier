/**
 * FeastFlow - Authentication & Role Switcher Module
 * Handles login, signup, persistent sessions, and seamless multi-role switching.
 */

const Auth = {
  init() {
    this.bindEvents();
    this.updateUserUI();
    this.renderGreeting();
  },

  getCurrentUser() {
    return window.db.currentUser;
  },

  getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: '☀️', mood: 'Start your day with a hearty breakfast' };
    if (hour < 17) return { text: 'Good Afternoon', icon: '🍕', mood: 'Refuel with lunch & gourmet delights' };
    return { text: 'Good Evening', icon: '🌙', mood: 'Unwind with comfort dinner & treats' };
  },

  updateUserUI() {
    const user = this.getCurrentUser();
    const userBadgeEl = document.getElementById('header-user-badge');
    const rolePillEl = document.getElementById('header-role-pill');
    const userNameEl = document.getElementById('header-user-name');
    const userAvatarEl = document.getElementById('header-user-avatar');

    if (user) {
      if (userNameEl) userNameEl.textContent = user.name;
      if (userAvatarEl) userAvatarEl.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
      if (rolePillEl) {
        rolePillEl.textContent = this.formatRoleName(user.role);
        rolePillEl.className = `role-badge badge-${user.role}`;
      }

      // Sync role indicator across screens
      document.querySelectorAll('.current-user-name-text').forEach(el => {
        el.textContent = user.name;
      });
      document.querySelectorAll('.current-user-role-text').forEach(el => {
        el.textContent = this.formatRoleName(user.role);
      });
    }

    // Update Bottom Nav based on current role
    if (window.Navigation) {
      window.Navigation.renderBottomNav(user ? user.role : 'customer');
    }
  },

  formatRoleName(role) {
    switch (role) {
      case 'customer': return 'Foodie (Customer)';
      case 'restaurant': return 'Kitchen Partner';
      case 'rider': return 'Delivery Rider';
      case 'admin': return 'Super Admin';
      default: return role;
    }
  },

  renderGreeting() {
    const user = this.getCurrentUser();
    const greeting = this.getTimeGreeting();
    const greetingTextEl = document.getElementById('greeting-title');
    const greetingSubEl = document.getElementById('greeting-subtitle');

    if (greetingTextEl) {
      const name = user ? user.name.split(' ')[0] : 'Foodie';
      greetingTextEl.innerHTML = `${greeting.text}, <span class="text-gradient">${name}</span>! ${greeting.icon}`;
    }
    if (greetingSubEl) {
      greetingSubEl.textContent = greeting.mood;
    }
  },

  loginDemo(role) {
    const targetUser = window.db.users.find(u => u.role === role);
    if (targetUser) {
      window.db.setCurrentUser(targetUser);
      this.updateUserUI();
      this.renderGreeting();
      this.closeAuthModal();
      
      // Dispatch role change
      if (window.App) {
        window.App.switchRoleView(role);
      }
      
      window.showToast(`Logged in as ${targetUser.name} (${this.formatRoleName(role)})`, 'success');
    }
  },

  login(email, password) {
    const user = window.db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      window.showToast('User not found. Use Demo Login or Sign Up.', 'error');
      return false;
    }
    if (user.status === 'suspended') {
      window.showToast('Account is suspended by Admin.', 'error');
      return false;
    }

    window.db.setCurrentUser(user);
    this.updateUserUI();
    this.renderGreeting();
    this.closeAuthModal();
    
    if (window.App) {
      window.App.switchRoleView(user.role);
    }
    window.showToast(`Welcome back, ${user.name}!`, 'success');
    return true;
  },

  signup(name, email, role, phone) {
    const existing = window.db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      window.showToast('Email already registered. Please sign in.', 'error');
      return false;
    }

    const newUser = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role || 'customer',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=150&q=80`,
      phone: phone || '+1 (555) 000-1122',
      address: '101 Maple Street, City Center',
      savedAddresses: [{ id: 'a_new', label: 'Home', address: '101 Maple Street, City Center', isDefault: true }],
      status: 'active'
    };

    if (role === 'rider') {
      newUser.vehicle = 'Yamaha NMAX (Blue)';
      newUser.vehiclePlate = 'FF-309-R';
      newUser.rating = 5.0;
      newUser.completedOrders = 0;
      newUser.todayEarnings = 0;
    } else if (role === 'restaurant') {
      newUser.restaurantId = 'r_custom_' + Date.now();
      newUser.restaurantName = name + "'s Kitchen";
    }

    window.db.users.push(newUser);
    window.db.setCurrentUser(newUser);
    this.updateUserUI();
    this.renderGreeting();
    this.closeAuthModal();

    if (window.App) {
      window.App.switchRoleView(newUser.role);
    }

    window.showToast(`Account created! Welcome, ${newUser.name}.`, 'success');
    return true;
  },

  logout() {
    // Return to guest or prompt modal
    const defaultCustomer = window.db.users[0];
    window.db.setCurrentUser(defaultCustomer);
    this.updateUserUI();
    this.renderGreeting();
    if (window.App) {
      window.App.switchRoleView('customer');
    }
    window.showToast('Switched to default customer session.', 'info');
  },

  openAuthModal(initialTab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
      this.switchAuthTab(initialTab);
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  switchAuthTab(tabName) {
    const loginForm = document.getElementById('auth-form-login');
    const signupForm = document.getElementById('auth-form-signup');
    const tabBtns = document.querySelectorAll('.auth-tab-btn');

    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    if (loginForm && signupForm) {
      if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
      }
    }
  },

  bindEvents() {
    // Quick Demo role switcher dropdown in header
    const roleSelect = document.getElementById('header-role-select');
    if (roleSelect) {
      roleSelect.value = this.getCurrentUser().role;
      roleSelect.addEventListener('change', (e) => {
        this.loginDemo(e.target.value);
      });
    }

    // Listen for custom database changes
    window.addEventListener('user-changed', () => {
      this.updateUserUI();
      this.renderGreeting();
      if (roleSelect) roleSelect.value = this.getCurrentUser().role;
    });

    // Close auth modal on backdrop click
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAuthModal();
      });
    }
  }
};

window.Auth = Auth;
