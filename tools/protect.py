#!/usr/bin/env python3
"""Encrypt the password-protected case studies.

The readable source for each protected page lives in _private/<slug>/index.html,
which is git-ignored and never published. This script encrypts everything
between the PROTECTED:START and PROTECTED:END markers and writes the published
page to <slug>/index.html. Only the password gate, the <head>, and ciphertext
end up in the published file, so the case study can't be read from page source.

Edit the _private copy, then rebuild:

    python3 tools/protect.py

It asks for the password (or reads PORTFOLIO_PASSWORD). protect.js does the
matching decryption in the browser: PBKDF2-SHA256 -> AES-256-CBC + HMAC-SHA256.
"""

import base64
import getpass
import hashlib
import hmac
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUGS = [
    'osteoarthritis-care-plan',
    'cuttlefish-design-library',
    'medication-recommender-cost-analysis',
]
ITERATIONS = 600000
START = re.compile(r'<!-- PROTECTED:START.*?-->\n?')
END = '<!-- PROTECTED:END -->'


def b64(data):
    return base64.b64encode(data).decode('ascii')


def encrypt(plaintext, enc_key, mac_key):
    iv = os.urandom(16)
    ciphertext = subprocess.run(
        ['openssl', 'enc', '-aes-256-cbc', '-K', enc_key.hex(), '-iv', iv.hex()],
        input=plaintext, capture_output=True, check=True,
    ).stdout
    mac = hmac.new(mac_key, iv + ciphertext, hashlib.sha256).digest()
    return iv, ciphertext, mac


def build(slug, salt, enc_key, mac_key):
    with open(os.path.join(ROOT, '_private', slug, 'index.html'), encoding='utf-8') as f:
        source = f.read()

    start = START.search(source)
    end = source.find(END)
    if not start or end < start.end():
        sys.exit(f'{slug}: missing PROTECTED:START / PROTECTED:END markers')

    before = source[:start.start()]
    protected = source[start.end():end]
    # Page scripts expect the protected markup to exist, so protect.js loads
    # them after decrypting instead of the page loading them up front.
    scripts = re.findall(r'<script src="([^"]+)">\s*</script>', source[end:])

    iv, ciphertext, mac = encrypt(protected.encode('utf-8'), enc_key, mac_key)
    payload = {
        'iterations': ITERATIONS,
        'salt': b64(salt),
        'iv': b64(iv),
        'mac': b64(mac),
        'ciphertext': b64(ciphertext),
        'scripts': scripts,
    }

    page = (
        before
        + '<script id="protected-payload" type="application/json">'
        + json.dumps(payload)
        + '</script>\n<script src="../protect.js"></script>\n</body>\n</html>\n'
    )
    with open(os.path.join(ROOT, slug, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page)
    print(f'{slug}: encrypted {len(protected):,} characters')


def main():
    password = os.environ.get('PORTFOLIO_PASSWORD') or getpass.getpass('Password: ')
    if not password:
        sys.exit('No password given')

    # One salt per build, shared by every page, so unlocking one case study
    # unlocks the rest for the browser session.
    salt = os.urandom(16)
    keys = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS, dklen=64)
    for slug in SLUGS:
        build(slug, salt, keys[:32], keys[32:])


if __name__ == '__main__':
    main()
