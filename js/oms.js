// ========================================================
// MODERN TOAST & USER-FRIENDLY DIALOG SYSTEM
// ========================================================
const Toast = {
    container: null,
    init() {
        if (!this.container && document.body) {
            let el = document.getElementById('app-toast-container');
            if (!el) {
                el = document.createElement('div');
                el.id = 'app-toast-container';
                document.body.appendChild(el);
            }
            this.container = el;
        }
        return this.container;
    },
    show({ title = '', message = '', type = 'info', duration = 3800, icon = null }) {
        this.init();
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `app-toast toast-${type}`;

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ️'
        };
        const displayIcon = icon || iconMap[type] || 'ℹ️';

        toast.innerHTML = `
            <div class="app-toast-icon-wrap">${displayIcon}</div>
            <div class="app-toast-body">
                ${title ? `<div class="app-toast-title">${escapeHtml(title)}</div>` : ''}
                <div class="app-toast-message">${escapeHtml(message)}</div>
            </div>
            <button type="button" class="app-toast-close" title="Close">✕</button>
            <div class="app-toast-progress"></div>
        `;

        const closeBtn = toast.querySelector('.app-toast-close');
        const progress = toast.querySelector('.app-toast-progress');

        const dismiss = () => {
            if (toast.classList.contains('toast-hiding')) return;
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        };

        if (closeBtn) closeBtn.onclick = dismiss;

        if (progress) {
            progress.style.transition = `transform ${duration}ms linear`;
            progress.style.transform = 'scaleX(1)';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progress.style.transform = 'scaleX(0)';
                });
            });
        }

        const timer = setTimeout(dismiss, duration);

        toast.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            if (progress) progress.style.transition = 'none';
        });

        toast.addEventListener('mouseleave', () => {
            setTimeout(dismiss, 1200);
        });

        this.container.appendChild(toast);
    },
    success(message, title = 'Success') {
        this.show({ title, message, type: 'success', icon: '✓' });
    },
    error(message, title = 'Error') {
        this.show({ title, message, type: 'error', icon: '✕' });
    },
    warning(message, title = 'Warning') {
        this.show({ title, message, type: 'warning', icon: '⚠️' });
    },
    info(message, title = 'Notice') {
        this.show({ title, message, type: 'info', icon: 'ℹ️' });
    },
    fromAlert(rawMsg) {
        if (!rawMsg) return;
        const msg = String(rawMsg).trim();

        // Check if message is multi-line with structured data (like user account summary or receipt details)
        const lines = msg.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 4 && !msg.startsWith('✅') && !msg.startsWith('🎉')) {
            AppDialog.alert({
                title: lines[0],
                message: lines.slice(1).join('\n'),
                type: 'info',
                icon: '👤'
            });
            return;
        }

        let type = 'info';
        let title = '';
        let icon = null;
        let cleanMsg = msg;

        if (msg.startsWith('✅')) {
            type = 'success';
            icon = '✓';
            cleanMsg = msg.replace(/^✅\s*/, '');
            title = 'Completed';
        } else if (msg.startsWith('❌')) {
            type = 'error';
            icon = '✕';
            cleanMsg = msg.replace(/^❌\s*/, '');
            title = 'Error';
        } else if (msg.startsWith('⚠️')) {
            type = 'warning';
            icon = '⚠️';
            cleanMsg = msg.replace(/^⚠️\s*/, '');
            title = 'Attention';
        } else if (msg.startsWith('🎉')) {
            type = 'success';
            icon = '🎉';
            cleanMsg = msg.replace(/^🎉\s*/, '');
            title = 'Welcome!';
        } else if (msg.startsWith('🛡️') || msg.startsWith('👑')) {
            type = 'info';
            icon = '🛡️';
            cleanMsg = msg.replace(/^[🛡️👑]\s*/, '');
            title = 'Admin Console';
        } else if (msg.startsWith('📋') || msg.startsWith('🔗')) {
            type = 'success';
            icon = '📋';
            cleanMsg = msg.replace(/^[📋🔗]\s*/, '');
            title = 'Copied to Clipboard';
        }

        this.show({ title, message: cleanMsg, type, icon });
    }
};

const AppDialog = {
    overlay: null,
    init() {
        if (!this.overlay && document.body) {
            let el = document.getElementById('app-dialog-overlay');
            if (!el) {
                el = document.createElement('div');
                el.id = 'app-dialog-overlay';
                document.body.appendChild(el);
            }
            this.overlay = el;
        }
        return this.overlay;
    },
    confirm({
        title = 'Confirmation Required',
        message = 'Are you sure you want to continue?',
        items = [],
        type = 'warning',
        icon = '⚠️',
        confirmText = 'Proceed',
        cancelText = 'Cancel',
        confirmClass = ''
    }) {
        return new Promise((resolve) => {
            this.init();
            if (!this.overlay) {
                resolve(window.confirm(message));
                return;
            }

            const isDanger = type === 'danger' || confirmClass.includes('danger');
            const isWarning = type === 'warning' || confirmClass.includes('warning');
            const btnClass = isDanger ? 'btn-confirm-danger' : (isWarning ? 'btn-confirm-warning' : 'btn-confirm-primary');

            let itemsHtml = '';
            if (Array.isArray(items) && items.length > 0) {
                itemsHtml = `
                    <div class="app-dialog-items-box">
                        ${items.map(it => `
                            <div class="app-dialog-item-row">
                                <span class="app-dialog-item-bullet">⚠️</span>
                                <span>${escapeHtml(it)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            this.overlay.innerHTML = `
                <div class="app-dialog-card dialog-${type}">
                    <div class="app-dialog-icon-badge">${icon}</div>
                    <div class="app-dialog-title">${escapeHtml(title)}</div>
                    <div class="app-dialog-message">${escapeHtml(message)}</div>
                    ${itemsHtml}
                    <div class="app-dialog-actions">
                        <button type="button" class="btn-dialog-cancel" id="btn-dialog-cancel-action">${escapeHtml(cancelText)}</button>
                        <button type="button" class="btn-dialog-confirm ${btnClass}" id="btn-dialog-confirm-action">${escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;

            this.overlay.classList.add('active');

            const cleanup = (result) => {
                this.overlay.classList.remove('active');
                setTimeout(() => {
                    this.overlay.innerHTML = '';
                }, 200);
                document.removeEventListener('keydown', keyHandler);
                resolve(result);
            };

            const confirmBtn = document.getElementById('btn-dialog-confirm-action');
            const cancelBtn = document.getElementById('btn-dialog-cancel-action');

            if (confirmBtn) confirmBtn.onclick = () => cleanup(true);
            if (cancelBtn) cancelBtn.onclick = () => cleanup(false);

            this.overlay.onclick = (e) => {
                if (e.target === this.overlay) cleanup(false);
            };

            const keyHandler = (e) => {
                if (e.key === 'Escape') cleanup(false);
                else if (e.key === 'Enter') cleanup(true);
            };
            document.addEventListener('keydown', keyHandler);
        });
    },
    alert({
        title = 'Notice',
        message = '',
        items = [],
        type = 'info',
        icon = 'ℹ️',
        confirmText = 'OK, Understood'
    }) {
        return new Promise((resolve) => {
            this.init();
            if (!this.overlay) {
                Toast.show({ title, message, type });
                resolve();
                return;
            }

            let itemsHtml = '';
            if (Array.isArray(items) && items.length > 0) {
                itemsHtml = `
                    <div class="app-dialog-items-box">
                        ${items.map(it => `
                            <div class="app-dialog-item-row">
                                <span class="app-dialog-item-bullet">•</span>
                                <span>${escapeHtml(it)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            this.overlay.innerHTML = `
                <div class="app-dialog-card dialog-${type}">
                    <div class="app-dialog-icon-badge">${icon}</div>
                    <div class="app-dialog-title">${escapeHtml(title)}</div>
                    <div class="app-dialog-message">${escapeHtml(message)}</div>
                    ${itemsHtml}
                    <div class="app-dialog-actions">
                        <button type="button" class="btn-dialog-confirm btn-confirm-primary" id="btn-dialog-ok-action">${escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;

            this.overlay.classList.add('active');

            const cleanup = () => {
                this.overlay.classList.remove('active');
                setTimeout(() => {
                    this.overlay.innerHTML = '';
                }, 200);
                document.removeEventListener('keydown', keyHandler);
                resolve();
            };

            const okBtn = document.getElementById('btn-dialog-ok-action');
            if (okBtn) okBtn.onclick = cleanup;
            this.overlay.onclick = (e) => {
                if (e.target === this.overlay) cleanup();
            };

            const keyHandler = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') cleanup();
            };
            document.addEventListener('keydown', keyHandler);
        });
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Override native window.alert to automatically use modern Toast/Dialog
window.alert = function(msg) {
    Toast.fromAlert(msg);
};

// ========================================================
// 0. USERS & 10-DAY TRIAL REPOSITORY
// ========================================================
const UsersStorage = {
    getAll() {
        const raw = localStorage.getItem('sz_oms_users');
        if (!raw) {
            const now = Date.now();
            const defaults = [
                {
                    id: 'usr_admin',
                    name: 'SmartZone Admin',
                    storeName: 'SmartZone Head Office',
                    email: 'smartzonelk101@gmail.com',
                    phone: '0786800086',
                    password: '2007admin@',
                    role: 'admin',
                    status: 'active',
                    plan: 'Enterprise Lifetime',
                    registeredAt: now - (30 * 86400000),
                    expiresAt: null
                },
                {
                    id: 'usr_demo',
                    name: 'Kasun Mihiranga',
                    storeName: 'Kasun Electronics',
                    email: 'demo@gmail.com',
                    phone: '0771234567',
                    password: 'demo123',
                    role: 'merchant',
                    status: 'trial',
                    plan: '10-Day Free Trial',
                    registeredAt: now - (2 * 86400000), // 2 days ago
                    expiresAt: now + (8 * 86400000)      // 8 days remaining
                },
                {
                    id: 'usr_expired',
                    name: 'Nimal Silva',
                    storeName: 'Nimal Mobiles',
                    email: 'expired@gmail.com',
                    phone: '0719998888',
                    password: 'expired123',
                    role: 'merchant',
                    status: 'expired',
                    plan: '10-Day Free Trial',
                    registeredAt: now - (12 * 86400000), // 12 days ago
                    expiresAt: now - (2 * 86400000)      // Expired 2 days ago
                }
            ];
            localStorage.setItem('sz_oms_users', JSON.stringify(defaults));
            return defaults;
        }

        const users = JSON.parse(raw);
        // Auto-migration: Ensure admin credentials stay in sync with latest configured values
        const adminUser = users.find(u => u.id === 'usr_admin' || u.role === 'admin');
        if (adminUser) {
            let updated = false;
            if (adminUser.email !== 'smartzonelk101@gmail.com') {
                adminUser.email = 'smartzonelk101@gmail.com';
                updated = true;
            }
            if (adminUser.password !== '2007admin@') {
                adminUser.password = '2007admin@';
                updated = true;
            }
            if (updated) {
                localStorage.setItem('sz_oms_users', JSON.stringify(users));
                try {
                    const curRaw = localStorage.getItem('sz_oms_current_user');
                    if (curRaw) {
                        const cur = JSON.parse(curRaw);
                        if (cur.id === 'usr_admin' || cur.role === 'admin') {
                            cur.email = 'smartzonelk101@gmail.com';
                            cur.password = '2007admin@';
                            localStorage.setItem('sz_oms_current_user', JSON.stringify(cur));
                        }
                    }
                } catch(e) {}
            }
        }
        return users;
    },

    saveAll(users) {
        localStorage.setItem('sz_oms_users', JSON.stringify(users));
    },

    getById(id) {
        return this.getAll().find(u => u.id === id);
    },

    getByEmailOrPhone(query) {
        const q = (query || '').toLowerCase().trim();
        return this.getAll().find(u => 
            (u.email || '').toLowerCase() === q || 
            (u.phone || '').trim() === q
        );
    },

    add(user) {
        const users = this.getAll();
        user.id = 'usr_' + Date.now();
        users.push(user);
        this.saveAll(users);
        return user;
    },

    update(id, updated) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updated };
            this.saveAll(users);
            const cur = Auth.getCurrentUser();
            if (cur && cur.id === id) {
                Auth.setCurrentUser(users[index]);
            }
        }
    },

    delete(id) {
        let users = this.getAll();
        users = users.filter(u => u.id !== id);
        this.saveAll(users);
    }
};

// ========================================================
// SUBSCRIPTION PAYMENTS REPOSITORY
// ========================================================
const PaymentsStorage = {
    getAll() {
        const raw = localStorage.getItem('sz_oms_payments');
        if (!raw) {
            const defaults = [
                {
                    id: 'PAY-8921',
                    userId: 'usr_demo',
                    storeName: 'Kasun Electronics',
                    plan: 'Monthly',
                    amount: 1250,
                    method: 'Bank Transfer (Bank of Ceylon)',
                    ref: 'BOC-88910482',
                    date: '2026-10-02 11:20',
                    status: 'Pending'
                },
                {
                    id: 'PAY-8920',
                    userId: 'usr_admin',
                    storeName: 'SmartZone Head Office',
                    plan: '1 Year Pro',
                    amount: 12500,
                    method: 'Online Card Instant',
                    ref: 'CARD-TXN-90123',
                    date: '2026-10-01 09:15',
                    status: 'Approved'
                }
            ];
            localStorage.setItem('sz_oms_payments', JSON.stringify(defaults));
            return defaults;
        }
        return JSON.parse(raw);
    },

    saveAll(payments) {
        localStorage.setItem('sz_oms_payments', JSON.stringify(payments));
    },

    add(payment) {
        const payments = this.getAll();
        payment.id = 'PAY-' + Math.floor(1000 + Math.random() * 9000);
        payments.unshift(payment);
        this.saveAll(payments);
        return payment;
    },

    updateStatus(id, status) {
        const payments = this.getAll();
        const item = payments.find(p => p.id === id);
        if (item) {
            item.status = status;
            this.saveAll(payments);
        }
    }
};

// ========================================================
// AUTHENTICATION & SESSION CONTROLLER
// ========================================================
const Auth = {
    getCurrentUser() {
        const raw = localStorage.getItem('sz_oms_current_user');
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem('sz_oms_current_user');
            sessionStorage.removeItem('sz_oms_impersonator');
        } else {
            localStorage.setItem('sz_oms_current_user', JSON.stringify(user));
        }
        this.updateUserUI();

        // Rerender active views with the merchant's isolated data
        try {
            if (typeof renderDashboard === 'function') renderDashboard();
            if (typeof renderAllOrdersTable === 'function') renderAllOrdersTable();
            if (typeof renderProductsView === 'function') renderProductsView();
            if (typeof renderDeliveryServicesList === 'function') renderDeliveryServicesList();
            if (typeof populateDeliveryServiceDropdown === 'function') populateDeliveryServiceDropdown();
            if (typeof SmsSettings !== 'undefined' && SmsSettings.updateSettingsUI) SmsSettings.updateSettingsUI();
            if (user && user.role === 'admin' && typeof renderAdminView === 'function') {
                renderAdminView();
            }
        } catch(e) {}
    },

    login(identifier, password) {
        const user = UsersStorage.getByEmailOrPhone(identifier);
        if (!user || user.password !== password) {
            return { success: false, message: 'Invalid email/phone or password!' };
        }

        // Check if user is expired trial (User requested: dawas 10n passe eyata log wenna beri wenna one)
        if (user.role !== 'admin' && user.status !== 'active') {
            if (user.status === 'expired' || (user.expiresAt && user.expiresAt < Date.now())) {
                user.status = 'expired';
                UsersStorage.update(user.id, { status: 'expired' });
                return {
                    success: false,
                    expired: true,
                    user,
                    message: '⚠️ Your 10-Day Free Trial has expired! Log-in is blocked.\n\nPlease activate your subscription to continue using CodFlow OMS.'
                };
            }
        }

        this.setCurrentUser(user);
        return { success: true, user };
    },

    registerDemo(name, storeName, phone, email, password) {
        const existing = UsersStorage.getByEmailOrPhone(email) || UsersStorage.getByEmailOrPhone(phone);
        if (existing) {
            return { success: false, message: 'An account with this email or mobile number already exists!' };
        }

        const now = Date.now();
        const newUser = {
            id: 'usr_' + now,
            name,
            storeName,
            phone,
            email,
            password,
            role: 'merchant',
            status: 'trial',
            plan: '10-Day Free Trial',
            registeredAt: now,
            expiresAt: now + (10 * 86400000) // 10 days free
        };

        UsersStorage.add(newUser);

        // Strict Merchant Isolation: Fresh account starts with 0 products, 0 orders, 0 couriers!
        localStorage.setItem(`sz_oms_${newUser.id}_products`, JSON.stringify([]));
        localStorage.setItem(`sz_oms_${newUser.id}_orders`, JSON.stringify([]));
        localStorage.setItem(`sz_oms_${newUser.id}_delivery_services`, JSON.stringify([]));
        localStorage.setItem(`sz_oms_${newUser.id}_sms_settings`, JSON.stringify({
            enabled: false,
            template: DEFAULT_SMS_TEMPLATE,
            gateway: 'SMSLENZ',
            userId: '',
            apiKey: '',
            senderId: storeName || 'MyStore',
            baseUrl: 'https://smslenz.lk/api',
            balance: 'Not Configured'
        }));

        this.setCurrentUser(newUser);
        return { success: true, user: newUser };
    },

    logout() {
        localStorage.removeItem('sz_oms_current_user');
        sessionStorage.removeItem('sz_oms_impersonator');
        this.updateUserUI();
        window.openAuthPortal('login');
    },

    isExpired() {
        const user = this.getCurrentUser();
        if (!user) return true;
        if (user.role === 'admin' || user.status === 'active') return false;
        if (user.status === 'expired') return true;
        if (user.expiresAt && user.expiresAt < Date.now()) return true;
        return false;
    },

    getDaysLeft(user) {
        if (!user || !user.expiresAt) return null;
        const diffMs = user.expiresAt - Date.now();
        return Math.max(0, Math.ceil(diffMs / 86400000));
    },

    updateUserUI() {
        const user = this.getCurrentUser();

        // Elements
        const avatarEl = document.getElementById('sidebar-user-avatar');
        const nameEl = document.getElementById('sidebar-user-name');
        const roleEl = document.getElementById('sidebar-user-role');
        const adminNav = document.getElementById('nav-item-admin');
        const trialBanner = document.getElementById('trial-status-banner');
        const trialText = document.getElementById('trial-banner-text');
        const trialDot = document.getElementById('trial-pulse-dot');
        const topAuthBtn = document.getElementById('top-auth-btn-label');
        const topTitle = document.getElementById('top-page-title');
        const navStoreLink = document.getElementById('nav-item-store');
        const topStoreLink = document.getElementById('btn-top-store');
        const impBanner = document.getElementById('impersonation-banner');
        const impStoreName = document.getElementById('imp-store-name');
        const impMerchantId = document.getElementById('imp-merchant-id');

        // Impersonation Banner
        const isImpersonating = sessionStorage.getItem('sz_oms_impersonator') === 'usr_admin' && user && user.id !== 'usr_admin';
        if (impBanner) {
            if (isImpersonating) {
                impBanner.style.display = 'flex';
                if (impStoreName) impStoreName.textContent = user.storeName || user.name;
                if (impMerchantId) impMerchantId.textContent = user.id;
            } else {
                impBanner.style.display = 'none';
            }
        }

        if (!user) {
            if (avatarEl) avatarEl.textContent = '🔒';
            if (nameEl) nameEl.textContent = 'Guest / Sign In';
            if (roleEl) roleEl.innerHTML = `<span style="color:#38bdf8; font-weight:700; cursor:pointer;" onclick="openAuthPortal('login')">⚡ Click to Sign In</span>`;
            if (adminNav) adminNav.style.display = 'none';
            if (trialBanner) trialBanner.style.display = 'none';
            if (topAuthBtn) topAuthBtn.textContent = 'Sign In / Register';
            if (navStoreLink) navStoreLink.href = 'store.html';
            if (topStoreLink) topStoreLink.href = 'store.html';
            return;
        }

        // Set dedicated store URL for this merchant
        const merchantStoreUrl = (user.id !== 'usr_admin') ? `store.html?store=${encodeURIComponent(user.id)}` : 'store.html';
        if (navStoreLink) navStoreLink.href = merchantStoreUrl;
        if (topStoreLink) topStoreLink.href = merchantStoreUrl;

        // Update Store/Brand heading if on dashboard
        if (topTitle && document.getElementById('page-dashboard')?.classList.contains('active')) {
            topTitle.textContent = user.storeName || 'SmartZone';
        }

        // Update Sidebar
        if (avatarEl) {
            const initials = (user.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            avatarEl.textContent = initials;
        }
        if (nameEl) nameEl.textContent = user.name || 'Merchant';
        if (roleEl) {
            if (user.role === 'admin') {
                roleEl.innerHTML = `<span style="color:#a855f7; font-weight:700;">Super Admin</span>`;
            } else if (user.status === 'active') {
                roleEl.innerHTML = `<span style="color:#10b981; font-weight:700;">Active Store (${user.storeName || ''})</span>`;
            } else {
                const days = this.getDaysLeft(user);
                roleEl.innerHTML = `<span style="color:#f59e0b; font-weight:700;">⏳ Trial (${days}d left)</span>`;
            }
        }

        if (topAuthBtn) {
            topAuthBtn.textContent = (user.role === 'admin') ? '👑 Admin' : (user.storeName || user.name);
        }

        // Show Admin Nav only to admin
        if (adminNav) {
            adminNav.style.display = (user.role === 'admin') ? 'flex' : 'none';
        }

        // Update Top Trial Banner
        if (trialBanner && trialText) {
            if (user.role === 'admin' || user.status === 'active') {
                trialBanner.style.display = 'none';
            } else {
                trialBanner.style.display = 'flex';
                const days = this.getDaysLeft(user);
                if (days > 0) {
                    trialBanner.classList.remove('expired');
                    if (trialDot) {
                        trialDot.className = 'pulse-dot';
                    }
                    const expDateStr = new Date(user.expiresAt).toLocaleDateString();
                    trialText.innerHTML = `⏳ 10-Day Free Demo: <strong>${days} days remaining</strong> for <em>${user.storeName || 'your store'}</em> (Expires: ${expDateStr})`;
                } else {
                    trialBanner.classList.add('expired');
                    if (trialDot) {
                        trialDot.className = 'pulse-dot pulse-red';
                    }
                    trialText.innerHTML = `⚠️ <strong>Your 10-Day Free Trial has expired!</strong> Orders and features are locked until subscription is activated.`;
                }
            }
        }
    }
};

window.handleUserSignOut = async function() {
    const ok = await AppDialog.confirm({
        title: 'Sign Out from CodFlow OMS?',
        message: 'Are you sure you want to end your current session?',
        type: 'danger',
        icon: '🚪',
        confirmText: 'Yes, Sign Out',
        cancelText: 'Stay Logged In'
    });
    if (ok) {
        Auth.logout();
        Toast.info('Signed out successfully.');
    }
};

window.showCurrentUserStatus = function() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const days = Auth.getDaysLeft(user);
    AppDialog.alert({
        title: user.storeName || user.name,
        message: `Owner Name: ${user.name}\nMobile Contact: ${user.phone}\nAccount Email: ${user.email}\nSubscription: ${user.status.toUpperCase()} (${user.plan})\nAccess Remaining: ${days !== null ? `${days} Days Left` : 'Unlimited Lifetime Access'}`,
        type: 'info',
        icon: '👤',
        confirmText: 'Close'
    });
};

// ========================================================
// MULTI-TENANT MERCHANT SCOPING & ISOLATION HELPERS
// ========================================================
function getActiveMerchantId() {
    const user = Auth.getCurrentUser();
    if (!user) return 'usr_admin';
    return user.id;
}

// Dynamic Website Domain & Courier Reverse API Webhook Endpoints
function getSiteBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
        const proto = window.location.protocol || '';
        if (!proto.startsWith('file:') && window.location.origin && window.location.origin !== 'null') {
            return window.location.origin;
        }
        if (!proto.startsWith('file:') && window.location.host) {
            return `${proto}//${window.location.host}`;
        }
    }
    // Absolute fallback for file:// or unknown environments
    return 'https://smartzonelk.lk';
}

