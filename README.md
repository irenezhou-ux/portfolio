# portfolio

## Password-protected case studies

The Osteoarthritis, Cuttlefish and Medication Recommender pages are published encrypted.
Their readable sources live in `_private/<page>/index.html`, which git ignores.

To edit one of them, change the file in `_private/`, then rebuild:

    python3 tools/protect.py

Don't edit the published `index.html` in those folders; the next rebuild overwrites it.
Keep a backup of `_private/` — it isn't in git, so this computer has the only copy.
