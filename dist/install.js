(() => {
  const guide = document.getElementById('install-guide');
  const dialog = document.getElementById('install-dialog');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const android = /Android/i.test(navigator.userAgent);
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let installPrompt = null;
  guide.hidden = standalone();
  guide.textContent = android ? 'Instalar en mi Android' : ios ? 'Instalar en mi iPhone' : 'Instalar la app';
  if (ios) document.getElementById('install-android').hidden = true;
  if (android) document.getElementById('install-ios').hidden = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    guide.hidden = standalone();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    guide.hidden = true;
    if (dialog.open) dialog.close();
  });
  guide.addEventListener('click', async () => {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = null;
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch {
        dialog.showModal();
      }
    } else dialog.showModal();
  });
  document.getElementById('install-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
})();
