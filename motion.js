(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animated = new Set();
  const reveal = (element, delay = 0) => {
    if (preference.matches || !element.animate) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(22px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    animated.add(animation);
    animation.finished.then(() => animated.delete(animation)).catch(() => animated.delete(animation));
  };
  const hero = document.querySelector('main .hero');
  if (hero) Array.from(hero.children).forEach((child, index) => reveal(child, index * 70));
  const targets = document.querySelectorAll('main .project-card, main .section > h2, main .about-band, main .contact-band, main .skills-grid > div, main .gallery-grid > figure');
  let observer;
  if ('IntersectionObserver' in window && !preference.matches) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach(target => observer.observe(target));
  }
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    observer?.disconnect();
    animated.forEach(animation => animation.cancel());
    animated.clear();
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    scheduled = false;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', update);
  update();
})();
