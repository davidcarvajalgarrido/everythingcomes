# Todo llega · Everything comes

A minimal, contemplative landing page. A single phrase — *"Todo llega"* (Everything comes) — cycles through 18 languages, each one drifting softly into view like petals in the wind.

## Stack

- **HTML5** — semantic structure, accessible live regions
- **CSS3** — custom properties, `clamp()`, smooth transitions, `prefers-reduced-motion`
- **Vanilla JavaScript** — text rotation, sakura canvas animation, Atropos init
- **[Atropos.js](https://atroposjs.com/)** (CDN only) — subtle 3-D parallax on the hero card

No build step. No framework. No bundler.

## Files

```
index.html  — page structure and semantic markup
styles.css  — all visual styles, transitions, and responsive rules
main.js     — phrase rotation, sakura petal animation, Atropos initialisation
README.md   — this file
```

## Run locally

Open `index.html` directly in any modern browser — no server required.

For a more complete environment (avoids CORS quirks with some browsers), serve it locally:

```bash
# Python
python3 -m http.server 8080

# Node.js (no install needed)
npx serve .
```

Then visit `http://localhost:8080`.

## Deploy to GitHub Pages

The repository includes a `.nojekyll` file so GitHub Pages skips Jekyll processing and serves the static files as-is.

1. Push the repository to GitHub (the `main` branch).
2. Go to **Settings → Pages** in your repository.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose **Branch: `main`** and folder **`/ (root)`**, then click **Save**.
5. After a moment the site will be live at `https://<username>.github.io/<repo>/`.

No build step, no configuration files — the repository root is the site root.

## Design notes

| Detail | Value |
|---|---|
| Background | `#f7f3ee` warm off-white |
| Typography | Georgia serif, weight 400 |
| Phrase transition | 1000 ms ease-in fade-out + 1400 ms ease-out fade-in, 0.25 em vertical drift |
| Sakura petals | 52 canvas ellipses, `requestAnimationFrame` |
| Parallax tilt | Atropos.js, 6° max rotation, no shadow/highlight |
| Accessibility | `aria-live="polite"` on rotating text, `aria-hidden` on canvas |
| Reduced motion | Instant text swap, petals disabled |