// Floating fried-chicken Parika. Drifts slowly around the screen, bounces off edges, tap for a joke, double-tap to send it away.
// Starts after the first tap (the opening gate), so it never covers the "tap to open" screen.
(() => {
  const src = document.currentScript.dataset.src || '../photos/chicken.webp';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = document.createElement('style');
  css.textContent = `
    .pk-chicken{position:fixed;left:0;top:0;z-index:40;width:clamp(44px,12vw,70px);cursor:pointer;touch-action:manipulation;
      user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;
      filter:drop-shadow(0 6px 10px rgba(60,25,0,.35));opacity:0;transition:opacity .6s;will-change:transform}
    .pk-chicken.bye{transition:transform .5s ease-in,opacity .5s ease-in;opacity:0}
    .pk-chicken.on{opacity:1}
    .pk-chicken img{width:100%;height:auto;display:block;pointer-events:none}
    .pk-bubble{position:fixed;z-index:41;padding:6px 12px;border-radius:999px;background:#fff8ec;color:#5a2d0c;
      font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.18);pointer-events:none;
      white-space:nowrap;transition:opacity .4s,transform .4s}`;
  document.head.appendChild(css);

  const el = document.createElement('div');
  el.className = 'pk-chicken';
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Fried chicken Parika (tap me, double-tap to send away)');
  el.innerHTML = `<img src="${src}" alt="" width="189" height="360" decoding="async">`;

  const jokes = ['my favorite snack 🍗', 'extra crispy, extra cute', 'chicken? no, my baby', '24 pieces of perfection', 'catch me if you can 😜'];
  let lastTap = 0, j = 0, x = 0, y = 0, vx = 0, vy = 0, rot = 0, spin = 0, last = 0, running = false;

  function bubble(text = jokes[j++ % jokes.length]) {
    const b = document.createElement('div');
    b.className = 'pk-bubble';
    b.textContent = text;
    document.body.appendChild(b);
    const r = el.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - b.offsetWidth / 2), innerWidth - b.offsetWidth - 8);
    b.style.left = left + 'px';
    b.style.top = Math.max(8, r.top - 40) + 'px';
    setTimeout(() => { b.style.opacity = 0; b.style.transform = 'translateY(-14px)'; }, 1400);
    setTimeout(() => b.remove(), 1900);
  }

  function bye() { // double-tap: a little spin, a wave, and gone
    running = false;
    document.querySelectorAll('.pk-bubble').forEach(b => b.remove());
    bubble('okay okay, bye 👋');
    el.classList.add('bye');
    el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot + 540}deg) scale(.2)`;
    setTimeout(() => el.remove(), 550);
  }

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap < 350) return bye();
    lastTap = now;
    bubble();
    spin += 360;                      // a happy twirl
    const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 30;
    vx = Math.cos(a) * s; vy = Math.sin(a) * s; // and wander off in a new direction
  });

  function tick(t) {
    if (!running) return;
    const dt = Math.min((t - (last || t)) / 1000, 0.05); last = t;
    const w = el.offsetWidth, h = el.offsetHeight;
    // gentle random steering so the path never looks like a screensaver
    vx += (Math.random() - 0.5) * 15 * dt; vy += (Math.random() - 0.5) * 15 * dt;
    const sp = Math.hypot(vx, vy), max = 35, min = 18; // px per second: a slow drift
    if (sp > max) { vx *= 0.98; vy *= 0.98; } else if (sp < min) { vx *= 1.03; vy *= 1.03; }
    x += vx * dt; y += vy * dt;
    if (x < 0) { x = 0; vx = Math.abs(vx); } if (x > innerWidth - w) { x = innerWidth - w; vx = -Math.abs(vx); }
    if (y < 0) { y = 0; vy = Math.abs(vy); } if (y > innerHeight - h) { y = innerHeight - h; vy = -Math.abs(vy); }
    const twirl = spin * Math.min(1, dt * 4); spin -= twirl; rot += twirl;
    const wobble = Math.sin(t / 900) * 8;
    el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot + wobble}deg)`;
    requestAnimationFrame(tick);
  }

  function start() {
    document.body.appendChild(el);
    const w = el.offsetWidth || 60, h = el.offsetHeight || 115;
    if (reduce) { // no drifting: just sit in a corner, still tappable
      el.style.transform = `translate3d(12px,${innerHeight - h - 12}px,0)`;
    } else {
      x = Math.random() * (innerWidth - w); y = innerHeight - h;
      const a = -Math.PI / 2 + (Math.random() - 0.5); vx = Math.cos(a) * 28; vy = Math.sin(a) * 28;
      running = true; requestAnimationFrame(tick);
      document.addEventListener('visibilitychange', () => {
        if (!el.isConnected || el.classList.contains('bye')) return;
        running = !document.hidden; last = 0; if (running) requestAnimationFrame(tick);
      });
    }
    requestAnimationFrame(() => el.classList.add('on'));
  }

  // wait for the opening tap, plus a beat so the gate animation finishes first
  addEventListener('pointerdown', () => setTimeout(start, 2500), { once: true });
})();
