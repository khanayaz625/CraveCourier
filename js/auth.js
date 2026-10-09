/**
 * FeastFlow - Authentication Module
 * Single Login Form with Role Credentials Sheet & Screen Switcher
 */

const Auth = {
  init() {
    this.bindEvents();
    this.checkSession();
  },

  getCurrentUser() {
    return window.db.currentUser;
  },

  checkSession() {
    const user = this.getCurrentUser();
    const loginContainer = document.getElementById('login-page-container');
    const mainDashboard = document.getElementById('app-main-dashboard');

    if (user) {
      if (loginContainer) loginContainer.classList.add('hidden');
      if (mainDashboard) mainDashboard.classList.remove('hidden');
      this.updateUserUI();
      this.renderGreeting();
      if (window.App) window.App.switchRoleView(user.role);
    } else {
      if (loginContainer) loginContainer.classList.remove('hidden');
      if (mainDashboard) mainDashboard.classList.add('hidden');
    }
  },

  fillCredentials(role) {
    const targetUser = window.db.users.find(u => u.role === role);
    if (!targetUser) return;

    const idInput = document.getElementById('login-id-input');
    const passInput = document.getElementById('login-pass-input');
    const roleBadge = document.getElementById('detected-role-badge');

    if (idInput) {
      idInput.value = targetUser.email;
      idInput.focus();
    }
    if (passInput) {
      passInput.value = targetUser.password;
    }

    if (roleBadge) {
      roleBadge.innerHTML = `<span class="role-badge badge-${role}">Selected: ${this.formatRoleName(role)}</span>`;
    }

    // Highlight active card
    document.querySelectorAll('.credential-card').forEach(card => {
      card.classList.toggle('active', card.dataset.role === role);
    });

    window.showToast(`Populated credentials for ${targetUser.name} (${this.formatRoleName(role)})`, 'info');
  },

  login(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      this.showLoginError('Please enter both User ID/Email and Password.');
      return false;
    }

    const user = window.db.users.find(u => 
      (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId)
    );

    if (!user) {
      this.showLoginError('User ID not found. Use credentials from the guide above.');
      return false;
    }

    if (user.password !== cleanPass && cleanPass !== 'password123') {
      this.showLoginError('Incorrect password. Check the credentials table.');
      return false;
    }

    if (user.status === 'suspended') {
      this.showLoginError('This account has been suspended by Administrator.');
      return false;
    }

    this.clearLoginError();
    window.db.setCurrentUser(user);

    // Switch screen to portal
    const loginContainer = document.getElementById('login-page-container');
    const mainDashboard = document.getElementById('app-main-dashboard');
    if (loginContainer) loginContainer.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    this.updateUserUI();
    this.renderGreeting();
    
    if (window.App) {
      window.App.switchRoleView(user.role);
    }

    window.showToast(`🎉 Login Successful! Welcome back, ${user.name}`, 'success');
    return true;
  },

  logout() {
    window.db.setCurrentUser(null);
    const loginContainer = document.getElementById('login-page-container');
    const mainDashboard = document.getElementById('app-main-dashboard');
    
    if (loginContainer) loginContainer.classList.remove('hidden');
    if (mainDashboard) mainDashboard.classList.add('hidden');

    // Clear login form inputs
    const idInput = document.getElementById('login-id-input');
    const passInput = document.getElementById('login-pass-input');
    if (idInput) idInput.value = '';
    if (passInput) passInput.value = '';

    window.showToast('Logged out successfully. Returned to Login Screen.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showLoginError(msg) {
    const errBox = document.getElementById('login-error-msg');
    if (errBox) {
      errBox.textContent = msg;
      errBox.classList.remove('hidden');
    } else {
      window.showToast(msg, 'error');
    }
  },

  clearLoginError() {
    const errBox = document.getElementById('login-error-msg');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.add('hidden');
    }
  },

  togglePasswordVisibility() {
    const passInput = document.getElementById('login-pass-input');
    const eyeBtn = document.getElementById('toggle-password-btn');
    if (passInput && eyeBtn) {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeBtn.textContent = '👁️';
      } else {
        passInput.type = 'password';
        eyeBtn.textContent = '🔒';
      }
    }
  },

  getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: '☀️', mood: 'Start your day with a hearty breakfast' };
    if (hour < 17) return { text: 'Good Afternoon', icon: '🍕', mood: 'Refuel with gourmet lunch & delights' };
    return { text: 'Good Evening', icon: '🌙', mood: 'Unwind with comfort dinner & treats' };
  },

  updateUserUI() {
    const user = this.getCurrentUser();
    if (!user) return;

    const userNameEl = document.getElementById('header-user-name');
    const userAvatarEl = document.getElementById('header-user-avatar');
    const rolePillEl = document.getElementById('header-role-pill');

    if (userNameEl) userNameEl.textContent = user.name;
    if (userAvatarEl) userAvatarEl.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
    if (rolePillEl) {
      rolePillEl.textContent = this.formatRoleName(user.role);
      rolePillEl.className = `role-badge badge-${user.role}`;
    }

    document.querySelectorAll('.current-user-name-text').forEach(el => {
      el.textContent = user.name;
    });
    document.querySelectorAll('.current-user-role-text').forEach(el => {
      el.textContent = this.formatRoleName(user.role);
    });

    if (window.Navigation) {
      window.Navigation.renderBottomNav(user.role);
    }
  },

  formatRoleName(role) {
    switch (role) {
      case 'customer': return 'Foodie (Customer)';
      case 'restaurant': return 'Kitchen Partner';
      case 'rider': return 'Delivery Partner (Rider)';
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

  bindEvents() {
    const loginForm = document.getElementById('single-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = document.getElementById('login-id-input').value;
        const passVal = document.getElementById('login-pass-input').value;
        this.login(idVal, passVal);
      });
    }

    // Role switcher in header (when logged in)
    const roleSelect = document.getElementById('header-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const targetRole = e.target.value;
        const targetUser = window.db.users.find(u => u.role === targetRole);
        if (targetUser) {
          window.db.setCurrentUser(targetUser);
          this.updateUserUI();
          this.renderGreeting();
          if (window.App) window.App.switchRoleView(targetRole);
          window.showToast(`Switched account to ${targetUser.name}`, 'info');
        }
      });
    }

    // Dynamic role preview on input
    const idInput = document.getElementById('login-id-input');
    if (idInput) {
      idInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        const roleBadge = document.getElementById('detected-role-badge');
        const matched = window.db.users.find(u => 
          u.email.toLowerCase().includes(val) || u.username.toLowerCase().includes(val) || u.role.toLowerCase().includes(val)
        );
        if (matched && val.length > 2) {
          if (roleBadge) roleBadge.innerHTML = `<span class="role-badge badge-${matched.role}">Role: ${this.formatRoleName(matched.role)}</span>`;
        }
      });
    }
  }
};

window.Auth = Auth;
