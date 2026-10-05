window.addEventListener('hashchange', () => location.reload());
(async () => {
  'use strict';
  const target = document.getElementById('shortlist-content');
  const {escape:e, money} = Serandib;
  try {
    const payload = Serandib.readShared();
    if (!payload) {
      if (new URLSearchParams(location.search).has('id')) throw new Error('This older saved link is not supported by this version. Please create a new shortlist in the venue finder.');
      const rows = Serandib.savedLists();
      target.innerHTML = '<p class="notice">Saved on this browser only. Keep a share link to open a list on another device. Clearing browser data removes saved lists. Up to 30 recent lists are kept.</p>' + (rows.length ? '<div class="saved-list">' + rows.map(row => `<article class="saved-card"><p class="eyebrow">${e(row.payload.settings.city)} · ${row.payload.settings.year}</p><h2>${row.payload.ids.length} possibilities</h2><p>${money(row.payload.settings.budget)} · ${row.payload.settings.guests} guests</p><a class="text-link" href="${e(Serandib.shortlistURL(row.payload))}">Open shortlist</a></article>`).join('') + '</div><button type="button" class="outline-button" id="clear-saved">Clear saved lists from this browser</button><p id="clear-status" role="status"></p>' : '<p>No saved lists yet. Select up to three options in the venue finder, then choose “Save & share”.</p>');
      document.getElementById('clear-saved')?.addEventListener('click', () => {
        if (Serandib.storage.remove('shortlists')) location.reload();
        else document.getElementById('clear-status').textContent = 'Browser storage is unavailable. Use your browser settings to clear site data.';
      });
      return;
    }
    const data = await Serandib.directory(), settings = payload.settings;
    const list = payload.ids.map(id => {
      for (const venue of data.venues) {
        if (id === 'venue__' + venue.id) return SerandibVenueEngine.estimate(venue, {id, name:'Venue quotation', kind:'quote', taxNote:'Request the full price, taxes and inclusions.'}, settings);
        const p = venue.packages.find(p => p.id === id);
        if (p) return SerandibVenueEngine.estimate(venue, p, settings);
      }
      return {removed:true};
    });
    const params = new URLSearchParams({...settings, ids:payload.ids.join(',')});
    target.innerHTML = `<div class="notice"><strong>${e(settings.city)} · ${settings.year} · ${settings.guests} guests</strong><p>Venue allowance: ${money(settings.budget)}. Prices are recalculated from the current directory and still need a hotel quote. Anyone with this link can view the selections and search details.</p></div><div class="action-row"><button type="button" class="button" id="share-list">Share this shortlist</button><button type="button" class="outline-button" id="save-list">Save on this browser</button><a class="text-link" href="venues.html?${e(params.toString())}">Refine these choices</a><a class="text-link" href="${e(Serandib.shortlistURL(payload, 'consultation.html'))}">Discuss your shortlist</a></div><p id="share-status" role="status"></p><div class="saved-list">${list.map(i => i.removed ? '<article class="saved-card"><h2>A package has changed.</h2><p>This package is no longer listed. Ask Serandib for current options.</p></article>' : `<article class="saved-card"><p class="eyebrow">${e(i.venue.city)}</p><h2>${e(i.venue.name)}</h2><h3>${e(i.package.name)}</h3><p>${i.subtotal === null ? 'Quote required' : money(i.subtotal) + ' published subtotal'}</p><p>${e(i.package.taxNote)}</p><p>${i.status === 'potential' ? 'Potential fit; final quote and date availability need confirmation.' : e(i.reasons.join(' ') || 'Above this budget.')}</p><a class="text-link" href="venue.html?id=${encodeURIComponent(i.venue.id)}">View venue & source details</a></article>`).join('')}</div>`;
    document.getElementById('save-list').addEventListener('click', () => {
      const saved = Serandib.saveShortlist(payload);
      document.getElementById('share-status').textContent = saved.persisted ? 'Saved on this browser.' : 'Browser storage is unavailable. Keep the share link to return to this list.';
    });
    document.getElementById('share-list').addEventListener('click', async () => {
      const status = document.getElementById('share-status'), url = Serandib.shortlistURL(payload);
      try {
        if (navigator.share) await navigator.share({title:'Our Serandib wedding shortlist', url});
        else { await navigator.clipboard.writeText(url); status.textContent = 'Link copied.'; }
      } catch (error) {
        if (error.name === 'AbortError') return;
        const field = document.createElement('textarea'); field.readOnly = true; field.value = url; field.setAttribute('aria-label', 'Shortlist share link');
        status.replaceChildren(document.createTextNode('Copy this complete link: '), field); field.focus(); field.select();
      }
    });
  } catch (error) { target.innerHTML = '<div class="notice">' + e(error.message) + '</div>'; }
})();
