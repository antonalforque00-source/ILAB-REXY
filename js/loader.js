/**
 * =====================================================
 * LOANSPHERE — Page Loader (js/loader.js)
 *
 * Features:
 * 1. Intro loader with "CODE NI ALFORQUE" badge
 * 2. Progress bar animation
 * 3. Smooth slide-out when page is ready
 * 4. Page transition overlay on every link click
 * 5. Body fade-in after loader hides
 * =====================================================
 */

(function () {

  /* ── Loading messages that cycle ── */
  const MESSAGES = [
    'Initializing LoanSphere...',
    'Loading your dashboard...',
    'Connecting to database...',
    'Almost ready...',
  ];

  let msgIndex   = 0;
  let msgTimer   = null;
  let dismissed  = false;

  /* ── Cycle loading text ── */
  function cycleMessage() {
    const el = document.getElementById('loaderMsg');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
      msgIndex = (msgIndex + 1) % MESSAGES.length;
      el.textContent = MESSAGES[msgIndex];
      el.style.opacity = '1';
    }, 300);
  }

  /* ── Dismiss the intro loader ── */
  function hideLoader() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(msgTimer);

    const loader = document.getElementById('introLoader');
    if (!loader) return;

    /* First fill bar to 100% */
    const fill = document.getElementById('loaderFill');
    if (fill) fill.style.width = '100%';

    /* Short pause then slide out */
    setTimeout(() => {
      loader.classList.add('loader-slide-out');
      setTimeout(() => {
        loader.style.display = 'none';
        /* Fade in the page content */
        document.body.classList.add('page-fade-in');
      }, 600);
    }, 400);
  }

  /* ── Page transition overlay (on internal link navigation) ── */
  function triggerTransition(href) {
    const overlay = document.getElementById('pageTransition');
    if (!overlay) { window.location.href = href; return; }

    overlay.classList.remove('leaving');
    overlay.classList.add('entering');

    setTimeout(() => {
      window.location.href = href;
    }, 350);
  }

  /* ── Intercept internal anchor clicks for smooth transitions ── */
  function attachTransitionLinks() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      /* Only intercept internal relative links */
      if (
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        anchor.target === '_blank'
      ) return;

      e.preventDefault();
      triggerTransition(href);
    });
  }

  /* ── Run on page load ── */
  window.addEventListener('DOMContentLoaded', function () {

    /* Show first message */
    const el = document.getElementById('loaderMsg');
    if (el) {
      el.textContent = MESSAGES[0];
      el.style.transition = 'opacity .3s ease';
    }

    /* Cycle messages every 700ms */
    msgTimer = setInterval(cycleMessage, 700);

    /* Attach smooth navigation to links */
    attachTransitionLinks();

    /* Handle page-leave transition (coming back via browser back) */
    const overlay = document.getElementById('pageTransition');
    if (overlay) {
      overlay.classList.remove('entering');
      overlay.classList.add('leaving');
    }
  });

  /* ── Hide loader when window is fully loaded ── */
  window.addEventListener('load', function () {
    /* Minimum display time: 2.4s so the animation completes */
    const minTime = 2400;
    const elapsed = performance.now();
    const remaining = Math.max(0, minTime - elapsed);

    setTimeout(hideLoader, remaining);
  });

  /* ── Expose for manual hide (e.g. after DB connects) ── */
  window.hideIntroLoader = hideLoader;
  window.navigateTo      = triggerTransition;

})();