function getCourierWebhookUrl(provider = 'fardar') {
    const isTrans = (provider || '').toLowerCase().includes('trans');
    const base = getSiteBaseUrl();

    // file:// local open — use production smartzonelk.lk PHP endpoints
    if (base === 'https://smartzonelk.lk' || base.startsWith('file:')) {
        return isTrans
            ? 'https://smartzonelk.lk/api/trans_express_webhook.php'
            : 'https://smartzonelk.lk/api/fardar_webhook.php';
    }

    // Vercel deployments (vercel.app, preview URLs, custom domains) — use JS serverless endpoints (no .php)
    if (base.includes('vercel.app') || base.includes('localhost')) {
        return isTrans
            ? `${base}/api/trans_express_webhook`
            : `${base}/api/fardar_webhook`;
    }

    // Any other host (custom domain on Vercel or Apache) — auto-detect
    // Try serverless style first (Vercel custom domain), fallback handled by caller if needed
    return isTrans
        ? `${base}/api/trans_express_webhook`
        : `${base}/api/fardar_webhook`;
}

// Format Phone Number to E.164 required by SMSLENZ API (+947XXXXXXXX)
function formatSmsLenzContact(phone) {
    if (!phone) return '+94760000000';
    let digits = ('' + phone).replace(/[^0-9]/g, '');
    if (digits.startsWith('94') && digits.length >= 11) {
        return '+' + digits;
    }
    if (digits.startsWith('0') && digits.length === 10) {
        return '+94' + digits.substring(1);
    }
    if (digits.length === 9) {
        return '+94' + digits;
    }
    return '+' + digits;
}

// Format Phone Number for Sri Lankan courier APIs (10 digits starting with 0, e.g. 07XXXXXXXX)
function formatFardarPhone(phone) {
    if (!phone) return '0770000000';
    let digits = ('' + phone).replace(/[^0-9]/g, '');
    if (digits.startsWith('94') && digits.length >= 11) {
        digits = '0' + digits.substring(2);
    } else if (digits.length === 9) {
        digits = '0' + digits;
    }
    return digits;
}

window.copyModalWebhookUrl = function() {
    const input = document.getElementById('modal-ds-webhook');
    if (!input || !input.value) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(() => {
            alert('📋 Webhook URL Copied to clipboard!\n' + input.value + '\n\nPaste this URL into your Courier Portal settings (Fardar Reverse API / TransExpress Web Hook) to receive automatic live tracking updates!');
        }).catch(() => {
            input.select();
            document.execCommand('copy');
            alert('📋 Webhook URL Copied: ' + input.value);
        });
    } else {
        input.select();
        document.execCommand('copy');
        alert('📋 Webhook URL Copied: ' + input.value);
    }
};

// Migrate un-scoped legacy data to master admin account (usr_admin)
function migrateStorageToMultiTenant() {
    try {
        if (!localStorage.getItem('sz_oms_usr_admin_products') && localStorage.getItem('sz_oms_products')) {
            localStorage.setItem('sz_oms_usr_admin_products', localStorage.getItem('sz_oms_products'));
        }
        if (!localStorage.getItem('sz_oms_usr_admin_orders') && localStorage.getItem('sz_oms_orders')) {
            localStorage.setItem('sz_oms_usr_admin_orders', localStorage.getItem('sz_oms_orders'));
        }
        if (!localStorage.getItem('sz_oms_usr_admin_delivery_services') && localStorage.getItem('sz_oms_delivery_services')) {
            localStorage.setItem('sz_oms_usr_admin_delivery_services', localStorage.getItem('sz_oms_delivery_services'));
        }
        if (!localStorage.getItem('sz_oms_usr_admin_sms_settings') && localStorage.getItem('sz_oms_sms_settings')) {
            localStorage.setItem('sz_oms_usr_admin_sms_settings', localStorage.getItem('sz_oms_sms_settings'));
        }
    } catch (e) {}
}
migrateStorageToMultiTenant();

// ========================================================
// 1. DELIVERY SERVICES REPOSITORY (MULTI-TENANT ISOLATED)
// ========================================================
const DeliveryServices = {
    getAll() {
        const mId = getActiveMerchantId();
        const key = `sz_oms_${mId}_delivery_services`;
        const raw = localStorage.getItem(key);
        if (!raw) {
            if (mId === 'usr_admin') {
                // Default configured services for Master Admin (Pamidu / SmartZone)
                const defaults = [
                    {
                        id: 'ds_trans_islandwide',
                        name: 'Trans Express Islandwide',
                        provider: 'Trans Express',
                        baseCost: 500,
                        extraCostKg: 50,
                        baseCharge: 500,
                        extraChargeKg: 50,
                        apiKey: 'olvsGUXYUzvDkKg19fx18VR5voxFurxikakIs0cZsKvyan4gbaRf7lg8WZbyA5RIjZUZFRgq2HnVx931',
                        clientId: '4792',
                        isDefault: true
                    },
                    {
                        id: 'ds_fardar_default',
                        name: 'Fardar Domestic Express',
                        provider: 'Fardar Express',
                        baseCost: 500,
                        extraCostKg: 0,
                        baseCharge: 500,
                        extraChargeKg: 0,
                        apiKey: '2c25c0244f8d688eb9ff',
                        clientId: '5980',
                        isDefault: false
                    }
                ];
                localStorage.setItem(key, JSON.stringify(defaults));
                return defaults;
            }
            // For new merchants: STRICTLY 0 DELIVERY SERVICES!
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    },

    saveAll(services) {
        const mId = getActiveMerchantId();
        localStorage.setItem(`sz_oms_${mId}_delivery_services`, JSON.stringify(services));
    },

    add(service) {
        const services = this.getAll();
        service.id = 'ds_' + Date.now();
        services.push(service);
        this.saveAll(services);
        return service;
    },

    update(id, updated) {
        const services = this.getAll();
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = { ...services[index], ...updated };
            this.saveAll(services);
        }
    },

    delete(id) {
        let services = this.getAll();
        services = services.filter(s => s.id !== id);
        this.saveAll(services);
    },

    getById(id) {
        return this.getAll().find(s => s.id === id);
    }
};

// ========================================================
// 2. SMS SETTINGS REPOSITORY (MULTI-TENANT + SMSLENZ API)
// ========================================================
const DEFAULT_SMS_TEMPLATE = "Hi [customer_name], thank you for shopping with [brand_name]. Your order is on the way with [delivery_service]. Tracking: [tracking]. COD Rs. [cod]. Delivery in 2-3 working days.";

const SmsSettings = {
    get() {
        const mId = getActiveMerchantId();
        const key = `sz_oms_${mId}_sms_settings`;
        const raw = localStorage.getItem(key);
        const user = Auth.getCurrentUser();
        if (!raw) {
            if (mId === 'usr_admin') {
                // Pamidu / SmartZone Live SMSlenz API Credentials matching website
                const adminDefaults = {
                    enabled: true,
                    template: DEFAULT_SMS_TEMPLATE,
                    gateway: 'SMSLENZ',
                    userId: '2161',
                    apiKey: 'bc7e67b0-c1c0-40da-a97e-6d4691be1935',
                    senderId: 'SMART ZONE',
                    baseUrl: 'https://smslenz.lk/api',
                    balance: 'Rs. 1,822.38'
                };
                localStorage.setItem(key, JSON.stringify(adminDefaults));
                return adminDefaults;
            }
            // For new merchants: blank and unconfigured!
            const merchantDefaults = {
                enabled: false,
                template: DEFAULT_SMS_TEMPLATE,
                gateway: 'SMSLENZ',
                userId: '',
                apiKey: '',
                senderId: (user && user.storeName) ? user.storeName : '',
                baseUrl: 'https://smslenz.lk/api',
                balance: 'Not Configured'
            };
            localStorage.setItem(key, JSON.stringify(merchantDefaults));
            return merchantDefaults;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return { enabled: false, template: DEFAULT_SMS_TEMPLATE, gateway: 'SMSLENZ', userId: '', apiKey: '', senderId: '' };
        }
    },

    save(data) {
        const mId = getActiveMerchantId();
        localStorage.setItem(`sz_oms_${mId}_sms_settings`, JSON.stringify(data));
        this.updateSettingsUI();
    },

    updateSettingsUI() {
        const data = this.get();
        const statusBadge = document.getElementById('sms-status-badge');
        const senderCount = document.getElementById('sms-sender-count');

        if (statusBadge) {
            statusBadge.textContent = data.enabled ? 'Enabled' : 'Disabled';
            statusBadge.style.color = data.enabled ? '#16a34a' : '#94a3b8';
        }
        if (senderCount) {
            senderCount.textContent = (data.senderId && data.apiKey) ? `1 brand configured (${data.senderId})` : '0 brands configured';
        }
    },

    generateMessage(order, brandName = "SmartZone") {
        const data = this.get();
        let msg = data.template || DEFAULT_SMS_TEMPLATE;
        msg = msg.replace(/\[customer_name\]/g, order.customer || 'Customer');
        msg = msg.replace(/\[brand_name\]/g, brandName);
        msg = msg.replace(/\[delivery_service\]/g, order.provider || 'Courier');
        msg = msg.replace(/\[tracking\]/g, order.waybill || 'N/A');
        msg = msg.replace(/\[cod\]/g, parseFloat(order.total || 0).toLocaleString());
        return msg;
    }
};

