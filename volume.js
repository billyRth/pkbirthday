// Volume slider for the music button. Talks to the page's YouTube player without touching the page's own code.
// iPhones/iPads ignore volume set from a web page (only the hardware buttons work), so the slider is hidden there.
(() => {
  const iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const btn = document.getElementById('music');
  if (iOS || !btn) return;

  const css = document.createElement('style');
  css.textContent = `
    .pk-vol{width:72px;height:18px;margin:0 2px 0 4px;accent-color:currentColor;cursor:pointer;flex:none;vertical-align:middle}
    @media (max-width:360px){.pk-vol{width:56px}}`;
  document.head.appendChild(css);

  const vol = document.createElement('input');
  Object.assign(vol, { type: 'range', min: 0, max: 100, step: 1, value: 70, className: 'pk-vol' });
  vol.setAttribute('aria-label', 'Music volume');
  // keep slider gestures from also toggling mute on the button underneath
  ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown'].forEach((t) => vol.addEventListener(t, (e) => e.stopPropagation()));

  const player = () => {
    const f = document.querySelector('iframe[src*="youtube"]');
    return f && window.YT && YT.get ? YT.get(f.id) : null;
  };
  vol.addEventListener('input', () => {
    const p = player();
    if (p && p.setVolume) p.setVolume(+vol.value); // mute stays the button's job, so its label never goes stale
  });

  btn.appendChild(vol);
})();
