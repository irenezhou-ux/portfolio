history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
(function () {

    /* ── Custom cursor ─────────────────────────────────── */
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = -80, my = -80, rx = -80, ry = -80;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    }, { passive: true });

    (function lerpRing() {
        rx += (mx - rx) * .11;
        ry += (my - ry) * .11;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(lerpRing);
    })();

    document.querySelectorAll('a, button, .case-item, .skill-tag, .disc-tag').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('grow'));
        el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
    });

    /* ── Scroll progress bar ───────────────────────────── */
    const progressBar = document.querySelector('.scroll-progress');
    function updateProgress() {
        const max = document.documentElement.scrollHeight - innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    }
    addEventListener('scroll', updateProgress, { passive: true });

    /* ── Hero name slide-up ────────────────────────────── */
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        const text = heroName.textContent.trim();
        heroName.innerHTML = `<span class="word-wrap"><span class="word-inner" style="animation-delay:.2s">${text}</span></span>`;
        heroName.style.opacity  = '1';
        heroName.style.animation = 'none';
    }

    /* ── Stagger skill tags ────────────────────────────── */
    document.querySelectorAll('.skills-list .skill-tag').forEach((el, i) => {
        el.style.transitionDelay = (i * .04) + 's';
    });

    /* ── Auto-add reveal-left to section eyebrows ─────── */
    document.querySelectorAll('.section-eyebrow').forEach(el => {
        el.classList.add('reveal-left');
    });

    /* ── Counter animation ─────────────────────────────── */
    function runCounter(el) {
        const raw = el.dataset.count || '';
        const suffix = raw.replace(/[\d]/g, '');
        const target = parseInt(raw);
        if (isNaN(target)) return;
        const t0 = performance.now(), dur = 1500;
        (function step(now) {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
        })(performance.now());
    }

    /* ── Intersection Observer ─────────────────────────── */
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('vis');
            e.target.querySelectorAll('[data-count]').forEach(runCounter);
            if (e.target.dataset.count) runCounter(e.target);
            io.unobserve(e.target);
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => io.observe(el));

    /* ── Marquee hover pause ───────────────────────────── */
    document.querySelectorAll('.marquee-section').forEach(sec => {
        const track = sec.querySelector('.marquee-track');
        sec.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
        sec.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    });

    /* ── Magnetic contact buttons ──────────────────────── */
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            btn.style.transition = 'background .2s, color .2s';
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width  / 2) * .22;
            const y = (e.clientY - r.top  - r.height / 2) * .32;
            btn.style.transform = `translate(${x}px,${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'background .2s, color .2s, transform .6s cubic-bezier(.16,1,.3,1)';
            btn.style.transform = '';
        });
    });

    /* ── Work dropdown ─────────────────────────────────── */
    const dropWrap    = document.getElementById('workDropdown');
    const dropTrigger = dropWrap.querySelector('.work-trigger');
    const dropMenu    = document.getElementById('workMenu');
    const dropItems   = () => [...dropMenu.querySelectorAll('[role="menuitem"]')];

    function openDrop() {
        dropWrap.classList.add('open');
        dropTrigger.setAttribute('aria-expanded', 'true');
        dropItems().forEach(i => i.setAttribute('tabindex', '0'));
    }
    function closeDrop(returnFocus = true) {
        dropWrap.classList.remove('open');
        dropTrigger.setAttribute('aria-expanded', 'false');
        dropItems().forEach(i => i.setAttribute('tabindex', '-1'));
        if (returnFocus) dropTrigger.focus();
    }

    dropWrap.addEventListener('mouseenter', () => openDrop());
    dropWrap.addEventListener('mouseleave', () => closeDrop(false));

    /* Keyboard: Escape closes, arrows navigate */
    document.addEventListener('keydown', e => {
        if (!dropWrap.classList.contains('open')) return;
        const items = dropItems();
        const idx   = items.indexOf(document.activeElement);
        if (e.key === 'Escape') { closeDrop(); return; }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            items[(idx + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            items[(idx - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Tab') {
            closeDrop(false);
        }
    });

    /* Close dropdown when a menu item is clicked */
    dropItems().forEach(item => item.addEventListener('click', () => closeDrop(false)));

    /* ── Logo click: scroll to very top ────────────────── */
    const navName = document.querySelector('.nav-name');
    if (navName) {
        navName.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Burger menu ───────────────────────────────────── */
    const burger  = document.getElementById('burger');
    const navList = document.getElementById('navLinks');
    const bars    = burger.querySelectorAll('span');
    burger.addEventListener('click', () => {
        const open = navList.classList.toggle('open');
        bars[0].style.transform = open ? 'translateY(6.5px) rotate(45deg)' : '';
        bars[1].style.opacity   = open ? '0' : '';
        bars[2].style.transform = open ? 'translateY(-6.5px) rotate(-45deg)' : '';
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        navList.classList.remove('open');
        bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }));

})();
