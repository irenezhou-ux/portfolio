history.scrollRestoration = 'manual';
document.getElementById('page-scroll').scrollTop = 0;
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
    const pageScroll   = document.getElementById('page-scroll');
    function updateProgress() {
        const max = pageScroll.scrollHeight - pageScroll.clientHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? pageScroll.scrollTop / max : 0})`;
    }
    pageScroll.addEventListener('scroll', updateProgress, { passive: true });

    /* The nav bar sits outside #page-scroll (so its own scrollbar never
       overlaps it), which means a wheel/trackpad scroll while the cursor
       happens to be over the nav wouldn't otherwise reach the scrollable
       content underneath. Forward it manually. */
    document.getElementById('nav').addEventListener('wheel', e => {
        pageScroll.scrollTop += e.deltaY;
    }, { passive: true });

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
        if (el.dataset.animating === '1') return;
        el.dataset.animating = '1';

        const raw = el.dataset.count || '';

        if (raw === '∞') {
            const t0 = performance.now(), dur = 1200;
            (function step(now) {
                const p = Math.min((now - t0) / dur, 1);
                const ease = Math.pow(p, 3);
                if (p < 1) {
                    el.textContent = Math.round(ease * 9999);
                    requestAnimationFrame(step);
                } else {
                    el.textContent = '∞';
                    el.dataset.animating = '0';
                }
            })(performance.now());
            return;
        }

        const suffix = raw.replace(/[\d]/g, '');
        const target = parseInt(raw);
        if (isNaN(target)) { el.dataset.animating = '0'; return; }
        const t0 = performance.now(), dur = 1500;
        (function step(now) {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.dataset.animating = '0';
        })(performance.now());
    }

    /* ── Intersection Observer ─────────────────────────── */
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('vis');
            io.unobserve(e.target);
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => io.observe(el));

    /* Counters trigger off a shrunk "viewport" (rootMargin) so they fire
       once the stats box is meaningfully on screen, not the instant it
       peeks past the very bottom edge — the box is short enough that a
       plain percentage-based threshold still fires while it's still low
       on the screen. It stays observed and replays every time the stats
       re-cross that band, so a fast scroll that blows past it the first
       time doesn't miss it for good. */
    const counterIo = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.querySelectorAll('[data-count]').forEach(runCounter);
            if (e.target.dataset.count) runCounter(e.target);
        });
    }, { threshold: 0, rootMargin: '-15% 0px -15% 0px' });

    document.querySelectorAll('.about-stats').forEach(el => counterIo.observe(el));

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

    /* Touch devices synthesize a mouseenter right before the click when
       tapped, which would open it and then have the click below
       immediately toggle it shut again. Only wire up real hover on
       devices that actually have it. */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        dropWrap.addEventListener('mouseenter', () => openDrop());
        dropWrap.addEventListener('mouseleave', () => closeDrop(false));
    }

    /* Hover doesn't exist on touch, so the trigger also needs a
       tap-to-toggle, plus tapping anywhere else closes it. */
    dropTrigger.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (dropWrap.classList.contains('open')) closeDrop(false);
        else openDrop();
    });
    document.addEventListener('click', e => {
        if (dropWrap.classList.contains('open') && !dropWrap.contains(e.target)) closeDrop(false);
    });

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
            pageScroll.scrollTo({ top: 0, behavior: 'smooth' });
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
