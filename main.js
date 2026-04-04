// ============================================================
// main.js — Todo llega · Everything comes
// ============================================================

// ── Translations (18 languages) ──────────────────────────────
const PHRASES = [
  { text: 'Todo llega',             lang: 'es'             }, // Spanish
  { text: 'Everything comes',       lang: 'en'             }, // English
  { text: 'Tout arrive',            lang: 'fr'             }, // French
  { text: 'Tutto arriva',           lang: 'it'             }, // Italian
  { text: 'Tudo chega',             lang: 'pt'             }, // Portuguese
  { text: 'Alles kommt',            lang: 'de'             }, // German
  { text: 'Всё приходит',           lang: 'ru'             }, // Russian
  { text: '全てが訪れる',            lang: 'ja'             }, // Japanese
  { text: '一切都会来',              lang: 'zh'             }, // Chinese (Simplified)
  { text: 'كل شيء يأتي',            lang: 'ar', dir: 'rtl' }, // Arabic
  { text: 'Όλα έρχονται',           lang: 'el'             }, // Greek
  { text: 'सब कुछ आता है',           lang: 'hi'             }, // Hindi
  { text: '모든 것이 온다',           lang: 'ko'             }, // Korean
  { text: 'Her şey gelir',          lang: 'tr'             }, // Turkish
  { text: 'Allt kommer',            lang: 'sv'             }, // Swedish
  { text: 'Alles komt',             lang: 'nl'             }, // Dutch
  { text: 'הכל מגיע',               lang: 'he', dir: 'rtl' }, // Hebrew
  { text: 'Wszystko przychodzi',    lang: 'pl'             }, // Polish
];

// How long (ms) each phrase stays fully visible after its fade-in completes.
const DISPLAY_DURATION = 4500;

// Duration (ms) of the fade-out step (exit).  Keep in sync with --fade-out-dur in styles.css.
const FADE_OUT = 1000;

// Duration (ms) of the fade-in step (entrance).  Keep in sync with --fade-in-dur in styles.css.
const FADE_IN = 1400;

// ── Reduced-motion preference ─────────────────────────────────
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// ─────────────────────────────────────────────────────────────
// TEXT ROTATION
// ─────────────────────────────────────────────────────────────

const phraseEl = document.getElementById('rotating-text');
let currentIndex = 0;

/**
 * Transition to `phrase`, then fire `onComplete` when fully visible.
 *
 * The sequence:
 *   1. Add `is-out`   → CSS ease-in transition: fade out + drift up      (FADE_OUT ms)
 *   2. Swap text while invisible
 *   3. Add `is-reset` → instant snap to below-centre (transition: none)
 *   4. Remove `is-reset` → CSS ease-out transition: fade in + drift up   (FADE_IN ms)
 *   5. Fire `onComplete`
 *
 * Separate durations for out/in make the exit feel crisp and the
 * entrance feel slow and deliberate — more poetic, less carousel-like.
 */
function transitionToPhrase(phrase, onComplete) {
  if (prefersReducedMotion) {
    // Instant swap — no motion
    phraseEl.textContent = phrase.text;
    phraseEl.setAttribute('lang', phrase.lang);
    phrase.dir
      ? phraseEl.setAttribute('dir', phrase.dir)
      : phraseEl.removeAttribute('dir');
    if (onComplete) onComplete();
    return;
  }

  // ① Fade out (upward, ease-in via CSS)
  phraseEl.classList.add('is-out');

  setTimeout(() => {
    // ② Swap content while element is invisible
    phraseEl.textContent = phrase.text;
    phraseEl.setAttribute('lang', phrase.lang);
    phrase.dir
      ? phraseEl.setAttribute('dir', phrase.dir)
      : phraseEl.removeAttribute('dir');

    // ③ Snap to "below centre" without any transition
    phraseEl.classList.remove('is-out');
    phraseEl.classList.add('is-reset');

    // Force the browser to commit the reset state before removing the class
    void phraseEl.offsetHeight;

    // ④ Remove reset → base ease-out transition animates up into place
    phraseEl.classList.remove('is-reset');

    if (onComplete) setTimeout(onComplete, FADE_IN);
  }, FADE_OUT);
}