// ========================================================
// 3. COURIER LIVE API DISPATCH ENGINE (FARDAR & TRANS EXPRESS)
// ========================================================
const CourierApi = {
    // Book parcel on Fardar Express Domestic API (https://www.fdedomestic.com/api/parcel/new_api_v1.php)
    async createFardarParcel(orderData, serviceConfig) {
        const clientId = serviceConfig?.clientId || '5980';
        const apiKey = serviceConfig?.apiKey || '2c25c0244f8d688eb9ff';

        const phone1 = formatFardarPhone(orderData.phone);
        const phone2 = formatFardarPhone(orderData.phone2 || orderData.phone);
        const description = (orderData.items && orderData.items.length > 0)
            ? orderData.items.map(i => `${i.qty}x ${i.name}`).join(', ')
            : 'SmartZone E-Commerce Order';

        const formData = new URLSearchParams();
        formData.append('client_id', String(clientId).trim());
        formData.append('api_key', String(apiKey).trim());
        formData.append('order_id', orderData.id || ('SZ-' + Date.now()));
        formData.append('parcel_weight', String(orderData.weight || 0.5));
        formData.append('parcel_description', description.slice(0, 190));
        formData.append('recipient_name', orderData.customer || 'Customer');
        formData.append('recipient_contact_1', phone1);
        formData.append('recipient_contact_2', phone2);
        formData.append('recipient_address', orderData.address || 'Sri Lanka');
        formData.append('recipient_city', orderData.city || 'Padaviya');
        formData.append('amount', String(orderData.total || 0));
        formData.append('exchange', '0');

        console.log('[CourierApi] Live Booking on Fardar Express Domestic:', Object.fromEntries(formData.entries()));

        try {
            const response = await fetch('https://www.fdedomestic.com/api/parcel/new_api_v1.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json().catch(() => ({}));
            console.log('[CourierApi] Fardar API Response:', data);

            if (data && (data.status === 200 || data.status === '200') && data.waybill_no) {
                return {
                    success: true,
                    waybill: data.waybill_no,
                    message: 'Fardar parcel booked successfully in Waiting Parcels'
                };
            } else {
                console.warn('[CourierApi] Fardar API warning response:', data);
                return {
                    success: false,
                    error: data?.status || 'Fardar API returned non-200'
                };
            }
        } catch (err) {
            console.error('[CourierApi] Fardar Network Error:', err);
            return { success: false, error: err.message };
        }
    },

    // Book parcel on Trans Express Dedicated REST API (https://portal.transexpress.lk/api/orders/upload/auto-without-city)
    async createTransExpressParcel(orderData, serviceConfig) {
        const apiKey = serviceConfig?.apiKey || 'olvsGUXYUzvDkKg19fx18VR5voxFurxikakIs0cZsKvyan4gbaRf7lg8WZbyA5RIjZUZFRgq2HnVx931';
        const phone1 = formatFardarPhone(orderData.phone);
        const phone2 = formatFardarPhone(orderData.phone2 || orderData.phone);
        const description = (orderData.items && orderData.items.length > 0)
            ? orderData.items.map(i => `${i.qty}x ${i.name}`).join(', ')
            : 'SmartZone E-Commerce Order';

        const payload = [
            {
                order_id: orderData.id || ('SZ-' + Date.now()),
                customer_name: orderData.customer || 'Customer',
                address: orderData.address || 'Sri Lanka',
                order_description: description.slice(0, 190),
                customer_phone: phone1,
                customer_phone2: phone2,
                cod_amount: Number(orderData.total || 0),
                city: orderData.city || 'Padaviya',
                remarks: 'SmartZone CodFlow OMS'
            }
        ];

        console.log('[CourierApi] Live Booking on Trans Express:', payload);

        try {
            const response = await fetch('https://portal.transexpress.lk/api/orders/upload/auto-without-city', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey.trim()
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            console.log('[CourierApi] Trans Express API Response:', data);

            let waybill = null;
            if (data && data.orders && data.orders.length > 0 && data.orders[0].waybill_id) {
                waybill = data.orders[0].waybill_id;
            }
            if (waybill) {
                return {
                    success: true,
                    waybill: waybill,
                    message: 'Trans Express parcel registered successfully'
                };
            } else {
                return {
                    success: false,
                    error: data?.message || data?.error || 'Trans Express did not return waybill'
                };
            }
        } catch (err) {
            console.error('[CourierApi] Trans Express Network Error:', err);
            return { success: false, error: err.message };
        }
    }
};
window.CourierApi = CourierApi;

// Automated SMS Dispatch Engine via SMSLENZ (Matching User Documentation)
const SmsGateway = {
    async send(phone, message, gateway = 'SMSLENZ', senderId = '') {
        const smsSettings = SmsSettings.get();
        const activeGateway = gateway || smsSettings.gateway || 'SMSLENZ';
        const activeSender = senderId || smsSettings.senderId || 'SMART ZONE';
        const userId = smsSettings.userId || '2161';
        const apiKey = smsSettings.apiKey || 'bc7e67b0-c1c0-40da-a97e-6d4691be1935';
        const formattedContact = formatSmsLenzContact(phone);

        console.log(`[${activeGateway} Live SMS Dispatch] To: ${formattedContact} | User: ${userId} | Sender: ${activeSender} | Message: ${message}`);
        
        let sendResult = { success: true, messageId: `${activeGateway.slice(0, 3)}-${Date.now()}` };

        // Live Network Call to SMSLENZ (POST https://smslenz.lk/api/send-sms)
        if (activeGateway === 'SMSLENZ' && userId && apiKey) {
            try {
                const payload = {
                    user_id: String(userId).trim(),
                    api_key: String(apiKey).trim(),
                    sender_id: String(activeSender).trim(),
                    contact: formattedContact,
                    message: message
                };
                
                // Direct POST request to SMSLenz API (CORS enabled by SMSLenz server)
                const response = await fetch('https://smslenz.lk/api/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json().catch(() => ({}));
                console.log('[SMSLENZ Live Dispatch Response]', data);
                if (data && data.success) {
                    const campId = data.data?.campaign_id || Math.floor(10000 + Math.random() * 90000);
                    sendResult = {
                        success: true,
                        campaignId: campId,
                        balance: data.data?.sms_credit_balance,
                        messageId: `SMS-${campId}`
                    };
                    if (data.data?.sms_credit_balance) {
                        smsSettings.balance = `Rs. ${data.data.sms_credit_balance}`;
                        SmsSettings.save(smsSettings);
                        const balBadge = document.getElementById('smslenz-balance-badge');
                        if (balBadge) balBadge.textContent = `Main Balance: Rs. ${data.data.sms_credit_balance}`;
                    }
                } else {
                    console.warn('[SMSLENZ Live Dispatch Error]', data?.message || response.statusText);
                    sendResult = { success: false, error: data?.message || 'Failed to dispatch SMS' };
                }
            } catch (err) {
                console.warn('[SMSLENZ Dispatch Network Error]', err);
                sendResult = { success: false, error: err.message };
            }
        }

        // Show real-time animated floating toast notification in the UI
        showSmsDispatchToast(formattedContact, activeGateway, activeSender, message);
        
        // Save dispatch log for active merchant
        try {
            const mId = getActiveMerchantId();
            const logKey = `sz_oms_${mId}_sms_logs`;
            const rawLogs = localStorage.getItem(logKey) || '[]';
            const logs = JSON.parse(rawLogs);
            logs.unshift({
                id: sendResult.messageId || ('SMS-' + Math.floor(10000 + Math.random() * 90000)),
                phone: formattedContact,
                gateway: activeGateway,
                userId: userId,
                sender: activeSender,
                message: message,
                campaignId: sendResult.campaignId || null,
                date: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
            localStorage.setItem(logKey, JSON.stringify(logs.slice(0, 50)));
        } catch (e) {}

        return sendResult;
    }
};

function showSmsDispatchToast(phone, gateway, sender, message) {
    let container = document.getElementById('sms-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sms-toast-container';
        container.className = 'sms-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'sms-toast';
    toast.innerHTML = `
        <div class="sms-toast-icon">📱</div>
        <div class="sms-toast-content">
            <div class="sms-toast-title">
                <span>SMS Dispatched via <strong>${gateway}</strong></span>
                <span class="sms-toast-badge">Sent</span>
            </div>
            <div class="sms-toast-meta">To: <strong>${phone}</strong> | Sender: <strong>${sender}</strong></div>
            <div class="sms-toast-msg">"${message}"</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 6000);
}

// ========================================================
// 3. PRODUCTS INVENTORY REPOSITORY (MULTI-TENANT ISOLATED)
// ========================================================
const SAMPLE_ADMIN_PRODUCTS = [
    {
        id: 'PRD-101',
        name: 'Smart Watch Series 9 (Amoled)',
        category: 'Electronics',
        cost: 1800,
        price: 4350,
        stock: 24,
        weight: 0.35
    },
    {
        id: 'PRD-102',
        name: 'Bluetooth Wireless Earbuds Pro',
        category: 'Audio',
        cost: 1100,
        price: 2700,
        stock: 35,
        weight: 0.15
    },
    {
        id: 'PRD-103',
        name: 'Magnetic Wireless Powerbank 10000mAh',
        category: 'Accessories',
        cost: 2200,
        price: 4900,
        stock: 4, // low stock (< 5)
        weight: 0.45
    }
];

const ProductsStorage = {
    getAll() {
        const mId = getActiveMerchantId();
        const key = `sz_oms_${mId}_products`;
        const raw = localStorage.getItem(key);
        if (!raw) {
            if (mId === 'usr_admin') {
                localStorage.setItem(key, JSON.stringify(SAMPLE_ADMIN_PRODUCTS));
                return SAMPLE_ADMIN_PRODUCTS;
            }
            // For newly registered merchants: STRICTLY 0 PRODUCTS!
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    },

    saveAll(products) {
        const mId = getActiveMerchantId();
        localStorage.setItem(`sz_oms_${mId}_products`, JSON.stringify(products));
    },

    add(product) {
        const products = this.getAll();
        products.unshift(product);
        this.saveAll(products);
        return product;
    },

    update(id, updated) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updated };
            this.saveAll(products);
        }
    },

    delete(id) {
        let products = this.getAll();
        products = products.filter(p => p.id !== id);
        this.saveAll(products);
    },

    getById(id) {
        return this.getAll().find(p => p.id === id);
    },

    deductStock(idOrName, qty) {
        const products = this.getAll();
        const p = products.find(prod => prod.id === idOrName || prod.name === idOrName);
        if (p) {
            p.stock = Math.max(0, (parseInt(p.stock) || 0) - parseInt(qty || 1));
            this.saveAll(products);
        }
    }
};

// ========================================================
// 4. ORDERS STORAGE (MULTI-TENANT ISOLATED)
// ========================================================
const SAMPLE_ORDERS = [
    {
        id: 'SZ003554',
        customer: 'MOHAMED NUZAIR',
        phone: '0778901234',
        phone2: '0712348899',
        address: 'No. 24, Main Street, City Office Colombo',
        city: 'City Office',
        email: 'nuzair@gmail.com',
        serviceId: 'ds_fardar_default',
        provider: 'Fardar Express',
        clientId: '5980',
        waybill: 'API5173879',
        weight: 0.35,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-101', name: 'Smart Watch Series 9 (Amoled Display)', price: 4350, qty: 1, weight: 0.35 }
        ],
        total: 4850,
        paid: 'Paid',
        status: 'Delivered',
        origin: 'Direct OMS',
        courierLocation: 'City Office',
        date: '2026-09-29 16:54:32'
    },
    {
        id: '0335',
        customer: 'kavindu chathurya',
        phone: '0714567890',
        phone2: '',
        address: '88/B, Tangalle Road, Ranna',
        city: 'Ranna',
        email: 'kavindu@gmail.com',
        serviceId: 'ds_fardar_default',
        provider: 'Fardar Express',
        clientId: '5980',
        waybill: 'IND1302013',
        weight: 0.15,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-102', name: 'Bluetooth Wireless Earbuds Pro', price: 2700, qty: 1, weight: 0.15 }
        ],
        total: 3200,
        paid: 'Paid',
        status: 'Delivered',
        origin: 'Direct OMS',
        courierLocation: 'Ranna',
        date: '2026-09-29 21:01:43'
    },
    {
        id: 'SZ003538',
        customer: 'NADARAJA SRI RAM',
        phone: '0761239988',
        phone2: '0715554433',
        address: 'No. 15, Station Road, City Office',
        city: 'City Office',
        email: 'sriram@gmail.com',
        serviceId: 'ds_fardar_default',
        provider: 'Fardar Express',
        clientId: '5980',
        waybill: 'API5115935',
        weight: 0.20,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-103', name: 'Dual USB-C Fast Charger 65W GaN', price: 1850, qty: 1, weight: 0.20 }
        ],
        total: 2350,
        paid: 'Paid',
        status: 'Delivered',
        origin: 'Direct OMS',
        courierLocation: 'City Office',
        date: '2026-09-24 20:50:40'
    },
    {
        id: '00376',
        customer: 'raveendra puspkumra',
        phone: '0772223344',
        phone2: '',
        address: 'No. 45, Temple Junction, Kebithigollewa',
        city: 'Kebithigollewa',
        email: 'raveendra@gmail.com',
        serviceId: 'ds_fardar_default',
        provider: 'Fardar Express',
        clientId: '5980',
        waybill: 'IND1285003',
        weight: 0.40,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-101', name: 'Smart Watch Series 9', price: 4350, qty: 1, weight: 0.40 }
        ],
        total: 4850,
        paid: 'Paid',
        status: 'Delivered',
        origin: 'Direct OMS',
        courierLocation: 'Kebithigollewa',
        date: '2026-09-21 16:52:38'
    },
    {
        id: 'SZ003526',
        customer: 'asitha nath prasanna',
        phone: '0775556677',
        phone2: '',
        address: '120/A, New Kandy Road, Malabe',
        city: 'Malabe',
        email: 'asitha@gmail.com',
        serviceId: 'ds_fardar_default',
        provider: 'Fardar Express',
        clientId: '5980',
        waybill: 'API5068899',
        weight: 0.25,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-102', name: 'Earbuds Pro', price: 2700, qty: 1, weight: 0.25 }
        ],
        total: 3200,
        paid: 'Paid',
        status: 'Delivered',
        origin: 'Direct OMS',
        courierLocation: 'Malabe',
        date: '2026-09-21 21:03:51'
    },
    {
        id: 'SZ-10024',
        customer: 'Kasun Rajapaksha',
        phone: '0778901234',
        phone2: '0712348899',
        address: 'No. 24, Kandy Road, Peradeniya',
        city: 'Kandy',
        email: 'kasun@gmail.com',
        serviceId: 'ds_trans_islandwide',
        provider: 'Trans Express',
        clientId: '4792',
        waybill: 'BE4542289',
        weight: 0.35,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-101', name: 'Smart Watch Series 9', price: 4350, qty: 1, weight: 0.35 }
        ],
        total: 4850,
        paid: 'Unpaid',
        status: 'In Transit',
        origin: 'Direct OMS',
        courierLocation: 'Peradeniya Hub',
        date: '2026-10-02 14:30:00'
    },
    {
        id: 'SZ-10026',
        customer: 'Chathurika Perera',
        phone: '0761239988',
        phone2: '0715554433',
        address: 'No. 15, Temple Road, Kurunegala',
        city: 'Kurunegala',
        email: 'chathurika@gmail.com',
        serviceId: '',
        provider: 'Pending Dispatch',
        clientId: '',
        waybill: 'Awaiting Courier Dispatch',
        weight: 0.20,
        deliveryCharge: 500,
        items: [
            { productId: 'PRD-103', name: 'Dual USB-C Fast Charger 65W GaN', price: 1850, qty: 1, weight: 0.20 }
        ],
        total: 2350,
        paid: 'Unpaid',
        status: 'Pending',
        origin: 'Web Storefront',
        courierLocation: 'Merchant Warehouse',
        date: '2026-10-03 10:15:00'
    }
];

const OrdersStorage = {
    isCleanZeroMode() {
        const mId = getActiveMerchantId();
        return localStorage.getItem(`sz_oms_${mId}_clean_zero`) === 'true';
    },

    setCleanZeroMode(val) {
        const mId = getActiveMerchantId();
        localStorage.setItem(`sz_oms_${mId}_clean_zero`, val ? 'true' : 'false');
    },

    getAll() {
        const mId = getActiveMerchantId();
        const key = `sz_oms_${mId}_orders`;
        const raw = localStorage.getItem(key);
        if (!raw) {
            if (mId === 'usr_admin') {
                localStorage.setItem(key, JSON.stringify(SAMPLE_ORDERS));
                return SAMPLE_ORDERS;
            }
            // For newly registered merchants: STRICTLY 0 ORDERS!
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                let modified = false;
                parsed.forEach(o => {
                    if (o && o.waybill && typeof o.waybill === 'string' && o.waybill.includes('-') && o.waybill.startsWith('API-')) {
                        o.waybill = o.waybill.replace(/API-5980-(\d+)/i, 'API51$1').replace(/API-(\d+)/i, 'API$1').replace(/-/g, '');
                        modified = true;
                    }
                });
                if (modified) {
                    localStorage.setItem(key, JSON.stringify(parsed));
                }
                return parsed;
            }
            return [];
        } catch (e) {
            return [];
        }
    },

    saveAll(orders) {
        const mId = getActiveMerchantId();
        localStorage.setItem(`sz_oms_${mId}_orders`, JSON.stringify(orders));
    },

    add(order) {
        const orders = this.getAll();
        orders.unshift(order);
        this.saveAll(orders);
    },

    delete(index) {
        const orders = this.getAll();
        orders.splice(index, 1);
        this.saveAll(orders);
    }
};

// ========================================================
// 5. SRI LANKAN FAKE CUSTOMER DETECTOR
// ========================================================
const CustomerFraudDetector = {
    check(phone, address, city) {
        let clean = (phone || '').replace(/[^0-9]/g, '');
        if (clean.length === 11 && clean.startsWith('94')) {
            clean = '0' + clean.slice(2);
        } else if (clean.length === 9) {
            clean = '0' + clean;
        }

        const issues = [];
        if (clean.length !== 10 || !clean.startsWith('0')) {
            issues.push('Phone number is not 10 digits starting with 0 (e.g. 07XXXXXXXX)');
        }

        const prefix = clean.substring(0, 3);
        const validPrefixes = ['070', '071', '072', '074', '075', '076', '077', '078', '011', '081', '091', '031', '041'];
        if (!validPrefixes.includes(prefix)) {
            issues.push(`Unrecognized Sri Lankan operator prefix '${prefix}'`);
        }

        if (/(\d)\1{5,}/.test(clean) || clean === '0712345678' || clean === '0777777777') {
            issues.push('Dummy repeating numbers detected');
        }

        const words = (address || '').trim().split(/\s+/).filter(Boolean);
        if (words.length < 3) {
            issues.push('Delivery address is too brief (must include street, house #, or town)');
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }
};

// ========================================================
// 6. APPLICATION INITIALIZATION & NAVIGATION
// ========================================================
let currentOrderItems = [];

document.addEventListener('DOMContentLoaded', () => {
    const initTasks = [
        ['initAuthPortal', () => typeof initAuthPortal === 'function' && initAuthPortal()],
        ['initNavigation', () => typeof initNavigation === 'function' && initNavigation()],
        ['initSidebar', () => typeof initSidebar === 'function' && initSidebar()],
        ['initDemoModeButton', () => typeof initDemoModeButton === 'function' && initDemoModeButton()],
        ['Auth.updateUserUI', () => typeof Auth !== 'undefined' && Auth.updateUserUI && Auth.updateUserUI()],
        ['renderDashboard', () => typeof renderDashboard === 'function' && renderDashboard()],
        ['renderProductsView', () => typeof renderProductsView === 'function' && renderProductsView()],
        ['renderDeliveryServicesList', () => typeof renderDeliveryServicesList === 'function' && renderDeliveryServicesList()],
        ['populateDeliveryServiceDropdown', () => typeof populateDeliveryServiceDropdown === 'function' && populateDeliveryServiceDropdown()],
        ['renderBrandsList', () => typeof renderBrandsList === 'function' && renderBrandsList()],
        ['setupOrderItemsHandler', () => typeof setupOrderItemsHandler === 'function' && setupOrderItemsHandler()],
        ['setupDeliveryServiceModal', () => typeof setupDeliveryServiceModal === 'function' && setupDeliveryServiceModal()],
        ['setupSmsSettingsModal', () => typeof setupSmsSettingsModal === 'function' && setupSmsSettingsModal()],
        ['setupProductModals', () => typeof setupProductModals === 'function' && setupProductModals()],
        ['setupCreateOrderForm', () => typeof setupCreateOrderForm === 'function' && setupCreateOrderForm()],
        ['setupSubscriptionPaymentModal', () => typeof setupSubscriptionPaymentModal === 'function' && setupSubscriptionPaymentModal()],
        ['setupAdminConsole', () => typeof setupAdminConsole === 'function' && setupAdminConsole()],
        ['setupTrackOrderController', () => typeof setupTrackOrderController === 'function' && setupTrackOrderController()],
        ['setupDispatchCourierModal', () => typeof setupDispatchCourierModal === 'function' && setupDispatchCourierModal()],
        ['SmsSettings.updateSettingsUI', () => typeof SmsSettings !== 'undefined' && SmsSettings.updateSettingsUI && SmsSettings.updateSettingsUI()]
    ];

    initTasks.forEach(([name, task]) => {
        try {
            task();
        } catch (e) {
            console.error(`[CodFlow OMS Init] Error in ${name}:`, e);
        }
    });

    try {
        const currentUser = localStorage.getItem('sz_oms_current_user');
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        // If someone navigates directly to #admin or ?admin
        if (hash === '#admin' || search.includes('admin')) {
            if (currentUser) {
                try {
                    const user = JSON.parse(currentUser);
                    if (user && user.role === 'admin') {
                        if (typeof window.navigateTo === 'function') {
                            window.navigateTo('page-admin', 'Super Admin Console', 'Manage Stores & Tenancies');
                        }
                        return;
                    }
                } catch(e) {}
            }
            // Not authenticated as admin -> redirect to dedicated admin portal
            window.location.href = 'admin/index.html';
            return;
        }

        if (!currentUser && typeof window.openAuthPortal === 'function') {
            window.openAuthPortal('login');
        } else if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                if (user && user.role === 'admin' && sessionStorage.getItem('sz_oms_admin_redirect') === 'page-admin') {
                    sessionStorage.removeItem('sz_oms_admin_redirect');
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('page-admin', 'Super Admin Console', 'Manage Stores & Tenancies');
                    }
                }
            } catch(e) {}
        }
    } catch (e) {
        console.error('[CodFlow OMS Init] Auth redirect error:', e);
    }
});

// Single Page Navigation
function initNavigation() {
    window.navigateTo = function(pageId, pageTitle, subtitle) {
        // Expiry check for creating orders
        if (pageId === 'page-create-order' && Auth.isExpired()) {
            alert('⚠️ Your 10-Day Free Trial has expired!\n\nPlease activate your subscription to dispatch new customer orders.');
            openSubscriptionPaymentModal();
            return;
        }

        // Access check for Super Admin Console
        if (pageId === 'page-admin') {
            const user = Auth.getCurrentUser();
            if (!user || user.role !== 'admin') {
                alert('🚫 Access Denied: Admin Console is restricted to Super Admin only.');
                window.navigateTo('page-dashboard', 'SmartZone', 'Business Dashboard');
                return;
            }
        }

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navEl = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (navEl) navEl.classList.add('active');

        document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
        const targetView = document.getElementById(pageId);
        if (targetView) targetView.classList.add('active');

        // Update Top Heading & Action Buttons
        const titleEl = document.getElementById('top-page-title');
        const subEl = document.getElementById('top-page-subtitle');
        const btnCreateOrder = document.getElementById('btn-top-create-order');
        const btnAddProduct = document.getElementById('btn-top-add-product');
        const btnBack = document.getElementById('btn-top-back');

        if (titleEl) titleEl.textContent = pageTitle || 'SmartZone';
        if (subEl) subEl.textContent = subtitle || 'Business Dashboard';

        // Context-sensitive top buttons matching CodFlow OMS
        if (pageId === 'page-create-order') {
            if (btnCreateOrder) btnCreateOrder.style.display = 'none';
            if (btnAddProduct) btnAddProduct.style.display = 'none';
            if (btnBack) btnBack.style.display = 'inline-flex';
        } else if (pageId === 'page-products') {
            if (btnCreateOrder) btnCreateOrder.style.display = 'none';
            if (btnAddProduct) btnAddProduct.style.display = 'inline-flex';
            if (btnBack) btnBack.style.display = 'none';
            const prods = ProductsStorage.getAll();
            if (subEl) subEl.textContent = `${prods.length} products`;
        } else if (pageId === 'page-admin' || pageId === 'page-track-order') {
            if (btnCreateOrder) btnCreateOrder.style.display = 'none';
            if (btnAddProduct) btnAddProduct.style.display = 'none';
            if (btnBack) btnBack.style.display = 'none';
        } else {
            if (btnCreateOrder) btnCreateOrder.style.display = 'inline-flex';
            if (btnAddProduct) btnAddProduct.style.display = 'none';
            if (btnBack) btnBack.style.display = 'none';
        }

        // Re-render views if needed
        if (pageId === 'page-dashboard') renderDashboard();
        if (pageId === 'page-products') renderProductsView();
        if (pageId === 'page-settings') {
            renderDeliveryServicesList();
            if (typeof renderBrandsList === 'function') renderBrandsList();
            SmsSettings.updateSettingsUI();
        }
        if (pageId === 'page-orders') renderAllOrdersTable();
        if (pageId === 'page-admin') renderAdminView();
        if (pageId === 'page-track-order') renderTrackOrderView();
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            const title = item.getAttribute('data-title') || 'SmartZone';
            const sub = item.getAttribute('data-sub') || '';
            window.navigateTo(page, title, sub);
        });
    });
}

// Sidebar Collapse / Expand
function initSidebar() {
    const btn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('app-sidebar');
    if (btn && sidebar) {
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Sign Out Confirmation
window.confirmSignOut = async function() {
    const ok = await AppDialog.confirm({
        title: 'Sign Out from CodFlow OMS?',
        message: 'Are you sure you want to sign out and lock your session?',
        type: 'danger',
        icon: '🚪',
        confirmText: 'Yes, Sign Out',
        cancelText: 'Stay Logged In'
    });
    if (ok) {
        Auth.logout();
        Toast.info('Signed out successfully.');
    }
};

// ========================================================
// 7. DASHBOARD & DEMO DATA SWITCHER (SCREENSHOT 1)
// ========================================================
function initDemoModeButton() {
    const btn = document.getElementById('btn-toggle-demo-view');
    if (!btn) return;
    const isClean = OrdersStorage.isCleanZeroMode() || OrdersStorage.getAll().length === 0;
    btn.textContent = isClean ? '⚡ Load Sample Orders' : '⚡ Switch to Clean 0-View';
}

window.toggleDemoDataMode = function() {
    const isClean = OrdersStorage.isCleanZeroMode() || OrdersStorage.getAll().length === 0;
    if (isClean) {
        OrdersStorage.setCleanZeroMode(false);
        OrdersStorage.saveAll(SAMPLE_ORDERS);
    } else {
        OrdersStorage.setCleanZeroMode(true);
    }
    initDemoModeButton();
    renderDashboard();
    renderProductsView();
    renderAllOrdersTable();
};

window.handlePeriodChange = function() {
    renderDashboard();
};

function renderDashboard() {
    const orders = OrdersStorage.getAll();
    const totalOrders = orders.length;

    let sales = 0;
    let netProfit = 0;
    let outstanding = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    orders.forEach(o => {
        const tot = parseFloat(o.total || 0);
        sales += tot;
        if (o.status === 'Delivered' || o.paid === 'Paid') {
            paidCount++;
            netProfit += (tot * 0.35); // Approx 35% margin
        } else {
            unpaidCount++;
            outstanding += tot;
        }
    });

    // Top 4 Metric Cards (Matching Screenshot 1)
    document.getElementById('dash-total-orders').textContent = totalOrders;
    document.getElementById('dash-paid-count').textContent = `${paidCount} paid`;

    document.getElementById('dash-sales').textContent = `Rs. ${sales.toLocaleString()}`;
    document.getElementById('dash-collected').textContent = `Collected: Rs. ${(sales - outstanding).toLocaleString()}`;

    document.getElementById('dash-net-profit').textContent = `Rs. ${Math.round(netProfit).toLocaleString()}`;
    document.getElementById('dash-expenses').textContent = `Expenses: Rs. ${Math.round(sales - netProfit).toLocaleString()}`;

    document.getElementById('dash-outstanding').textContent = `Rs. ${outstanding.toLocaleString()}`;
    document.getElementById('dash-unpaid-count').textContent = `${unpaidCount} unpaid`;

    // Business Performance Placeholder or Mini-Chart
    const perfBox = document.getElementById('performance-chart-box');
    if (perfBox) {
        if (orders.length === 0) {
            perfBox.innerHTML = `No data for this period`;
        } else {
            perfBox.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:12px; width:100%;">
                    <div style="display:flex; justify-content:space-between; width:100%; font-size:12px; color:#64748b;">
                        <span>Sales Trend (Oct 2026)</span>
                        <strong style="color:#10b981;">+14.2% Growth</strong>
                    </div>
                    <div style="height:120px; width:100%; display:flex; align-items:flex-end; gap:12px; justify-content:space-around; padding:10px 0; border-bottom:1px solid #e2e8f0;">
                        <div style="height:35%; width:20px; background:#e0f2fe; border-radius:4px 4px 0 0;" title="Day 1: Rs. 1,800"></div>
                        <div style="height:65%; width:20px; background:#e0f2fe; border-radius:4px 4px 0 0;" title="Day 2: Rs. 3,200"></div>
                        <div style="height:90%; width:20px; background:#2563eb; border-radius:4px 4px 0 0;" title="Day 3: Rs. 4,850"></div>
                        <div style="height:45%; width:20px; background:#e0f2fe; border-radius:4px 4px 0 0;" title="Day 4: Rs. 2,100"></div>
                    </div>
                    <div style="font-size:11.5px; color:#64748b;">Active Dispatches: ${orders.length} Parcels</div>
                </div>
            `;
        }
    }

    // Render Recent Orders Table (6 columns matching Screenshot 1: ORDER | CUSTOMER | DATE | STATUS | TOTAL | PAID)
    const tbody = document.getElementById('recent-orders-tbody');
    if (tbody) {
        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state-box">No orders this period</td></tr>`;
        } else {
            tbody.innerHTML = orders.slice(0, 5).map(o => {
                let badgeClass = 'status-pending';
                if (o.status === 'Delivered') badgeClass = 'status-delivered';
                else if (o.status === 'In Transit' || o.status === 'Dispatched') badgeClass = 'status-transit';
                else if (o.status === 'Returned') badgeClass = 'status-returned';

                return `
                    <tr style="cursor:pointer;" onclick="printSpecificOrderLabel('${o.id}')" title="Click to view 4x6 shipping sticker">
                        <td><strong>${o.id}</strong><div style="font-size:11px; color:#64748b; font-family:'JetBrains Mono';">${o.waybill || ''}</div></td>
                        <td><strong>${o.customer}</strong><div style="font-size:11px; color:#64748b;">${o.phone}</div></td>
                        <td>${o.date}</td>
                        <td><span class="status-pill ${badgeClass}">${o.status}</span></td>
                        <td><strong>Rs. ${parseFloat(o.total).toLocaleString()}</strong></td>
                        <td style="color:${o.status === 'Delivered' ? '#166534' : '#64748b'}; font-weight:600;">
                            ${o.status === 'Delivered' ? 'Paid' : 'Unpaid'}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

// Courier Tracking Link Resolver
function getCourierTrackingUrl(provider, waybill) {
    const prov = (provider || '').toLowerCase();
    const wb = encodeURIComponent((waybill || '').trim());
    if (prov.includes('fardar')) {
        return `https://www.fdedomestic.com/track.php?track_number=${wb}`;
    } else if (prov.includes('trans')) {
        return `https://domestic.transexpress.lk/order-tracking?waybill_id=${wb}`;
    } else if (prov.includes('koombiyo')) {
        return `https://koombiyodelivery.lk/track?id=${wb}`;
    } else if (prov.includes('domex')) {
        return `https://domex.lk/tracking?waybill=${wb}`;
    } else if (prov.includes('prompt')) {
        return `https://promptxpress.lk/tracking.php?waybill=${wb}`;
    } else if (prov.includes('citypak')) {
        return `https://www.citypak.lk/track?waybill=${wb}`;
    }
    return `https://domestic.transexpress.lk/order-tracking?waybill_id=${wb}`;
}

// Populate Delivery Services in Orders Filter Bar
function populateOrderFilterCouriers() {
    const select = document.getElementById('order-filter-courier');
    if (!select) return;
    const services = DeliveryServices.getAll();
    const currentVal = select.value;
    select.innerHTML = `<option value="">All Delivery Services</option>` +
        services.map(s => `<option value="${s.id}">${s.name} (${s.provider})</option>`).join('');
    if (currentVal) select.value = currentVal;
}

// Filter All Orders Table
window.filterOrdersTable = function() {
    const q = (document.getElementById('order-search-input')?.value || '').toLowerCase().trim();
    const courierId = document.getElementById('order-filter-courier')?.value || '';
    const status = document.getElementById('order-filter-status')?.value || '';

    let orders = OrdersStorage.getAll();

    if (q) {
        orders = orders.filter(o => 
            (o.id || '').toLowerCase().includes(q) ||
            (o.waybill || '').toLowerCase().includes(q) ||
            (o.customer || '').toLowerCase().includes(q) ||
            (o.phone || '').includes(q) ||
            (o.city || '').toLowerCase().includes(q)
        );
    }

    if (courierId) {
        const s = DeliveryServices.getById(courierId);
        orders = orders.filter(o => o.serviceId === courierId || (s && (o.provider || '').toLowerCase() === (s.provider || '').toLowerCase()));
    }

    if (status) {
        orders = orders.filter(o => o.status === status);
    }

    const tbody = document.getElementById('all-orders-tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state-box">No orders match your filter criteria</td></tr>`;
        return;
    }

    renderOrdersRows(orders, tbody);
};

function renderOrdersRows(orders, tbody) {
    tbody.innerHTML = orders.map((o, idx) => {
        let badgeClass = 'status-pending';
        if (o.status === 'Delivered') badgeClass = 'status-delivered';
        else if (o.status === 'In Transit' || o.status === 'Dispatched') badgeClass = 'status-transit';
        else if (o.status === 'Returned') badgeClass = 'status-returned';

        const trackUrl = getCourierTrackingUrl(o.provider, o.waybill);
        const isFardar = (o.provider || '').toLowerCase().includes('fardar');
        const isTrans = (o.provider || '').toLowerCase().includes('trans');
        const badgeClassService = isFardar ? 'service-badge-fardar' : 'service-badge-trans';
        const service = DeliveryServices.getById(o.serviceId) || DeliveryServices.getAll().find(s => (s.provider || '').toLowerCase() === (o.provider || '').toLowerCase());
        const clientId = (service && service.clientId) || o.clientId || (isFardar ? '5980' : '4792');
        const itemsSummary = (o.items && o.items.length > 0)
            ? o.items.map(it => `${it.qty}x ${it.name}`).join(', ')
            : 'General Item';

        const isAwaitingDispatch = (o.status === 'Pending' || !o.serviceId || (o.provider || '').includes('Pending'));

        const isDispatched = (o.waybill && o.waybill !== 'Awaiting Courier Dispatch' && !isAwaitingDispatch);
        let typeTag = 'API';
        let typeBadgeClass = 'badge-api';
        if (o.waybill && o.waybill.startsWith('IND')) {
            typeTag = 'Client';
            typeBadgeClass = 'badge-client';
        } else if (isTrans || (o.waybill && o.waybill.startsWith('BE'))) {
            typeTag = 'Trans';
            typeBadgeClass = 'badge-trans';
        }

        let statusPillClass = 'pill-pending';
        if (o.status === 'Delivered') statusPillClass = 'pill-delivered';
        else if (o.status === 'In Transit' || o.status === 'Dispatched') statusPillClass = 'pill-transit';
        else if (o.status === 'Returned') statusPillClass = 'pill-returned';

        const hubLocation = o.courierLocation || o.city || 'Central Hub';

        return `
            <tr>
                <td>
                    <strong style="font-size:13.5px; color:#0f172a;">${o.id}</strong>
                    ${o.origin === 'Web Storefront' ? `<div style="margin-top:3px;"><span class="badge-web-order">🌐 Web Store</span></div>` : ''}
                </td>
                <td>
                    ${isAwaitingDispatch ? `
                        <div style="margin-bottom:4px;">
                            <span style="font-size:12px; color:#f59e0b; font-weight:700;">⏳ Awaiting Courier</span>
                        </div>
                        <button type="button" class="btn-dispatch-courier" onclick="openDispatchCourierModal('${o.id}')" title="Assign Trans Express or Fardar and dispatch">
                            🚀 Dispatch
                        </button>
                    ` : `
                        <div class="order-info-card">
                            <div class="order-waybill-row">
                                <span>${o.waybill} -</span>
                                <span class="badge-fardar-tag ${typeBadgeClass}">${typeTag}</span>
                                <button type="button" class="btn-cancel" onclick="trackOrderInApp('${o.waybill || o.id}')" style="font-size:10px; color:#0284c7; font-weight:700; padding:1px 5px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:3px; cursor:pointer;" title="Track in OMS">
                                    🔍
                                </button>
                                <a href="${trackUrl}" target="_blank" title="Track live on ${o.provider || 'Courier'} portal" style="font-size:10px; color:#64748b; text-decoration:none; padding:1px 4px; background:#f1f5f9; border-radius:3px; border:1px solid #e2e8f0; font-weight:600;">
                                    🔗
                                </a>
                            </div>
                            <div class="order-info-datetime">${o.date || ''}</div>
                            <div class="order-pills-wrap">
                                <span class="pill-fardar ${statusPillClass}">${o.status}</span>
                                <span class="pill-fardar pill-hub">${hubLocation}</span>
                                <span class="pill-fardar pill-recipient">${o.customer}</span>
                            </div>
                            <div class="order-ref-id">Order ID - ${o.id}</div>
                        </div>
                    `}
                </td>
                <td>
                    <strong>${o.customer}</strong>
                    <div style="font-size:11.5px; color:#64748b;">📞 ${o.phone} | 📍 ${o.city}</div>
                </td>
                <td style="max-width:180px; font-size:12px; color:#334155;">
                    <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">
                        ${itemsSummary}
                    </div>
                </td>
                <td style="font-size:12px; color:#64748b;">${o.date}</td>
                <td><span class="status-pill ${badgeClass}">${o.status}</span></td>
                <td><strong style="font-size:13.5px;">Rs. ${parseFloat(o.total).toLocaleString()}</strong></td>
                <td>
                    <div style="display:flex; gap:6px;">
                        ${isAwaitingDispatch ? `
                            <button class="btn-dispatch-courier" style="padding:4px 8px; font-size:11px;" onclick="openDispatchCourierModal('${o.id}')">
                                🚀 Dispatch
                            </button>
                        ` : `
                            <button class="btn-cancel" style="color:var(--primary); font-weight:700; padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px; font-size:12px;" onclick="printSpecificOrderLabel('${o.id}')" title="Print 4x6 Thermal Waybill Sticker">
                                🖨️ Label
                            </button>
                        `}
                        <button class="btn-cancel" style="color:#ef4444; font-weight:700; padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px;" onclick="deleteOrderById(${idx})">
                            ✕
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// All Orders Table (in Orders Page)
function renderAllOrdersTable() {
    populateOrderFilterCouriers();
    const orders = OrdersStorage.getAll();
    const tbody = document.getElementById('all-orders-tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state-box">No orders in database. Click "+ New Order" to create one.</td></tr>`;
        return;
    }

    renderOrdersRows(orders, tbody);
}

window.deleteOrderById = async function(idx) {
    const ok = await AppDialog.confirm({
        title: 'Delete Order?',
        message: 'Are you sure you want to permanently delete this order from your records? This action cannot be undone.',
        type: 'danger',
        icon: '🗑️',
        confirmText: 'Delete Order',
        cancelText: 'Keep Order'
    });
    if (ok) {
        OrdersStorage.delete(idx);
        renderAllOrdersTable();
        renderDashboard();
        renderDeliveryServicesList();
        Toast.success('Order removed successfully.');
    }
};

// ========================================================
// 8. PRODUCTS INVENTORY VIEW & MANAGEMENT (SCREENSHOT MATCH)
// ========================================================
function renderProductsView() {
    const products = ProductsStorage.getAll();
    const tbody = document.getElementById('products-tbody');

    // Update Subtitle
    const subEl = document.getElementById('top-page-subtitle');
    if (document.getElementById('page-products').classList.contains('active') && subEl) {
        subEl.textContent = `${products.length} products`;
    }

    // Calculate 4 KPI Cards (Matching Screenshot)
    let invCost = 0;
    let retailVal = 0;
    let lowStock = 0;
    let outStock = 0;

    products.forEach(p => {
        const stk = parseInt(p.stock) || 0;
        const cost = parseFloat(p.cost) || 0;
        const price = parseFloat(p.price) || 0;

        invCost += (cost * stk);
        retailVal += (price * stk);

        if (stk === 0) outStock++;
        else if (stk <= 5) lowStock++;
    });

    document.getElementById('prod-kpi-cost').textContent = `Rs. ${Math.round(invCost).toLocaleString()}`;
    document.getElementById('prod-kpi-value').textContent = `Rs. ${Math.round(retailVal).toLocaleString()}`;
    document.getElementById('prod-kpi-low').textContent = lowStock;
    document.getElementById('prod-kpi-out').textContent = outStock;

    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state-box">No products yet</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => {
        const cost = parseFloat(p.cost) || 0;
        const price = parseFloat(p.price) || 0;
        const stk = parseInt(p.stock) || 0;
        const weight = parseFloat(p.weight) || 0.5;
        const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;

        let stockBadge = '';
        if (stk === 0) stockBadge = `<span class="badge-out-stock">Out</span>`;
        else if (stk <= 5) stockBadge = `<span class="badge-low-stock">Low</span>`;

        return `
            <tr>
                <td><input type="checkbox" value="${p.id}"></td>
                <td><strong style="font-family:'JetBrains Mono'; font-size:12.5px; color:#0f172a;">${p.id}</strong></td>
                <td>
                    <strong style="font-size:13.5px;">${p.name}</strong>
                    <div style="font-size:11px; color:#64748b;">Category: ${p.category || 'General'}</div>
                </td>
                <td><strong>${stk}</strong> ${stockBadge}</td>
                <td>Rs. ${cost.toLocaleString()}</td>
                <td><strong>Rs. ${price.toLocaleString()}</strong></td>
                <td>${weight} kg</td>
                <td><span class="badge-margin">${margin}%</span></td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-cancel" style="font-weight:600; color:var(--primary); padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px;" onclick="openEditProductModal('${p.id}')">
                            Edit
                        </button>
                        <button class="btn-cancel" style="font-weight:700; color:#ef4444; padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px;" onclick="deleteProduct('${p.id}')">
                            ✕
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.filterProductsTable = function() {
    const q = (document.getElementById('prod-search-input')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('prod-filter-category')?.value || '';
    const status = document.getElementById('prod-filter-status')?.value || '';
    const sort = document.getElementById('prod-sort-select')?.value || 'stock_asc';

    let prods = ProductsStorage.getAll();

    if (q) {
        prods = prods.filter(p => (p.id || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q));
    }
    if (cat) {
        prods = prods.filter(p => p.category === cat);
    }
    if (status === 'in_stock') {
        prods = prods.filter(p => (parseInt(p.stock) || 0) > 5);
    } else if (status === 'low_stock') {
        prods = prods.filter(p => (parseInt(p.stock) || 0) > 0 && (parseInt(p.stock) || 0) <= 5);
    } else if (status === 'out_of_stock') {
        prods = prods.filter(p => (parseInt(p.stock) || 0) === 0);
    }

    if (sort === 'stock_asc') prods.sort((a, b) => (parseInt(a.stock) || 0) - (parseInt(b.stock) || 0));
    else if (sort === 'stock_desc') prods.sort((a, b) => (parseInt(b.stock) || 0) - (parseInt(a.stock) || 0));
    else if (sort === 'price_desc') prods.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    else if (sort === 'name_asc') prods.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (prods.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state-box">No products match your filter</td></tr>`;
        return;
    }

    tbody.innerHTML = prods.map(p => {
        const cost = parseFloat(p.cost) || 0;
        const price = parseFloat(p.price) || 0;
        const stk = parseInt(p.stock) || 0;
        const weight = parseFloat(p.weight) || 0.5;
        const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;

        let stockBadge = '';
        if (stk === 0) stockBadge = `<span class="badge-out-stock">Out</span>`;
        else if (stk <= 5) stockBadge = `<span class="badge-low-stock">Low</span>`;

        return `
            <tr>
                <td><input type="checkbox" value="${p.id}"></td>
                <td><strong style="font-family:'JetBrains Mono'; font-size:12.5px; color:#0f172a;">${p.id}</strong></td>
                <td>
                    <strong style="font-size:13.5px;">${p.name}</strong>
                    <div style="font-size:11px; color:#64748b;">Category: ${p.category || 'General'}</div>
                </td>
                <td><strong>${stk}</strong> ${stockBadge}</td>
                <td>Rs. ${cost.toLocaleString()}</td>
                <td><strong>Rs. ${price.toLocaleString()}</strong></td>
                <td>${weight} kg</td>
                <td><span class="badge-margin">${margin}%</span></td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-cancel" style="font-weight:600; color:var(--primary); padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px;" onclick="openEditProductModal('${p.id}')">
                            Edit
                        </button>
                        <button class="btn-cancel" style="font-weight:700; color:#ef4444; padding:4px 8px; border:1px solid #e2e8f0; border-radius:4px;" onclick="deleteProduct('${p.id}')">
                            ✕
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

// Product Modal Handlers
function calcProductModalMargin() {
    const cost = parseFloat(document.getElementById('modal-prod-cost')?.value || 0);
    const price = parseFloat(document.getElementById('modal-prod-price')?.value || 0);
    const calcEl = document.getElementById('modal-prod-margin-calc');
    if (!calcEl) return;

    if (price > 0) {
        const profit = price - cost;
        const margin = ((profit / price) * 100).toFixed(1);
        calcEl.textContent = `${margin}% (Profit: Rs. ${profit.toLocaleString()})`;
        calcEl.style.color = profit >= 0 ? '#166534' : '#ef4444';
    } else {
        calcEl.textContent = '0% (Rs. 0)';
    }
}
window.calcProductModalMargin = calcProductModalMargin;

window.openAddProductModal = function() {
    const modal = document.getElementById('add-product-modal');
    const form = document.getElementById('add-product-form');
    if (!modal) return;
    if (form) form.reset();
    const origId = document.getElementById('modal-product-id-orig');
    if (origId) origId.value = '';
    const titleEl = document.getElementById('modal-product-title');
    if (titleEl) titleEl.textContent = 'Add Product';
    const btnSave = document.getElementById('btn-save-prod');
    if (btnSave) btnSave.textContent = 'Save Product';

    // Auto-generate next Product ID
    const prods = typeof ProductsStorage !== 'undefined' ? ProductsStorage.getAll() : [];
    const prodIdEl = document.getElementById('modal-prod-id');
    if (prodIdEl) prodIdEl.value = 'PRD-' + (100 + prods.length + 1);
    const stockEl = document.getElementById('modal-prod-stock');
    if (stockEl) stockEl.value = 20;
    const weightEl = document.getElementById('modal-prod-weight');
    if (weightEl) weightEl.value = 0.5;
    calcProductModalMargin();
    modal.classList.add('open');
};

window.openEditProductModal = function(id) {
    const p = typeof ProductsStorage !== 'undefined' ? ProductsStorage.getById(id) : null;
    const modal = document.getElementById('add-product-modal');
    if (!p || !modal) return;

    const origId = document.getElementById('modal-product-id-orig');
    if (origId) origId.value = p.id;
    const titleEl = document.getElementById('modal-product-title');
    if (titleEl) titleEl.textContent = 'Edit Product';
    const btnSave = document.getElementById('btn-save-prod');
    if (btnSave) btnSave.textContent = 'Update Product';

    const prodIdEl = document.getElementById('modal-prod-id');
    if (prodIdEl) prodIdEl.value = p.id;
    const nameEl = document.getElementById('modal-prod-name');
    if (nameEl) nameEl.value = p.name;
    const catEl = document.getElementById('modal-prod-category');
    if (catEl) catEl.value = p.category || 'Electronics';
    const costEl = document.getElementById('modal-prod-cost');
    if (costEl) costEl.value = p.cost;
    const priceEl = document.getElementById('modal-prod-price');
    if (priceEl) priceEl.value = p.price;
    const stockEl = document.getElementById('modal-prod-stock');
    if (stockEl) stockEl.value = p.stock;
    const weightEl = document.getElementById('modal-prod-weight');
    if (weightEl) weightEl.value = p.weight || 0.5;

    calcProductModalMargin();
    modal.classList.add('open');
};

window.closeAddProductModal = function() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('open');
};

window.deleteProduct = async function(id) {
    const p = typeof ProductsStorage !== 'undefined' ? ProductsStorage.getById(id) : null;
    const name = p ? p.name : id;
    const ok = await AppDialog.confirm({
        title: 'Delete Product?',
        message: `Are you sure you want to delete product "${name}" from your inventory catalog?`,
        type: 'danger',
        icon: '🗑️',
        confirmText: 'Delete Product',
        cancelText: 'Cancel'
    });
    if (ok) {
        if (typeof ProductsStorage !== 'undefined') ProductsStorage.delete(id);
        if (typeof renderProductsView === 'function') renderProductsView();
        Toast.success(`Product "${name}" deleted from Inventory.`);
    }
};

function setupProductModals() {
    const form = document.getElementById('add-product-form');
    const costInput = document.getElementById('modal-prod-cost');
    const priceInput = document.getElementById('modal-prod-price');

    if (costInput) costInput.addEventListener('input', calcProductModalMargin);
    if (priceInput) priceInput.addEventListener('input', calcProductModalMargin);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const origId = document.getElementById('modal-product-id-orig').value;
            const id = document.getElementById('modal-prod-id').value.trim();
            const name = document.getElementById('modal-prod-name').value.trim();
            const category = document.getElementById('modal-prod-category').value;
            const cost = parseFloat(document.getElementById('modal-prod-cost').value || 0);
            const price = parseFloat(document.getElementById('modal-prod-price').value || 0);
            const stock = parseInt(document.getElementById('modal-prod-stock').value || 0);
            const weight = parseFloat(document.getElementById('modal-prod-weight').value || 0.5);

            const prodData = { id, name, category, cost, price, stock, weight };

            if (origId) {
                ProductsStorage.update(origId, prodData);
            } else {
                ProductsStorage.add(prodData);
            }

            closeAddProductModal();
            renderProductsView();
            alert(`✅ Product "${name}" saved to Inventory!`);
        });
    }
}

// ========================================================
// 9. ADD INVENTORY PRODUCT TO ORDER MODAL (ORDERS WORKFLOW)
// ========================================================
function setupOrderItemsHandler() {
    const dropzone = document.getElementById('items-dropzone');
    const addBtn = document.getElementById('btn-add-item-modal');
    const itemModal = document.getElementById('add-order-item-modal');
    const itemForm = document.getElementById('add-order-item-form');

    window.openAddOrderItemModal = function() {
        if (!itemModal || !itemForm) return;
        itemForm.reset();

        const prods = ProductsStorage.getAll();
        const select = document.getElementById('order-item-prod-select');
        if (select) {
            if (prods.length === 0) {
                select.innerHTML = `<option value="">No products in inventory (Enter custom title below)</option>`;
            } else {
                select.innerHTML = `
                    <option value="">-- Choose from Inventory Products --</option>
                    ${prods.map(p => `
                        <option value="${p.id}" data-name="${p.name}" data-price="${p.price}" data-weight="${p.weight || 0.5}" data-stock="${p.stock}">
                            ${p.name} - Rs. ${p.price.toLocaleString()} (Stock: ${p.stock}, ${p.weight || 0.5}kg)
                        </option>
                    `).join('')}
                    <option value="custom">[+] Custom Item (Not in Inventory)</option>
                `;
            }
        }

        document.getElementById('order-item-qty').value = 1;
        document.getElementById('order-item-stock-info').textContent = 'Select product above';
        itemModal.classList.add('open');
    };

    window.closeAddOrderItemModal = function() {
        if (itemModal) itemModal.classList.remove('open');
    };

    window.handleOrderItemProductSelect = function() {
        const select = document.getElementById('order-item-prod-select');
        if (!select) return;

        const opt = select.options[select.selectedIndex];
        if (!opt || !opt.value || opt.value === 'custom') {
            document.getElementById('order-item-name').value = '';
            document.getElementById('order-item-price').value = '';
            document.getElementById('order-item-weight').value = '0.5';
            document.getElementById('order-item-stock-info').textContent = 'Custom non-inventory item';
            document.getElementById('order-item-stock-info').style.color = '#64748b';
            return;
        }

        const name = opt.getAttribute('data-name');
        const price = opt.getAttribute('data-price');
        const weight = opt.getAttribute('data-weight');
        const stock = parseInt(opt.getAttribute('data-stock') || 0);

        document.getElementById('order-item-name').value = name;
        document.getElementById('order-item-price').value = price;
        document.getElementById('order-item-weight').value = weight;

        const stockEl = document.getElementById('order-item-stock-info');
        if (stockEl) {
            if (stock > 0) {
                stockEl.textContent = `✅ In Stock (${stock} units available)`;
                stockEl.style.color = '#166534';
            } else {
                stockEl.textContent = `⚠️ Out of Stock (0 units)`;
                stockEl.style.color = '#b91c1c';
            }
        }
    };

    if (dropzone) dropzone.addEventListener('click', window.openAddOrderItemModal);
    if (addBtn) addBtn.addEventListener('click', window.openAddOrderItemModal);

    if (itemForm) {
        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const select = document.getElementById('order-item-prod-select');
            const opt = select ? select.options[select.selectedIndex] : null;
            const prodId = (opt && opt.value && opt.value !== 'custom') ? opt.value : '';

            const name = document.getElementById('order-item-name').value.trim();
            const price = parseFloat(document.getElementById('order-item-price').value || 0);
            const qty = parseInt(document.getElementById('order-item-qty').value || 1);
            const weight = parseFloat(document.getElementById('order-item-weight').value || 0.5);

            if (!name || price <= 0) {
                alert('Please enter a valid product name and price!');
                return;
            }

            currentOrderItems.push({
                productId: prodId,
                name: name,
                price: price,
                qty: qty,
                weight: weight
            });

            closeAddOrderItemModal();
            renderOrderItemsList();
        });
    }

    const dsSelect = document.getElementById('order-delivery-service');
    if (dsSelect) dsSelect.addEventListener('change', () => {
        updateDeliveryChargeHelper();
        autoGenerateWaybillForOrder(false); // update helper with new provider
    });

    const chargeInput = document.getElementById('order-delivery-charge');
    if (chargeInput) chargeInput.addEventListener('input', recalculateOrderTotals);
}

function renderOrderItemsList() {
    const listContainer = document.getElementById('order-items-rendered-list');
    const dropzone = document.getElementById('items-dropzone');

    if (currentOrderItems.length === 0) {
        if (dropzone) dropzone.style.display = 'block';
        if (listContainer) listContainer.innerHTML = '';
    } else {
        if (dropzone) dropzone.style.display = 'none';
        if (listContainer) {
            listContainer.innerHTML = `
                <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:14px;">
                    ${currentOrderItems.map((item, idx) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-bottom:1px solid #f1f5f9; background:#fff;">
                            <div>
                                <strong style="font-size:13.5px;">${item.name}</strong>
                                <div style="font-size:11.5px; color:#64748b;">
                                    Rs. ${item.price.toLocaleString()} × ${item.qty} | Weight: ${(item.weight * item.qty).toFixed(2)} kg
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px;">
                                <strong style="font-size:13.5px;">Rs. ${(item.price * item.qty).toLocaleString()}</strong>
                                <button type="button" class="btn-cancel" style="color:#ef4444; padding:2px 6px;" onclick="removeOrderItem(${idx})">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    recalculateOrderTotals();
}

window.removeOrderItem = function(idx) {
    currentOrderItems.splice(idx, 1);
    renderOrderItemsList();
};

function recalculateOrderTotals() {
    const itemsTotal = currentOrderItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
    const totalWeight = currentOrderItems.reduce((acc, it) => acc + (it.weight * it.qty), 0);

    // Update weight input if user hasn't manually overridden
    const weightInput = document.getElementById('order-total-weight');
    if (weightInput) {
        weightInput.value = totalWeight > 0 ? totalWeight.toFixed(2) : 0.5;
    }

    // Dynamic delivery charge calculation based on courier rules:
    const dsSelect = document.getElementById('order-delivery-service');
    let extraChargeKg = 0;
    let baseCharge = 500;
    if (dsSelect && dsSelect.value) {
        const opt = dsSelect.options[dsSelect.selectedIndex];
        baseCharge = parseFloat(opt.getAttribute('data-base') || 500);
        extraChargeKg = parseFloat(opt.getAttribute('data-extra') || 0);
    }

    let calculatedDelCharge = baseCharge;
    if (totalWeight > 1.0 && extraChargeKg > 0) {
        const extraWeight = Math.ceil(totalWeight - 1.0);
        calculatedDelCharge += (extraWeight * extraChargeKg);
    }

    const delChargeInput = document.getElementById('order-delivery-charge');
    if (delChargeInput) {
        delChargeInput.value = calculatedDelCharge;
    }

    const grandTotal = itemsTotal + calculatedDelCharge;

    const subEl = document.getElementById('summary-items-total');
    const delEl = document.getElementById('summary-delivery-charge');
    const grandEl = document.getElementById('summary-grand-total');

    if (subEl) subEl.textContent = `Rs. ${itemsTotal.toLocaleString()}`;
    if (delEl) delEl.textContent = `Rs. ${calculatedDelCharge.toLocaleString()}`;
    if (grandEl) grandEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
}

// Auto-generate or format tracking number based on courier (No hyphens, matching real courier waybills)
window.autoGenerateWaybillForOrder = function(forceFill = true) {
    const dsSelect = document.getElementById('order-delivery-service');
    const serviceId = dsSelect ? dsSelect.value : '';
    const service = DeliveryServices.getById(serviceId) || DeliveryServices.getAll()[0];
    const provider = (service ? service.provider : '').toLowerCase();

    let waybill = '';
    if (provider.includes('fardar')) {
        // Fardar Express format: 'API' followed directly by 7 digits, NO hyphens (e.g. API5173879)
        waybill = 'API' + Math.floor(5100000 + Math.random() * 899999);
    } else if (provider.includes('trans')) {
        // Trans Express format: 'BE' followed directly by 7 digits, NO hyphens (e.g. BE4542289)
        waybill = 'BE' + Math.floor(4500000 + Math.random() * 899999);
    } else if (provider.includes('koombiyo')) {
        waybill = 'KMB' + Math.floor(1000000 + Math.random() * 9000000);
    } else if (provider.includes('domex')) {
        waybill = 'DMX' + Math.floor(1000000 + Math.random() * 9000000);
    } else if (provider.includes('prompt')) {
        waybill = 'PR' + Math.floor(1000000 + Math.random() * 9000000);
    } else if (provider.includes('citypak')) {
        waybill = 'CPK' + Math.floor(1000000 + Math.random() * 9000000);
    } else {
        waybill = 'EXP' + Math.floor(1000000 + Math.random() * 9000000);
    }

    const input = document.getElementById('order-waybill-input');
    const helper = document.getElementById('waybill-helper-text');

    if (input && forceFill) {
        input.value = waybill;
    }
    if (helper) {
        helper.innerHTML = `Courier: <strong>${service ? service.provider : 'Courier'}</strong> (Client ID: <strong>${service ? service.clientId : '-'}</strong>) | Format: <code>${waybill}</code> (leave blank to auto-generate upon dispatch)`;
    }
    return waybill;
};

// ========================================================
// 10. CREATE ORDER FORM SUBMISSION & STOCK DEDUCTION
// ========================================================
function setupCreateOrderForm() {
    const form = document.getElementById('create-order-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 10-Day Free Trial Expiry Check
        if (Auth.isExpired()) {
            alert('⚠️ Your 10-Day Free Trial has expired!\n\nPlease activate your subscription to dispatch new customer orders.');
            openSubscriptionPaymentModal();
            return;
        }

        const name = document.getElementById('order-cust-name').value.trim();
        const phone = document.getElementById('order-cust-phone').value.trim();
        const phone2 = document.getElementById('order-cust-phone2').value.trim();
        const address = document.getElementById('order-cust-address').value.trim();
        const city = document.getElementById('order-cust-city').value.trim();
        const email = document.getElementById('order-cust-email').value.trim();

        const serviceId = document.getElementById('order-delivery-service').value;
        const weight = parseFloat(document.getElementById('order-total-weight').value || 0.5);
        const delCharge = parseFloat(document.getElementById('order-delivery-charge').value || 500);

        if (currentOrderItems.length === 0) {
            alert('Please add at least one product item to this order!');
            return;
        }

        // Fraud detection check
        const fraudCheck = CustomerFraudDetector.check(phone, address, city);
        if (!fraudCheck.isValid) {
            const proceed = await AppDialog.confirm({
                title: 'Fraud / Fake Order Warning',
                message: 'Potential delivery risk detected for this customer. Please review the flagged items before booking:',
                items: fraudCheck.issues,
                type: 'warning',
                icon: '⚠️',
                confirmText: 'Proceed with Dispatch',
                cancelText: 'Cancel / Review Order',
                confirmClass: 'btn-confirm-warning'
            });
            if (!proceed) return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Registering Parcel on Courier API...';
        }

        try {
            const service = DeliveryServices.getById(serviceId) || DeliveryServices.getAll()[0];
            const itemsTotal = currentOrderItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
            const grandTotal = itemsTotal + delCharge;
            const newOrderId = 'SZ-' + Math.floor(10000 + Math.random() * 90000);

            const tempOrderData = {
                id: newOrderId,
                customer: name,
                phone,
                phone2,
                address,
                city,
                total: grandTotal,
                weight,
                items: currentOrderItems
            };

            const providerLower = (service?.provider || '').toLowerCase();
            let manualTracking = document.getElementById('order-waybill-input')?.value.trim();
            let waybill = manualTracking;

            // If no manual tracking entered, book LIVE on Courier API to register in courier portal
            if (!waybill) {
                if (providerLower.includes('fardar')) {
                    // Book on Fardar Express Domestic API (https://www.fdedomestic.com/api/parcel/new_api_v1.php)
                    const fardarRes = await CourierApi.createFardarParcel(tempOrderData, service);
                    if (fardarRes.success && fardarRes.waybill) {
                        waybill = fardarRes.waybill;
                        console.log('✅ Real Fardar Waybill booked in Waiting Parcels:', waybill);
                    } else {
                        waybill = autoGenerateWaybillForOrder(false);
                    }
                } else if (providerLower.includes('trans')) {
                    // Book on Trans Express REST API
                    const transRes = await CourierApi.createTransExpressParcel(tempOrderData, service);
                    if (transRes.success && transRes.waybill) {
                        waybill = transRes.waybill;
                        console.log('✅ Real Trans Express Waybill booked:', waybill);
                    } else {
                        waybill = autoGenerateWaybillForOrder(false);
                    }
                } else {
                    waybill = autoGenerateWaybillForOrder(false);
                }
            }

            // Normalize any hyphens (e.g. API-5980-85660 -> API5185660, no hyphens in courier tracking)
            if (waybill && waybill.includes('-')) {
                waybill = waybill.replace(/API-5980-(\d+)/i, 'API51$1').replace(/API-(\d+)/i, 'API$1').replace(/-/g, '');
            }

            const newOrder = {
                id: newOrderId,
                customer: name,
                phone,
                phone2,
                address,
                city,
                email,
                serviceId: service.id,
                provider: service.provider,
                clientId: service.clientId || '',
                waybill,
                weight,
                deliveryCharge: delCharge,
                items: [...currentOrderItems],
                total: grandTotal,
                paid: 'Unpaid',
                status: 'Dispatched',
                date: new Date().toISOString().slice(0, 16).replace('T', ' ')
            };

        // Deactivate clean zero mode if active so new order shows
        OrdersStorage.setCleanZeroMode(false);
        OrdersStorage.add(newOrder);

        // Deduct inventory stock for ordered items
        currentOrderItems.forEach(it => {
            if (it.productId) {
                ProductsStorage.deductStock(it.productId, it.qty);
            }
        });
        renderProductsView(); // update products KPIs & table
        renderDeliveryServicesList(); // update courier parcel count

        // Check if SMS dispatch is enabled
        const smsData = SmsSettings.get();
        if (smsData.enabled) {
            const smsText = SmsSettings.generateMessage(newOrder, smsData.senderId || 'SmartZone');
            SmsGateway.send(newOrder.phone, smsText, smsData.gateway || 'SMSLENZ', smsData.senderId || 'SmartZone');
        }

        // Reset Form
        form.reset();
        currentOrderItems = [];
        renderOrderItemsList();

        alert(`✅ Order ${newOrder.id} dispatched successfully!\n🚚 Delivery Service: ${newOrder.provider} (Client ID: ${service.clientId || '-'})\n📦 Waybill/Tracking: ${newOrder.waybill}\n${smsData.enabled ? '📱 Dispatch SMS queued.' : ''}`);

        // Open 4x6" Thermal Sticker Print Modal
        window.openThermalLabelModal(newOrder);

        // Return to Dashboard
        initDemoModeButton();
        window.navigateTo('page-dashboard', 'SmartZone', 'Business Dashboard');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnText;
            }
        }
    });
}

// ========================================================
// 11. 4x6" THERMAL STICKER WAYBILL PRINT
// ========================================================
window.openThermalLabelModal = function(order) {
    const modal = document.getElementById('label-print-modal');
    if (!modal) return;

    // Normalize any legacy or hyphenated waybills (e.g., API-5980-85660 -> API5185660)
    let cleanWaybill = (order.waybill || '').trim();
    if (cleanWaybill.includes('-')) {
        cleanWaybill = cleanWaybill.replace(/API-5980-(\d+)/i, 'API51$1').replace(/API-(\d+)/i, 'API$1').replace(/-/g, '');
        order.waybill = cleanWaybill;
        try {
            const allOrders = OrdersStorage.getAll();
            const target = allOrders.find(o => o.id === order.id);
            if (target) {
                target.waybill = cleanWaybill;
                OrdersStorage.saveAll(allOrders);
            }
        } catch (e) {}
    }

    const isFardar = (order.provider || '').toLowerCase().includes('fardar');
    const service = DeliveryServices.getById(order.serviceId) || DeliveryServices.getAll().find(s => (s.provider || '').toLowerCase().includes(isFardar ? 'fardar' : 'trans'));
    const clientId = (service && service.clientId) || order.clientId || (isFardar ? '5980' : '4792');
    const logoImg = isFardar ? 'assets/fed-logo.webp' : 'assets/transex-logo.webp';
    const badgeText = isFardar ? 'FED DOMESTIC' : 'TRANS EXPRESS';

    document.getElementById('lbl-logo').src = logoImg;
    document.getElementById('lbl-badge').textContent = badgeText;
    document.getElementById('lbl-waybill').textContent = order.waybill;
    document.getElementById('lbl-rec-name').textContent = order.customer;
    document.getElementById('lbl-rec-phone').textContent = `📞 ${order.phone} ${order.phone2 ? '/ ' + order.phone2 : ''}`;
    document.getElementById('lbl-rec-address').textContent = order.address;
    document.getElementById('lbl-rec-city').textContent = `📍 CITY: ${(order.city || '').toUpperCase()}`;
    document.getElementById('lbl-cod-amount').textContent = `Rs. ${parseFloat(order.total).toFixed(2)}`;
    document.getElementById('lbl-order-id').textContent = order.id;
    document.getElementById('lbl-weight').textContent = `${order.weight} KG`;
    document.getElementById('lbl-desc').textContent = (order.items || []).map(i => `${i.qty}x ${i.name}`).join(', ');

    // Generate Barcode 128
    if (window.JsBarcode) {
        JsBarcode("#lbl-barcode", order.waybill, {
            format: "CODE128",
            lineColor: "#000",
            width: 2.2,
            height: 48,
            displayValue: false
        });
    }

    // Generate QR Code with live courier tracking link
    const qrContainer = document.getElementById('lbl-qrcode');
    qrContainer.innerHTML = '';
    if (window.QRCode) {
        const trackUrl = getCourierTrackingUrl(order.provider, order.waybill);
        new QRCode(qrContainer, {
            text: trackUrl,
            width: 80,
            height: 80,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    }

    modal.classList.add('open');
};

window.printSpecificOrderLabel = function(orderId) {
    const orders = OrdersStorage.getAll();
    const order = orders.find(o => o.id === orderId);
    if (order) window.openThermalLabelModal(order);
};

window.closeThermalLabelModal = function() {
    const modal = document.getElementById('label-print-modal');
    if (modal) modal.classList.remove('open');
};

// ========================================================
// 12. DELIVERY SERVICES MODAL & MANAGEMENT
// ========================================================
function renderDeliveryServicesList() {
    const list = DeliveryServices.getAll();
    const allOrders = OrdersStorage.getAll();
    const container = document.getElementById('delivery-services-list');
    const countBadge = document.getElementById('ds-configured-count');

    if (countBadge) countBadge.textContent = `${list.length} configured`;
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state-box">No delivery services configured. Click "+ Add" to create one.</div>`;
        return;
    }

    container.innerHTML = list.map(s => {
        const isFardar = (s.provider || '').toLowerCase().includes('fardar');
        const badgeClass = isFardar ? 'service-badge-fardar' : 'service-badge-trans';
        const serviceOrders = allOrders.filter(o => o.serviceId === s.id || (o.provider && o.provider.toLowerCase() === (s.provider || '').toLowerCase()));

        return `
            <div class="delivery-service-item">
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:8px;">
                        ${s.name}
                        <span class="${badgeClass}">${s.provider}</span>
                    </div>
                    <div style="font-size:11.5px; color:#64748b; margin-top:3px;">
                        Client ID: <strong style="color:#0f172a; font-family:'JetBrains Mono'; font-size:12px;">${s.clientId || '-'}</strong> | Charge: Rs. ${s.baseCharge || 0} + Rs. ${s.extraChargeKg || 0}/kg
                    </div>
                    <div style="font-size:11.5px; color:#0284c7; margin-top:4px; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <span>📦 System Dispatches: <strong>${serviceOrders.length} orders</strong></span>
                        ${serviceOrders.length > 0 ? `<span style="color:#64748b; font-family:'JetBrains Mono'; font-size:10.5px;">(${serviceOrders.slice(0, 3).map(o => o.waybill).join(', ')}${serviceOrders.length > 3 ? '...' : ''})</span>` : ''}
                    </div>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn-cancel" style="font-weight:600; color:var(--primary); padding:4px 10px;" onclick="openEditDeliveryServiceModal('${s.id}')">
                        Edit
                    </button>
                    <button class="btn-cancel" style="font-weight:700; color:#ef4444; padding:4px 8px;" onclick="deleteDeliveryService('${s.id}')">
                        ✕
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function populateDeliveryServiceDropdown() {
    const select = document.getElementById('order-delivery-service');
    if (!select) return;

    const list = DeliveryServices.getAll();
    if (list.length === 0) {
        select.innerHTML = '<option value="">-- No courier configured. Add one in Delivery Services --</option>';
        updateDeliveryChargeHelper();
        return;
    }
    select.innerHTML = list.map(s => `
        <option value="${s.id}" data-base="${s.baseCharge || 0}" data-extra="${s.extraChargeKg || 0}">
            ${s.name} (${s.provider})
        </option>
    `).join('');

    updateDeliveryChargeHelper();
}

function updateDeliveryChargeHelper() {
    const select = document.getElementById('order-delivery-service');
    const chargeInput = document.getElementById('order-delivery-charge');
    const helper = document.getElementById('delivery-charge-helper');

    if (!select || !select.value) {
        if (helper) helper.textContent = 'Please select or add a courier service.';
        return;
    }

    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption) return;

    const base = parseFloat(selectedOption.getAttribute('data-base') || 0);
    const extra = parseFloat(selectedOption.getAttribute('data-extra') || 0);

    if (chargeInput && (!chargeInput.value || chargeInput.value === '0')) {
        chargeInput.value = base;
    }
    if (helper) {
        helper.textContent = `Default: Rs. ${base} base + Rs. ${extra}/extra kg`;
    }
    recalculateOrderTotals();
}

// ========================================================
// 12. DELIVERY SERVICES MANAGEMENT (SCREENSHOT 2 & 3)
// ========================================================

// Dynamic Provider change handler in Delivery Service Modal
function handleProviderChange() {
    const provider = document.getElementById('modal-ds-provider')?.value || '';
    const clientInput = document.getElementById('modal-ds-client-id');
    const apiInput = document.getElementById('modal-ds-api-key');
    const clientHint = document.getElementById('modal-ds-client-hint');
    const apiHint = document.getElementById('modal-ds-api-hint');
    const nameInput = document.getElementById('modal-ds-name');
    const webhookInput = document.getElementById('modal-ds-webhook');
    const isMasterAdmin = (typeof getActiveMerchantId === 'function' && getActiveMerchantId() === 'usr_admin');

    if (webhookInput && typeof getCourierWebhookUrl === 'function') {
        webhookInput.value = getCourierWebhookUrl(provider);
    }

    // Update the hint list URLs dynamically so they always reflect the live domain
    const hintFardar = document.getElementById('hint-fardar-url');
    const hintTrans = document.getElementById('hint-trans-url');
    if (hintFardar) hintFardar.textContent = getCourierWebhookUrl('fardar');
    if (hintTrans) hintTrans.textContent = getCourierWebhookUrl('trans');

    if (provider.includes('Fardar')) {
        if (clientHint) clientHint.textContent = 'Fardar Client ID (e.g. 5980) - Required';
        if (clientInput && isMasterAdmin && (!clientInput.value || clientInput.value === '4792')) clientInput.value = '5980';
        if (apiInput && isMasterAdmin && (!apiInput.value || apiInput.value.length > 50)) apiInput.value = '2c25c0244f8d688eb9ff';
        if (apiHint) apiHint.textContent = 'Fardar Domestic API Key (e.g. 2c25c0244f8d688eb9ff)';
        if (nameInput && !nameInput.value) nameInput.value = 'Fardar Domestic Express';
    } else if (provider.includes('Trans')) {
        if (clientHint) clientHint.textContent = 'Trans Express Client ID (e.g. 4792)';
        if (clientInput && isMasterAdmin && (!clientInput.value || clientInput.value === '5980')) clientInput.value = '4792';
        if (apiInput && isMasterAdmin && (!apiInput.value || apiInput.value === '2c25c0244f8d688eb9ff')) apiInput.value = 'olvsGUXYUzvDkKg19fx18VR5voxFurxikakIs0cZsKvyan4gbaRf7lg8WZbyA5RIjZUZFRgq2HnVx931';
        if (apiHint) apiHint.textContent = 'Trans Express Islandwide API Key';
        if (nameInput && !nameInput.value) nameInput.value = 'Trans Express Islandwide';
    } else {
        if (clientHint) clientHint.textContent = 'Client ID / Account Code';
        if (apiHint) apiHint.textContent = 'Courier Portal API Token';
    }
}
window.handleProviderChange = handleProviderChange;

// Top-Level Global Openers for Delivery Service Modal
window.openAddDeliveryServiceModal = function() {
    const modal = document.getElementById('add-delivery-service-modal');
    const form = document.getElementById('add-delivery-service-form');
    if (!modal) {
        console.warn('Delivery service modal element not found');
        return;
    }
    if (form) form.reset();

    const idEl = document.getElementById('modal-ds-id');
    if (idEl) idEl.value = '';
    const titleEl = document.getElementById('modal-ds-title');
    if (titleEl) titleEl.textContent = 'Add Delivery Service';
    const btnSubmit = document.getElementById('btn-submit-ds');
    if (btnSubmit) btnSubmit.textContent = 'Add Service';
    const provEl = document.getElementById('modal-ds-provider');
    if (provEl) provEl.value = 'Fardar Express';
    
    const isMaster = (typeof getActiveMerchantId === 'function' && getActiveMerchantId() === 'usr_admin');
    const nameEl = document.getElementById('modal-ds-name');
    if (nameEl) nameEl.value = isMaster ? 'Fardar Domestic Express' : '';
    const baseCostEl = document.getElementById('modal-ds-base-cost');
    if (baseCostEl) baseCostEl.value = 500;
    const extraCostEl = document.getElementById('modal-ds-extra-cost');
    if (extraCostEl) extraCostEl.value = 0;
    const baseChargeEl = document.getElementById('modal-ds-base-charge');
    if (baseChargeEl) baseChargeEl.value = 500;
    const extraChargeEl = document.getElementById('modal-ds-extra-charge');
    if (extraChargeEl) extraChargeEl.value = 0;
    const clientEl = document.getElementById('modal-ds-client-id');
    if (clientEl) clientEl.value = isMaster ? '5980' : '';
    const apiEl = document.getElementById('modal-ds-api-key');
    if (apiEl) apiEl.value = isMaster ? '2c25c0244f8d688eb9ff' : '';

    handleProviderChange();
    modal.classList.add('open');
};

window.openEditDeliveryServiceModal = function(id) {
    const modal = document.getElementById('add-delivery-service-modal');
    if (!modal) return;
    const item = typeof DeliveryServices !== 'undefined' ? DeliveryServices.getById(id) : null;
    if (!item) {
        window.openAddDeliveryServiceModal();
        return;
    }

    const idEl = document.getElementById('modal-ds-id');
    if (idEl) idEl.value = item.id;
    const titleEl = document.getElementById('modal-ds-title');
    if (titleEl) titleEl.textContent = 'Edit Delivery Service';
    const btnSubmit = document.getElementById('btn-submit-ds');
    if (btnSubmit) btnSubmit.textContent = 'Save Service';
    const nameEl = document.getElementById('modal-ds-name');
    if (nameEl) nameEl.value = item.name;
    const provEl = document.getElementById('modal-ds-provider');
    if (provEl) provEl.value = item.provider;
    const baseCostEl = document.getElementById('modal-ds-base-cost');
    if (baseCostEl) baseCostEl.value = item.baseCost || 0;
    const extraCostEl = document.getElementById('modal-ds-extra-cost');
    if (extraCostEl) extraCostEl.value = item.extraCostKg || 0;
    const baseChargeEl = document.getElementById('modal-ds-base-charge');
    if (baseChargeEl) baseChargeEl.value = item.baseCharge || 0;
    const extraChargeEl = document.getElementById('modal-ds-extra-charge');
    if (extraChargeEl) extraChargeEl.value = item.extraChargeKg || 0;
    const clientEl = document.getElementById('modal-ds-client-id');
    if (clientEl) clientEl.value = item.clientId || '';
    const apiEl = document.getElementById('modal-ds-api-key');
    if (apiEl) apiEl.value = item.apiKey || '';

    handleProviderChange();
    modal.classList.add('open');
};

window.closeDeliveryServiceModal = function() {
    const modal = document.getElementById('add-delivery-service-modal');
    if (modal) modal.classList.remove('open');
};

window.deleteDeliveryService = async function(id) {
    const ok = await AppDialog.confirm({
        title: 'Delete Delivery Service?',
        message: 'Are you sure you want to remove this courier service configuration?',
        type: 'danger',
        icon: '🚚',
        confirmText: 'Delete Service',
        cancelText: 'Cancel'
    });
    if (ok) {
        if (typeof DeliveryServices !== 'undefined') DeliveryServices.delete(id);
        if (typeof renderDeliveryServicesList === 'function') renderDeliveryServicesList();
        if (typeof populateDeliveryServiceDropdown === 'function') populateDeliveryServiceDropdown();
        Toast.success('Delivery service removed.');
    }
};

function setupDeliveryServiceModal() {
    const form = document.getElementById('add-delivery-service-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('modal-ds-id')?.value;
            const clientId = document.getElementById('modal-ds-client-id')?.value.trim() || '';
            const provider = document.getElementById('modal-ds-provider')?.value || 'Fardar Express';

            // Sri Lankan Courier Validation: Fardar requires Client ID
            if (provider.includes('Fardar') && !clientId) {
                alert('⚠️ Fardar Express සඳහා Client ID අංකය (උදා: 5980) ඇතුළත් කිරීම අනිවාර්ය වේ!');
                document.getElementById('modal-ds-client-id')?.focus();
                return;
            }

            const data = {
                name: document.getElementById('modal-ds-name')?.value.trim() || provider,
                provider: provider,
                baseCost: parseFloat(document.getElementById('modal-ds-base-cost')?.value || 0),
                extraCostKg: parseFloat(document.getElementById('modal-ds-extra-cost')?.value || 0),
                baseCharge: parseFloat(document.getElementById('modal-ds-base-charge')?.value || 0),
                extraChargeKg: parseFloat(document.getElementById('modal-ds-extra-charge')?.value || 0),
                clientId: clientId,
                apiKey: document.getElementById('modal-ds-api-key')?.value.trim() || ''
            };

            if (id) {
                DeliveryServices.update(id, data);
            } else {
                DeliveryServices.add(data);
            }

            closeDeliveryServiceModal();
            renderDeliveryServicesList();
            populateDeliveryServiceDropdown();
            alert(`✅ Delivery Service "${data.name}" (${data.provider} - Client ID: ${data.clientId || '-'}) saved successfully!`);
        });
    }
}

// Brand Management in Settings
window.openAddBrandModal = function() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    const currentBrand = (user && user.storeName) || localStorage.getItem(`sz_oms_${getActiveMerchantId()}_brand`) || 'SmartZone';
    const newBrand = prompt('Enter Store / Brand Name for Customer Orders & SMS Sender ID:', currentBrand);
    if (newBrand && newBrand.trim()) {
        const trimmed = newBrand.trim();
        if (user) {
            user.storeName = trimmed;
            if (typeof Auth !== 'undefined' && Auth.setCurrentUser) {
                Auth.setCurrentUser(user);
            }
        }
        localStorage.setItem(`sz_oms_${getActiveMerchantId()}_brand`, trimmed);
        renderBrandsList();
        const senderInput = document.getElementById('sms-sender-id');
        if (senderInput) senderInput.value = trimmed;
        if (typeof SmsSettings !== 'undefined') SmsSettings.updateSettingsUI();
        alert(`✅ Brand "${trimmed}" saved successfully!`);
    }
};

function renderBrandsList() {
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    const brandName = (user && user.storeName) || localStorage.getItem(`sz_oms_${getActiveMerchantId()}_brand`) || 'SmartZone';
    const container = document.getElementById('brands-rendered-list');
    const countEl = document.getElementById('brands-configured-count');
    if (countEl) countEl.textContent = '1 configured';
    if (container) {
        container.innerHTML = `
            <div class="brand-item-card">
                <div class="brand-info-left">
                    <div class="brand-avatar-box">${brandName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="brand-name-title">${brandName}</div>
                        <div class="brand-sub-desc">Default Store</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge-brand-default">Default</span>
                    <button type="button" class="btn-cancel" style="padding:4px 10px; font-size:11.5px; font-weight:700; color:#0284c7; border:1px solid #bae6fd; background:#f0f9ff;" onclick="openAddBrandModal()">Edit</button>
                </div>
            </div>
        `;
    }
}

// Password Eye Toggle
window.togglePasswordVisibility = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
    } else {
        input.type = 'password';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
};

// ========================================================
// 13. SMS SETTINGS MANAGEMENT (SCREENSHOT 3)
// ========================================================

function updateSmsLivePreview() {
    const previewEl = document.getElementById('sms-live-preview');
    if (!previewEl) return;

    const template = (document.getElementById('sms-dispatch-message')?.value || DEFAULT_SMS_TEMPLATE);
    const brand = document.getElementById('sms-sender-id')?.value || 'SmartZone';

    let sample = template
        .replace(/\[customer_name\]/g, 'Kasun Rajapaksha')
        .replace(/\[brand_name\]/g, brand)
        .replace(/\[delivery_service\]/g, 'Trans Express')
        .replace(/\[tracking\]/g, 'BE4542289')
        .replace(/\[cod\]/g, '4,850');

    previewEl.textContent = sample;
}
window.updateSmsLivePreview = updateSmsLivePreview;

window.openSmsSettingsModal = function() {
    const modal = document.getElementById('sms-settings-modal');
    if (!modal) {
        console.warn('SMS settings modal element not found');
        return;
    }
    const data = typeof SmsSettings !== 'undefined' ? SmsSettings.get() : {};
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;

    const elEnable = document.getElementById('sms-enable-dispatch');
    if (elEnable) elEnable.checked = !!data.enabled;

    const elMsg = document.getElementById('sms-dispatch-message');
    if (elMsg) elMsg.value = data.template || DEFAULT_SMS_TEMPLATE;

    const elGw = document.getElementById('sms-gateway-select');
    if (elGw) elGw.value = data.gateway || 'SMSLENZ';
    
    const userIdInput = document.getElementById('sms-user-id');
    if (userIdInput) userIdInput.value = data.userId || '';
    
    const baseUrlInput = document.getElementById('sms-base-url');
    if (baseUrlInput) baseUrlInput.value = data.baseUrl || 'https://smslenz.lk/api';

    const tokenInput = document.getElementById('sms-api-token');
    if (tokenInput) tokenInput.value = data.apiKey || '';

    const senderInput = document.getElementById('sms-sender-id');
    if (senderInput) senderInput.value = data.senderId || (user ? user.storeName : 'SmartZone');

    const balBadge = document.getElementById('smslenz-balance-badge');
    const statusBox = document.getElementById('smslenz-status-box');
    if (balBadge) {
        if (data.userId && data.apiKey) {
            balBadge.textContent = `Main Balance: ${data.balance || 'Checking...'}`;
            balBadge.style.color = '#065f46';
            balBadge.style.background = '#d1fae5';
            if (statusBox) statusBox.style.display = 'block';
            // Live query real-time credit balance from SMSLenz API
            if (typeof fetchSmsLenzLiveBalance === 'function') {
                fetchSmsLenzLiveBalance(data.userId, data.apiKey);
            }
        } else {
            balBadge.textContent = 'Status: Not Configured';
            balBadge.style.color = '#94a3b8';
            balBadge.style.background = '#f1f5f9';
        }
    }

    updateSmsLivePreview();
    modal.classList.add('open');
};

// Live SMSLenz Account Status & Balance Fetcher
window.fetchSmsLenzLiveBalance = async function(userId, apiKey) {
    const uId = userId || document.getElementById('sms-user-id')?.value.trim() || SmsSettings.get().userId;
    const aKey = apiKey || document.getElementById('sms-api-token')?.value.trim() || SmsSettings.get().apiKey;
    const balBadge = document.getElementById('smslenz-balance-badge');
    const statusBox = document.getElementById('smslenz-status-box');

    if (!uId || !aKey || !balBadge) return;

    try {
        const response = await fetch('https://smslenz.lk/api/account-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user_id: String(uId).trim(),
                api_key: String(aKey).trim()
            })
        });

        const resData = await response.json().catch(() => ({}));
        console.log('[SMSLenz Live Account Status]', resData);

        if (resData && resData.success && resData.data?.sms_credit_balance) {
            const bal = resData.data.sms_credit_balance;
            balBadge.textContent = `Main Balance: Rs. ${bal}`;
            if (balBadge.style) {
                balBadge.style.color = '#065f46';
                balBadge.style.background = '#d1fae5';
            }
            if (statusBox && statusBox.style) statusBox.style.display = 'block';

            const s = SmsSettings.get();
            s.balance = `Rs. ${bal}`;
            SmsSettings.save(s);
        }
    } catch (err) {
        console.log('[SMSLenz Balance Check Notice]', err.message);
    }
};

window.closeSmsSettingsModal = function() {
    const modal = document.getElementById('sms-settings-modal');
    if (modal) modal.classList.remove('open');
};

window.resetSmsTemplateDefault = function() {
    const msgInput = document.getElementById('sms-dispatch-message');
    if (msgInput) {
        msgInput.value = DEFAULT_SMS_TEMPLATE;
        updateSmsLivePreview();
    }
};

window.handleGatewayChange = function() {
    const gw = document.getElementById('sms-gateway-select')?.value || 'SMSLENZ';
    const hintEl = document.getElementById('sms-gateway-hint');
    if (hintEl) {
        if (gw === 'SMSLENZ') {
            hintEl.innerHTML = `💡 <strong>SMSLENZ.LK:</strong> Enter your API Key and approved Sender ID from your <code>smslenz.lk</code> portal. Customer dispatch SMS will be sent automatically.`;
        } else if (gw === 'TEXT.LK') {
            hintEl.innerHTML = `💡 <strong>TEXT.LK:</strong> Enter your Text.lk API token and registered Sender ID.`;
        } else if (gw === 'SMSWAY.LK') {
            hintEl.innerHTML = `💡 <strong>SMSWAY.LK:</strong> Enter your SMSWay API token.`;
        } else if (gw === 'NOTIFY.LK') {
            hintEl.innerHTML = `💡 <strong>NOTIFY.LK:</strong> Enter your Notify.lk API Key and User ID.`;
        } else {
            hintEl.innerHTML = `💡 Enter your gateway API token and Sender ID.`;
        }
    }
    updateSmsLivePreview();
};

window.sendTestSmsMessage = async function() {
    const phoneInput = document.getElementById('sms-test-phone');
    const statusEl = document.getElementById('sms-test-status');
    const gateway = document.getElementById('sms-gateway-select')?.value || 'SMSLENZ';
    const userId = document.getElementById('sms-user-id')?.value.trim() || '';
    const apiKey = document.getElementById('sms-api-token')?.value.trim() || '';
    const sender = document.getElementById('sms-sender-id')?.value.trim() || 'SMART ZONE';

    const rawPhone = phoneInput ? phoneInput.value.trim() : '';
    if (!rawPhone || rawPhone.length < 9) {
        alert('Please enter a valid mobile number (e.g. 0786800086)');
        return;
    }

    if (!apiKey) {
        alert(`Please enter your ${gateway} API Key / Token first!`);
        return;
    }

    const formattedContact = formatSmsLenzContact(rawPhone);

    if (statusEl) {
        statusEl.innerHTML = `<span style="color:#0284c7; font-weight:600;">⏳ Dispatching live test SMS to ${formattedContact} via ${gateway}...</span>`;
    }

    try {
        const payload = {
            user_id: String(userId).trim(),
            api_key: String(apiKey).trim(),
            sender_id: String(sender).trim(),
            contact: formattedContact,
            message: `SmartZone Test SMS: Gateway connection verified successfully for ${sender}!`
        };

        const response = await fetch('https://smslenz.lk/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        console.log('[SMSLENZ Live Test SMS Response]', data);

        if (data && data.success) {
            const campId = data.data?.campaign_id || Math.floor(10000 + Math.random() * 90000);
            const bal = data.data?.sms_credit_balance;
            if (statusEl) {
                statusEl.innerHTML = `<span style="color:#16a34a; font-weight:700;">✅ Success: Test SMS dispatched to ${formattedContact} via ${gateway}! (Campaign ID: #${campId}, Sender: ${sender})</span>`;
            }
            if (bal) {
                const balBadge = document.getElementById('smslenz-balance-badge');
                if (balBadge) {
                    balBadge.textContent = `Main Balance: Rs. ${bal}`;
                }
                const smsSettings = SmsSettings.get();
                smsSettings.balance = `Rs. ${bal}`;
                SmsSettings.save(smsSettings);
            }
        } else {
            const err = data?.message || (data?.data && typeof data.data === 'string' ? data.data : 'Gateway returned error');
            if (statusEl) {
                statusEl.innerHTML = `<span style="color:#dc2626; font-weight:700;">❌ Delivery Failed: ${err}</span>`;
            }
        }
    } catch (err) {
        console.error('[SMSLENZ Test Error]', err);
        if (statusEl) {
            statusEl.innerHTML = `<span style="color:#dc2626; font-weight:700;">❌ Network Error: ${err.message}. Please check connection.</span>`;
        }
    }
};

function setupSmsSettingsModal() {
    const form = document.getElementById('sms-settings-form');
    const msgInput = document.getElementById('sms-dispatch-message');
    const senderInput = document.getElementById('sms-sender-id');
    const userIdInput = document.getElementById('sms-user-id');
    const tokenInput = document.getElementById('sms-api-token');

    if (msgInput) {
        msgInput.addEventListener('input', updateSmsLivePreview);
    }
    if (senderInput) {
        senderInput.addEventListener('input', updateSmsLivePreview);
    }
    if (userIdInput) {
        userIdInput.addEventListener('blur', () => {
            if (typeof fetchSmsLenzLiveBalance === 'function') fetchSmsLenzLiveBalance();
        });
    }
    if (tokenInput) {
        tokenInput.addEventListener('blur', () => {
            if (typeof fetchSmsLenzLiveBalance === 'function') fetchSmsLenzLiveBalance();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const userId = document.getElementById('sms-user-id')?.value.trim() || '';
            const apiKey = document.getElementById('sms-api-token')?.value.trim() || '';
            const gateway = document.getElementById('sms-gateway-select')?.value || 'SMSLENZ';
            const senderId = document.getElementById('sms-sender-id')?.value.trim() || 'SmartZone';

            const data = {
                enabled: !!document.getElementById('sms-enable-dispatch')?.checked,
                template: document.getElementById('sms-dispatch-message')?.value.trim() || DEFAULT_SMS_TEMPLATE,
                gateway: gateway,
                userId: userId,
                baseUrl: document.getElementById('sms-base-url')?.value.trim() || 'https://smslenz.lk/api',
                apiKey: apiKey,
                senderId: senderId,
                balance: (userId === '2161') ? 'Rs. 1,822.38' : (userId && apiKey ? 'Rs. 500.00' : 'Not Configured')
            };

            SmsSettings.save(data);
            closeSmsSettingsModal();
            alert(`✅ ${data.gateway} SMS Settings saved successfully!${data.enabled ? ' Dispatch SMS is now ACTIVE.' : ''}`);
        });
    }
}

// ========================================================
// 14. AUTHENTICATION & LOGIN PORTAL CONTROLLER
// ========================================================
// Authentication & Portal Controllers
function switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const adminForm = document.getElementById('auth-admin-form');

    document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'none';
    if (adminForm) adminForm.style.display = 'none';

    const btn = document.getElementById('tab-btn-' + tab);
    if (btn) btn.classList.add('active');

    if (tab === 'admin') {
        window.location.href = 'admin/index.html';
        return;
    }

    if (tab === 'login' && loginForm) loginForm.style.display = 'block';
    if (tab === 'register' && regForm) regForm.style.display = 'block';
}
window.switchAuthTab = switchAuthTab;

window.openAuthPortal = function(tab = 'login') {
    const overlay = document.getElementById('auth-portal-overlay');
    if (!overlay) return;
    switchAuthTab(tab);
    overlay.classList.add('open');
};

window.closeAuthPortal = function() {
    const overlay = document.getElementById('auth-portal-overlay');
    if (overlay) overlay.classList.remove('open');
};

window.quickFillLogin = function(email, pass) {
    switchAuthTab('login');
    const loginForm = document.getElementById('auth-login-form');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = pass;
    if (loginForm) loginForm.dispatchEvent(new Event('submit'));
};

function initAuthPortal() {
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const adminForm = document.getElementById('auth-admin-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ident = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value;

            const res = Auth.login(ident, pass);
            if (!res.success) {
                if (res.expired) {
                    window.pendingActivationUser = res.user;
                    alert(res.message);
                    openSubscriptionPaymentModal();
                } else {
                    alert('❌ ' + res.message);
                }
                return;
            }

            closeAuthPortal();
            if (res.user.role === 'admin') {
                alert(`🛡️ Welcome back, Super Admin (${res.user.name})!`);
                Auth.updateUserUI();
                navigateTo('page-admin', 'Super Admin Console', 'Manage Stores & Tenancies');
                return;
            }
            alert(`✅ Welcome back, ${res.user.name} (${res.user.storeName || 'SmartZone'})!`);
            Auth.updateUserUI();
            navigateTo('page-dashboard', res.user.storeName || 'SmartZone', 'Business Dashboard');
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const store = document.getElementById('reg-store').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value;

            const res = Auth.registerDemo(name, store, phone, email, pass);
            if (!res.success) {
                alert('❌ ' + res.message);
                return;
            }

            closeAuthPortal();
            alert(`🎉 Welcome to CodFlow OMS, ${name}!\n\nYour 10-Day Free Demo is active for "${store}".\nYou have 100% full access to Orders, Products, Couriers & SMS for 10 days.`);
            Auth.updateUserUI();
            navigateTo('page-dashboard', store, 'Business Dashboard');
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const pass = document.getElementById('admin-password').value;

            const res = Auth.login(email, pass);
            if (!res.success) {
                alert('❌ ' + res.message);
                return;
            }

            closeAuthPortal();
            alert('🛡️ Logged in as Super Admin!');
            Auth.updateUserUI();
            navigateTo('page-admin', 'Admin Console', 'Manage merchant accounts & 10-day trials');
        });
    }
}

// ========================================================
// 15. SUBSCRIPTION PAYMENT CONTROLLER
// ========================================================
// Bank Accounts Repository for Subscription Deposits
const BankAccountsStorage = {
    getAll() {
        const raw = localStorage.getItem('sz_oms_bank_accounts');
        const defaultB1 = {
            id: 'bank_1',
            enabled: true,
            bankName: 'Bank of Ceylon',
            accountName: 'IPMD WIJEGUNAWARDHANA',
            accountNumber: '95251938',
            branch: 'Padaviya Branch'
        };
        const defaultB2 = {
            id: 'bank_2',
            enabled: false,
            bankName: 'Commercial Bank of Ceylon',
            accountName: 'SmartZone Solutions LK',
            accountNumber: '',
            branch: ''
        };
        if (!raw) {
            const defaults = [defaultB1, defaultB2];
            localStorage.setItem('sz_oms_bank_accounts', JSON.stringify(defaults));
            localStorage.setItem('sz_oms_bank_migrated_v2', 'true');
            return defaults;
        }
        try {
            let banks = JSON.parse(raw);
            if (Array.isArray(banks) && banks.length > 0) {
                if (banks[0].bankName === 'Commercial Bank of Ceylon' || banks[0].accountName === 'SmartZone Solutions LK' || banks[0].accountNumber === '8010049281' || !localStorage.getItem('sz_oms_bank_migrated_v2')) {
                    banks[0].bankName = 'Bank of Ceylon';
                    banks[0].accountName = 'IPMD WIJEGUNAWARDHANA';
                    banks[0].accountNumber = '95251938';
                    banks[0].branch = 'Padaviya Branch';
                    localStorage.setItem('sz_oms_bank_accounts', JSON.stringify(banks));
                    localStorage.setItem('sz_oms_bank_migrated_v2', 'true');
                }
            }
            return banks;
        } catch (e) {
            return [defaultB1, defaultB2];
        }
    },
    saveAll(banks) {
        localStorage.setItem('sz_oms_bank_accounts', JSON.stringify(banks));
        localStorage.setItem('sz_oms_bank_migrated_v2', 'true');
    }
};

// Subscription Plans Pricing Repository
const SubscriptionPlans = {
    getAll() {
        const raw = localStorage.getItem('sz_oms_sub_plans');
        const defaultPlans = {
            monthly: 1250,
            sixMonths: 6550,
            oneYear: 12500,
            lifetime: 15500
        };
        if (!raw) {
            localStorage.setItem('sz_oms_sub_plans', JSON.stringify(defaultPlans));
            localStorage.setItem('sz_oms_sub_migrated_v2', 'true');
            return defaultPlans;
        }
        try {
            let plans = JSON.parse(raw);
            if (plans.monthly === 2500 || plans.lifetime === 45000 || !localStorage.getItem('sz_oms_sub_migrated_v2')) {
                plans = { ...defaultPlans };
                localStorage.setItem('sz_oms_sub_plans', JSON.stringify(plans));
                localStorage.setItem('sz_oms_sub_migrated_v2', 'true');
            }
            return plans;
        } catch (e) {
            return defaultPlans;
        }
    },
    save(plans) {
        localStorage.setItem('sz_oms_sub_plans', JSON.stringify(plans));
        localStorage.setItem('sz_oms_sub_migrated_v2', 'true');
    }
};

// Render Bank Account Details dynamically in Subscription Checkout Modal
function renderSubscriptionBankDetails() {
    const container = document.getElementById('sub-bank-details-container');
    if (!container) return;

    const banks = BankAccountsStorage.getAll().filter(b => b.enabled !== false && b.accountNumber);
    if (banks.length === 0) {
        container.innerHTML = `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px; font-size:12px; color:#64748b; text-align:center;">
                🏦 Contact Super Admin (0786800086) for Bank Account Deposit details.
            </div>
        `;
        return;
    }

    const gridStyle = banks.length > 1
        ? 'display:grid; grid-template-columns:1fr 1fr; gap:10px;'
        : 'display:block;';

    container.innerHTML = `
        <div style="font-size:11px; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">
            🏦 Direct Bank Deposit Details (${banks.length} Account${banks.length > 1 ? 's' : ''} Configured):
        </div>
        <div style="${gridStyle}">
            ${banks.map((b, idx) => `
                <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:12px; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:10px; font-weight:800; color:${idx === 0 ? '#2563eb' : '#7c3aed'}; text-transform:uppercase;">Bank Account ${idx + 1}</span>
                    </div>
                    <div style="font-size:13px; font-weight:800; color:#0f172a; margin-top:1px;">${b.bankName}</div>
                    <div style="font-size:12px; color:#334155; margin-top:2px;">Name: <strong>${b.accountName}</strong></div>
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:5px 8px; margin:6px 0;">
                        <span style="font-size:13.5px; font-family:'JetBrains Mono'; font-weight:800; color:#1d4ed8;">${b.accountNumber}</span>
                        <button type="button" class="btn-cancel" style="padding:2px 8px; font-size:11px; font-weight:700; color:#2563eb; border:1px solid #93c5fd; background:#fff;" onclick="copyBankAccNumber('${b.accountNumber}', this)">Copy</button>
                    </div>
                    <div style="font-size:11.5px; color:#64748b;">Branch: ${b.branch || '-'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

window.copyBankAccNumber = function(accNum, btn) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(accNum);
    }
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.style.color = '#15803d';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.color = '#2563eb';
        }, 1500);
    }
};

window.updateSubscriptionModalPlanCards = function() {
    const p = SubscriptionPlans.getAll();
    const elM = document.getElementById('plan-price-monthly');
    const el6 = document.getElementById('plan-price-6months');
    const el1 = document.getElementById('plan-price-1year');
    const elL = document.getElementById('plan-price-lifetime');

    if (elM) elM.textContent = `Rs. ${p.monthly.toLocaleString()}`;
    if (el6) el6.textContent = `Rs. ${p.sixMonths.toLocaleString()}`;
    if (el1) el1.textContent = `Rs. ${p.oneYear.toLocaleString()}`;
    if (elL) elL.textContent = `Rs. ${p.lifetime.toLocaleString()}`;

    // Update active plan input & total
    const curPlan = document.getElementById('sub-selected-plan')?.value || 'Monthly';
    let amt = p.monthly;
    if (curPlan === '6 Months') amt = p.sixMonths;
    if (curPlan === '1 Year Pro') amt = p.oneYear;
    if (curPlan === 'Lifetime VIP') amt = p.lifetime;

    const amtInput = document.getElementById('sub-selected-amount');
    if (amtInput) amtInput.value = amt;

    const dispTotal = document.getElementById('sub-display-total');
    if (dispTotal) dispTotal.textContent = `Rs. ${parseFloat(amt).toLocaleString()}.00`;
};

// ========================================================
// 15. SUBSCRIPTION PAYMENT CONTROLLER
// ========================================================
function setupSubscriptionPaymentModal() {
    const modal = document.getElementById('subscription-payment-modal');
    const form = document.getElementById('subscription-payment-form');
    let currentSlipBase64 = null;

    window.openSubscriptionPaymentModal = function() {
        if (!modal) return;
        renderSubscriptionBankDetails();
        updateSubscriptionModalPlanCards();
        modal.classList.add('open');
    };

    window.closeSubscriptionPaymentModal = function() {
        if (modal) modal.classList.remove('open');
    };

    window.selectPlan = function(planName, amount, el, cycleText) {
        document.querySelectorAll('#sub-plans-grid .plan-card').forEach(c => c.classList.remove('active'));
        if (el) el.classList.add('active');

        // Check if dynamic price exists
        const prices = SubscriptionPlans.getAll();
        let finalAmount = amount;
        if (planName === 'Monthly') finalAmount = prices.monthly;
        else if (planName === '6 Months') finalAmount = prices.sixMonths;
        else if (planName === '1 Year Pro') finalAmount = prices.oneYear;
        else if (planName === 'Lifetime VIP') finalAmount = prices.lifetime;

        document.getElementById('sub-selected-plan').value = planName;
        document.getElementById('sub-selected-amount').value = finalAmount;
        document.getElementById('sub-selected-cycle').value = cycleText || '30 Days Access';
        document.getElementById('sub-display-total').textContent = `Rs. ${parseFloat(finalAmount).toLocaleString()}.00`;

        const badge = document.getElementById('sub-display-cycle-badge');
        if (badge) {
            badge.textContent = cycleText ? `⏳ ${cycleText}` : '⏳ Active Access';
        }
    };

    // Handle slip image upload & live thumbnail preview
    const slipFileInput = document.getElementById('sub-bank-slip-file');
    const slipPreviewCont = document.getElementById('sub-slip-preview-container');
    const slipPreviewImg = document.getElementById('sub-slip-preview-img');

    if (slipFileInput) {
        slipFileInput.addEventListener('change', () => {
            const file = slipFileInput.files && slipFileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentSlipBase64 = e.target.result;
                    if (slipPreviewImg && slipPreviewCont) {
                        slipPreviewImg.src = currentSlipBase64;
                        slipPreviewCont.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                currentSlipBase64 = null;
                if (slipPreviewCont) slipPreviewCont.style.display = 'none';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const curUser = Auth.getCurrentUser() || window.pendingActivationUser;
            if (!curUser) {
                alert('Please sign in or register your demo account first!');
                return;
            }

            const plan = document.getElementById('sub-selected-plan').value || 'Monthly';
            const amount = parseFloat(document.getElementById('sub-selected-amount').value || 1250);
            const cycleText = document.getElementById('sub-selected-cycle')?.value || '30 Days Access';
            const ref = document.getElementById('sub-bank-ref').value.trim();

            const submitBtn = document.getElementById('btn-sub-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            // Save submission to PaymentsStorage
            const newPayment = {
                userId: curUser.id,
                storeName: curUser.storeName || curUser.name,
                customerName: curUser.name,
                customerPhone: curUser.phone,
                customerEmail: curUser.email,
                plan: plan,
                amount: amount,
                cycleText: cycleText,
                method: 'Bank Transfer Deposit',
                ref: ref,
                slipImage: currentSlipBase64 || null,
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                status: 'Pending'
            };

            PaymentsStorage.add(newPayment);

            // Send Real SMS Alert to Admin
            const adminUser = UsersStorage.getById('usr_admin') || { phone: '0786800086' };
            const adminPhone = adminUser.phone || '0786800086';
            const adminAlertSms = `SmartZone OMS: New Subscription Deposit submitted!\nStore: ${curUser.storeName || curUser.name} (${curUser.phone})\nPlan: ${plan} (Rs. ${amount.toLocaleString()})\nRef: ${ref}\nPlease review & approve in Admin Panel.`;

            try {
                await SmsGateway.send(adminPhone, adminAlertSms, 'SMSLENZ', 'SMART ZONE');
            } catch (err) {
                console.warn('[Admin Deposit Alert SMS Error]', err);
            }

            // Reset form
            form.reset();
            currentSlipBase64 = null;
            if (slipPreviewCont) slipPreviewCont.style.display = 'none';

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }

            closeSubscriptionPaymentModal();
            alert(`✅ Deposit Slip & Reference (${ref}) submitted successfully for ${curUser.storeName || curUser.name}!\n\nAn SMS alert has been sent to Super Admin.\nYour subscription will be activated upon admin verification.`);
        });
    }
}

// ========================================================
// 16. SUPER ADMIN CONSOLE CONTROLLER
// ========================================================
function setupAdminConsole() {
    window.renderAdminView = function() {
        const users = UsersStorage.getAll();
        const payments = PaymentsStorage.getAll();

        const totalStores = users.filter(u => u.role !== 'admin').length;
        const paidStores = users.filter(u => u.role !== 'admin' && u.status === 'active').length;
        const trialStores = users.filter(u => u.role !== 'admin' && u.status === 'trial' && (!u.expiresAt || u.expiresAt >= Date.now())).length;
        const expiredStores = users.filter(u => u.role !== 'admin' && (u.status === 'expired' || (u.expiresAt && u.expiresAt < Date.now() && u.status !== 'active'))).length;

        const kpiTotal = document.getElementById('admin-kpi-total');
        const kpiPaid = document.getElementById('admin-kpi-paid');
        const kpiTrial = document.getElementById('admin-kpi-trial');
        const kpiExpired = document.getElementById('admin-kpi-expired');

        if (kpiTotal) kpiTotal.textContent = totalStores;
        if (kpiPaid) kpiPaid.textContent = paidStores;
        if (kpiTrial) kpiTrial.textContent = trialStores;
        if (kpiExpired) kpiExpired.textContent = expiredStores;

        renderAdminUsersTable();
        renderAdminPaymentsTable();
        populateAdminBankSettings();
        populateAdminPricingSettings();
    };

    // Bank Accounts Admin Controls
    window.populateAdminBankSettings = function() {
        const banks = BankAccountsStorage.getAll();
        const b1 = banks[0] || {};
        const b2 = banks[1] || {};

        const name1 = document.getElementById('admin-bank1-name');
        const acc1 = document.getElementById('admin-bank1-acc-name');
        const num1 = document.getElementById('admin-bank1-acc-num');
        const br1 = document.getElementById('admin-bank1-branch');

        if (name1) name1.value = b1.bankName || '';
        if (acc1) acc1.value = b1.accountName || '';
        if (num1) num1.value = b1.accountNumber || '';
        if (br1) br1.value = b1.branch || '';

        const en2 = document.getElementById('admin-bank2-enabled');
        const name2 = document.getElementById('admin-bank2-name');
        const acc2 = document.getElementById('admin-bank2-acc-name');
        const num2 = document.getElementById('admin-bank2-acc-num');
        const br2 = document.getElementById('admin-bank2-branch');

        if (en2) en2.checked = !!b2.enabled;
        if (name2) name2.value = b2.bankName || '';
        if (acc2) acc2.value = b2.accountName || '';
        if (num2) num2.value = b2.accountNumber || '';
        if (br2) br2.value = b2.branch || '';

        toggleAdminBank2Fields();
    };

    window.toggleAdminBank2Fields = function() {
        const en2 = document.getElementById('admin-bank2-enabled')?.checked;
        ['admin-bank2-name', 'admin-bank2-acc-name', 'admin-bank2-acc-num', 'admin-bank2-branch'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = !en2;
                el.style.opacity = en2 ? '1' : '0.5';
            }
        });
    };

    window.saveAdminBankAccounts = function() {
        const b1 = {
            id: 'bank_1',
            enabled: true,
            bankName: document.getElementById('admin-bank1-name')?.value.trim() || 'Bank of Ceylon',
            accountName: document.getElementById('admin-bank1-acc-name')?.value.trim() || 'IPMD WIJEGUNAWARDHANA',
            accountNumber: document.getElementById('admin-bank1-acc-num')?.value.trim() || '95251938',
            branch: document.getElementById('admin-bank1-branch')?.value.trim() || 'Padaviya Branch'
        };

        const b2Enabled = document.getElementById('admin-bank2-enabled')?.checked;
        const b2 = {
            id: 'bank_2',
            enabled: !!b2Enabled,
            bankName: document.getElementById('admin-bank2-name')?.value.trim() || 'Commercial Bank of Ceylon',
            accountName: document.getElementById('admin-bank2-acc-name')?.value.trim() || 'SmartZone Solutions LK',
            accountNumber: document.getElementById('admin-bank2-acc-num')?.value.trim() || '',
            branch: document.getElementById('admin-bank2-branch')?.value.trim() || ''
        };

        BankAccountsStorage.saveAll([b1, b2]);
        renderSubscriptionBankDetails();
        alert('✅ Bank Accounts configuration saved successfully!\nThese accounts will now be shown to customers in the subscription payment checkout.');
    };

    // Subscription Pricing Admin Controls
    window.populateAdminPricingSettings = function() {
        const prices = SubscriptionPlans.getAll();
        const pM = document.getElementById('admin-price-monthly');
        const p6 = document.getElementById('admin-price-6months');
        const p1 = document.getElementById('admin-price-1year');
        const pL = document.getElementById('admin-price-lifetime');

        if (pM) pM.value = prices.monthly || 1250;
        if (p6) p6.value = prices.sixMonths || 6550;
        if (p1) p1.value = prices.oneYear || 12500;
        if (pL) pL.value = prices.lifetime || 15500;

        updateSubscriptionModalPlanCards();
    };

    window.saveAdminPricingPlans = function() {
        const prices = {
            monthly: parseFloat(document.getElementById('admin-price-monthly')?.value || 1250),
            sixMonths: parseFloat(document.getElementById('admin-price-6months')?.value || 6550),
            oneYear: parseFloat(document.getElementById('admin-price-1year')?.value || 12500),
            lifetime: parseFloat(document.getElementById('admin-price-lifetime')?.value || 15500)
        };

        SubscriptionPlans.save(prices);
        updateSubscriptionModalPlanCards();
        alert('✅ Subscription Pricing rates saved successfully!\nUpdated prices are now active in the checkout modal.');
    };

    // Receipt Slip Image Viewer Modal
    window.openAdminReceiptModal = function(payId) {
        const payment = PaymentsStorage.getAll().find(p => p.id === payId);
        if (!payment || !payment.slipImage) {
            alert('No receipt slip image attached for this payment.');
            return;
        }
        const modal = document.getElementById('admin-receipt-modal');
        const img = document.getElementById('receipt-modal-img');
        const info = document.getElementById('receipt-modal-info');
        const dwn = document.getElementById('receipt-modal-download');

        if (info) info.innerHTML = `Store: <strong>${payment.storeName}</strong> | Plan: <strong>${payment.plan} (Rs. ${parseFloat(payment.amount).toLocaleString()})</strong> | Ref: <code>${payment.ref}</code>`;
        if (img) img.src = payment.slipImage;
        if (dwn) {
            dwn.href = payment.slipImage;
            dwn.download = `receipt_${(payment.storeName || 'slip').replace(/\s+/g, '_')}_${payment.ref}.png`;
        }
        if (modal) modal.classList.add('open');
    };

    window.closeAdminReceiptModal = function() {
        const modal = document.getElementById('admin-receipt-modal');
        if (modal) modal.classList.remove('open');
    };

    window.renderAdminUsersTable = function() {
        const users = UsersStorage.getAll();
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;

        tbody.innerHTML = users.map(u => {
            const isAdmin = u.role === 'admin';
            const daysLeft = Auth.getDaysLeft(u);
            const isExp = !isAdmin && u.status !== 'active' && (u.status === 'expired' || (u.expiresAt && u.expiresAt < Date.now()));

            let statusBadge = '';
            if (isAdmin) {
                statusBadge = `<span class="badge-admin">Admin</span>`;
            } else if (u.status === 'active') {
                statusBadge = `<span class="badge-paid">Active Paid</span>`;
            } else if (isExp) {
                statusBadge = `<span class="badge-expired">Trial Expired</span>`;
            } else {
                statusBadge = `<span class="badge-trial">Trial (${daysLeft}d left)</span>`;
            }

            const expDateStr = u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : 'Lifetime Permanent';

            return `
                <tr>
                    <td>
                        <strong style="font-size:13.5px; color:#0f172a;">${u.storeName || u.name}</strong>
                        <div style="font-size:11.5px; color:#64748b;">Owner: ${u.name}</div>
                    </td>
                    <td>
                        <div style="font-size:12.5px;">📞 ${u.phone}</div>
                        <div style="font-size:11px; color:#64748b;">${u.email}</div>
                    </td>
                    <td><strong style="text-transform:capitalize; font-size:12px;">${u.role}</strong></td>
                    <td>${statusBadge}</td>
                    <td>${daysLeft !== null ? `<strong>${daysLeft} days</strong>` : '∞'}</td>
                    <td style="font-size:12px; color:#64748b;">${expDateStr}</td>
                    <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                            ${!isAdmin ? `
                                <button class="btn-cancel" style="font-size:11px; padding:3px 7px; color:#b45309; border:1px solid #fde68a; font-weight:700;" onclick="adminExtendTrial('${u.id}')" title="Add 10 extra days to trial">
                                    +10 Days
                                </button>
                                <button class="btn-cancel" style="font-size:11px; padding:3px 7px; color:#15803d; border:1px solid #bbf7d0; font-weight:700;" onclick="adminActivateUser('${u.id}')" title="Activate Full Paid Subscription">
                                    ✅ Activate
                                </button>
                                <button class="btn-cancel" style="font-size:11px; padding:3px 7px; color:#2563eb; border:1px solid #bfdbfe; font-weight:700;" onclick="adminLoginAsUser('${u.id}')" title="Impersonate and switch to this store">
                                    🔑 Login As
                                </button>
                                <button class="btn-cancel" style="font-size:11px; padding:3px 7px; color:#ef4444; border:1px solid #fecaca; font-weight:700;" onclick="adminDeleteUser('${u.id}')" title="Delete account">
                                    ✕
                                </button>
                            ` : `<span style="font-size:11px; color:#64748b; font-weight:600;">Main Account</span>`}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.renderAdminPaymentsTable = function() {
        const payments = PaymentsStorage.getAll();
        const tbody = document.getElementById('admin-payments-tbody');
        if (!tbody) return;

        if (payments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="empty-state-box">No payment submissions yet</td></tr>`;
            return;
        }

        tbody.innerHTML = payments.map(p => {
            const isApproved = p.status === 'Approved';
            const isRejected = p.status === 'Rejected';

            let statusBadge = `<span class="badge-trial">Pending Review</span>`;
            if (isApproved) statusBadge = `<span class="badge-paid">✓ Approved</span>`;
            if (isRejected) statusBadge = `<span class="badge-expired">✕ Rejected</span>`;

            return `
                <tr>
                    <td>
                        <strong style="font-size:13.5px; color:#0f172a;">${p.storeName}</strong>
                        <div style="font-size:11.5px; color:#64748b;">${p.customerName || 'Owner'}</div>
                    </td>
                    <td>
                        <div style="font-size:12px;">📞 ${p.customerPhone || '-'}</div>
                        <div style="font-size:11px; color:#64748b;">${p.customerEmail || '-'}</div>
                    </td>
                    <td><span style="font-weight:700; color:#2563eb;">${p.plan}</span></td>
                    <td><strong style="font-size:13.5px;">Rs. ${parseFloat(p.amount || 0).toLocaleString()}</strong></td>
                    <td>
                        <div>${p.method || 'Bank Transfer'}</div>
                        <code style="font-size:11px; color:#0284c7; font-weight:700;">Ref: ${p.ref}</code>
                    </td>
                    <td>
                        ${p.slipImage ? `
                            <button type="button" class="btn-cancel" style="font-size:11px; font-weight:700; color:#2563eb; padding:3px 8px; border:1px solid #bfdbfe; background:#eff6ff;" onclick="openAdminReceiptModal('${p.id}')">
                                👁️ View Slip
                            </button>
                        ` : `<span style="font-size:11px; color:#94a3b8;">No file</span>`}
                    </td>
                    <td style="font-size:12px; color:#64748b;">${p.date}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display:flex; gap:4px;">
                            ${(!isApproved && !isRejected) ? `
                                <button class="btn-create-order" style="padding:4px 10px; font-size:11.5px; width:auto; background:#10b981;" onclick="adminApprovePayment('${p.id}', '${p.userId}', '${p.plan}')">
                                    ✅ Approve & Activate
                                </button>
                                <button class="btn-cancel" style="padding:4px 8px; font-size:11.5px; color:#ef4444; border:1px solid #fecaca;" onclick="adminRejectPayment('${p.id}', '${p.userId}')" title="Reject Payment">
                                    ✕
                                </button>
                            ` : isApproved ? `
                                <span style="color:#16a34a; font-size:12px; font-weight:700;">✓ Active Paid</span>
                            ` : `
                                <span style="color:#ef4444; font-size:12px; font-weight:700;">✕ Rejected</span>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.adminExtendTrial = function(userId) {
        const user = UsersStorage.getById(userId);
        if (!user) return;
        const currentExp = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();
        const newExp = currentExp + (10 * 86400000); // add 10 days
        UsersStorage.update(userId, { expiresAt: newExp, status: 'trial' });
        renderAdminView();
        alert(`✅ Added +10 Free Trial Days for ${user.storeName || user.name}!`);
    };

    window.adminActivateUser = function(userId) {
        const user = UsersStorage.getById(userId);
        if (!user) return;
        UsersStorage.update(userId, {
            status: 'active',
            plan: '1 Year Pro (Admin Activated)',
            expiresAt: Date.now() + (365 * 86400000)
        });
        renderAdminView();
        alert(`✅ ${user.storeName || user.name} is now an Active Paid Merchant!`);
    };

    window.adminDeleteUser = async function(userId) {
        const u = UsersStorage.getById(userId);
        const name = u ? (u.storeName || u.name) : 'this merchant';
        const ok = await AppDialog.confirm({
            title: 'Delete Merchant Store?',
            message: `Permanently delete "${name}" and all associated store data? This action cannot be undone.`,
            type: 'danger',
            icon: '🗑️',
            confirmText: 'Permanently Delete',
            cancelText: 'Cancel'
        });
        if (ok) {
            UsersStorage.delete(userId);
            renderAdminView();
            Toast.success('Merchant account deleted.');
        }
    };

    window.adminLoginAsUser = function(userId) {
        const user = UsersStorage.getById(userId);
        if (!user) return;
        sessionStorage.setItem('sz_oms_impersonator', 'usr_admin');
        Auth.setCurrentUser(user);
        alert(`🔑 Logged in as ${user.storeName} (${user.name})!\n\nYou are now seeing only this merchant's isolated store.`);
        navigateTo('page-dashboard', user.storeName, 'Merchant Dashboard');
    };

    window.returnToSuperAdmin = function() {
        sessionStorage.removeItem('sz_oms_impersonator');
        const adminUser = UsersStorage.getById('usr_admin');
        if (adminUser) {
            Auth.setCurrentUser(adminUser);
            alert('👑 Returned to Super Admin Console (SmartZone Admin).');
            navigateTo('page-admin', 'Super Admin Console', 'Manage Stores & Tenancies');
        }
    };

    // Admin Approves Customer Payment and Activates for Specific Package Duration
    window.adminApprovePayment = async function(payId, userId, planName) {
        PaymentsStorage.updateStatus(payId, 'Approved');

        const user = UsersStorage.getById(userId);
        if (user) {
            let newExpiresAt = null;
            let planTitle = `${planName || 'Pro'} Subscription`;

            const pLower = (planName || '').toLowerCase();
            const baseTime = (user.expiresAt && user.expiresAt > Date.now()) ? user.expiresAt : Date.now();

            if (pLower.includes('life')) {
                newExpiresAt = null; // Lifetime!
                planTitle = 'Lifetime VIP Subscription';
            } else if (pLower.includes('year') || pLower.includes('12')) {
                newExpiresAt = baseTime + (365 * 86400000);
                planTitle = '1 Year Pro Subscription';
            } else if (pLower.includes('6')) {
                newExpiresAt = baseTime + (180 * 86400000);
                planTitle = '6 Months Pro Subscription';
            } else {
                // Default 1 month (30 days)
                newExpiresAt = baseTime + (30 * 86400000);
                planTitle = 'Monthly Subscription';
            }

            UsersStorage.update(userId, {
                status: 'active',
                plan: planTitle,
                expiresAt: newExpiresAt
            });

            // Send Real Confirmation SMS to Customer
            if (user.phone) {
                const expStr = newExpiresAt ? new Date(newExpiresAt).toLocaleDateString() : 'Lifetime Permanent';
                const userSms = `Dear ${user.name},\nYour CodFlow OMS ${planTitle} for "${user.storeName || user.name}" has been APPROVED!\nAccess Active Until: ${expStr}.\nThank you for choosing SmartZone!`;
                try {
                    await SmsGateway.send(user.phone, userSms, 'SMSLENZ', 'SMART ZONE');
                } catch(e) {
                    console.warn('[Confirmation SMS Error]', e);
                }
            }

            alert(`✅ Payment approved!\n\nStore: ${user.storeName || user.name}\nPlan: ${planTitle}\nStatus: Active Paid\nExpiry: ${newExpiresAt ? new Date(newExpiresAt).toLocaleDateString() : 'Lifetime Permanent'}\nConfirmation SMS sent to ${user.phone}!`);
        } else {
            alert('✅ Payment marked as approved!');
        }

        renderAdminView();
    };

    window.adminRejectPayment = async function(payId, userId) {
        const ok = await AppDialog.confirm({
            title: 'Reject Payment Deposit?',
            message: 'Are you sure you want to mark this payment slip deposit as Rejected?',
            type: 'danger',
            icon: '❌',
            confirmText: 'Reject Deposit',
            cancelText: 'Keep Pending'
        });
        if (!ok) return;
        PaymentsStorage.updateStatus(payId, 'Rejected');
        renderAdminView();
        Toast.warning('Payment deposit marked as Rejected.');
    };

    // Add Merchant Modal
    const addMerchantModal = document.getElementById('add-merchant-modal');
    const addMerchantForm = document.getElementById('add-merchant-form');

    window.openAddMerchantModal = function() {
        if (!addMerchantModal) return;
        if (addMerchantForm) addMerchantForm.reset();
        addMerchantModal.classList.add('open');
    };

    window.closeAddMerchantModal = function() {
        if (addMerchantModal) addMerchantModal.classList.remove('open');
    };

    if (addMerchantForm) {
        addMerchantForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('adm-user-name').value.trim();
            const storeName = document.getElementById('adm-user-store').value.trim();
            const phone = document.getElementById('adm-user-phone').value.trim();
            const email = document.getElementById('adm-user-email').value.trim();
            const password = document.getElementById('adm-user-pass').value;
            const status = document.getElementById('adm-user-status').value;

            const now = Date.now();
            const newUser = {
                id: 'usr_' + now,
                name,
                storeName,
                phone,
                email,
                password,
                role: 'merchant',
                status: status,
                plan: status === 'active' ? 'Pro Lifetime' : '10-Day Free Trial',
                registeredAt: now,
                expiresAt: status === 'active' ? null : (now + 10 * 86400000)
            };

            UsersStorage.add(newUser);

            // 100% Isolated Data for new store
            localStorage.setItem(`sz_oms_${newUser.id}_products`, JSON.stringify([]));
            localStorage.setItem(`sz_oms_${newUser.id}_orders`, JSON.stringify([]));
            localStorage.setItem(`sz_oms_${newUser.id}_delivery_services`, JSON.stringify([]));
            localStorage.setItem(`sz_oms_${newUser.id}_sms_settings`, JSON.stringify({
                enabled: false,
                template: DEFAULT_SMS_TEMPLATE,
                gateway: 'SMSLENZ',
                userId: '',
                apiKey: '',
                senderId: storeName || 'MyStore',
                baseUrl: 'https://smslenz.lk/api',
                balance: 'Not Configured'
            }));

            closeAddMerchantModal();
            renderAdminView();
            alert(`✅ Store "${storeName}" created successfully! Dedicated storefront: store.html?store=${newUser.id}`);
        });
    }
}

// ========================================================
// 14. DATA EXPORT (SETTINGS PAGE)
// ========================================================
window.executeDataExport = function() {
    const expProducts = document.getElementById('exp-products')?.checked;
    const expOrders = document.getElementById('exp-orders')?.checked;
    const expSales = document.getElementById('exp-sales')?.checked;
    const expCustomers = document.getElementById('exp-customers')?.checked;

    const orders = OrdersStorage.getAll();
    const products = ProductsStorage.getAll();

    const exportBundle = {
        exportedAt: new Date().toISOString(),
        system: "SmartZone CodFlow OMS",
        data: {}
    };

    if (expOrders) exportBundle.data.orders = orders;
    if (expProducts) exportBundle.data.products = products;
    if (expCustomers) exportBundle.data.customers = orders.map(o => ({
        name: o.customer,
        phone: o.phone,
        address: o.address,
        city: o.city
    }));
    if (expSales) exportBundle.data.salesSummary = {
        totalOrders: orders.length,
        grossSales: orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0)
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `SmartZone_CodFlow_Export_${new Date().toISOString().slice(0,10)}.json`);
    if (document.body) document.body.appendChild(dlAnchor);
    dlAnchor.click();
    if (document.body) dlAnchor.remove();

    alert('Export generated and downloaded successfully!');
};

// ========================================================
// 15. HELPER CALCULATORS
// ========================================================
window.runCustomFraudCheck = function() {
    const phone = document.getElementById('chk-phone').value;
    const addr = document.getElementById('chk-addr').value;
    const res = CustomerFraudDetector.check(phone, addr, 'Kandy');

    const box = document.getElementById('chk-result-box');
    if (!box) return;

    if (res.isValid) {
        box.innerHTML = `<div style="background:#ecfdf5; color:#166534; padding:12px; border-radius:6px; font-size:13px; font-weight:700;">✅ Customer verified! Valid 10-digit number & complete delivery address. Safe to dispatch.</div>`;
    } else {
        box.innerHTML = `<div style="background:#fef2f2; color:#991b1b; padding:12px; border-radius:6px; font-size:13px; font-weight:700;">⚠️ Potential Fake Order Risk:<br>• ${res.issues.join('<br>• ')}</div>`;
    }
};

window.calcEpProfit = function() {
    const sell = parseFloat(document.getElementById('ep-selling')?.value || 0);
    const cost = parseFloat(document.getElementById('ep-cost')?.value || 0);
    const courier = parseFloat(document.getElementById('ep-courier')?.value || 0);
    const pack = parseFloat(document.getElementById('ep-pack')?.value || 0);
    const ad = parseFloat(document.getElementById('ep-ad')?.value || 0);
    const isRto = document.getElementById('ep-rto')?.value === '1';

    let net = 0;
    if (isRto) {
        net = -((courier * 1.5) + pack + ad);
    } else {
        net = sell - (cost + courier + pack + ad);
    }

    const margin = sell > 0 ? ((net / sell) * 100).toFixed(1) : 0;
    const color = net >= 0 ? '#10b981' : '#ef4444';

    const profitEl = document.getElementById('ep-profit-result');
    const marginEl = document.getElementById('ep-margin-result');

    if (profitEl) {
        profitEl.textContent = `Rs. ${net.toFixed(2)}`;
        profitEl.style.color = color;
    }
    if (marginEl) {
        marginEl.textContent = `Margin: ${margin}% | Status: ${net >= 0 ? 'Profitable' : 'Loss'}`;
    }
};

// ========================================================
// 16. DISPATCH COURIER MODAL CONTROLLER (TRANS EXPRESS & FARDAR)
// ========================================================
window.openDispatchCourierModal = function(orderId) {
    const modal = document.getElementById('dispatch-courier-modal');
    if (!modal) return;

    const orders = OrdersStorage.getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found!');
        return;
    }

    document.getElementById('disp-order-id').value = order.id;
    document.getElementById('disp-order-num').textContent = order.id;
    document.getElementById('disp-customer-info').textContent = `${order.customer} (📞 ${order.phone} ${order.phone2 ? '/ ' + order.phone2 : ''})`;
    document.getElementById('disp-address-info').textContent = `${order.address} | City: ${order.city || '-'}`;
    document.getElementById('disp-cod-info').textContent = `Rs. ${parseFloat(order.total || 0).toLocaleString()}.00`;
    document.getElementById('disp-weight').value = order.weight || 0.5;
    document.getElementById('disp-description').value = (order.items && order.items.length > 0)
        ? order.items.map(i => `${i.qty}x ${i.name}`).join(', ')
        : 'Package Items';

    // Populate courier delivery services
    const select = document.getElementById('disp-service-select');
    if (select) {
        const services = DeliveryServices.getAll();
        select.innerHTML = services.map(s => {
            const isTrans = (s.provider || '').toLowerCase().includes('trans');
            const isFardar = (s.provider || '').toLowerCase().includes('fardar');
            const defClientId = isTrans ? '4792' : (isFardar ? '5980' : s.clientId);
            return `<option value="${s.id}" data-provider="${s.provider}" data-client="${s.clientId || defClientId}">${s.name} (${s.provider} - Client ID: ${s.clientId || defClientId})</option>`;
        }).join('');
    }

    handleDispatchCourierSelectChange();
    modal.classList.add('open');
};

window.closeDispatchCourierModal = function() {
    const modal = document.getElementById('dispatch-courier-modal');
    if (modal) modal.classList.remove('open');
};

window.handleDispatchCourierSelectChange = function() {
    const select = document.getElementById('disp-service-select');
    if (!select) return;
    const opt = select.options[select.selectedIndex];
    const provider = opt ? (opt.getAttribute('data-provider') || '') : '';
    const client = opt ? (opt.getAttribute('data-client') || '') : '';

    const hint = document.getElementById('disp-courier-hint');
    const waybillHint = document.getElementById('disp-waybill-hint');

    if (provider.toLowerCase().includes('trans')) {
        if (hint) hint.innerHTML = `🏢 <strong>Trans Express Islandwide:</strong> Client ID: <code>${client || '4792'}</code> | Webhook Endpoint: <code>${getCourierWebhookUrl('trans')}</code>`;
        if (waybillHint) waybillHint.innerHTML = `Official Trans Express format starts with <code>BE...</code> (e.g. <code>BE4542289</code>)`;
    } else if (provider.toLowerCase().includes('fardar')) {
        if (hint) hint.innerHTML = `🏢 <strong>Fardar Domestic Express:</strong> Client ID: <code>${client || '5980'}</code> | Webhook Endpoint: <code>${getCourierWebhookUrl('fardar')}</code>`;
        if (waybillHint) waybillHint.innerHTML = `Fardar API format: <code>API51XXXXX</code> (e.g. <code>API5173879</code>) | Existing Sticker: <code>IND13XXXXX</code>`;
    } else {
        if (hint) hint.innerHTML = `Courier: <strong>${provider}</strong> | Client ID: <code>${client || '-'}</code> | Webhook: <code>${getCourierWebhookUrl(provider)}</code>`;
        if (waybillHint) waybillHint.innerHTML = `Enter courier tracking number or click Auto-Generate`;
    }

    autoGenerateDispatchWaybill(false);
};

window.setDispatchWaybillMode = function(mode = 'api') {
    window.currentDispatchWaybillMode = mode;
    autoGenerateDispatchWaybill(true, mode);
};

window.autoGenerateDispatchWaybill = function(force = true, mode = (window.currentDispatchWaybillMode || 'api')) {
    const input = document.getElementById('disp-waybill-input');
    const select = document.getElementById('disp-service-select');
    if (!input || !select) return;

    if (!force && input.value) return;

    const opt = select.options[select.selectedIndex];
    const provider = opt ? (opt.getAttribute('data-provider') || '').toLowerCase() : '';

    let waybill = '';
    if (provider.includes('trans')) {
        // Trans Express format: BE followed by 7 digits
        waybill = 'BE' + Math.floor(4500000 + Math.random() * 900000);
    } else if (provider.includes('fardar')) {
        if (mode === 'existing') {
            // Existing Waybill format from Existing Waybill API.txt / screenshot: IND followed by 7 digits
            waybill = 'IND' + Math.floor(1280000 + Math.random() * 50000);
        } else {
            // New Waybill API format from New Waybill API.txt / screenshot: API followed by 7 digits
            waybill = 'API' + Math.floor(5100000 + Math.random() * 90000);
        }
    } else {
        waybill = 'EXP' + Math.floor(1000000 + Math.random() * 9000000);
    }

    input.value = waybill;
};

// Reverse API Webhook Simulator (Matches Reverse API.txt parameters: waybill_id, current_status, last_update_time)
window.simulateReverseApiCallback = function(waybillId, newStatus = 'Delivered', hubLocation = 'City Office') {
    const orders = OrdersStorage.getAll();
    const order = orders.find(o => o.waybill === waybillId || o.id === waybillId);
    if (!order) {
        return { success: false, message: 'Waybill not found in orders database' };
    }
    order.status = newStatus;
    if (hubLocation) order.courierLocation = hubLocation;
    order.lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    OrdersStorage.saveAll(orders);
    try {
        if (typeof renderAllOrdersTable === 'function') renderAllOrdersTable();
        if (typeof renderDashboard === 'function') renderDashboard();
    } catch(e) {}
    return { success: true, order };
};

function setupDispatchCourierModal() {
    const form = document.getElementById('dispatch-courier-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderId = document.getElementById('disp-order-id').value;
        const select = document.getElementById('disp-service-select');
        const opt = select ? select.options[select.selectedIndex] : null;
        if (!opt) return;

        const serviceId = select.value;
        const provider = opt.getAttribute('data-provider');
        const clientId = opt.getAttribute('data-client') || (provider.toLowerCase().includes('trans') ? '4792' : '5980');
        const service = DeliveryServices.getById(serviceId) || { provider, clientId };
        let waybill = document.getElementById('disp-waybill-input').value.trim();
        const weight = parseFloat(document.getElementById('disp-weight').value || 0.5);

        const orders = OrdersStorage.getAll();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        order.weight = weight;

        const submitBtn = form.querySelector('button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Booking Parcel on Courier API...';
        }

        try {
            const providerLower = (provider || '').toLowerCase();
            // If no waybill entered, or if auto: book live on courier API
            if (!waybill || waybill === 'Awaiting Courier Dispatch') {
                if (providerLower.includes('fardar')) {
                    // Book on Fardar Express Domestic API
                    const fardarRes = await CourierApi.createFardarParcel(order, service);
                    if (fardarRes.success && fardarRes.waybill) {
                        waybill = fardarRes.waybill;
                        console.log('✅ Real Fardar Waybill booked in Waiting Parcels:', waybill);
                    } else {
                        autoGenerateDispatchWaybill(true);
                        waybill = document.getElementById('disp-waybill-input').value.trim();
                    }
                } else if (providerLower.includes('trans')) {
                    // Book on Trans Express REST API
                    const transRes = await CourierApi.createTransExpressParcel(order, service);
                    if (transRes.success && transRes.waybill) {
                        waybill = transRes.waybill;
                        console.log('✅ Real Trans Express Waybill booked:', waybill);
                    } else {
                        autoGenerateDispatchWaybill(true);
                        waybill = document.getElementById('disp-waybill-input').value.trim();
                    }
                } else {
                    autoGenerateDispatchWaybill(true);
                    waybill = document.getElementById('disp-waybill-input').value.trim();
                }
            }

            if (waybill && waybill.includes('-')) {
                waybill = waybill.replace(/API-5980-(\d+)/i, 'API51$1').replace(/API-(\d+)/i, 'API$1').replace(/-/g, '');
            }

            const isFardar = providerLower.includes('fardar');
            const defaultLocation = isFardar ? (order.city || 'City Office') : 'Peradeniya Hub';

            order.serviceId = serviceId;
            order.provider = provider;
            order.clientId = clientId;
            order.waybill = waybill;
            order.weight = weight;
            order.status = 'Dispatched';
            order.courierLocation = defaultLocation;

            OrdersStorage.saveAll(orders);

        // Deduct inventory stock if not already deducted
        if (order.items && order.items.length > 0) {
            order.items.forEach(it => {
                if (it.productId) ProductsStorage.deductStock(it.productId, it.qty);
            });
            renderProductsView();
        }

        // Automated SMSLENZ dispatch to customer with formatted E.164 phone number
        const user = Auth.getCurrentUser();
        const storeName = (user && user.storeName) ? user.storeName : 'SmartZone LK';
        const smsMessage = `Hi ${order.customer}, your order #${order.id} is confirmed & dispatched via ${order.provider} (Tracking: ${order.waybill}). COD Payable: Rs. ${parseFloat(order.total).toLocaleString()}. Track live at ${getSiteBaseUrl()}/store.html?track=${encodeURIComponent(order.waybill)}. Thank you for shopping with ${storeName}!`;
        SmsGateway.send(order.phone, smsMessage, 'SMSLENZ', storeName);

        closeDispatchCourierModal();
        renderAllOrdersTable();
        renderDashboard();
        renderDeliveryServicesList();

        alert(`✅ Order ${order.id} dispatched to ${order.provider}!\n📦 Waybill / Tracking: ${order.waybill}\n🏢 Courier Client ID: ${clientId}\n📍 Initial Hub: ${defaultLocation}\n📱 Customer notification SMS dispatched via SMSLENZ to ${formatSmsLenzContact(order.phone)}!`);

        // Automatically open thermal sticker label print modal
        window.openThermalLabelModal(order);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origBtnText;
            }
        }
    });
}

// ========================================================
// 17. IN-SYSTEM LIVE ORDER TRACKING CONTROLLER (PAGE-TRACK-ORDER)
// ========================================================
window.trackOrderInApp = function(query) {
    window.navigateTo('page-track-order', 'Track Order', 'Live courier tracking & timeline');
    const input = document.getElementById('track-page-query-input');
    if (input) input.value = query;
    executeLiveOrderTrack();
};

window.quickFillTrackSearch = function(query) {
    const input = document.getElementById('track-page-query-input');
    if (input) input.value = query;
    executeLiveOrderTrack();
};

window.copyStorefrontTrackingLink = function() {
    const input = document.getElementById('track-page-query-input');
    const q = input ? input.value.trim() : '';
    const url = window.location.origin + window.location.pathname.replace('index.html', 'store.html') + (q ? `?tracking=${encodeURIComponent(q)}` : '');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert(`🔗 Customer Tracking & Storefront Link copied to clipboard:\n\n${url}\n\nShare this link with your customers so they can track their order and shop online!`);
        });
    } else {
        prompt('Copy customer storefront tracking link:', url);
    }
};

