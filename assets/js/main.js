/* Buildless GitHub Pages: only validated assets are requested. */
(() => {
  'use strict';
  const safePath = path => typeof path === 'string' && /^assets\/[a-zA-Z0-9_./-]+$/.test(path) && !path.includes('..');
  const warning = message => {
    const target = document.getElementById('load-warning');
    if (target) { target.textContent = message; target.hidden = false; }
  };
  function mountAsset(slot, asset) {
    if (!asset || asset.status !== 'verified' || !safePath(asset.src)) return;
    const stage = slot.querySelector('[data-stage]');
    if (!stage) return;
    const onFailure = () => warning('One or more media assets could not be loaded.');
    let media;
    if (slot.dataset.kind === 'video') {
      if (!safePath(asset.poster)) return;
      media = stage.querySelector('video');
      if (!media) { media = document.createElement('video'); stage.replaceChildren(media); }
      media.controls = true; media.muted = true; media.defaultMuted = true;
      media.playsInline = true; media.preload = 'none';
      if (media.getAttribute('poster') !== asset.poster) media.poster = asset.poster;
      media.setAttribute('aria-label', asset.alt || asset.caption);
      if (media.getAttribute('src') !== asset.src) media.src = asset.src;
      media.addEventListener('error', onFailure, { once: true });
      // No autoplay, including for users who prefer reduced motion.
    } else {
      let link = stage.querySelector('a');
      media = stage.querySelector('img');
      if (!link || !media) {
        link = document.createElement('a'); media = document.createElement('img');
        link.append(media); stage.replaceChildren(link);
      }
      media.alt = asset.alt || asset.caption; media.loading = 'lazy'; media.decoding = 'async';
      media.addEventListener('error', onFailure, { once: true });
      if (media.getAttribute('src') !== asset.src) media.src = asset.src;
      link.href = asset.src; link.target = '_blank'; link.rel = 'noopener';
      link.setAttribute('aria-label', `Open full-size image: ${media.alt}`);
      slot.querySelectorAll('.full-size-link').forEach(anchor => { anchor.href = asset.src; });
    }
    const caption = slot.querySelector('[data-caption]');
    if (caption && asset.caption) caption.textContent = asset.caption;
    slot.dataset.status = 'verified';
  }
  function renderTable(table, target) {
    if (!target || table?.status !== 'verified_paper' || !Array.isArray(table.rows)) return;
    const fragment = document.createDocumentFragment();
    for (const row of [...(table.reference_rows || []), ...table.rows]) {
      const tr = document.createElement('tr'); if (row.model === 'Full') tr.className = 'full';
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = row.model; tr.append(th);
      for (const metric of table.metrics) {
        const value = row.values[metric.key];
        if (!value || !Number.isFinite(value.mean) || (value.sd !== null && !Number.isFinite(value.sd))) throw new Error('Incomplete results');
        const td = document.createElement('td'); td.append(value.mean.toFixed(metric.decimals));
        if (value.sd !== null) {
          const sd = document.createElement('span'); sd.className = 'metric-sd';
          sd.textContent = ` ± ${value.sd.toFixed(metric.decimals)}`; td.append(sd);
        }
        tr.append(td);
      }
      fragment.append(tr);
    }
    target.replaceChildren(fragment);
  }
  function revealHash() {
    const id = location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const disclosure = target.matches('details') ? target : target.closest('details');
    if (disclosure && !disclosure.hidden) disclosure.open = true;
  }
  async function readJSON(path) {
    const response = await fetch(path); if (!response.ok) throw new Error('Missing content'); return response.json();
  }
  async function initialize() {
    const responses = await Promise.allSettled([readJSON('assets/data/site-content.json'), readJSON('assets/data/results.json')]);
    const contentResult = responses[0];
    if (contentResult.status === 'fulfilled') {
      const content = contentResult.value;
      document.querySelectorAll('[data-asset]').forEach(slot => mountAsset(slot, content.assets?.[slot.dataset.asset]));
      document.querySelectorAll('[data-optional-assets]').forEach(group => {
        group.hidden = !group.dataset.optionalAssets.split(/\s+/).some(id => content.assets?.[id]?.status === 'verified');
      });
      const reviewBar = document.getElementById('review-bar');
      if (reviewBar && content.release_status === 'ready') reviewBar.hidden = true;
    } else warning('Media configuration is unavailable. The embedded media and paper values remain available; use the HTTP preview to load updated metadata.');
    const resultsResult = responses[1];
    if (resultsResult.status === 'fulfilled') {
      try {
        const results = resultsResult.value;
        renderTable(results.main_table, document.querySelector('#main-results tbody'));
        const optionalTable = document.getElementById('optional-results');
        if (optionalTable) {
          optionalTable.hidden = !(results.optional_table?.enabled && results.optional_table?.status === 'verified_paper');
          if (!optionalTable.hidden) renderTable(results.optional_table, optionalTable.querySelector('tbody'));
        }
        if (results.rollout?.status === 'verified_paper') {
          for (const row of [...(results.rollout.reference_models || []), ...(results.rollout.models || [])]) {
            const element = [...document.querySelectorAll('[data-rollout-model]')].find(node => node.dataset.rolloutModel === row.model);
            const metric = row.vehicle_collision;
            if (element && Number.isFinite(metric?.mean) && (metric.sd === null || Number.isFinite(metric.sd))) {
              element.textContent = `${metric.mean.toFixed(2)}${metric.sd === null ? '' : ` ± ${metric.sd.toFixed(2)}`}%`;
            }
          }
        }
      } catch (_) { warning('Updated quantitative data could not be displayed. The paper-verified fallback remains available.'); }
    } else warning('The results data file is unavailable. Values shown below are the paper-verified HTML fallback.');
    revealHash();
  }
  window.addEventListener('hashchange', revealHash);
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target?.matches('details') && !target.hidden) target.open = true;
  }));
  initialize().catch(() => warning('Some page content could not be initialized.'));
})();