/** Advance to the next phrase and schedule the one after it. */
function showNextPhrase() {
  currentIndex = (currentIndex + 1) % PHRASES.length;
  transitionToPhrase(PHRASES[currentIndex], () => {
    setTimeout(showNextPhrase, DISPLAY_DURATION);
  });
}

// Start the rotation after the initial phrase has been on screen long enough to read
setTimeout(showNextPhrase, DISPLAY_DURATION);

// ─────────────────────────────────────────────────────────────
// SAKURA PETAL ANIMATION
// ─────────────────────────────────────────────────────────────

const canvas = document.getElementById('sakura-canvas');
const ctx    = canvas.getContext('2d');

/** Resize canvas to fill the viewport. */
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Fewer petals for reduced-motion; zero disables the loop entirely.
const petalCount = prefersReducedMotion ? 0 : 52;

/**
 * Create one petal with randomised physics and appearance.
 * @param {number|null} startY  Spawn Y position; null = random on-screen.
 */
function createPetal(startY = null) {
  return {
    x:          Math.random() * canvas.width,
    y:          startY !== null ? startY : Math.random() * canvas.height,
    size:       3 + Math.random() * 4.5,           // ellipse half-width (px)
    speedY:     0.35 + Math.random() * 0.55,       // downward drift per frame
    speedX:     (Math.random() - 0.5) * 0.4,       // base lateral drift
    angle:      Math.random() * Math.PI * 2,       // current rotation (radians)
    rotSpeed:   (Math.random() - 0.5) * 0.025,     // rotation increment per frame
    wobble:     Math.random() * Math.PI * 2,       // sinusoidal oscillation phase
    wobbleFreq: 0.012 + Math.random() * 0.010,     // oscillation frequency
    wobbleAmp:  0.5   + Math.random() * 0.8,       // oscillation amplitude (px)
    opacity:    0.45  + Math.random() * 0.45,
    hue:        335   + Math.random() * 15,        // 335–350° pink-rose
    sat:        45    + Math.random() * 40,        // saturation %
    lit:        68    + Math.random() * 16,        // lightness %
  };
}

// Initialise the petal pool; scatter Y positions across the screen at start.
const petals = Array.from({ length: petalCount }, () => createPetal());

/**
 * Draw a single petal as a slightly eccentric, rotated ellipse.
 * The eccentricity (0.52 ratio) gives it a leaf-like silhouette.
 */
function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = `hsl(${p.hue}, ${p.sat}%, ${p.lit}%)`;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Animation loop — advances every petal and repaints the canvas. */
function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of petals) {
    // Apply wind-like sinusoidal oscillation to horizontal drift
    p.wobble += p.wobbleFreq;
    p.x      += p.speedX + Math.sin(p.wobble) * p.wobbleAmp;
    p.y      += p.speedY;
    p.angle  += p.rotSpeed;

    // Wrap horizontally so petals re-enter from the opposite edge
    if      (p.x < -20)               p.x = canvas.width  + 15;
    else if (p.x > canvas.width + 20) p.x = -15;

    // Recycle petals that have fallen below the viewport
    if (p.y > canvas.height + 15) {
      Object.assign(p, createPetal(-Math.random() * 50));
    }

    drawPetal(p);
  }

  requestAnimationFrame(animatePetals);
}

if (petalCount > 0) {
  animatePetals();
}

// ─────────────────────────────────────────────────────────────
// ATROPOS.JS PARALLAX
// ─────────────────────────────────────────────────────────────

/**
 * Initialise the subtle 3-D tilt effect on the hero card.
 * Low rotation limits keep the effect contemplative, not distracting.
 */
if (typeof Atropos !== 'undefined') {
  Atropos({
    el:           '#hero-atropos',
    activeOffset: 25,
    shadowScale:  1,       // no extra shadow size
    rotateXMax:   6,       // degrees — gentle tilt
    rotateYMax:   6,
    shadow:       false,   // shadow disabled for a cleaner look
    highlight:    false,   // no specular highlight sheen
  });
}
