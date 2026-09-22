# Flamingo Delight

Sample homepage for flamingodelight.com: Palm Springs kitsch, gifts and playful content.

Static page: `index.html` + `tokens.css` + `styles.css`. Preview with `python -m http.server 8141`.

## Artwork

Generated with Higgsfield (`higgsfield-ai/soul/v2/standard`) by `generate.ts`, which skips files already in `assets/_raw/`.

    npm install
    npm run art      # needs HF_CREDENTIALS (reads C:/Working_Projects/Homelab_Design/.env.local)
    npm run shrink   # assets/_raw/*.png -> assets/*.jpg (ImageMagick)

To redo an image, delete it from `assets/_raw/` and run both again.

## Logo

Codex's logos are kept as-is in `assets/_src/`. `python scripts/logo.py` removes their cream background and writes `assets/logo-wide.webp` plus the favicons. The page palette in `tokens.css` is sampled from the logo.
