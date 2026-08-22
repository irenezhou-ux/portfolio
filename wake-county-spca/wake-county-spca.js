(function () {
    /* ── Demo video play/pause ─────────────────────────── */
    const demoVideo     = document.getElementById('demoVideo');
    const demoContainer = document.getElementById('demoContainer');
    const videoToggle   = document.getElementById('videoToggle');
    const iconPause     = document.getElementById('iconPause');
    const iconPlay      = document.getElementById('iconPlay');

    if (demoVideo && videoToggle) {
        function setPlaying(playing) {
            iconPause.style.display = playing ? '' : 'none';
            iconPlay.style.display  = playing ? 'none' : '';
            videoToggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
            demoContainer.classList.toggle('paused', !playing);
        }

        videoToggle.addEventListener('click', () => {
            if (demoVideo.paused) {
                demoVideo.play();
                setPlaying(true);
            } else {
                demoVideo.pause();
                setPlaying(false);
            }
        });

        demoContainer.addEventListener('click', e => {
            if (e.target === videoToggle || videoToggle.contains(e.target)) return;
            videoToggle.click();
        });
    }

    /* ── Prototype toggle ──────────────────────────────── */
    const protoSlider  = document.getElementById('protoSlider');
    const protoToggle  = document.getElementById('protoToggle');
    const protoTabs    = [...document.querySelectorAll('.proto-tab')];

    function moveSlider(tab) {
        const wrapRect = protoToggle.getBoundingClientRect();
        const tabRect  = tab.getBoundingClientRect();
        protoSlider.style.width     = tabRect.width + 'px';
        protoSlider.style.transform = `translateX(${tabRect.left - wrapRect.left - 6}px)`;
    }

    // Init slider on the active tab without animation
    const initTab = protoTabs.find(t => t.classList.contains('active'));
    if (initTab) {
        protoSlider.style.transition = 'none';
        requestAnimationFrame(() => {
            moveSlider(initTab);
            requestAnimationFrame(() => {
                protoSlider.style.transition = '';
            });
        });
    }

    protoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            const target = tab.getAttribute('aria-controls');
            protoTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            document.querySelectorAll('.proto-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(target).classList.add('active');
            moveSlider(tab);
        });
    });

    // Collapsible prototype section
    (function() {
        const container = document.querySelector('.proto-container');
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = 'proto-collapse-btn';
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Collapse screens');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="18 15 12 9 6 15"/></svg>';

        const inner = document.createElement('div');
        [...container.children].forEach(child => inner.appendChild(child));

        const wrap = document.createElement('div');
        wrap.className = 'proto-collapse-wrap';
        wrap.appendChild(inner);

        container.appendChild(wrap);
        container.appendChild(btn);

        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!isExpanded));
            btn.setAttribute('aria-label', isExpanded ? 'Expand screens' : 'Collapse screens');
            wrap.classList.toggle('collapsed');
        });
    })();
})();

(function () {
    /* ── Screen lightbox slideshow ─────────────────────── */
    const frames = [...document.querySelectorAll('.browser-frame, .phone-frame')];
    if (!frames.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'screen-lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous screen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="lightbox-stage"><img class="lightbox-img" alt="Prototype screen"></div>
        <button class="lightbox-nav lightbox-next" aria-label="Next screen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="lightbox-zoom-controls">
            <button class="lightbox-zoom lightbox-zoom-out" aria-label="Zoom out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <button class="lightbox-zoom lightbox-zoom-in" aria-label="Zoom in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
        </div>
        <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(lightbox);

    const imgEl      = lightbox.querySelector('.lightbox-img');
    const stageEl    = lightbox.querySelector('.lightbox-stage');
    const counterEl  = lightbox.querySelector('.lightbox-counter');
    const prevBtn    = lightbox.querySelector('.lightbox-prev');
    const nextBtn    = lightbox.querySelector('.lightbox-next');
    const closeBtn   = lightbox.querySelector('.lightbox-close');
    const zoomInBtn  = lightbox.querySelector('.lightbox-zoom-in');
    const zoomOutBtn = lightbox.querySelector('.lightbox-zoom-out');

    let gallery = [];
    let index   = 0;
    let zoom    = 1;
    let panX    = 0;
    let panY    = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const MIN_ZOOM = 1;
    const MAX_ZOOM = 4;

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

    function show(i) {
        index = (i + gallery.length) % gallery.length;
        imgEl.src = gallery[index].src;
        counterEl.textContent = `${index + 1} / ${gallery.length}`;
        const multi = gallery.length > 1;
        prevBtn.style.display = nextBtn.style.display = multi ? '' : 'none';
        resetZoom();
    }

    function open(frame) {
        const panel = frame.closest('.proto-panel') || document;
        gallery = [...panel.querySelectorAll('.browser-frame img, .phone-frame img')];
        show(gallery.indexOf(frame.querySelector('img')));
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    frames.forEach(frame => {
        frame.classList.add('screen-clickable');
        frame.addEventListener('click', () => open(frame));
    });

    prevBtn.addEventListener('click', e => { e.stopPropagation(); show(index - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); show(index + 1); });
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    zoomInBtn.addEventListener('click',  e => { e.stopPropagation(); setZoom(zoom + 0.5); });
    zoomOutBtn.addEventListener('click', e => { e.stopPropagation(); setZoom(zoom - 0.5); });

    imgEl.addEventListener('dblclick', e => {
        e.stopPropagation();
        setZoom(zoom > 1 ? 1 : 2);
    });

    stageEl.addEventListener('wheel', e => {
        e.preventDefault();
        setZoom(zoom + (e.deltaY < 0 ? 0.3 : -0.3));
    }, { passive: false });

    imgEl.addEventListener('mousedown', e => {
        if (zoom === 1) return;
        e.preventDefault();
        dragging   = true;
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
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
        if (e.key === '+' || e.key === '=') setZoom(zoom + 0.5);
        if (e.key === '-' || e.key === '_') setZoom(zoom - 0.5);
        if (e.key === '0') setZoom(1);
    });
})();
