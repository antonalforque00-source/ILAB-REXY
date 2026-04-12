
(function () {


  const MESSAGES = [
    'Initializing LoanSphere...',
    'Loading your dashboard...',
    'Connecting to database...',
    'Almost ready...',
  ];

  let msgIndex   = 0;
  let msgTimer   = null;
  let dismissed  = false;


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


  function hideLoader() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(msgTimer);

    const loader = document.getElementById('introLoader');
    if (!loader) return;


    const fill = document.getElementById('loaderFill');
    if (fill) fill.style.width = '100%';


    setTimeout(() => {
      loader.classList.add('loader-slide-out');
      setTimeout(() => {
        loader.style.display = 'none';
   
        document.body.classList.add('page-fade-in');
      }, 600);
    }, 400);
  }


  function triggerTransition(href) {
    const overlay = document.getElementById('pageTransition');
    if (!overlay) { window.location.href = href; return; }

    overlay.classList.remove('leaving');
    overlay.classList.add('entering');

    setTimeout(() => {
      window.location.href = href;
    }, 350);
  }


  function attachTransitionLinks() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;


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


  window.addEventListener('DOMContentLoaded', function () {


    const el = document.getElementById('loaderMsg');
    if (el) {
      el.textContent = MESSAGES[0];
      el.style.transition = 'opacity .3s ease';
    }


    msgTimer = setInterval(cycleMessage, 700);


    attachTransitionLinks();

  
    const overlay = document.getElementById('pageTransition');
    if (overlay) {
      overlay.classList.remove('entering');
      overlay.classList.add('leaving');
    }
  });


  window.addEventListener('load', function () {
   
    const minTime = 2400;
    const elapsed = performance.now();
    const remaining = Math.max(0, minTime - elapsed);

    setTimeout(hideLoader, remaining);
  });


  window.hideIntroLoader = hideLoader;
  window.navigateTo      = triggerTransition;

})();
