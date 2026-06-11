</div>
                </div>
            </div>
        </section>

        <!-- ===== FOOTER ===== -->
        <footer class="footer">
            <div class="footer-inner">
                <div class="footer-copy">&copy; 2026 Mr. Ilyas Abdi Ali. All rights reserved.</div>
                <div class="footer-socials">
                    <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Dribbble"><i class="fab fa-dribbble"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
        </footer>

    </div><!-- /#app -->

    <!-- ===== BACK TO TOP ===== -->
    <button id="back-to-top" aria-label="Back to top">
        <i class="fas fa-arrow-up"></i>
    </button>

    <!-- ============================================================
    FIREBASE MODULAR SDK (CDN v12.13.0)
    ============================================================ -->
    <script type="module">
        // ================================================================
        // 🔥 FIREBASE CONFIG — REPLACE WITH YOUR OWN PROJECT CONFIG
        // ================================================================
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
        import {
            getAuth,
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            signInWithPopup,
            GoogleAuthProvider,
            sendPasswordResetEmail,
            sendEmailVerification,
            signOut,
            onAuthStateChanged,
            updateProfile
        } from
          'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';

        // ⚠️ REPLACE THIS with your own Firebase project config from
      
        const firebaseConfig = {
            apiKey: "AIzaSyBzgoI6WiZ-2cGvALjSzS1fHIeeEnUy-Ts",
            authDomain: "your-project.firebaseapp.com",
            projectId: "my-awr-f12c1",
            storageBucket: "my-awr-f12c1.firebasestorage.app",
            messagingSenderId: "566434636051",
            appId: "1:566434636051:android:02ca7d09cdfbf9ef31bae6"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const googleProvider = new GoogleAuthProvider();

        // ================================================================
        // DOM REFERENCES
        // ================================================================
        const $ = (sel) => document.querySelector(sel);
        const $$ = (sel) => document.querySelectorAll(sel);

        const loadingScreen = $('#loading-screen');
        const authPage = $('#auth-page');
        const appEl = $('#app');
        const authError = $('#auth-error');

        const loginForm = $('#login-form');
        const registerForm = $('#register-form');
        const forgotForm = $('#forgot-form');
        const loginBtn = $('#login-btn');
        const registerBtn = $('#register-btn');
        const forgotBtn = $('#forgot-btn');
        const googleLoginBtn = $('#google-login-btn');
        const googleRegisterBtn = $('#google-register-btn');

        const forgotLink = $('#forgot-link');
        const backToLogin = $('#back-to-login');
        const switchToLogin = $('#switch-to-login');

        const authTabs = $$('.auth-tab');
        const navAvatar = $('#nav-avatar');
        const navInitials = $('#nav-initials');
        const navUsername = $('#nav-username');
        const logoutBtn = $('#logout-btn');
        const userProfileBtn = $('#user-profile-btn');

        const themeToggle = $('#theme-toggle');
        const hamburger = $('#hamburger');
        const navLinks = $('#nav-links');
        const backToTopBtn = $('#back-to-top');
        const typingEl = $('#typing-text');
        const skillsGrid = $('#skills-grid');
        const projectsGrid = $('#projects-grid');
        const timeline = $('#timeline');
        const contactForm = $('#contact-form');

        // ================================================================
        // TOAST NOTIFICATION SYSTEM
        // ================================================================
        function showToast(message, type = 'info') {
            const container = $('#toast-container');
            const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
            toast.addEventListener('click', () => {
                toast.classList.add('toast-out');
                setTimeout(() => toast.remove(), 350);
            });
            container.appendChild(toast);
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.add('toast-out');
                    setTimeout(() => toast.remove(), 350);
                }
            }, 4000);
        }

        // ================================================================
        // AUTH ERROR DISPLAY
        // ================================================================
        function showAuthError(msg) {
            authError.textContent = msg;
            authError.classList.add('show');
        }

        function clearAuthError() {
            authError.textContent = '';
            authError.classList.remove('show');
        }

        function getFirebaseErrorMessage(code) {
            const map = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Check your connection.',
                'auth/popup-closed-by-user': 'Sign-in cancelled.',
                'auth/cancelled-popup-request': 'Sign-in cancelled.',
            };
            return map[code] || 'Something went wrong. Please try again.';
        }

        // ================================================================
        // SWITCH AUTH FORMS
        // ================================================================
        function switchAuthForm(formId) {
            clearAuthError();
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            $(`#${formId}`).classList.add('active');
            authTabs.forEach(t => {
                const tab = t.dataset.tab;
                t.classList.toggle('active', (tab === 'login' && formId === 'login-form') || (tab === 'register' && formId === 'register-form'));
            });
        }

        forgotLink.addEventListener('click', () => {
            clearAuthError();
            $$('.auth-form').forEach(f => f.classList.remove('active'));
            forgotForm.classList.add('active');
        });

        backToLogin.addEventListener('click', () => switchAuthForm('login-form'));
        switchToLogin.addEventListener('click', () => switchAuthForm('login-form'));

        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const id = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
                switchAuthForm(id);
            });
        });

        // ================================================================
        // AUTH: EMAIL/PASSWORD LOGIN
        // ================================================================
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthError();
            const email = $('#login-email').value.trim();
            const password = $('#login-password').value;
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in...';
            try {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('Welcome back!', 'success');
            } catch (err) {
                showAuthError(getFirebaseErrorMessage(err.code));
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        });

        // ================================================================
        // AUTH: REGISTER
        // ================================================================
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthError();
            const name = $('#reg-name').value.trim();
            const email = $('#reg-email').value.trim();
            const password = $('#reg-password').value;
            const confirm = $('#reg-confirm').value;

            if (password !== confirm) {
                showAuthError('Passwords do not match.');
                return;
            }
            if (password.length < 6) {
                showAuthError('Password must be at least 6 characters.');
                return;
            }

            registerBtn.disabled = true;
            registerBtn.textContent = 'Creating account...';
            try {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });
                await sendEmailVerification(cred.user);
                showToast('Account created! Please verify your email.', 'success');
            } catch (err) {
                showAuthError(getFirebaseErrorMessage(err.code));
                registerBtn.disabled = false;
                registerBtn.textContent = 'Create Account';
            }
        });

        // ================================================================
        // AUTH: GOOGLE SIGN-IN
        // ================================================================
        async function handleGoogleSignIn() {
            clearAuthError();
            try {
                await signInWithPopup(auth, googleProvider);
                showToast('Signed in with Google!', 'success');
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    showAuthError(getFirebaseErrorMessage(err.code));
                }
            }
        }

        googleLoginBtn.addEventListener('click', handleGoogleSignIn);
        googleRegisterBtn.addEventListener('click', handleGoogleSignIn);

        // ================================================================
        // AUTH: FORGOT PASSWORD
        // ================================================================
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthError();
            const email = $('#forgot-email').value.trim();
            if (!email) { showAuthError('Enter your email address.'); return; }
            forgotBtn.disabled = true;
            forgotBtn.textContent = 'Sending...';
            try {
                await sendPasswordResetEmail(auth, email);
                showToast('Password reset link sent! Check your inbox.', 'success');
                switchAuthForm('login-form');
                $('#forgot-email').value = '';
            } catch (err) {
                showAuthError(getFirebaseErrorMessage(err.code));
            }
            forgotBtn.disabled = false;
            forgotBtn.textContent = 'Send Reset Link';
        });

        // ================================================================
        // AUTH STATE LISTENER — PROTECT PORTFOLIO
        // ================================================================
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in → show portfolio
                authPage.classList.add('hidden');
                appEl.classList.add('visible');
                const displayName = user.displayName || user.email.split('@')[0] || 'User';
                const photoURL = user.photoURL;
                navUsername.textContent = displayName;
                // Avatar
                if (photoURL) {
                    navAvatar.innerHTML = `<img src="${photoURL}" alt="${displayName}" />`;
                } else {
                    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
                    navInitials.textContent = initials;
                    navAvatar.innerHTML = `<span id="nav-initials">${initials}</span>`;
                }
                loadingScreen.classList.add('hidden');
                // Init portfolio features after auth
                setTimeout(initPortfolio, 200);
            } else {
                // Not signed in → show auth page
                appEl.classList.remove('visible');
                authPage.classList.remove('hidden');
                loadingScreen.classList.add('hidden');
            }
        });

        // ================================================================
        // LOGOUT
        // ================================================================
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showToast('Signed out successfully.', 'info');
            } catch (err) {
                showToast('Error signing out.', 'error');
            }
        });

        // ================================================================
        // THEME TOGGLE (Dark / Light Mode)
        // ================================================================
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('portfolio-theme', theme);
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
        setTheme(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);

        // ================================================================
        // MOBILE HAMBURGER MENU
        // ================================================================
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });

        // ================================================================
        // BACK TO TOP BUTTON
        // ================================================================
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // ================================================================
        // PORTFOLIO DATA
        // ================================================================
        const skillsData = [
            { name: 'HTML / CSS', percent: 95 },
            { name: 'JavaScript', percent: 90 },
            { name: 'React / Next.js', percent: 85 },
            { name: 'Node.js', percent: 80 },
            { name: 'UI/UX Design', percent: 88 },
            { name: 'Git / DevOps', percent: 75 },
        ];

        const projectsData = [
            { title: 'FinTech Dashboard', tags: ['React', 'Node.js', 'D3.js'], img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80' },
            { title: 'E-Commerce Platform', tags: ['Next.js', 'Stripe', 'Sanity'], img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
            { title: 'Agency Portfolio', tags: ['HTML', 'CSS', 'GSAP'], img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80' },
            { title: 'SaaS Landing Page', tags: ['React', 'Framer Motion'], img: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80' },
            { title: 'Brand Identity System', tags: ['Figma', 'Illustrator', 'Webflow'], img: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&q=80' },
            { title: 'Mobile App Design', tags: ['Figma', 'Flutter'], img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80' },
        ];

        const experienceData = [
            { date: '2024 — Present', title: 'Senior Web Developer', company: 'Freelance / Self-Employed', desc: 'Leading full-stack web development projects for diverse clients. Building modern, scalable applications with React, Node.js, and cloud infrastructure.' },
            { date: '2022 — 2024', title: 'Full Stack Developer', company: 'Digital Agency', desc: 'Developed and maintained 20+ client websites. Collaborated with design teams to deliver pixel-perfect responsive layouts and optimized performance.' },
            { date: '2020 — 2022', title: 'Frontend Developer', company: 'Tech Startup', desc: 'Built interactive user interfaces with React and TypeScript. Implemented animations, state management, and integrated RESTful APIs.' },
            { date: '2019 — 2020', title: 'Junior Web Developer', company: 'Web Studio', desc: 'Started my professional journey building responsive WordPress sites and custom HTML/CSS landing pages. Learned the foundations of modern web development.' },
        ];

        // ================================================================
        // RENDER PORTFOLIO CONTENT
        // ================================================================
        function renderSkills() {
            skillsGrid.innerHTML = skillsData.map(s => `
                        <div class="skill-card glass reveal">
                            <div class="skill-header">
                                <span class="skill-name">${s.name}</span>
                                <span class="skill-percent">${s.percent}%</span>
                            </div>
                            <div class="skill-bar">
                                <div class="skill-fill" data-width="${s.percent}"></div>
                            </div>
                        </div>
                    `).join('');
        }

        function renderProjects() {
            projectsGrid.innerHTML = projectsData.map(p => `
                        <div class="project-card reveal">
                            <img class="project-img" src="${p.img}" alt="${p.title}" loading="lazy" />
                            <div class="project-info">
                                <h4>${p.title}</h4>
                                <div class="project-tags">
                                    ${p.tags.map(t => `<span>${t}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('');
        }

        function renderTimeline() {
            timeline.innerHTML = experienceData.map(e => `
                        <div class="timeline-item reveal">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content glass">
                                <div class="timeline-date">${e.date}</div>
                                <h4>${e.title}</h4>
                                <div class="timeline-company">${e.company}</div>
                                <p>${e.desc}</p>
                            </div>
                        </div>
                    `).join('');
        }

        // ================================================================
        // TYPING EFFECT
        // ================================================================
        function startTyping() {
            const words = ['Web Developer', 'UI/UX Designer', 'Problem Solver', 'Tech Enthusiast'];
            let wordIdx = 0;
            let charIdx = 0;
            let isDeleting = false;
            let speed = 100;

            function type() {
                const current = words[wordIdx];
                if (isDeleting) {
                    typingEl.textContent = current.substring(0, charIdx--);
                    speed = 40;
                } else {
                    typingEl.textContent = current.substring(0, charIdx++);
                    speed = 100;
                }

                if (!isDeleting && charIdx === current.length) {
                    speed = 1800;
                    isDeleting = true;
                } else if (isDeleting && charIdx === 0) {
                    isDeleting = false;
                    wordIdx = (wordIdx + 1) % words.length;
                    speed = 500;
                }
                setTimeout(type, speed);
            }
            type();
        }

        // ================================================================
        // ANIMATED COUNTERS (Intersection Observer)
        // ================================================================
        function animateCounters() {
            const counters = $$('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const increment = Math.ceil(target / 40);
                let current = 0;
                const update = () => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target + '+';
                        return;
                    }
                    counter.textContent = current;
                    requestAnimationFrame(update);
                };
                update();
            });
        }

        // ================================================================
        // SKILLS ANIMATION (animate skill bars on scroll)
        // ================================================================
        function animateSkills() {
            const fills = $$('.skill-fill');
            fills.forEach(fill => {
                const width = fill.dataset.width;
                fill.style.width = width + '%';
            });
        }

        // ================================================================
        // SCROLL REVEAL (Intersection Observer)
        // ================================================================
        function initScrollReveal() {
            const reveals = $$('.reveal');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // If this reveal contains skill-fill children, animate them
                        if (entry.target.querySelector('.skill-fill')) {
                            setTimeout(() => {
                                entry.target.querySelectorAll('.skill-fill').forEach(f => {
                                    f.style.width = f.dataset.width + '%';
                                });
                            }, 200);
                        }
                        // If this is a stat counter, trigger counting
                        if (entry.target.querySelector('.stat-number') && !entry.target.dataset.counted) {
                            entry.target.dataset.counted = 'true';
                            animateCountersInView(entry.target);
                        }
                    }
                });
            }, { threshold: 0.15 });

            reveals.forEach(el => observer.observe(el));
        }

        function animateCountersInView(container) {
            const counters = container.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const increment = Math.ceil(target / 40);
                let current = 0;
                const update = () => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target + '+';
                        return;
                    }
                    counter.textContent = current;
                    requestAnimationFrame(update);
                };
                update();
            });
        }

        // ================================================================
        // CONTACT FORM HANDLER
        // ================================================================
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message sent! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        });

        // ================================================================
        // INIT ALL PORTFOLIO FEATURES
        // ================================================================
        function initPortfolio() {
            renderSkills();
            renderProjects();
            renderTimeline();
            startTyping();
            initScrollReveal();

            // Reset skill fills for re-animation
            document.querySelectorAll('.skill-fill').forEach(f => f.style.width = '0%');
        }

        // ================================================================
        // NAVBAR ACTIVE LINK ON SCROLL
        // ================================================================
        window.addEventListener('scroll', () => {
            const sections = $$('section[id], .hero');
            let current = '';
            sections.forEach(s => {
                const top = s.offsetTop - 120;
                if (window.scrollY >= top) {
                    current = s.getAttribute('id') || 'home';
                }
            });
            navLinks.querySelectorAll('a').forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
            });
        });

        console.log('🔥 HackerAI — Firebase Auth Portfolio loaded');
        console.log('📧 Replace firebaseConfig with your own Firebase project config.');
    </script>
</body>
</html>