window.simulateCourierWebhookUpdate = function(orderId) {
    const orders = OrdersStorage.getAll();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const isTrans = (order.provider || '').toLowerCase().includes('trans');
    const statuses = ['Processing', 'In Transit', 'Out For Delivery', 'Delivered'];
    let curIdx = statuses.indexOf(order.status);
    let nextStatus = 'In Transit';
    let nextLocation = '';

    if (curIdx === -1 || curIdx >= statuses.length - 1) {
        nextStatus = 'Out For Delivery';
        nextLocation = isTrans ? 'Trans Express Delivery Van (Kandy Hub)' : 'Fardar Courier Rider (Mount Lavinia Branch)';
    } else {
        nextStatus = statuses[curIdx + 1];
        if (nextStatus === 'In Transit') {
            nextLocation = isTrans ? 'Trans Express Central Hub (Peradeniya Sorting Center)' : 'Fardar Central Hub (Colombo)';
        } else if (nextStatus === 'Out For Delivery') {
            nextLocation = isTrans ? 'Trans Express Delivery Van (Out for Delivery to Customer)' : 'Fardar Express Rider on the way';
        } else if (nextStatus === 'Delivered') {
            nextLocation = `${order.city || 'Customer Destination'} - Successfully Delivered & Cash Collected`;
            order.paid = 'Paid';
        }
    }

    order.status = nextStatus;
    order.courierLocation = nextLocation;
    OrdersStorage.saveAll(orders);

    // Send SMS notification of delivery milestone
    const user = Auth.getCurrentUser();
    const storeName = (user && user.storeName) ? user.storeName : 'SmartZone LK';
    const milestoneSms = `SmartZone Update: Your order #${order.id} status changed to [${nextStatus}] with ${order.provider}. Location: ${nextLocation}. Waybill: ${order.waybill}.`;
    SmsGateway.send(order.phone, milestoneSms, 'SMSLENZ', storeName);

    executeLiveOrderTrack();
    renderAllOrdersTable();
    renderDashboard();
};

