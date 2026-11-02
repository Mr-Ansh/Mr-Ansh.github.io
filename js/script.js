(() => {
  document.documentElement.classList.add('js');
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
      }
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(item => observer.observe(item));
  } else reveals.forEach(item => item.classList.add('is-visible'));

  const art = document.querySelector('.tree-art img');
  const sections = [...document.querySelectorAll('[data-grow]')];
  let svg = null;
  let progress = 0;
  let frame = 0;
  const updateGrowth = () => {
    frame = 0;
    if (!svg) return;
    const root = svg.querySelector('#roots');
    const trunk = svg.querySelector('#trunk');
    const branches = svg.querySelector('#branches');
    const leaves = svg.querySelectorAll('.leaf');
    const p = progress;
    [[root, Math.min(1, p * 3.5)], [trunk, Math.max(0, Math.min(1, (p - .08) * 2.2))], [branches, Math.max(0, Math.min(1, (p - .28) * 2.1))]].forEach(([group, amount]) => {
      if (group) group.querySelectorAll('path').forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length * (1 - amount));
      });
    });
    leaves.forEach((leaf, index) => {
      const threshold = .42 + (index % 6) * .075;
      leaf.style.opacity = String(Math.max(0, Math.min(1, (p - threshold) * 5)));
    });
    const canopy = svg.querySelector('.canopy');
    if (canopy) canopy.style.opacity = String(Math.max(0, Math.min(1, (p - .34) * 2.5)));
    const butterfly = svg.querySelector('.butterfly');
    if (butterfly) butterfly.style.opacity = String(Math.max(0, Math.min(1, (p - .68) * 4)));
  };
  const measure = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 1;
    if (!frame) frame = requestAnimationFrame(updateGrowth);
  };
  if (art) {
    fetch(art.getAttribute('src')).then(response => response.text()).then(source => {
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      if (parsed.querySelector('parsererror')) return;
      svg = parsed.documentElement;
      if (reducedMotion) progress = 1;
      measure();
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      art.src = URL.createObjectURL(blob);
    }).catch(() => { /* The static illustration remains available if scripting or fetch is unavailable. */ });
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    if (reducedMotion) progress = 1;
  }
})();
