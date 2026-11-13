/* Progressive enhancement: without JavaScript, thumbnails open the original GIFs. */
(() => {
  'use strict';

  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const cards = Array.from(gallery.querySelectorAll('figure[data-gif]'));
  const form = document.getElementById('gallery-filters');
  const search = document.getElementById('gallery-search');
  const category = document.getElementById('gallery-category');
  const count = document.getElementById('gallery-count');
  const empty = document.getElementById('gallery-empty');
  const dialog = document.getElementById('gif-modal');
  const image = document.getElementById('gif-modal-img');
  const caption = document.getElementById('gif-modal-caption');
  const position = document.getElementById('gif-modal-position');
  const original = document.getElementById('gif-original');
  const close = document.getElementById('gif-modal-close');
  const previous = document.getElementById('gif-modal-prev');
  const next = document.getElementById('gif-modal-next');
  let visible = [...cards];
  let current = 0;
  let returnFocus = null;
  let previousOverflow = '';

  const normalize = (value) => value.toLowerCase().replace(/[\/\s-]+/g, ' ').trim();
  const searchable = new Map(cards.map(card => [card, normalize([
    card.dataset.scene, Number(card.dataset.scene), card.dataset.tags,
    card.dataset.gifCaption, card.textContent
  ].join(' '))]));

  function filter() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    visible = cards.filter(card => {
      const categoryMatch = category.value === 'all' || card.dataset.tags.split(' ').includes(category.value);
      const match = categoryMatch && words.every(word => searchable.get(card).includes(word));
      card.hidden = !match;
      return match;
    });
    count.textContent = `${visible.length} of ${cards.length} scenes`;
    empty.hidden = visible.length !== 0;
  }

  if (form && search && category && count && empty) {
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filter);
    category.addEventListener('change', filter);
    form.addEventListener('reset', event => {
      event.preventDefault();
      search.value = '';
      category.value = 'all';
      filter();
      search.focus();
    });
  }

  // Keep direct GIF links usable when native dialogs are unavailable.
  if (!dialog || typeof dialog.showModal !== 'function' || !image || !caption || !position || !original || !close || !previous || !next) return;

  function renderScene(index) {
    current = (index + visible.length) % visible.length;
    const card = visible[current];
    image.src = card.dataset.gif;
    image.alt = `${card.dataset.gifCaption}: denoising visualization`;
    caption.textContent = card.dataset.gifCaption;
    position.textContent = `${current + 1} of ${visible.length} visible scenes`;
    original.href = card.dataset.gif;
    previous.disabled = visible.length < 2;
    next.disabled = visible.length < 2;
  }

  gallery.addEventListener('click', event => {
    const link = event.target.closest('.ll-thumb-link');
    if (!link || !gallery.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const card = link.closest('figure[data-gif]');
    const index = visible.indexOf(card);
    if (index < 0) return;
    event.preventDefault();
    returnFocus = link;
    previousOverflow = document.body.style.overflow;
    renderScene(index);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    close.focus();
  });

  close.addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => renderScene(current - 1));
  next.addEventListener('click', () => renderScene(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    image.alt = '';
    document.body.style.overflow = previousOverflow;
    returnFocus?.focus();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      renderScene(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
