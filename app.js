/**
 * Gudiya Mart - Core Application Logic & Client DB Management
 * Sourcing Currency: Indian Rupees (₹)
 */

const app = {
    // Supabase REST Configuration
    supabase: {
        url: "https://abobgjnuxejihezxlxdq.supabase.co/rest/v1",
        key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFib2Jnam51eGVqaWhlenhseGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTY0MDIsImV4cCI6MjEwMzI5MjQwMn0.Uf-VibHLXIj0mzlpWfCV4bKo3BoFXQb5UBjfjPKOS3s", // Replace with your Supabase Anon API Key

        async request(endpoint, method = 'GET', body = null) {
            if (!this.key || this.key === "PLACEHOLDER_KEY") {
                console.warn("Supabase API Key is missing. Using local storage mode.");
                return null;
            }
            try {
                const headers = {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                };
                const config = { method, headers };
                if (body) {
                    config.body = JSON.stringify(body);
                }
                const response = await fetch(`${this.url}/${endpoint}`, config);
                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(`REST Error: ${response.status} - ${errorMsg}`);
                }
                if (response.status === 204) return [];
                return await response.json();
            } catch (err) {
                console.error("Supabase API request failed:", err);
                return null;
            }
        }
    },

    // Map local orders to database representation
    mapOrderToDB(order) {
        return {
            id: order.id,
            user_id: order.userId,
            user_name: order.userName,
            user_phone: order.userPhone,
            items: order.items,
            delivery_slot: order.deliverySlot,
            delivery_address: order.deliveryAddress,
            subtotal: order.subtotal,
            discount: order.discount,
            shipping: order.shipping,
            total: order.total,
            status: order.status,
            created_at: order.orderedAt
        };
    },

    // Map database orders back to camelCase local representation
    mapOrderFromDB(dbOrder) {
        return {
            id: dbOrder.id,
            userId: dbOrder.user_id,
            userName: dbOrder.user_name,
            userPhone: dbOrder.user_phone,
            items: dbOrder.items,
            deliverySlot: dbOrder.delivery_slot,
            deliveryAddress: dbOrder.delivery_address,
            subtotal: Number(dbOrder.subtotal),
            discount: Number(dbOrder.discount),
            shipping: Number(dbOrder.shipping),
            total: Number(dbOrder.total),
            status: dbOrder.status,
            orderedAt: dbOrder.created_at
        };
    },

    // Application State
    state: {
        users: [],
        currentUser: null,
        products: [],
        orders: [],
        cart: [],
        theme: 'light',
        activeView: 'shop-view',
        activeAdminSubtab: 'admin-orders-tab',
        currentSlide: 0,
        carouselInterval: null,
        selectedWeights: {}
    },

    // Default Catalog Seeds (Indian organic vegetable catalog in Rupees)
    defaultProducts: [
        {
            id: 'v1',
            name: 'Desi Tomatoes (Tamatar)',
            category: 'daily',
            unit: 'kg',
            price: 40,
            stock: 120,
            sales: 85,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v2',
            name: 'Pahadi Potatoes (Aloo)',
            category: 'root',
            unit: 'kg',
            price: 30,
            stock: 250,
            sales: 154,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v3',
            name: 'Nasik Red Onions (Pyaz)',
            category: 'daily',
            unit: 'kg',
            price: 28,
            stock: 200,
            sales: 130,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1508747702-f520acf9b3fb?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v4',
            name: 'Sweet Crunchy Carrots (Gajar)',
            category: 'root',
            unit: 'kg',
            price: 45,
            stock: 90,
            sales: 42,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v5',
            name: 'Organic Spinach (Palak)',
            category: 'leafy',
            unit: 'bunch',
            price: 20,
            stock: 65,
            sales: 52,
            step: 1,
            image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v6',
            name: 'Organic Broccoli Crowns',
            category: 'exotic',
            unit: 'kg',
            price: 120,
            stock: 45,
            sales: 29,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v7',
            name: 'Fresh Lady Finger (Bhindi)',
            category: 'daily',
            unit: 'kg',
            price: 50,
            stock: 80,
            sales: 60,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v8',
            name: 'Shimla Green Capsicum',
            category: 'daily',
            unit: 'kg',
            price: 70,
            stock: 75,
            sales: 38,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1563565080-7acb2cf55047?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v9',
            name: 'Fresh Green Cabbage (Patta Gobhi)',
            category: 'leafy',
            unit: 'pc',
            price: 35,
            stock: 110,
            sales: 47,
            step: 1,
            image: 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v10',
            name: 'Mountain Ginger (Adrak)',
            category: 'root',
            unit: 'kg',
            price: 160,
            stock: 50,
            sales: 33,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v11',
            name: 'Mountain Garlic (Lahsun)',
            category: 'root',
            unit: 'kg',
            price: 220,
            stock: 60,
            sales: 25,
            step: 0.5,
            image: 'https://images.unsplash.com/photo-1589618474799-a9a700373a15?w=600&auto=format&fit=crop&q=60'
        },
        {
            id: 'v12',
            name: 'Fresh Coriander (Dhaniya)',
            category: 'leafy',
            unit: 'bunch',
            price: 10,
            stock: 150,
            sales: 112,
            step: 1,
            image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop&q=60'
        }
    ],

    // HTML Escaping Utility for XSS Prevention
    escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, (match) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return map[match];
        });
    },

    // Local Storage Helpers
    saveToStorage() {
        localStorage.setItem('gudiyamart_users', JSON.stringify(this.state.users));
        localStorage.setItem('gudiyamart_currentUser', JSON.stringify(this.state.currentUser));
        localStorage.setItem('gudiyamart_products', JSON.stringify(this.state.products));
        localStorage.setItem('gudiyamart_orders', JSON.stringify(this.state.orders));
        localStorage.setItem('gudiyamart_theme', this.state.theme);
    },

    loadFromStorage() {
        const storedUsers = localStorage.getItem('gudiyamart_users');
        const storedCurrentUser = localStorage.getItem('gudiyamart_currentUser');
        const storedProducts = localStorage.getItem('gudiyamart_products');
        const storedOrders = localStorage.getItem('gudiyamart_orders');
        const storedTheme = localStorage.getItem('gudiyamart_theme');

        // Setup users
        if (storedUsers) {
            this.state.users = JSON.parse(storedUsers);
        } else {
            this.state.users = [];
        }

        // Setup current user session
        if (storedCurrentUser) {
            this.state.currentUser = JSON.parse(storedCurrentUser);
        }

        // Setup products
        if (storedProducts) {
            this.state.products = JSON.parse(storedProducts);
        } else {
            this.state.products = [...this.defaultProducts];
        }

        // Setup orders
        if (storedOrders) {
            this.state.orders = JSON.parse(storedOrders);
        } else {
            this.state.orders = [];
        }

        // Setup theme
        if (storedTheme) {
            this.state.theme = storedTheme;
        }
    },

    // Initialization
    async init() {
        this.loadFromStorage();
        this.applyTheme();
        this.registerDOMEvents();
        this.updateNavState();
        this.updatePromoSpotsCount();
        this.renderShop();
        this.renderCart();
        this.renderOrders();
        this.renderAdmin();

        // Start automatic hero banner slide rotation
        this.startCarouselRotation();

        // Update community neighbor indicators
        this.updateNeighborOptedCounts();

        // Start pre-launch hero countdown timer
        this.startHeroCountdown();

        // Register Service Worker for PWA performance and offline caching
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker registered successfully!', reg.scope))
                    .catch(err => console.error('Service Worker registration failed:', err));
            });
        }

        // Asynchronously sync database from Supabase on load
        await this.syncFromSupabase();

        console.log("Gudiya Mart Initialized!");
    },

    startHeroCountdown() {
        const targetDate = new Date("August 28, 2026 00:00:00").getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(this.state.countdownInterval);
                document.querySelectorAll('.hero-countdown-wrapper').forEach(el => {
                    el.innerHTML = `<span class="countdown-note text-success" style="color: var(--primary); font-weight: bold;">We are now accepting orders!</span>`;
                });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const format = num => String(num).padStart(2, '0');

            document.querySelectorAll('.countdown-days').forEach(el => el.textContent = format(days));
            document.querySelectorAll('.countdown-hours').forEach(el => el.textContent = format(hours));
            document.querySelectorAll('.countdown-mins').forEach(el => el.textContent = format(minutes));
            document.querySelectorAll('.countdown-secs').forEach(el => el.textContent = format(seconds));
        };

        updateCountdown();
        this.state.countdownInterval = setInterval(updateCountdown, 1000);
    },

    async syncFromSupabase() {
        // Query products
        const dbProducts = await this.supabase.request('gudiyamart_products', 'GET');
        if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
            console.log(`Synced ${dbProducts.length} products from Supabase.`);
            this.state.products = dbProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                unit: p.unit,
                price: Number(p.price),
                stock: Number(p.stock),
                sales: Number(p.sales),
                step: Number(p.step || 1),
                image: p.image
            }));
            this.saveToStorage();
            this.renderShop();
        } else if (dbProducts && Array.isArray(dbProducts) && dbProducts.length === 0) {
            console.log("Supabase gudiyamart_products table is empty. Seeding defaults...");
            for (const prod of this.state.products) {
                const dbProd = {
                    id: prod.id,
                    name: prod.name,
                    category: prod.category,
                    unit: prod.unit,
                    price: prod.price,
                    stock: prod.stock,
                    sales: prod.sales,
                    step: prod.step || 1,
                    image: prod.image
                };
                await this.supabase.request('gudiyamart_products', 'POST', dbProd);
            }
        }

        // Query users
        const dbUsers = await this.supabase.request('gudiyamart_users', 'GET');
        if (dbUsers && Array.isArray(dbUsers)) {
            console.log(`Synced ${dbUsers.length} users from Supabase.`);
            const mappedUsers = dbUsers.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                address: u.address,
                password: u.password,
                isAdmin: u.is_admin,
                isPromoMember: u.is_promo_member,
                joinedAt: u.created_at
            }));
            this.state.users = mappedUsers;
            this.saveToStorage();
        }

        // Query orders
        const dbOrders = await this.supabase.request('gudiyamart_orders', 'GET');
        if (dbOrders && Array.isArray(dbOrders)) {
            console.log(`Synced ${dbOrders.length} orders from Supabase.`);
            const mappedOrders = dbOrders.map(o => this.mapOrderFromDB(o));
            this.state.orders = mappedOrders;
            this.saveToStorage();

            // Re-draw views to show synced data
            this.renderOrders();
            this.renderAdmin();
            this.updatePromoSpotsCount();
        }
    },

    selectProductWeight(productId, weight) {
        this.state.selectedWeights[productId] = weight;
        this.renderShop(false); // Quick redraw to toggle active chip states
    },

    async forceSyncInventoryToSupabase() {
        this.showToast("Pushing local inventory to Supabase database...", "info");
        try {
            let successCount = 0;
            for (const prod of this.state.products) {
                // Check if product exists in Supabase
                const existing = await this.supabase.request(`gudiyamart_products?id=eq.${encodeURIComponent(prod.id)}`, 'GET');
                const dbProd = {
                    id: prod.id,
                    name: prod.name,
                    category: prod.category,
                    unit: prod.unit,
                    price: Number(prod.price),
                    stock: Number(prod.stock),
                    sales: Number(prod.sales),
                    step: Number(prod.step || 1),
                    image: prod.image
                };
                if (existing && Array.isArray(existing) && existing.length > 0) {
                    await this.supabase.request(`gudiyamart_products?id=eq.${encodeURIComponent(prod.id)}`, 'PATCH', dbProd);
                } else {
                    await this.supabase.request('gudiyamart_products', 'POST', dbProd);
                }
                successCount++;
            }
            this.showToast(`Catalog successfully synced! Sourced ${successCount} items to Supabase.`, "success");
        } catch (err) {
            console.error("Supabase inventory sync failed:", err);
            this.showToast("Error syncing catalog to Supabase database", "error");
        }
    },

    // Apply active theme to document body
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.state.theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
    },

    // Carousel Slider Functionality
    startCarouselRotation() {
        this.state.carouselInterval = setInterval(() => {
            this.rotateSlide(1);
        }, 4000);
    },

    stopCarouselRotation() {
        if (this.state.carouselInterval) {
            clearInterval(this.state.carouselInterval);
        }
    },

    rotateSlide(direction) {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        if (slides.length === 0) return;

        // Deactivate current slide
        slides[this.state.currentSlide].classList.remove('active');
        dots[this.state.currentSlide].classList.remove('active');

        // Increment slide pointer
        this.state.currentSlide = (this.state.currentSlide + direction + slides.length) % slides.length;

        // Activate new slide
        slides[this.state.currentSlide].classList.add('active');
        dots[this.state.currentSlide].classList.add('active');
    },

    jumpToSlide(slideIndex) {
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        if (slides.length === 0 || slideIndex < 0 || slideIndex >= slides.length) return;

        this.stopCarouselRotation();

        // Deactivate current slide
        slides[this.state.currentSlide].classList.remove('active');
        dots[this.state.currentSlide].classList.remove('active');

        this.state.currentSlide = slideIndex;

        // Activate slide
        slides[this.state.currentSlide].classList.add('active');
        dots[this.state.currentSlide].classList.add('active');

        this.startCarouselRotation();
    },

    scrollToShop() {
        const shopGrid = document.getElementById('vegetable-grid');
        if (shopGrid) {
            shopGrid.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Generate randomized numbers for community delivery slots to make it look alive
    updateNeighborOptedCounts() {
        const counts = {
            '7:00 AM': Math.floor(Math.random() * 8) + 4,
            '2:00 PM': Math.floor(Math.random() * 5) + 1,
            '5:00 PM': Math.floor(Math.random() * 12) + 6,
            '9:00 PM': Math.floor(Math.random() * 6) + 1
        };

        const slots = ['7', '2', '5', '9'];
        const slotKeys = ['7:00 AM', '2:00 PM', '5:00 PM', '9:00 PM'];

        slots.forEach((s, idx) => {
            const el = document.getElementById(`neigh-count-${s}`);
            if (el) {
                const count = counts[slotKeys[idx]];
                el.textContent = `${count} neighbor${count > 1 ? 's' : ''} opted`;
            }
        });
    },

    // Promo code spot logic (100 spots launch offer)
    updatePromoSpotsCount() {
        const customerRegistrationsCount = this.state.users.filter(u => !u.isAdmin).length;
        const spotsLeft = Math.max(0, 100 - customerRegistrationsCount);

        const spotsEl = document.getElementById('promo-spots-left');
        if (spotsEl) {
            spotsEl.textContent = spotsLeft;
        }

        const ringFill = document.getElementById('promo-progress-ring');
        if (ringFill) {
            const r = 30;
            const circumference = 2 * Math.PI * r;
            const progress = spotsLeft / 100;
            const offset = circumference * (1 - progress);
            ringFill.style.strokeDasharray = circumference;
            ringFill.style.strokeDashoffset = offset;
        }

        const regPromoText = document.getElementById('register-promo-text');
        const regPromoBadge = document.getElementById('register-promo-badge');
        if (regPromoText && regPromoBadge) {
            if (spotsLeft > 0) {
                regPromoText.textContent = `Hurry! ${spotsLeft} launch promo spots are still available for 10% OFF & free delivery.`;
                regPromoBadge.style.display = 'flex';
            } else {
                regPromoText.textContent = `Launch offer full! Regular memberships active.`;
                regPromoBadge.style.backgroundColor = 'var(--border)';
                regPromoBadge.style.borderColor = 'var(--text-muted)';
                regPromoBadge.style.color = 'var(--text-muted)';
            }
        }
    },

    // Navigation and Page view changes
    navigateTo(viewId) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.remove('active-view');
        });

        // Toggle active view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active-view');
            this.state.activeView = viewId;
        }

        // Update nav links highlights
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === viewId) {
                link.classList.add('active');
            }
        });

        // Update mobile bottom nav highlights (Quick Commerce Style)
        document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === viewId) {
                item.classList.add('active');
            }
        });

        // Hide/Show hero banner based on view
        const heroBanner = document.getElementById('hero-banner');
        if (heroBanner) {
            if (viewId === 'shop-view') {
                heroBanner.classList.remove('hidden');
            } else {
                heroBanner.classList.add('hidden');
            }
        }

        // Close mobile nav menu if open
        const navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('open');

        // Scroll to top
        window.scrollTo(0, 0);

        // Sub-page re-renders
        if (viewId === 'orders-view') {
            this.renderOrders();
        } else if (viewId === 'admin-view') {
            this.renderAdmin();
        }
    },

    updateNavState() {
        const authBtnText = document.getElementById('auth-btn-text');
        const navAuth = document.getElementById('nav-auth');

        if (this.state.currentUser) {
            // Logged in
            authBtnText.textContent = this.state.currentUser.isAdmin ? 'Operations' : 'Sign Out';
            navAuth.setAttribute('data-target', this.state.currentUser.isAdmin ? 'admin-view' : 'logout-trigger');
        } else {
            // Logged out
            authBtnText.textContent = 'Sign In';
            navAuth.setAttribute('data-target', 'auth-view');
        }

        // Sync location header address
        this.updateLocationHeader();
    },

    updateLocationHeader() {
        const topAddrEl = document.getElementById('top-delivery-address');
        if (topAddrEl) {
            if (this.state.currentUser) {
                topAddrEl.textContent = this.state.currentUser.address;
                topAddrEl.title = this.state.currentUser.address;
            } else {
                topAddrEl.textContent = "Guest / Sign In to select address";
                topAddrEl.title = "";
            }
        }
    },

    // DOM Action Events Listener Setup
    registerDOMEvents() {
        // Nav Brand Link clicks
        document.getElementById('nav-brand-logo').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo('shop-view');
        });

        // Navigation Link triggers
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.getAttribute('data-target');
                if (target === 'logout-trigger') {
                    e.preventDefault();
                    this.handleLogout();
                } else {
                    this.navigateTo(target);
                }
            });
        });

        // Mobile Nav Trigger
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            const navLinks = document.getElementById('nav-links');
            if (navLinks) navLinks.classList.toggle('open');
        });

        // Hero carousel dot jump handlers
        document.querySelectorAll('.carousel-dots .dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-slide'));
                this.jumpToSlide(index);
            });
        });

        // Hero CTA button click events (slides action buttons)
        document.querySelectorAll('.hero-cta-btn-action').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.state.currentUser) {
                    this.scrollToShop();
                } else {
                    this.navigateTo('auth-view');
                    this.toggleAuthTab('register');
                }
            });
        });

        // Theme Toggle Switch
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.saveToStorage();
            this.applyTheme();
        });

        // Cart Drawer visibility triggers
        const cartOverlay = document.getElementById('cart-drawer-overlay');
        const cartDrawer = document.getElementById('cart-drawer');

        const openCart = () => {
            cartOverlay.classList.add('open');
            cartDrawer.classList.add('open');
            this.renderCart();
        };

        const closeCart = () => {
            cartOverlay.classList.remove('open');
            cartDrawer.classList.remove('open');
        };

        document.getElementById('cart-trigger-btn').addEventListener('click', openCart);
        document.getElementById('close-cart-btn').addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
        document.getElementById('start-shopping-btn').addEventListener('click', () => {
            closeCart();
            this.navigateTo('shop-view');
        });

        // Shop Search and Category Filters with Debouncing
        const searchInput = document.getElementById('shop-search');
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.renderShop();
                }, 200);
            });
        }

        // Mobile prominent search syncing with desktop input
        const searchInputMain = document.getElementById('shop-search-main');
        if (searchInputMain) {
            searchInputMain.addEventListener('input', () => {
                const query = searchInputMain.value;
                if (searchInput) {
                    searchInput.value = query;
                }
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.renderShop();
                }, 200);
            });
        }

        // Mobile Horizontal Scroll Category Chips click handler
        document.querySelectorAll('#mobile-category-list .mobile-cat-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const category = chip.getAttribute('data-category');

                // Toggle active on mobile chips
                document.querySelectorAll('#mobile-category-list .mobile-cat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                // Sync to desktop sidebar category chips
                document.querySelectorAll('#category-filter-list .category-chip').forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-category') === category) {
                        c.classList.add('active');
                    }
                });

                this.renderShop();
            });
        });

        // Mobile Bottom Nav click handlers
        document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                if (item.id === 'btn-nav-cart') {
                    openCart();
                } else if (target) {
                    this.navigateTo(target);
                }
            });
        });

        // Floating Cart checkout banner click
        const floatViewCartBtn = document.getElementById('float-view-cart-btn');
        if (floatViewCartBtn) {
            floatViewCartBtn.addEventListener('click', openCart);
        }

        const sortSelect = document.getElementById('sort-selector');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.renderShop());
        }

        // Mobile Filter triggers
        const filterSidebar = document.getElementById('filter-sidebar');
        const openFiltersBtn = document.getElementById('open-filters-btn');
        const closeFiltersBtn = document.getElementById('close-filters-btn');

        if (openFiltersBtn && filterSidebar) {
            openFiltersBtn.addEventListener('click', () => filterSidebar.classList.add('open'));
        }
        if (closeFiltersBtn && filterSidebar) {
            closeFiltersBtn.addEventListener('click', () => filterSidebar.classList.remove('open'));
        }

        // Category Filter Chips
        document.querySelectorAll('#category-filter-list .category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#category-filter-list .category-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                if (filterSidebar) filterSidebar.classList.remove('open');
                this.renderShop();
            });
        });

        // Checkout Button in Cart Drawer
        document.getElementById('checkout-btn').addEventListener('click', () => this.placeOrder());

        // Authentication form tab switches
        document.getElementById('tab-login-btn').addEventListener('click', () => this.toggleAuthTab('login'));
        document.getElementById('tab-register-btn').addEventListener('click', () => this.toggleAuthTab('register'));

        // Forms submits
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Admin Sub-tabs switching
        document.querySelectorAll('.admin-subtab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-subtab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.admin-tab-content').forEach(cont => cont.classList.remove('active-subtab'));
                const subId = tab.getAttribute('data-subtab');
                document.getElementById(subId).classList.add('active-subtab');
                this.state.activeAdminSubtab = subId;

                if (subId === 'admin-orders-tab') {
                    this.renderAdminOrders();
                } else if (subId === 'admin-inventory-tab') {
                    this.renderAdminInventory();
                } else if (subId === 'admin-users-tab') {
                    this.renderAdminUsers();
                }
            });
        });

        // Admin filter selects
        document.getElementById('admin-filter-slot').addEventListener('change', () => this.renderAdminOrders());
        document.getElementById('admin-filter-status').addEventListener('change', () => this.renderAdminOrders());

        // Admin manage product form submission
        document.getElementById('product-manage-form').addEventListener('submit', (e) => this.handleSaveProduct(e));
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.clearProductForm());

        // Admin Mock Data Seeder
        document.getElementById('seed-mock-orders-btn').addEventListener('click', () => this.seedMockData());
    },

    // Show floating notifications banner (Toast)
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        if (type === 'error') icon = 'error';
        if (type === 'warning') icon = 'warning';

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove toast DOM element
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Auth Tab display toggler
    toggleAuthTab(tab) {
        const tabLogin = document.getElementById('tab-login-btn');
        const tabRegister = document.getElementById('tab-register-btn');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (tab === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            this.updatePromoSpotsCount();
        }
    },

    // Customer Registration Functionality
    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const address = document.getElementById('reg-address').value.trim();
        const password = document.getElementById('reg-password').value;

        // Validations
        if (this.state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showToast("Email already exists!", "error");
            return;
        }
        if (this.state.users.some(u => u.phone === phone)) {
            this.showToast("Phone number already exists!", "error");
            return;
        }
        if (password.length < 6) {
            this.showToast("Password must be at least 6 characters long", "error");
            return;
        }

        // Count customer accounts (excluding admins)
        const customerRegistrationsCount = this.state.users.filter(u => !u.isAdmin).length;
        const isPromoEligible = customerRegistrationsCount < 100;

        const newUser = {
            id: 'u-' + Math.random().toString(36).substring(2, 9),
            name,
            email,
            phone,
            address,
            password,
            isAdmin: false,
            isPromoMember: isPromoEligible,
            joinedAt: new Date().toISOString()
        };

        this.state.users.push(newUser);
        this.state.currentUser = newUser;
        this.saveToStorage();

        this.showToast(isPromoEligible
            ? "Registration Success! You unlocked 10% OFF & Free Delivery launch promo."
            : "Registration Successful! Welcome to Gudiya Mart.", "success");

        // Write to Supabase asynchronously
        const dbUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            password: newUser.password,
            is_admin: newUser.isAdmin,
            is_promo_member: newUser.isPromoMember,
            created_at: newUser.joinedAt
        };
        this.supabase.request('gudiyamart_users', 'POST', dbUser).then(res => {
            if (res) console.log("User registered in Supabase successfully!", res);
        });

        // UI Updates
        this.updateNavState();
        this.updatePromoSpotsCount();
        document.getElementById('register-form').reset();

        // Prefill delivery address in cart if it was open
        const cartAddr = document.getElementById('cart-delivery-address');
        if (cartAddr) cartAddr.value = newUser.address;

        this.navigateTo('shop-view');
        this.renderShop(); // Re-render to update discount displays
    },

    // User Login Functionality
    async handleLogin(e) {
        e.preventDefault();

        const emailOrPhone = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        // 1. Check local state users first
        let user = this.state.users.find(u =>
            (u.email.toLowerCase() === emailOrPhone || u.phone === emailOrPhone) &&
            u.password === password
        );

        // 2. Fallback: Check Supabase online if not found locally
        if (!user && this.supabase.key && this.supabase.key !== "PLACEHOLDER_KEY") {
            this.showToast("Authenticating online...", "info");

            // Build query based on email or phone
            const isEmail = emailOrPhone.includes('@');
            const field = isEmail ? 'email' : 'phone';
            const endpoint = `gudiyamart_users?${field}=eq.${encodeURIComponent(emailOrPhone)}&password=eq.${encodeURIComponent(password)}`;

            const dbUsers = await this.supabase.request(endpoint, 'GET');
            if (dbUsers && dbUsers.length > 0) {
                const dbUser = dbUsers[0];
                user = {
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    phone: dbUser.phone,
                    address: dbUser.address,
                    password: dbUser.password,
                    isAdmin: dbUser.is_admin,
                    isPromoMember: dbUser.is_promo_member,
                    joinedAt: dbUser.created_at
                };

                // Add to local state list so it's cached locally
                if (!this.state.users.some(u => u.id === user.id)) {
                    this.state.users.push(user);
                }
            }
        }

        if (!user) {
            this.showToast("Invalid credentials", "error");
            return;
        }

        this.state.currentUser = user;
        this.saveToStorage();
        this.showToast(`Welcome back, ${user.name}!`, "success");

        this.updateNavState();
        document.getElementById('login-form').reset();

        // Prefill delivery address in cart
        const cartAddr = document.getElementById('cart-delivery-address');
        if (cartAddr) cartAddr.value = user.address;

        if (user.isAdmin) {
            this.navigateTo('admin-view');
        } else {
            this.navigateTo('shop-view');
        }
    },

    // Sign Out
    handleLogout() {
        this.state.currentUser = null;
        this.state.cart = []; // Empty cart on logout
        this.saveToStorage();
        this.showToast("Signed out successfully", "info");

        this.updateNavState();
        this.navigateTo('shop-view');
        this.renderCart();
    },

    // Render Product Cards in the Shop Catalog with Skeleton Shimmer loaders
    renderShop(showShimmer = true) {
        const grid = document.getElementById('vegetable-grid');
        if (!grid) return;

        if (showShimmer) {
            grid.innerHTML = '';
            // Render 4 shimmering skeleton cards
            for (let i = 0; i < 4; i++) {
                const card = document.createElement('div');
                card.className = 'skeleton-card';
                card.innerHTML = `
                    <div class="skeleton-image shimmer"></div>
                    <div class="skeleton-info">
                        <div class="skeleton-line skeleton-origin shimmer"></div>
                        <div class="skeleton-line skeleton-title shimmer"></div>
                        <div class="skeleton-line skeleton-origin shimmer"></div>
                        <div class="skeleton-line skeleton-price-row shimmer"></div>
                        <div class="skeleton-line skeleton-btn shimmer"></div>
                    </div>
                `;
                grid.appendChild(card);
            }

            if (this.state.shopTimeout) {
                clearTimeout(this.state.shopTimeout);
            }
            this.state.shopTimeout = setTimeout(() => {
                this.renderShop(false);
            }, 300);
            return;
        }

        grid.innerHTML = '';

        // Apply filters
        const activeCategory = document.querySelector('#category-filter-list .category-chip.active').getAttribute('data-category');
        const searchQuery = document.getElementById('shop-search').value.trim().toLowerCase();
        const sortBy = document.getElementById('sort-selector').value;

        let filtered = this.state.products.filter(prod => {
            const matchesCat = activeCategory === 'all' || prod.category === activeCategory;
            const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || prod.category.toLowerCase().includes(searchQuery);
            return matchesCat && matchesSearch;
        });

        // Apply Sorting
        if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'popular') {
            filtered.sort((a, b) => b.sales - a.sales);
        }

        // Result counts
        document.getElementById('result-count').textContent = filtered.length;

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <span class="material-symbols-outlined" style="font-size: 3rem;">search_off</span>
                    <p>No organic produce found matching filters.</p>
                </div>
            `;
            return;
        }

        // Render card elements
        filtered.forEach(prod => {
            const card = document.createElement('article');
            card.className = 'product-card';

            const isOutOfStock = prod.stock <= 0;
            const promoActive = this.state.currentUser && this.state.currentUser.isPromoMember;

            // Calculate promotional price display
            const finalPrice = promoActive ? Math.round(prod.price * 0.9) : prod.price;
            const originalPriceMarkup = promoActive ? `<span style="text-decoration: line-through; font-size: 0.82rem; color: var(--text-muted); font-weight: 500; margin-left: 6px;">₹${prod.price}</span>` : '';

            // Check if product is in cart to display in-card stepper
            const cartItem = this.state.cart.find(item => item.productId === prod.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;

            let actionButtonMarkup = '';
            if (inCartQty > 0) {
                actionButtonMarkup = `
                    <div class="product-card-qty-stepper">
                        <button class="qty-btn-step" onclick="app.changeCartQty('${prod.id}', -1)" aria-label="Decrease quantity">-</button>
                        <span class="qty-val-step">${inCartQty} ${prod.unit}</span>
                        <button class="qty-btn-step" onclick="app.changeCartQty('${prod.id}', 1)" aria-label="Increase quantity">+</button>
                    </div>
                `;
            } else {
                let weightSelectorMarkup = '';
                if (prod.unit.toLowerCase().includes('kg')) {
                    const selectedWeight = this.state.selectedWeights[prod.id] || 0.5;
                    weightSelectorMarkup = `
                        <div class="product-weight-selector">
                            <button class="weight-chip ${selectedWeight === 0.25 ? 'active' : ''}" onclick="event.stopPropagation(); app.selectProductWeight('${prod.id}', 0.25)">250g</button>
                            <button class="weight-chip ${selectedWeight === 0.5 ? 'active' : ''}" onclick="event.stopPropagation(); app.selectProductWeight('${prod.id}', 0.5)">500g</button>
                            <button class="weight-chip ${selectedWeight === 1.0 ? 'active' : ''}" onclick="event.stopPropagation(); app.selectProductWeight('${prod.id}', 1.0)">1 kg</button>
                        </div>
                    `;
                }

                actionButtonMarkup = `
                    ${weightSelectorMarkup}
                    <button class="btn btn-primary" onclick="app.addToCart('${prod.id}')" ${isOutOfStock ? 'disabled style="background: var(--text-muted); cursor: not-allowed; box-shadow: none;"' : ''}>
                        <span class="material-symbols-outlined">add_shopping_cart</span>
                        ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                `;
            }

            card.innerHTML = `
                <div class="product-image-container">
                    <img class="product-image" src="${prod.image}" alt="${prod.name}" loading="lazy">
                    ${prod.sales > 60 ? `<span class="product-badge">Popular</span>` : ''}
                </div>
                <div class="product-info">
                    <span class="product-cat">${prod.category}</span>
                    <h3 class="product-title">${prod.name}</h3>
                    <div class="product-price-row">
                        <span class="product-price">₹${finalPrice}</span>
                        <span class="product-unit">/ ${prod.unit}</span>
                        ${originalPriceMarkup}
                    </div>
                    
                    <span class="product-stock-lbl ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : `Stock: ${prod.stock} ${prod.unit}`}
                    </span>
                    
                    ${actionButtonMarkup}
                </div>
            `;
            grid.appendChild(card);
        });
    },

    // Animate Cart Badge Bounce
    triggerCartBadgeAnimation() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.classList.remove('badge-pulse');
            void badge.offsetWidth; // Trigger reflow to restart animation
            badge.classList.add('badge-pulse');
        }
    },

    // Cart Operations: Add to Cart
    addToCart(productId) {
        const prod = this.state.products.find(p => p.id === productId);
        if (!prod || prod.stock <= 0) return;

        const cartItem = this.state.cart.find(item => item.productId === productId);

        // Use the selected weight choice if defined, otherwise default to product's step size
        const selectedQty = this.state.selectedWeights[productId] || Number(prod.step || 1);

        if (cartItem) {
            if (cartItem.quantity >= prod.stock) {
                this.showToast(`Cannot add more. Only ${prod.stock} units available in stock.`, "warning");
                return;
            }
            cartItem.quantity = parseFloat((cartItem.quantity + selectedQty).toFixed(2));
        } else {
            this.state.cart.push({
                productId,
                quantity: selectedQty
            });
        }

        this.showToast(`${prod.name} added to basket`, "success");
        this.triggerCartBadgeAnimation();
        this.renderCart();
    },

    // Cart Operations: Adjust quantities
    changeCartQty(productId, delta) {
        const cartItem = this.state.cart.find(item => item.productId === productId);
        if (!cartItem) return;

        const prod = this.state.products.find(p => p.id === productId);

        if (prod.unit === 'kg') {
            const weightOptions = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const currentQty = cartItem.quantity;
            let idx = weightOptions.indexOf(currentQty);
            if (idx === -1) {
                idx = weightOptions.reduce((closestIdx, val, i) => {
                    return Math.abs(val - currentQty) < Math.abs(weightOptions[closestIdx] - currentQty) ? i : closestIdx;
                }, 0);
            }

            let nextIdx = idx + delta;
            if (nextIdx >= 0 && nextIdx < weightOptions.length) {
                const newQty = weightOptions[nextIdx];
                if (newQty <= prod.stock) {
                    cartItem.quantity = newQty;
                } else {
                    this.showToast(`Cannot add more. Limit of ${prod.stock} kg available.`, "warning");
                    return;
                }
            } else if (nextIdx < 0) {
                this.removeFromCart(productId);
                return;
            } else {
                return;
            }
        } else {
            const step = Number(prod.step || 1);
            const qtyChange = delta * step;

            if (delta > 0 && cartItem.quantity >= prod.stock) {
                this.showToast(`Cannot add more. Limit of ${prod.stock} units available.`, "warning");
                return;
            }

            cartItem.quantity = parseFloat((cartItem.quantity + qtyChange).toFixed(2));

            if (cartItem.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
        }

        if (delta > 0) {
            this.triggerCartBadgeAnimation();
        }
        this.renderCart();
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.productId !== productId);
        this.renderCart();
    },

    updateCartItemQty(productId, newQty) {
        const cartItem = this.state.cart.find(item => item.productId === productId);
        if (!cartItem) return;

        cartItem.quantity = parseFloat(newQty.toFixed(2));
        this.renderCart();
    },

    // Render Cart drawer side-panel items and totals
    renderCart() {
        const badge = document.getElementById('cart-count');
        const badgeBottom = document.getElementById('cart-count-bottom');
        const totalItemsCount = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);

        if (badge) {
            badge.textContent = totalItemsCount;
        }
        if (badgeBottom) {
            badgeBottom.textContent = totalItemsCount;
        }

        const emptyView = document.getElementById('cart-empty-view');
        const itemsView = document.getElementById('cart-items-view');
        const footer = document.getElementById('cart-drawer-footer');

        // Floating Quick Cart Banner references
        const floatBanner = document.getElementById('floating-cart-banner');
        const floatQty = document.getElementById('float-cart-qty');
        const floatTotal = document.getElementById('float-cart-total');

        if (this.state.cart.length === 0) {
            emptyView.classList.remove('hidden');
            itemsView.classList.add('hidden');
            footer.classList.add('hidden');

            if (floatBanner) {
                floatBanner.classList.remove('visible');
            }
            // Trigger shop card updates to reset steppers back to "ADD"
            this.renderShop(false);
            return;
        }

        emptyView.classList.add('hidden');
        itemsView.classList.remove('hidden');
        footer.classList.remove('hidden');

        // Draw items
        const list = document.getElementById('cart-items-list');
        list.innerHTML = '';

        let subtotal = 0;

        this.state.cart.forEach(item => {
            const prod = this.state.products.find(p => p.id === item.productId);
            if (!prod) return;

            const itemCost = prod.price * item.quantity;
            subtotal += itemCost;

            // Generate dropdown options dynamically
            let selectOptions = '';

            if (prod.unit.toLowerCase().includes('kg')) {
                const weightOptions = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                weightOptions.forEach(w => {
                    if (w <= prod.stock) {
                        const isSelected = item.quantity === w ? 'selected' : '';
                        const displayLabel = w === 0.25 ? '250 gm' : (w === 0.5 ? '500 gm' : `${w} kg`);
                        selectOptions += `<option value="${w}" ${isSelected}>${displayLabel}</option>`;
                    }
                });
            } else {
                const maxLimit = Math.min(prod.stock, 10);
                const baseUnit = prod.unit.replace(/^[0-9.]+\s*/, '');
                for (let w = 1; w <= maxLimit; w++) {
                    const isSelected = item.quantity === w ? 'selected' : '';
                    selectOptions += `<option value="${w}" ${isSelected}>${w} ${baseUnit}</option>`;
                }
            }

            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <img class="cart-item-img" src="${prod.image}" alt="${prod.name}">
                <div class="cart-item-details">
                    <span class="cart-item-title">${prod.name}</span>
                    <span class="cart-item-price">₹${prod.price} per ${prod.unit}</span>
                    
                    <div class="cart-qty-dropdown-wrapper">
                        <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-right:6px;">Qty:</label>
                        <select class="cart-qty-select" onchange="app.updateCartItemQty('${prod.id}', parseFloat(this.value))">
                            ${selectOptions}
                        </select>
                    </div>

                    <span class="cart-item-price-total">₹${itemCost}</span>
                </div>
                <button class="cart-item-remove" onclick="app.removeFromCart('${prod.id}')">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            `;
            list.appendChild(row);
        });

        // Sync Floating Quick Cart Banner
        if (floatBanner && floatQty && floatTotal) {
            floatBanner.classList.add('visible');
            floatQty.textContent = `${totalItemsCount} Item${totalItemsCount > 1 ? 's' : ''}`;
            const promoActive = this.state.currentUser && this.state.currentUser.isPromoMember;
            const discountAmount = promoActive ? Math.round(subtotal * 0.1) : 0;
            const finalTotal = subtotal - discountAmount;
            floatTotal.textContent = `₹${finalTotal}`;
        }

        // Address synchronization
        const addressTextarea = document.getElementById('cart-delivery-address');
        if (addressTextarea && !addressTextarea.value && this.state.currentUser) {
            addressTextarea.value = this.state.currentUser.address;
        }

        // Calculations & Promotions (Rupee System: ₹30 flat shipping)
        const promoActive = this.state.currentUser && this.state.currentUser.isPromoMember;
        const discountAmount = promoActive ? Math.round(subtotal * 0.1) : 0;
        const baseShippingFee = 30; // ₹30 Shipping
        const shippingFee = promoActive ? 0 : baseShippingFee;
        const finalTotal = subtotal - discountAmount + shippingFee;

        // Apply calculations to UI
        document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;

        const shippingEl = document.getElementById('cart-shipping');
        shippingEl.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee}`;
        if (shippingFee === 0) shippingEl.classList.add('text-success');
        else shippingEl.classList.remove('text-success');

        const discountWrapper = document.getElementById('cart-discount-wrapper');
        const discountEl = document.getElementById('cart-discount');
        if (promoActive) {
            discountWrapper.classList.remove('hidden');
            discountEl.textContent = `-₹${discountAmount}`;
            document.getElementById('cart-promo-badge').classList.remove('hidden');
        } else {
            discountWrapper.classList.add('hidden');
            document.getElementById('cart-promo-badge').classList.add('hidden');
        }

        document.getElementById('cart-total').textContent = `₹${finalTotal}`;

        // Trigger shop card steppers redraw
        this.renderShop(false);
    },

    // Order Placement Checkout Flow
    placeOrder() {
        if (!this.state.currentUser) {
            this.showToast("Please sign in or register to place your booking order.", "warning");
            this.navigateTo('auth-view');
            // Close Cart drawer
            document.getElementById('cart-drawer-overlay').classList.remove('open');
            document.getElementById('cart-drawer').classList.remove('open');
            return;
        }

        const deliverySlot = document.querySelector('input[name="delivery-time"]:checked').value;
        const deliveryAddress = document.getElementById('cart-delivery-address').value.trim();

        if (!deliveryAddress) {
            this.showToast("Please provide a valid delivery address", "error");
            return;
        }

        // Verify stock is still sufficient
        for (const item of this.state.cart) {
            const prod = this.state.products.find(p => p.id === item.productId);
            if (prod.stock < item.quantity) {
                this.showToast(`Sorry, stock for ${prod.name} has run low. Try reducing quantity.`, "error");
                return;
            }
        }

        // Subtract stocks
        const purchasedItems = [];
        let subtotal = 0;

        this.state.cart.forEach(item => {
            const prod = this.state.products.find(p => p.id === item.productId);
            prod.stock = parseFloat((prod.stock - item.quantity).toFixed(2));
            prod.sales = parseFloat((prod.sales + item.quantity).toFixed(2));

            purchasedItems.push({
                productId: prod.id,
                name: prod.name,
                unit: prod.unit,
                price: prod.price,
                quantity: item.quantity
            });

            subtotal += prod.price * item.quantity;

            // Sync remaining stock and sales to Supabase asynchronously
            this.supabase.request(`gudiyamart_products?id=eq.${encodeURIComponent(prod.id)}`, 'PATCH', {
                stock: prod.stock,
                sales: prod.sales
            }).then(res => {
                if (res) console.log(`Product stock synced to Supabase for ${prod.name}!`, res);
            });
        });

        // Calculations in Rupees (₹30 flat shipping)
        const promoActive = this.state.currentUser.isPromoMember;
        const discountAmount = promoActive ? Math.round(subtotal * 0.1) : 0;
        const shippingFee = promoActive ? 0 : 30;
        const finalTotal = subtotal - discountAmount + shippingFee;

        // Build Order
        const newOrder = {
            id: 'GM-' + Math.floor(100000 + Math.random() * 900000),
            userId: this.state.currentUser.id,
            userName: this.state.currentUser.name,
            userPhone: this.state.currentUser.phone,
            items: purchasedItems,
            deliverySlot,
            deliveryAddress,
            subtotal,
            discount: discountAmount,
            shipping: shippingFee,
            total: finalTotal,
            status: 'Pending',
            orderedAt: new Date().toISOString()
        };

        this.state.orders.push(newOrder);
        this.state.cart = []; // Empty cart
        this.saveToStorage();

        // Write to Supabase database asynchronously
        const dbOrder = this.mapOrderToDB(newOrder);
        this.supabase.request('gudiyamart_orders', 'POST', dbOrder).then(res => {
            if (res) console.log("Order synced to Supabase database successfully!", res);
        });

        this.showToast("Order booked successfully! Real-time logistics tracks under 'My Deliveries'.", "success");

        // Close cart drawer
        document.getElementById('cart-drawer-overlay').classList.remove('open');
        document.getElementById('cart-drawer').classList.remove('open');

        // Refresh views
        this.renderShop();
        this.renderCart();
        this.navigateTo('orders-view');
    },

    // Render User orders list screen
    renderOrders() {
        const authAlert = document.getElementById('orders-auth-alert');
        const dashboard = document.getElementById('orders-dashboard-content');

        if (!this.state.currentUser) {
            authAlert.classList.remove('hidden');
            dashboard.classList.add('hidden');
            return;
        }

        authAlert.classList.add('hidden');
        dashboard.classList.remove('hidden');

        const activeList = document.getElementById('active-orders-list');
        const pastList = document.getElementById('past-orders-list');

        activeList.innerHTML = '';
        pastList.innerHTML = '';

        // Filter user orders
        const userOrders = this.state.orders.filter(o => o.userId === this.state.currentUser.id);

        // Sort: newest first
        userOrders.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

        // Stats update
        const totalCount = userOrders.length;
        const activeCount = userOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

        document.getElementById('user-total-orders').textContent = totalCount;
        document.getElementById('user-active-orders').textContent = activeCount;

        // Promo Badge logic
        const promoStatus = document.getElementById('user-promo-status');
        const promoExpiry = document.getElementById('user-promo-expiry');
        const promoCard = document.getElementById('user-promo-banner-card');

        if (this.state.currentUser.isPromoMember) {
            promoStatus.textContent = "Founding Member";
            promoStatus.className = "stat-num text-success";
            promoExpiry.textContent = "10% OFF & FREE Deliveries active";
            promoCard.style.borderColor = 'var(--primary)';
        } else {
            promoStatus.textContent = "Regular Local";
            promoStatus.className = "stat-num text-muted";
            promoExpiry.textContent = "100 promo slots filled in society";
            promoCard.style.borderColor = 'var(--border)';
        }

        let activeRendered = 0;
        let pastRendered = 0;

        userOrders.forEach(o => {
            const card = document.createElement('div');
            card.className = 'order-card';

            // Build items list markup in Rupees
            let itemsHtml = '';
            o.items.forEach(it => {
                itemsHtml += `
                    <li class="order-item-row">
                        <span>${it.name} (x${it.quantity})</span>
                        <strong>₹${it.price * it.quantity}</strong>
                    </li>
                `;
            });

            // Delivery route tracker mapping
            let trackerHtml = '';
            if (o.status !== 'Cancelled') {
                const steps = ['Pending', 'Packing', 'Out for Delivery', 'Delivered'];
                const currentIdx = steps.indexOf(o.status);

                trackerHtml = `
                    <div class="delivery-tracker-panel">
                        <div class="tracker-title">
                            <span class="material-symbols-outlined">directions_car</span>
                            <span>Community Sourcing Dispatch Route</span>
                        </div>
                        <div class="tracker-timeline">
                            <div class="tracker-step ${currentIdx >= 0 ? (currentIdx === 0 ? 'current' : 'completed') : ''}">
                                <div class="tracker-node"></div>
                                <span class="tracker-label">Booked</span>
                            </div>
                            <div class="tracker-step ${currentIdx >= 1 ? (currentIdx === 1 ? 'current' : 'completed') : ''}">
                                <div class="tracker-node"></div>
                                <span class="tracker-label">Sorting</span>
                            </div>
                            <div class="tracker-step ${currentIdx >= 2 ? (currentIdx === 2 ? 'current' : 'completed') : ''}">
                                <div class="tracker-node"></div>
                                <span class="tracker-label">On Truck</span>
                            </div>
                            <div class="tracker-step ${currentIdx >= 3 ? (currentIdx === 3 ? 'current' : 'completed') : ''}">
                                <div class="tracker-node"></div>
                                <span class="tracker-label">Arrived</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            const formattedDate = new Date(o.orderedAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            card.innerHTML = `
                <div class="order-card-header">
                    <div class="order-meta-info">
                        <span>Order: <strong>#${this.escapeHTML(o.id)}</strong></span>
                        <span>Date: <strong>${formattedDate}</strong></span>
                        <span>Route: <strong class="accent-text">${this.escapeHTML(o.deliverySlot)} Drop</strong></span>
                    </div>
                    <span class="order-status-badge ${o.status.toLowerCase().replace(/ /g, '-')}">${o.status}</span>
                </div>
                
                <div class="order-card-body">
                    <ul class="order-items-summary">
                        ${itemsHtml}
                    </ul>
                    
                    ${trackerHtml}
                </div>
                
                <div class="order-card-footer">
                    <div class="order-address-box">
                        <span class="material-symbols-outlined" style="font-size:0.9rem; vertical-align:middle;">home</span> 
                        Address: ${this.escapeHTML(o.deliveryAddress)}
                    </div>
                    <div class="order-total-price">
                        Paid: ₹${o.total}
                    </div>
                </div>
            `;

            if (o.status === 'Delivered' || o.status === 'Cancelled') {
                pastList.appendChild(card);
                pastRendered++;
            } else {
                activeList.appendChild(card);
                activeRendered++;
            }
        });

        if (activeRendered === 0) {
            activeList.innerHTML = `<div class="empty-state">No active deliveries. Place an order to see it here!</div>`;
        }
        if (pastRendered === 0) {
            pastList.innerHTML = `<div class="empty-state">No past orders.</div>`;
        }
    },

    // ----------------------------------------------------
    // ADMIN DASHBOARD PANELS
    // ----------------------------------------------------
    renderAdmin() {
        const authAlert = document.getElementById('admin-auth-alert');
        const dashboard = document.getElementById('admin-dashboard-content');

        if (!this.state.currentUser || !this.state.currentUser.isAdmin) {
            authAlert.classList.remove('hidden');
            dashboard.classList.add('hidden');
            return;
        }

        authAlert.classList.add('hidden');
        dashboard.classList.remove('hidden');

        // Calculate statistics summary in Rupees
        const totalRevenue = this.state.orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        const totalOrders = this.state.orders.length;
        const totalUsers = this.state.users.filter(u => !u.isAdmin).length;
        const promoUsers = this.state.users.filter(u => u.isPromoMember).length;

        // Render metrics card values in Rupees
        document.getElementById('admin-stat-revenue').textContent = `₹${totalRevenue}`;
        document.getElementById('admin-stat-orders').textContent = totalOrders;
        document.getElementById('admin-stat-users').textContent = totalUsers;
        document.getElementById('admin-stat-promo').textContent = `${promoUsers} / 100`;

        // Render subtabs
        if (this.state.activeAdminSubtab === 'admin-orders-tab') {
            this.renderAdminOrders();
        } else if (this.state.activeAdminSubtab === 'admin-inventory-tab') {
            this.renderAdminInventory();
        } else if (this.state.activeAdminSubtab === 'admin-users-tab') {
            this.renderAdminUsers();
        }
    },

    // Admin Dispatch Management Panel
    renderAdminOrders() {
        const tbody = document.getElementById('admin-orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        const slotFilter = document.getElementById('admin-filter-slot').value;
        const statusFilter = document.getElementById('admin-filter-status').value;

        // Filter orders
        const filtered = this.state.orders.filter(o => {
            const matchesSlot = slotFilter === 'all' || o.deliverySlot === slotFilter;
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            return matchesSlot && matchesStatus;
        });

        // Sort: oldest first
        filtered.sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt));

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 30px;">
                        No orders match the current dispatch filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(o => {
            const tr = document.createElement('tr');
            const itemsSummary = o.items.map(it => `${it.name} (x${it.quantity})`).join(', ');
            const badgeClass = o.status.toLowerCase().replace(/ /g, '-');
            const statusBadge = `<span class="order-status-badge ${badgeClass}">${o.status}</span>`;

            let actionsHtml = '';
            if (o.status === 'Pending') {
                actionsHtml = `<button class="btn btn-primary btn-sm" onclick="app.updateOrderStatus('${o.id}', 'Packing')">Pack Order</button>`;
            } else if (o.status === 'Packing') {
                actionsHtml = `<button class="btn btn-warning btn-sm" style="color:white;" onclick="app.updateOrderStatus('${o.id}', 'Out for Delivery')">Dispatch Truck</button>`;
            } else if (o.status === 'Out for Delivery') {
                actionsHtml = `<button class="btn btn-success btn-sm" onclick="app.updateOrderStatus('${o.id}', 'Delivered')">Confirm Delivery</button>`;
            } else {
                actionsHtml = `<span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Completed</span>`;
            }

            if (o.status !== 'Delivered' && o.status !== 'Cancelled') {
                actionsHtml += ` <button class="btn btn-danger btn-sm" style="padding: 6px;" onclick="app.updateOrderStatus('${o.id}', 'Cancelled')" title="Cancel Order"><span class="material-symbols-outlined" style="font-size:0.9rem;">cancel</span></button>`;
            }

            tr.innerHTML = `
                <td><strong>#${this.escapeHTML(o.id)}</strong></td>
                <td>
                    <div style="font-weight:700;">${this.escapeHTML(o.userName)}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${this.escapeHTML(o.userPhone)}</div>
                </td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsSummary}">${itemsSummary}</td>
                <td><span class="slot-badge">${this.escapeHTML(o.deliverySlot)}</span></td>
                <td style="max-width: 200px; font-size:0.8rem;" title="${this.escapeHTML(o.deliveryAddress)}">${this.escapeHTML(o.deliveryAddress)}</td>
                <td><strong>₹${o.total}</strong></td>
                <td>${statusBadge}</td>
                <td><div class="table-actions">${actionsHtml}</div></td>
            `;

            tbody.appendChild(tr);
        });
    },

    // Admin Dispatch Update Status
    updateOrderStatus(orderId, newStatus) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) return;

        // If cancelled, restore stock counts back
        if (newStatus === 'Cancelled') {
            order.items.forEach(it => {
                const prod = this.state.products.find(p => p.id === it.productId);
                if (prod) {
                    prod.stock += it.quantity;
                }
            });
        }

        order.status = newStatus;
        this.saveToStorage();

        // Update Supabase status asynchronously
        this.supabase.request(`gudiyamart_orders?id=eq.${encodeURIComponent(orderId)}`, 'PATCH', { status: newStatus }).then(res => {
            if (res) console.log(`Order #${orderId} status synced to Supabase!`, res);
        });

        this.showToast(`Order #${orderId} status updated to: ${newStatus}`, "info");

        // Refresh views
        this.renderAdmin();
        this.renderOrders();
        this.renderShop();
    },

    // Admin Vegetable Product Catalog Management
    renderAdminInventory() {
        const tbody = document.getElementById('admin-inventory-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.state.products.forEach(prod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img class="table-img" src="${prod.image}" alt="${prod.name}"></td>
                <td>
                    <div style="font-weight:700;">${prod.name}</div>
                </td>
                <td><span class="category-chip active" style="font-size:0.75rem; padding:4px 8px;">${prod.category}</span></td>
                <td>₹${prod.price} / ${prod.unit}</td>
                <td>
                    <span style="font-weight:700; color: ${prod.stock < 10 ? '#cc4d29' : 'inherit'}">
                        ${prod.stock}
                    </span> units
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="app.editProduct('${prod.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteProduct('${prod.id}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Load Product details inside Form for updates
    editProduct(productId) {
        const prod = this.state.products.find(p => p.id === productId);
        if (!prod) return;

        document.getElementById('edit-prod-id').value = prod.id;
        document.getElementById('prod-name').value = prod.name;
        document.getElementById('prod-category').value = prod.category;
        document.getElementById('prod-unit').value = prod.unit;
        document.getElementById('prod-price').value = prod.price;
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-image').value = prod.image;

        // Change Form heading and buttons
        document.getElementById('product-form-title').textContent = "Edit Vegetable Harvest";
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        document.getElementById('save-product-btn').textContent = "Update Sourcing Record";

        document.getElementById('product-manage-form').scrollIntoView({ behavior: 'smooth' });
    },

    clearProductForm() {
        document.getElementById('product-manage-form').reset();
        document.getElementById('edit-prod-id').value = '';
        document.getElementById('product-form-title').textContent = "Register Farm Supply";
        document.getElementById('cancel-edit-btn').classList.add('hidden');
        document.getElementById('save-product-btn').textContent = "Record Harvest";
    },

    handleSaveProduct(e) {
        e.preventDefault();

        const id = document.getElementById('edit-prod-id').value;
        const name = document.getElementById('prod-name').value.trim();
        const category = document.getElementById('prod-category').value;
        const unit = document.getElementById('prod-unit').value.trim();
        const price = parseInt(document.getElementById('prod-price').value);
        const stock = parseFloat(document.getElementById('prod-stock').value);
        const image = document.getElementById('prod-image').value.trim();

        // Dynamically compute step size based on selling unit
        const isWeightBased = unit.toLowerCase().includes('kg');
        const step = isWeightBased ? 0.5 : 1;

        if (id) {
            // Edit existing
            const prod = this.state.products.find(p => p.id === id);
            if (prod) {
                prod.name = name;
                prod.category = category;
                prod.unit = unit;
                prod.price = price;
                prod.stock = stock;
                prod.image = image;
                prod.step = step;
                this.showToast(`Supply ${name} updated successfully`, "success");

                // Sync to Supabase asynchronously
                const dbProd = {
                    name,
                    category,
                    unit,
                    price,
                    stock,
                    step,
                    image
                };
                this.supabase.request(`gudiyamart_products?id=eq.${encodeURIComponent(id)}`, 'PATCH', dbProd).then(res => {
                    if (res) console.log(`Product #${id} updated in Supabase!`, res);
                });
            }
        } else {
            // Add new
            const newProd = {
                id: 'v-' + Math.random().toString(36).substring(2, 9),
                name,
                category,
                unit,
                price,
                stock,
                sales: 0,
                step,
                image
            };
            this.state.products.push(newProd);
            this.showToast(`Supply ${name} recorded successfully`, "success");

            // Sync to Supabase asynchronously
            const dbProd = {
                id: newProd.id,
                name,
                category,
                unit,
                price,
                stock,
                sales: 0,
                step,
                image
            };
            this.supabase.request('gudiyamart_products', 'POST', dbProd).then(res => {
                if (res) console.log("New product synced to Supabase successfully!", res);
            });
        }

        this.saveToStorage();
        this.clearProductForm();
        this.renderAdminInventory();
        this.renderShop();
    },

    deleteProduct(productId) {
        if (!confirm("Are you sure you want to delete this vegetable from catalog?")) return;

        this.state.products = this.state.products.filter(p => p.id !== productId);
        this.saveToStorage();

        // Delete from Supabase database asynchronously
        this.supabase.request(`gudiyamart_products?id=eq.${encodeURIComponent(productId)}`, 'DELETE').then(res => {
            if (res) console.log(`Product #${productId} deleted from Supabase!`);
        });

        this.showToast("Product deleted from catalog", "info");

        this.renderAdminInventory();
        this.renderShop();
    },

    // Admin Customer Accounts List
    renderAdminUsers() {
        const tbody = document.getElementById('admin-users-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        const customers = this.state.users.filter(u => !u.isAdmin);

        if (customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 20px;">
                        No registered customers yet.
                    </td>
                </tr>
            `;
            return;
        }

        customers.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

        customers.forEach(u => {
            const tr = document.createElement('tr');
            const promoBadge = u.isPromoMember
                ? '<span class="order-status-badge delivered" style="font-size:0.7rem;">Promo Active</span>'
                : '<span class="order-status-badge cancelled" style="font-size:0.7rem; background-color:#e2e8f0; color:#475569;">No Promo</span>';

            const joinDate = new Date(u.joinedAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            tr.innerHTML = `
                <td><strong>${this.escapeHTML(u.name)}</strong></td>
                <td>${this.escapeHTML(u.email)}</td>
                <td>${this.escapeHTML(u.phone)}</td>
                <td style="max-width: 250px; font-size:0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${this.escapeHTML(u.address)}">${this.escapeHTML(u.address)}</td>
                <td>${promoBadge}</td>
                <td>${joinDate}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Seed mock orders data in Rupee System
    seedMockData() {
        if (this.state.users.length <= 1) {
            // Seed mock users
            const mockUsers = [
                {
                    id: 'u-mock-1',
                    name: 'Sourav Sen',
                    email: 'sourav@example.com',
                    phone: '9876543210',
                    address: 'Flat 101, Sunflower Apartments, Outer Ring Road',
                    password: 'password123',
                    isAdmin: false,
                    isPromoMember: true,
                    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'u-mock-2',
                    name: 'Kiran Reddy',
                    email: 'kiran@example.com',
                    phone: '8887776665',
                    address: 'Villa 22, Green Meadows Gated Society, Sector 4',
                    password: 'password123',
                    isAdmin: false,
                    isPromoMember: true,
                    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'u-mock-3',
                    name: 'Anjali Sharma',
                    email: 'anjali@example.com',
                    phone: '9009009001',
                    address: 'Flat 604, Tower B, Prestige Heights, Outer Ring Road',
                    password: 'password123',
                    isAdmin: false,
                    isPromoMember: false,
                    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            mockUsers.forEach(u => {
                if (!this.state.users.some(existing => existing.email === u.email)) {
                    this.state.users.push(u);
                }
            });
        }

        // Setup mock orders in Rupee values
        const testOrders = [
            {
                id: 'GM-332910',
                userId: 'u-mock-1',
                userName: 'Sourav Sen',
                userPhone: '9876543210',
                items: [
                    { productId: 'v1', name: 'Desi Tomatoes (Tamatar)', unit: '1 kg', price: 40, quantity: 2 },
                    { productId: 'v5', name: 'Organic Spinach (Palak)', unit: '1 bunch', price: 20, quantity: 3 }
                ],
                deliverySlot: '7:00 AM',
                deliveryAddress: 'Flat 101, Sunflower Apartments, Outer Ring Road',
                subtotal: 140,
                discount: 14,
                shipping: 0,
                total: 126,
                status: 'Pending',
                orderedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'GM-482103',
                userId: 'u-mock-2',
                userName: 'Kiran Reddy',
                userPhone: '8887776665',
                items: [
                    { productId: 'v6', name: 'Organic Broccoli Crowns', unit: '1 kg', price: 120, quantity: 1 },
                    { productId: 'v3', name: 'Nasik Red Onions (Pyaz)', unit: '1 kg', price: 28, quantity: 5 },
                    { productId: 'v2', name: 'Pahadi Potatoes (Aloo)', unit: '1 kg', price: 30, quantity: 3 }
                ],
                deliverySlot: '7:00 AM',
                deliveryAddress: 'Villa 22, Green Meadows Gated Society, Sector 4',
                subtotal: 350,
                discount: 35,
                shipping: 0,
                total: 315,
                status: 'Packing',
                orderedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'GM-902183',
                userId: 'u-mock-3',
                userName: 'Anjali Sharma',
                userPhone: '9009009001',
                items: [
                    { productId: 'v8', name: 'Shimla Green Capsicum', unit: '1 kg', price: 70, quantity: 2 },
                    { productId: 'v12', name: 'Fresh Coriander (Dhaniya)', unit: '1 bunch', price: 10, quantity: 4 }
                ],
                deliverySlot: '5:00 PM',
                deliveryAddress: 'Flat 604, Tower B, Prestige Heights, Outer Ring Road',
                subtotal: 180,
                discount: 0,
                shipping: 30, // ₹30 shipping
                total: 210,
                status: 'Delivered',
                orderedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Seed orders
        testOrders.forEach(o => {
            if (!this.state.orders.some(existing => existing.id === o.id)) {
                this.state.orders.push(o);
            }
        });

        this.saveToStorage();
        this.showToast("Mock database successfully seeded in Rupees!", "success");

        // Re-render pages
        this.renderAdmin();
        this.renderOrders();
        this.updatePromoSpotsCount();
    }
};

// Start application on DOM Content loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