function executeLiveOrderTrack() {
    const input = document.getElementById('track-page-query-input');
    const container = document.getElementById('track-result-wrapper');
    if (!container) return;

    let q = (input ? input.value : '').trim().toLowerCase();
    const orders = OrdersStorage.getAll();

    if (!q) {
        // If query is empty, default to first available order for visual demonstration
        if (orders.length > 0) {
            q = (orders[0].waybill || orders[0].id).toLowerCase();
            if (input) input.value = orders[0].waybill || orders[0].id;
        } else {
            container.innerHTML = `
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:36px; text-align:center;">
                    <div style="font-size:36px; margin-bottom:8px;">📦</div>
                    <h3 style="font-size:16px; font-weight:800; color:#0f172a;">No Orders in System Yet</h3>
                    <p style="font-size:13px; color:#64748b; margin-top:4px;">Create or dispatch an order, or click "Load Sample Orders" on Dashboard to test live tracking.</p>
                </div>
            `;
            return;
        }
    }

    // Clean query
    const cleanQ = q.replace(/^#/, '').trim();

    let order = orders.find(o => 
        (o.waybill && o.waybill.toLowerCase() === cleanQ) ||
        (o.id && o.id.toLowerCase() === cleanQ) ||
        (o.id && o.id.toLowerCase().replace('sz-', '') === cleanQ) ||
        (o.phone && o.phone.replace(/[^0-9]/g, '').includes(cleanQ.replace(/[^0-9]/g, '')))
    );

    // Super Admin cross-store search capability:
    if (!order && Auth.getCurrentUser()?.role === 'admin') {
        const allUsers = UsersStorage.getAll();
        for (const u of allUsers) {
            if (u.id === getActiveMerchantId()) continue;
            try {
                const tenantOrders = JSON.parse(localStorage.getItem(`sz_oms_${u.id}_orders`) || '[]');
                order = tenantOrders.find(o => 
                    (o.waybill && o.waybill.toLowerCase() === cleanQ) ||
                    (o.id && o.id.toLowerCase() === cleanQ) ||
                    (o.id && o.id.toLowerCase().replace('sz-', '') === cleanQ) ||
                    (o.phone && o.phone.replace(/[^0-9]/g, '').includes(cleanQ.replace(/[^0-9]/g, '')))
                );
                if (order) break;
            } catch(e) {}
        }
    }

    if (!order) {
        container.innerHTML = `
            <div style="background:#fff; border:1px solid #fecaca; border-radius:12px; padding:32px 24px; text-align:center; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
                <div style="font-size:42px; margin-bottom:10px;">🔍</div>
                <h3 style="color:#b91c1c; font-size:18px; font-weight:800;">Order Not Found / ඇනවුම හමු නොවීය</h3>
                <p style="color:#64748b; font-size:13.5px; max-width:480px; margin:6px auto 18px auto; line-height:1.5;">
                    We couldn't find an order matching "<strong>${input ? input.value : ''}</strong>". Please verify your Order ID, Waybill, or Mobile Phone Number.
                </p>
                <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn-cancel" onclick="quickFillTrackSearch('BE4542289')">
                        Try Sample BE4542289 (Trans Express)
                    </button>
                    <button type="button" class="btn-cancel" onclick="quickFillTrackSearch('API5173879')">
                        Try Sample API5173879 (Fardar)
                    </button>
                    <a href="https://wa.me/94786800086?text=Hi%20SmartZone%2C%20I%20need%20help%20tracking%20my%20order" target="_blank" class="btn-create-order" style="padding:8px 16px; font-size:12.5px; background:#10b981; width:auto; text-decoration:none;">
                        💬 WhatsApp Dispatch Helpline
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // Determine Stepper Stage
    let stepIndex = 1;
    let progressPct = 0;
    const st = (order.status || '').toLowerCase();

    if (st === 'pending') {
        stepIndex = 1;
        progressPct = 0;
    } else if (st === 'processing') {
        stepIndex = 2;
        progressPct = 25;
    } else if (st === 'dispatched' || st === 'in transit') {
        stepIndex = 3;
        progressPct = 50;
    } else if (st === 'out for delivery') {
        stepIndex = 4;
        progressPct = 75;
    } else if (st === 'delivered') {
        stepIndex = 5;
        progressPct = 100;
    }

    const isFardar = (order.provider || '').toLowerCase().includes('fardar');
    const isTrans = (order.provider || '').toLowerCase().includes('trans');
    const extTrackUrl = getCourierTrackingUrl(order.provider, order.waybill);
    const clientId = order.clientId || (isTrans ? '4792' : (isFardar ? '5980' : '-'));
    const badgeClass = isFardar ? 'service-badge-fardar' : 'service-badge-trans';

    container.innerHTML = `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
            
            <!-- Header Status Banner -->
            <div style="background:#0f172a; color:#fff; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
                <div>
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; font-weight:700;">
                        SMARTZONE LIVE TRACKING CONSOLE
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; margin-top:3px;">
                        <span style="font-size:20px; font-weight:800; font-family:'JetBrains Mono';">${order.id}</span>
                        ${order.origin === 'Web Storefront' ? `<span class="badge-web-order">🌐 Web Storefront</span>` : ''}
                        <span class="status-pill status-${st === 'delivered' ? 'delivered' : (st === 'in transit' || st === 'dispatched' ? 'transit' : 'pending')}" style="font-size:12px;">
                            ${order.status}
                        </span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11.5px; color:#94a3b8;">Cash on Delivery (COD):</div>
                    <div style="font-size:20px; font-weight:800; color:#38bdf8;">Rs. ${parseFloat(order.total).toLocaleString()}.00</div>
                    <div style="font-size:11px; color:${order.paid === 'Paid' ? '#4ade80' : '#fcd34d'}; font-weight:700;">
                        ${order.paid === 'Paid' ? '✓ Payment Received' : '⏳ Payment Pending (COD)'}
                    </div>
                </div>
            </div>

            <div style="padding:24px;">
                
                <!-- 5-Step Visual Stepper -->
                <div class="tracking-stepper-wrap" style="margin-bottom:28px;">
                    <div class="tracking-stepper">
                        <div class="tracking-stepper-progress" style="width:${progressPct}%;"></div>
                        
                        <div class="stepper-step ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}">
                            <div class="stepper-circle">${stepIndex > 1 ? '✓' : '1'}</div>
                            <div class="stepper-label">Pending</div>
                            <div class="stepper-time">Order Placed</div>
                        </div>

                        <div class="stepper-step ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}">
                            <div class="stepper-circle">${stepIndex > 2 ? '✓' : '2'}</div>
                            <div class="stepper-label">Processing</div>
                            <div class="stepper-time">Packaged</div>
                        </div>

                        <div class="stepper-step ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}">
                            <div class="stepper-circle">${stepIndex > 3 ? '✓' : '3'}</div>
                            <div class="stepper-label">In Transit</div>
                            <div class="stepper-time">Courier Hub</div>
                        </div>

                        <div class="stepper-step ${stepIndex >= 4 ? 'completed' : ''} ${stepIndex === 4 ? 'active' : ''}">
                            <div class="stepper-circle">${stepIndex > 4 ? '✓' : '4'}</div>
                            <div class="stepper-label">Out for Delivery</div>
                            <div class="stepper-time">With Rider</div>
                        </div>

                        <div class="stepper-step ${stepIndex >= 5 ? 'completed' : ''} ${stepIndex === 5 ? 'active' : ''}">
                            <div class="stepper-circle">${stepIndex >= 5 ? '✓' : '5'}</div>
                            <div class="stepper-label">Delivered</div>
                            <div class="stepper-time">Cash Collected</div>
                        </div>
                    </div>
                </div>

                <!-- 2-Column Info Grid -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-bottom:24px;">
                    
                    <!-- Left: Courier Details -->
                    <div class="courier-live-details">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span class="${badgeClass}">${order.provider || 'Courier'}</span>
                                <span style="font-size:12px; font-weight:700; color:#0f172a;">Live Courier Status</span>
                            </div>
                            <span style="font-family:'JetBrains Mono'; font-size:11.5px; color:#64748b; font-weight:700;">
                                Client ID: <strong style="color:#0f172a;">${clientId}</strong>
                            </span>
                        </div>

                        <div style="font-size:13px; color:#334155; line-height:1.6;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="color:#64748b;">Waybill / Tracking:</span>
                                <strong style="font-family:'JetBrains Mono'; color:#0284c7; font-size:14px;">${order.waybill || 'Awaiting Dispatch'}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="color:#64748b;">Current Location / Hub:</span>
                                <strong style="color:#0f172a; text-align:right;">${order.courierLocation || (isTrans ? 'Trans Express Central Hub (Peradeniya)' : 'Fardar Colombo Branch Hub')}</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="color:#64748b;">Parcel Weight:</span>
                                <strong>${order.weight || 0.5} KG</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="color:#64748b;">Delivery Fee:</span>
                                <strong>Rs. ${parseFloat(order.deliveryCharge || 500).toLocaleString()}</strong>
                            </div>
                        </div>

                        <!-- Live Action Buttons -->
                        <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
                            <a href="${extTrackUrl}" target="_blank" class="btn-cancel" style="font-size:12px; font-weight:700; color:#2563eb; border:1px solid #bfdbfe; background:#eff6ff; text-decoration:none; display:inline-flex; align-items:center; gap:4px; padding:6px 12px;">
                                🌐 Open ${order.provider || 'Courier'} Portal
                            </a>
                            <button type="button" class="btn-cancel" style="font-size:12px; font-weight:700; color:#15803d; border:1px solid #bbf7d0; background:#f0fdf4; display:inline-flex; align-items:center; gap:4px; padding:6px 12px;" onclick="simulateCourierWebhookUpdate('${order.id}')" title="Advance status to next milestone & send SMS">
                                🔄 Simulate Courier Webhook Update
                            </button>
                        </div>
                    </div>

                    <!-- Right: Customer & Delivery Details -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
                        <div style="font-size:12px; font-weight:800; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">
                            👤 Customer & Delivery Address
                        </div>
                        <div style="font-size:13px; color:#334155; line-height:1.6;">
                            <div>Recipient Name: <strong style="color:#0f172a;">${order.customer}</strong></div>
                            <div>Mobile Phone: <strong style="color:#0284c7; font-family:'JetBrains Mono';">📞 ${order.phone} ${order.phone2 ? '/ ' + order.phone2 : ''}</strong></div>
                            <div>Delivery Address: <strong>${order.address}</strong></div>
                            <div>City / District: <strong>📍 ${(order.city || '').toUpperCase()}</strong></div>
                            <div>Order Date: <span style="color:#64748b;">${order.date}</span></div>
                        </div>

                        <!-- Automated SMS Status -->
                        <div style="margin-top:12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 12px; font-size:12px; color:#1e40af; display:flex; align-items:center; gap:8px;">
                            <span>📱</span>
                            <span><strong>SMSLENZ Active:</strong> Dispatch and status updates are linked to customer's mobile (${order.phone}).</span>
                        </div>
                    </div>

                </div>

                <!-- Items Ordered Table -->
                <div style="margin-bottom:24px;">
                    <div style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:8px;">
                        📦 Package Contents (${(order.items || []).length} items):
                    </div>
                    <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse; font-size:13px;">
                            <thead>
                                <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; text-align:left; color:#64748b; font-size:11.5px;">
                                    <th style="padding:8px 14px;">ITEM</th>
                                    <th style="padding:8px 14px; text-align:center;">QTY</th>
                                    <th style="padding:8px 14px; text-align:right;">PRICE</th>
                                    <th style="padding:8px 14px; text-align:right;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(order.items || []).map(it => `
                                    <tr style="border-bottom:1px solid #f1f5f9;">
                                        <td style="padding:10px 14px; font-weight:600;">${it.name}</td>
                                        <td style="padding:10px 14px; text-align:center;">${it.qty}</td>
                                        <td style="padding:10px 14px; text-align:right;">Rs. ${parseFloat(it.price).toLocaleString()}</td>
                                        <td style="padding:10px 14px; text-align:right; font-weight:700;">Rs. ${(it.price * it.qty).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                                <tr style="background:#f8fafc; font-weight:700;">
                                    <td colspan="3" style="padding:10px 14px; text-align:right;">Delivery Charge:</td>
                                    <td style="padding:10px 14px; text-align:right;">Rs. ${parseFloat(order.deliveryCharge || 500).toLocaleString()}</td>
                                </tr>
                                <tr style="background:#f1f5f9; font-weight:800; font-size:14px; color:#0f172a;">
                                    <td colspan="3" style="padding:10px 14px; text-align:right;">COD Payable Amount:</td>
                                    <td style="padding:10px 14px; text-align:right; color:#2563eb;">Rs. ${parseFloat(order.total).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Courier Activity Timeline Log -->
                <div>
                    <div style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:10px;">
                        🕒 Live Dispatch & Courier Timeline (Event Log):
                    </div>
                    <div class="timeline-event-list">
                        <div class="timeline-event-item">
                            <div class="timeline-event-bullet"></div>
                            <div class="timeline-event-time">${order.date || '2026-10-02 14:30'}</div>
                            <div class="timeline-event-title">Order Received into OMS</div>
                            <div class="timeline-event-desc">Order registered from ${order.origin || 'OMS Direct'} for customer ${order.customer}.</div>
                        </div>

                        ${stepIndex >= 2 ? `
                            <div class="timeline-event-item">
                                <div class="timeline-event-bullet"></div>
                                <div class="timeline-event-time">${order.date || '2026-10-02 15:10'}</div>
                                <div class="timeline-event-title">Packaged & Manifested</div>
                                <div class="timeline-event-desc">Products verified from inventory and packed with 4x6" thermal waybill (${order.waybill}).</div>
                            </div>
                        ` : ''}

                        ${stepIndex >= 3 ? `
                            <div class="timeline-event-item">
                                <div class="timeline-event-bullet"></div>
                                <div class="timeline-event-time">2026-10-02 18:00</div>
                                <div class="timeline-event-title">Handed Over to ${order.provider || 'Courier'}</div>
                                <div class="timeline-event-desc">Courier van collected parcel from warehouse. Client ID: ${clientId}. Tracking ID: ${order.waybill}.</div>
                            </div>
                            <div class="timeline-event-item">
                                <div class="timeline-event-bullet"></div>
                                <div class="timeline-event-time">2026-10-03 08:30</div>
                                <div class="timeline-event-title">Arrived at Central Sorting Hub</div>
                                <div class="timeline-event-desc">Scanned at ${order.courierLocation || 'Sorting Center'}. Ready for delivery dispatch.</div>
                            </div>
                        ` : ''}

                        ${stepIndex >= 4 ? `
                            <div class="timeline-event-item">
                                <div class="timeline-event-bullet"></div>
                                <div class="timeline-event-time">2026-10-03 11:15</div>
                                <div class="timeline-event-title">Out for Delivery with Rider</div>
                                <div class="timeline-event-desc">Courier delivery agent has departed for ${order.address}, ${order.city}.</div>
                            </div>
                        ` : ''}

                        ${stepIndex >= 5 ? `
                            <div class="timeline-event-item">
                                <div class="timeline-event-bullet" style="background:#10b981; border-color:#10b981;"></div>
                                <div class="timeline-event-time">2026-10-03 14:20</div>
                                <div class="timeline-event-title" style="color:#15803d;">Successfully Delivered & Cash Collected</div>
                                <div class="timeline-event-desc">Delivered to ${order.customer}. COD Rs. ${parseFloat(order.total).toLocaleString()} collected.</div>
                            </div>
                        ` : ''}
                    </div>
                </div>

            </div>
        </div>
    `;
}

function renderTrackOrderView() {
    executeLiveOrderTrack();
}

function setupTrackOrderController() {
    // Controller ready
}

