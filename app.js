// ============================
// ADEEG.COM — Login System
// Google Sign-In + Email/Password
// Session Management | Dashboard
// ============================

const CONFIG = {
  GOOGLE_CLIENT_ID: '1076286184823-9p8gq0priirhctrpj0ioja30o7i3vjk8.apps.googleusercontent.com',
  SESSION_KEY: 'adeeg_session',
  THEME_KEY: 'adeeg_theme',
  USERS_KEY: 'adeeg_users'
};

// Demo users for email/password login
const DEMO_USERS = [
  { email: 'demo@adeeg.com', password: 'demo123', name: 'Ilyas Abdi Ali', picture: 'https://i.ibb.co/W4Pf34pg/file-0000000028ec71f49b86ee296e2dc895.png' },
  { email: 'admin@adeeg.com', password: 'admin123', name: 'Admin Adeeg', picture: '' }
];

// ============================
// UTILITY
// ============================
const Utils = {
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  genId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

// ============================
// SESSION
// ============================
const Session = {
  save(data) {
    const session = { ...data, id: Utils.genId(), time: new Date().toISOString() };
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
  },

  get() {
    const raw = localStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  exists() {
    return !!this.get();
  }
};

// ============================
// THEME
// ============================
const Theme = {
  init() {
    const saved = localStorage.getItem(CONFIG.THEME_KEY) || 'light';
    this.set(saved);
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.THEME_KEY, theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.set(current === 'light' ? 'dark' : 'light');
  }
};

// ============================
// USERS DATABASE
// ============================
function getUsers() {
  const stored = localStorage.getItem(CONFIG.USERS_KEY);
  const storedUsers = stored ? JSON.parse(stored) : [];
  const merged = [...DEMO_USERS];
  for (const u of storedUsers) {
    const idx = merged.findIndex(m => m.email === u.email);
    if (idx >= 0) merged[idx] = { ...merged[idx], ...u };
    else merged.push(u);
  }
  return merged;
}

function saveUser(data) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === data.email);
  if (idx >= 0) users[idx] = { ...users[idx], ...data };
  else users.push(data);
  localStorage.setItem(CONFIG.USERS_KEY, JSON.stringify(users));
}

// ============================
// GOOGLE SIGN-IN HANDLER
// ============================
function handleGoogleLogin(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      provider: 'google'
    };
    Session.save(user);
    Utils.toast(`Soo dhawoow, ${user.name}!`, 'success');
    showDashboard(user);
  } catch (err) {
    console.error('Google login error:', err);
    Utils.toast('Google login failed. Try again.', 'error');
  }
}
window.handleGoogleLogin = handleGoogleLogin;

// ============================
// EMAIL LOGIN
// ============================
document.getElementById('emailForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passInput').value.trim();
  const remember = document.getElementById('rememberMe').checked;

  if (!email || !password) {
    Utils.toast('Fadlan buuxi goobaha', 'error');
    return;
  }
  if (!Utils.isValidEmail(email)) {
    Utils.toast('Geli email sax ah', 'error');
    return;
  }
  if (password.length < 4) {
    Utils.toast('Password-ku waa inuu ka badanyahay 4 xaraf', 'error');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  setTimeout(() => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const userData = {
        id: 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
        name: user.name,
        email: user.email,
        picture: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a73e8&color=fff&size=200`,
        provider: 'email'
      };
      Session.save(userData);
      if (remember) {
        localStorage.setItem('adeeg_remembered', email);
      } else {
        localStorage.removeItem('adeeg_remembered');
      }
      Utils.toast(`Soo dhawoow, ${userData.name}!`, 'success');
      showDashboard(userData);
    } else {
      Utils.toast('Email ama password khalad', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = 'Login <i class="fas fa-arrow-right"></i>';
  }, 1000);
});

// ============================
// TOGGLE PASSWORD VISIBILITY
// ============================
function togglePass() {
  const input = document.getElementById('passInput');
  const icon = document.querySelector('.toggle-pass i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ============================
// FORGOT PASSWORD
// ============================
document.querySelector('.forgot')?.addEventListener('click', function(e) {
  e.preventDefault();
  Utils.toast('Password reset link ayaa laguu soo diray email-kaaga', 'info');
});

// ============================
// SIGNUP LINK
// ============================
document.querySelector('.signup-text a')?.addEventListener('click', function(e) {
  e.preventDefault();
  Utils.toast('Nagala soo xiriir: support@adeeg.com si aad akoon u sameysato', 'info');
});

// ============================
// SHOW DASHBOARD
// ============================
function showDashboard(user) {
  const name = user.name || 'User';
  const email = user.email || '';
  const picture = user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a73e8&color=fff&size=200`;

  // Time-based greeting
  const h = new Date().getHours();
  let greeting = 'Soo dhawoow';
  if (h < 12) greeting = 'Subax wanaagsan';
  else if (h < 18) greeting = 'Galab wanaagsan';
  else greeting = 'Fiid wanaagsan';

  // Populate dashboard
  document.getElementById('greeting').textContent = greeting;
  document.getElementById('dashName').textContent = name;
  document.getElementById('navName').textContent = name;
  document.getElementById('navAvatar').src = picture;
  document.getElementById('dashAvatar').src = picture;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('profileAvatar').src = picture;
  document.getElementById('headerName').textContent = name;
  document.getElementById('headerAvatar').src = picture;
  document.getElementById('settingEmail').textContent = email;

  // Switch pages
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('dashboardPage').classList.add('active');

  // Animate counters
  setTimeout(animateCounters, 300);
}

// ============================
// COUNTER ANIMATION
// ============================
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isDec = el.dataset.decimal === '1';
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDec ? val.toFixed(1) : Math.floor(val);
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ============================
// NAVIGATION (Sidebar)
// ============================
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    const section = this.dataset.section;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});

// ============================
// HAMBURGER MENU
// ============================
document.getElementById('hamburgerBtn')?.addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('open');
});

// ============================
// LOGOUT
// ============================
function logout() {
  Session.clear();
  Utils.toast('Waa la idin soo celiyay. Iska waran!', 'info');
  document.getElementById('dashboardPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('emailForm').reset();
}
document.getElementById('logoutBtn')?.addEventListener('click', logout);
document.getElementById('sidebarLogoutBtn')?.addEventListener('click', logout);

// ============================
// THEME TOGGLES
// ============================
document.getElementById('themeToggle')?.addEventListener('click', () => Theme.toggle());
document.getElementById('darkSwitch')?.addEventListener('change', function() {
  Theme.set(this.checked ? 'dark' : 'light');
});

// ============================
// INIT
// ============================
function init() {
  Theme.init();

  // Hide preloader
  setTimeout(() => {
    const p = document.getElementById('preloader');
    if (p) p.style.display = 'none';
  }, 600);

  // Check session
  setTimeout(() => {
    const session = Session.get();
    if (session) {
      showDashboard(session);
    } else {
      document.getElementById('loginPage').classList.add('active');
      // Restore remembered email
      const remembered = localStorage.getItem('adeeg_remembered');
      if (remembered) document.getElementById('emailInput').value = remembered;
    }
  }, 800);
}

document.addEventListener('DOMContentLoaded', init);
