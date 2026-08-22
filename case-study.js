history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
    var PASS = 'ireneportfolio', KEY = 'portfolio_auth';
    var gate = document.getElementById('pw-gate');
    if (sessionStorage.getItem(KEY) === '1') { gate.remove(); return; }
    document.getElementById('pw-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = document.getElementById('pw-input');
        if (inp.value === PASS) {
            sessionStorage.setItem(KEY, '1');
            gate.classList.add('pw-fade');
            setTimeout(function () { gate.remove(); }, 400);
        } else {
            document.getElementById('pw-error').textContent = 'Incorrect password  try again.';
            inp.classList.remove('pw-shake');
            void inp.offsetWidth;
            inp.classList.add('pw-shake');
            inp.select();
        }
    });
})();

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

    document.querySelectorAll('a, button').forEach(el => {
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

    /* ── Hero title word-split ─────────────────────────── */
    const title = document.querySelector('.project-title');
    if (title) {
        const words = title.textContent.trim().split(' ');
        const lines = words.length <= 4
            ? [words.join(' ')]
            : [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];
        title.innerHTML = lines.map((line, i) =>
            `<span class="word-wrap"><span class="word-inner" style="animation-delay:${.12 + i * .1}s">${line}</span></span>`
        ).join('');
    }

    /* ── Auto reveal-left on section eyebrows ──────────── */
    document.querySelectorAll('.section-eyebrow').forEach(el => {
        if (!el.classList.contains('reveal-left')) el.classList.add('reveal-left');
    });

    /* ── Intersection Observer ─────────────────────────── */
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('vis');
            io.unobserve(e.target);
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => io.observe(el));

    /* ── Magnetic case-nav buttons ─────────────────────── */
    document.querySelectorAll('.case-nav-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            btn.style.transition = 'opacity .2s, background .2s';
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width  / 2) * .22;
            const y = (e.clientY - r.top  - r.height / 2) * .32;
            btn.style.transform = `translate(${x}px,${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'opacity .2s, background .2s, transform .55s cubic-bezier(.16,1,.3,1)';
            btn.style.transform = '';
        });
    });

    /* ── Work dropdown (hover) ─────────────────────────── */
    const workDrop    = document.getElementById('workDropdown');
    const workTrigger = workDrop ? workDrop.querySelector('.work-trigger') : null;
    const workMenu    = document.getElementById('workMenu');

    function openDrop() {
        workDrop.classList.add('open');
        workTrigger.setAttribute('aria-expanded', 'true');
        workMenu.querySelectorAll('[role="menuitem"]').forEach(i => i.setAttribute('tabindex', '0'));
    }
    function closeDrop() {
        workDrop.classList.remove('open');
        workTrigger.setAttribute('aria-expanded', 'false');
        workMenu.querySelectorAll('[role="menuitem"]').forEach(i => i.setAttribute('tabindex', '-1'));
    }

    if (workDrop) {
        workDrop.addEventListener('mouseenter', () => openDrop());
        workDrop.addEventListener('mouseleave', () => closeDrop());
    }

    document.addEventListener('keydown', e => {
        if (!workDrop) return;
        if (e.key === 'Escape') { closeDrop(); workTrigger.focus(); return; }
        if (!workDrop.classList.contains('open')) return;
        const items = [...workMenu.querySelectorAll('[role="menuitem"]')];
        const idx   = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Tab' && !e.shiftKey && idx === items.length - 1) closeDrop();
        if (e.key === 'Tab' && e.shiftKey  && idx === 0) closeDrop();
    });

    /* ── Burger menu ───────────────────────────────────── */
    const burger   = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    if (burger) {
        burger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('mobile-open');
            burger.classList.toggle('active', open);
        });
    }

})();

(function () {
    /* ── Scroll position indicator ──────────────────────── */
    var col   = document.createElement('div'); col.id   = 'scroll-col';
    var rail  = document.createElement('div'); rail.id  = 'scroll-rail';
    col.appendChild(rail);
    document.body.appendChild(col);

    /* Section tick marks */
    var sections = Array.from(document.querySelectorAll('.section-wrap'));
    var ticks    = [];

    function positionTicks() {
        var n     = sections.length;
        var railH = rail.offsetHeight;
        sections.forEach(function (s, i) {
            var pos = n > 1 ? Math.round((i / (n - 1)) * railH) : Math.round(railH / 2);
            ticks[i].style.top = pos + 'px';
        });
    }

    sections.forEach(function (s, i) {
        var ey    = s.querySelector('.section-eyebrow');
        var label = ey ? ey.textContent.trim() : '';
        var tick  = document.createElement('div');
        tick.className = 'scroll-tick';
        var lbl = document.createElement('span');
        lbl.className = 'scroll-tick-label';
        lbl.textContent = label;
        tick.appendChild(lbl);
        tick.addEventListener('click', function () {
            s.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        rail.appendChild(tick);
        ticks.push(tick);
    });

    window.addEventListener('resize', positionTicks, { passive: true });
    positionTicks();

    /* Active tick on scroll */
    var current = 0;
    var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var idx = sections.indexOf(e.target);
            if (idx === -1 || idx === current) return;
            ticks[current].classList.remove('st-active');
            current = idx;
            ticks[current].classList.add('st-active');
        });
    }, { rootMargin: '-38% 0px -57% 0px' });

    sections.forEach(function (s) { sio.observe(s); });
    if (ticks.length) ticks[0].classList.add('st-active');
})();

(function () {
    /* ── Image zoom modal ──────────────────────────────── */
    const targets = [...document.querySelectorAll('.wireframe-img-wrap img, .artifact-shot img')];
    if (!targets.length) return;

    function findCaption(wrap) {
        let title = '';
        let desc = '';
        const next = wrap.nextElementSibling;
        if (next && (next.classList.contains('shot-caption') || next.classList.contains('artifact-shot-label'))) {
            const clone = next.cloneNode(true);
            const strong = clone.querySelector('strong');
            if (strong) {
                title = strong.textContent.trim();
                strong.remove();
            }
            desc = clone.textContent.trim();
        }
        return { title, desc };
    }

    const modal = document.createElement('div');
    modal.className = 'img-zoom-modal';
    modal.innerHTML = `
        <button class="img-zoom-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="img-zoom-stage">
            <div class="img-zoom-frame"><img alt=""></div>
            <div class="img-zoom-caption">
                <p class="img-zoom-title"></p>
                <p class="img-zoom-desc"></p>
            </div>
        </div>
        <div class="img-zoom-controls">
            <button class="img-zoom-btn img-zoom-out" aria-label="Zoom out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <button class="img-zoom-btn img-zoom-in" aria-label="Zoom in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    const imgEl     = modal.querySelector('.img-zoom-frame img');
    const frameEl   = modal.querySelector('.img-zoom-frame');
    const titleEl   = modal.querySelector('.img-zoom-title');
    const descEl    = modal.querySelector('.img-zoom-desc');
    const closeBtn  = modal.querySelector('.img-zoom-close');
    const zoomInBtn = modal.querySelector('.img-zoom-in');
    const zoomOutBtn= modal.querySelector('.img-zoom-out');

    let zoom = 1, panX = 0, panY = 0, dragging = false, dragStartX = 0, dragStartY = 0;
    const MIN_ZOOM = 1, MAX_ZOOM = 4;

    function applyTransform() {
        imgEl.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    }
    function setZoom(z) {
        zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
        if (zoom === MIN_ZOOM) { panX = 0; panY = 0; imgEl.classList.remove('zoomed'); }
        else { imgEl.classList.add('zoomed'); }
        applyTransform();
    }
    function resetZoom() {
        imgEl.style.transition = 'none';
        setZoom(1);
        requestAnimationFrame(() => { imgEl.style.transition = ''; });
    }

    function open(target) {
        const { title, desc } = findCaption(target.closest('.wireframe-img-wrap, .artifact-shot'));
        imgEl.src = target.src;
        imgEl.alt = target.alt || '';
        titleEl.textContent = title;
        titleEl.style.display = title ? '' : 'none';
        descEl.textContent = desc;
        descEl.style.display = desc ? '' : 'none';
        resetZoom();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    targets.forEach(img => img.addEventListener('click', () => open(img)));

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    zoomInBtn.addEventListener('click',  () => setZoom(zoom + 0.5));
    zoomOutBtn.addEventListener('click', () => setZoom(zoom - 0.5));

    imgEl.addEventListener('dblclick', () => setZoom(zoom > 1 ? 1 : 2));

    frameEl.addEventListener('wheel', e => {
        e.preventDefault();
        setZoom(zoom + (e.deltaY < 0 ? 0.3 : -0.3));
    }, { passive: false });

    imgEl.addEventListener('mousedown', e => {
        if (zoom === 1) return;
        e.preventDefault();
        dragging = true;
        dragStartX = e.clientX - panX;
        dragStartY = e.clientY - panY;
        imgEl.style.transition = 'none';
    });
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        panX = e.clientX - dragStartX;
        panY = e.clientY - dragStartY;
        applyTransform();
    });
    window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        imgEl.style.transition = '';
    });

    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === '+' || e.key === '=') setZoom(zoom + 0.5);
        if (e.key === '-' || e.key === '_') setZoom(zoom - 0.5);
        if (e.key === '0') setZoom(1);
    });
})();
