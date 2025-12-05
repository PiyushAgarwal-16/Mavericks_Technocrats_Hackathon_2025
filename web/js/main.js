document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        once: true,
        offset: 50
    });

    // Navbar Scroll Effect (Compact Mode)
    const navbar = document.getElementById('navbar');
    const navInner = navbar.querySelector('.glass-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.remove('py-6');
            navbar.classList.add('py-3');
            navInner.classList.add('bg-opacity-90', 'backdrop-blur-xl');
        } else {
            navbar.classList.add('py-6');
            navbar.classList.remove('py-3');
            navInner.classList.remove('bg-opacity-90', 'backdrop-blur-xl');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenu.classList.contains('hidden') ? 'menu' : 'x';
            mobileMenuBtn.innerHTML = `<i data-feather="${icon}"></i>`;
            feather.replace();
        });
    }

    // Deep Link Handler for "Erase Now" buttons
    const eraseButtons = document.querySelectorAll('.erase-now-btn');
    eraseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Visual feedback
            const originalText = btn.innerText;
            btn.innerText = 'Launching...';

            setTimeout(() => {
                btn.innerText = originalText;
                // Check if we are in root or pages folder to set correct path
                const isPagesFolder = window.location.pathname.includes('/pages/');
                window.location.href = isPagesFolder ? 'download.html' : 'pages/download.html';
            }, 800);
        });
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
