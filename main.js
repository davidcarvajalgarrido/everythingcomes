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
 * Scale down font-size if the phrase overflows its container.
 * Resets to CSS-driven size first so longer phrases can grow back.
 */
function fitPhraseText() {
  phraseEl.style.fontSize = '';
  const containerW = phraseEl.parentElement.clientWidth;
  const phraseW    = phraseEl.scrollWidth;
  if (phraseW > containerW) {
    const scale  = (containerW / phraseW) * 0.96;
    const sizePx = parseFloat(getComputedStyle(phraseEl).fontSize);
    phraseEl.style.fontSize = (sizePx * scale) + 'px';
  }
}

/**
 * Transition to `phrase`, then fire `onComplete` when fully visible.
 *
 * The sequence:
 *   1. Add `is-out`   → CSS ease-in transition: fade out + drift up      (FADE_OUT ms)
 *   2. Swap text while invisible
 *   3. Add `is-reset` → instant snap to below-centre (transition: none)
 *   4. Remove `is-reset` → CSS ease-out transition: fade in + drift up   (FADE_IN ms)
 *   5. Fire `onComplete`
 */
function transitionToPhrase(phrase, onComplete) {
  if (prefersReducedMotion) {
    // Instant swap — no motion
    phraseEl.textContent = phrase.text;
    phraseEl.setAttribute('lang', phrase.lang);
    phrase.dir
      ? phraseEl.setAttribute('dir', phrase.dir)
      : phraseEl.removeAttribute('dir');
    fitPhraseText();
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

    fitPhraseText();

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

// Apply initial fit and re-fit on window resize
fitPhraseText();
window.addEventListener('resize', fitPhraseText);

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
// 48 balances visual density with acceptable GPU/CPU cost on mobile.
const petalCount = prefersReducedMotion ? 0 : 48;

// ── Global wind state ─────────────────────────────────────────
// Two layered sine waves give a slow, organic horizontal drift.
let windTick = 0;

function globalWindX() {
  return (
    Math.sin(windTick * 0.00028) * 0.70 +
    Math.sin(windTick * 0.00071 + 1.4) * 0.28
  );
}

/**
 * Create one petal with randomised physics and appearance.
 * @param {number|null} startY  Spawn Y position; null = random on-screen.
 */
function createPetal(startY = null) {
  return {
    x:           Math.random() * canvas.width,
    y:           startY !== null ? startY : Math.random() * canvas.height,
    size:        2.5 + Math.random() * 4.5,            // ellipse half-width (px)
    elongation:  0.40 + Math.random() * 0.30,          // minor/major ratio — petal eccentricity
    speedY:      0.28 + Math.random() * 0.50,           // downward drift per frame
    speedX:      (Math.random() - 0.5) * 0.35,          // base lateral drift
    windSens:    0.40 + Math.random() * 0.90,           // sensitivity to global wind
    angle:       Math.random() * Math.PI * 2,           // current rotation (radians)
    rotSpeed:    (Math.random() - 0.5) * 0.022,         // rotation increment per frame
    wobble:      Math.random() * Math.PI * 2,           // sinusoidal oscillation phase
    wobbleFreq:  0.010 + Math.random() * 0.012,         // oscillation frequency
    wobbleAmp:   0.40  + Math.random() * 0.90,          // oscillation amplitude (px)
    opacity:     0.40  + Math.random() * 0.45,
    opacityOsc:  Math.random() * Math.PI * 2,           // phase for subtle opacity breathing
    hue:         330   + Math.random() * 20,            // 330–350° blush-pink
    sat:         35    + Math.random() * 45,            // saturation %
    lit:         72    + Math.random() * 18,            // lightness %
  };
}

// Initialise the petal pool; scatter Y positions across the screen at start.
const petals = Array.from({ length: petalCount }, () => createPetal());

/**
 * Draw a single petal as a slightly eccentric, rotated ellipse.
 * Per-petal elongation gives each one a distinct leaf-like silhouette.
 */
function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = `hsl(${p.hue}, ${p.sat}%, ${p.lit}%)`;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * p.elongation, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Animation loop — advances every petal and repaints the canvas. */
function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  windTick++;
  const wind = globalWindX();

  for (const p of petals) {
    // Sinusoidal sway + global wind influence
    p.wobble     += p.wobbleFreq;
    p.opacityOsc += 0.008;
    p.x          += p.speedX + wind * p.windSens + Math.sin(p.wobble) * p.wobbleAmp;
    p.y          += p.speedY;
    p.angle      += p.rotSpeed;

    // Subtle opacity breathing — petals fade very slightly in and out
    // Bounds keep petals visible (≥0.25) without becoming too opaque (≤0.88).
    // 0.003 is the per-frame breath amplitude — barely perceptible individually.
    p.opacity = Math.max(0.25, Math.min(0.88,
      p.opacity + Math.sin(p.opacityOsc) * 0.003
    ));

    // Wrap horizontally so petals re-enter from the opposite edge
    if      (p.x < -20)               p.x = canvas.width  + 15;
    else if (p.x > canvas.width + 20) p.x = -15;

    // Recycle petals that have fallen below the viewport
    if (p.y > canvas.height + 15) {
      Object.assign(p, createPetal(-Math.random() * 60));
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

// ─────────────────────────────────────────────────────────────
// FULLSCREEN TOGGLE
// ─────────────────────────────────────────────────────────────

const btnFullscreen = document.getElementById('btn-fullscreen');

function updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  btnFullscreen.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
  btnFullscreen.querySelector('.icon-fs-enter').hidden = isFs;
  btnFullscreen.querySelector('.icon-fs-exit').hidden  = !isFs;
}

if (btnFullscreen) {
  if (!document.fullscreenEnabled) {
    // Graceful fallback — hide button if API unavailable
    btnFullscreen.hidden = true;
  } else {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    updateFullscreenIcon();
  }
}

// ─────────────────────────────────────────────────────────────
// AUDIO TOGGLE
// ─────────────────────────────────────────────────────────────

const btnAudio     = document.getElementById('btn-audio');
const ambientAudio = document.getElementById('ambient-audio');
let audioPlaying   = false;

function updateAudioIcon() {
  btnAudio.setAttribute(
    'aria-label',
    audioPlaying ? 'Mute ambient audio' : 'Play ambient audio'
  );
  btnAudio.querySelector('.icon-audio-off').hidden = audioPlaying;
  btnAudio.querySelector('.icon-audio-on').hidden  = !audioPlaying;
}

if (btnAudio && ambientAudio) {
  btnAudio.addEventListener('click', () => {
    if (audioPlaying) {
      ambientAudio.pause();
      audioPlaying = false;
      updateAudioIcon();
    } else {
      ambientAudio.play().then(() => {
        audioPlaying = true;
        updateAudioIcon();
      }).catch(() => {
        // No audio source or autoplay blocked — stay in muted state
        audioPlaying = false;
        updateAudioIcon();
      });
    }
  });
  updateAudioIcon();
}

// ─────────────────────────────────────────────────────────────
// CREDITS — current year
// ─────────────────────────────────────────────────────────────

const yearEl = document.getElementById('credits-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
