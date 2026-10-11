/* Unlocks case studies encrypted by tools/protect.py.
   The page ships only ciphertext; the password derives the keys
   (PBKDF2-SHA256), the HMAC confirms the password was right, and
   AES-CBC decrypts the markup, which is then inserted after the gate.
   The derived keys are kept for the browser session so the other
   protected case studies open without asking again. */
(function () {
    var KEY = 'portfolio_key';
    var payload = JSON.parse(document.getElementById('protected-payload').textContent);
    var gate   = document.getElementById('pw-gate');
    var form   = document.getElementById('pw-form');
    var input  = document.getElementById('pw-input');
    var error  = document.getElementById('pw-error');
    var button = form.querySelector('button');

    function fromBase64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
    function toHex(b)      { return Array.from(b, function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
    function fromHex(s)    { return new Uint8Array(s.match(/../g).map(function (h) { return parseInt(h, 16); })); }

    async function deriveKeys(password) {
        var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        var bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(payload.salt), iterations: payload.iterations },
            base, 512
        );
        return new Uint8Array(bits);
    }

    /* Resolves to the page markup, or null if the keys are wrong. */
    async function decrypt(keys) {
        var iv = fromBase64(payload.iv), ciphertext = fromBase64(payload.ciphertext);
        var signed = new Uint8Array(iv.length + ciphertext.length);
        signed.set(iv);
        signed.set(ciphertext, iv.length);

        var macKey = await crypto.subtle.importKey('raw', keys.slice(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
        if (!await crypto.subtle.verify('HMAC', macKey, fromBase64(payload.mac), signed)) return null;

        var aesKey = await crypto.subtle.importKey('raw', keys.slice(0, 32), 'AES-CBC', false, ['decrypt']);
        return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, aesKey, ciphertext));
    }

    /* Page scripts query the case study markup, so they load after it, in order. */
    function loadScripts(srcs) {
        srcs.reduce(function (prev, src) {
            return prev.then(function () {
                return new Promise(function (done) {
                    var s = document.createElement('script');
                    s.src = src;
                    s.onload = s.onerror = done;
                    document.body.appendChild(s);
                });
            });
        }, Promise.resolve());
    }

    function reveal(html, fade) {
        gate.insertAdjacentHTML('afterend', html);
        loadScripts(payload.scripts);
        if (!fade) { gate.remove(); return; }
        gate.classList.add('pw-fade');
        setTimeout(function () { gate.remove(); }, 400);
    }

    function fail(message) {
        error.textContent = message;
        input.classList.remove('pw-shake');
        void input.offsetWidth;
        input.classList.add('pw-shake');
        input.select();
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        button.disabled = true;
        error.textContent = '';
        try {
            var keys = await deriveKeys(input.value);
            var html = await decrypt(keys);
            if (html === null) { fail('Incorrect password — try again.'); return; }
            try { sessionStorage.setItem(KEY, toHex(keys)); } catch (_) {}
            reveal(html, true);
        } catch (_) {
            fail('This browser couldn’t unlock the page. Try another browser.');
        } finally {
            button.disabled = false;
        }
    });

    /* Already unlocked earlier this session: open without showing the gate. */
    var saved = null;
    try { saved = sessionStorage.getItem(KEY); } catch (_) {}
    if (saved) {
        gate.classList.add('pw-checking');
        decrypt(fromHex(saved))
            .catch(function () { return null; })
            .then(function (html) {
                if (html !== null) reveal(html, false);
                else gate.classList.remove('pw-checking');
            });
    }
})();
