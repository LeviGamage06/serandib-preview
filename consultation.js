window.addEventListener('hashchange', () => location.reload());
(() => {
  'use strict';
  const form = document.getElementById('consultation-form');
  const status = document.getElementById('consultation-status');
  const sendButton = form.querySelector('[type="submit"]');
  const params = new URLSearchParams(location.search);
  let sending = false;
  let shortlist = null;
  form.querySelectorAll('button').forEach(button => button.disabled = false);
  // FormSubmit needs an absolute callback URL. Never include contact details in URLs.
  form.elements._next.value = new URL('thank-you.html', location.href).href;
  form.elements._url.value = new URL('consultation.html', location.href).href;
  if ([...form.elements.service.options].some(o => o.value === params.get('service'))) form.elements.service.value = params.get('service');
  try {
    shortlist = Serandib.readShared();
    if (shortlist) {
      const s = shortlist.settings;
      form.elements.service.value = 'Venue shortlisting';
      form.elements.location.value = s.city;
      form.elements.guests.value = s.guests;
      form.elements.date.value = s.date || String(s.year);
      const names = shortlist.ids.map(id => {
        for (const venue of window.SerandibVenueData.venues) {
          if (id === 'venue__' + venue.id) return venue.name;
          const p = venue.packages.find(p => p.id === id);
          if (p) return venue.name + ' — ' + p.name;
        }
        return id + ' (no longer listed; please confirm)';
      });
      form.elements.shortlisted_venues.value = names.join('\n');
      form.elements.shortlist_link.value = Serandib.shortlistURL(shortlist);
      const note = document.createElement('p');
      note.className = 'notice';
      note.textContent = `Your ${shortlist.ids.length} shortlisted selections will be included in your enquiry.`;
      form.prepend(note);
    } else if (params.has('shortlist')) {
      status.textContent = 'This older shortlist link cannot be loaded. Please describe your chosen venues in the message.';
    }
  } catch (error) { status.textContent = error.message; }
  for (const name of ['names', 'email']) {
    form.elements[name].addEventListener('input', () => form.elements[name].setCustomValidity(''));
  }
  function valid() {
    for (const name of ['names', 'email']) {
      form.elements[name].value = form.elements[name].value.trim();
      form.elements[name].setCustomValidity(form.elements[name].value ? '' : 'Please enter your details.');
    }
    return form.reportValidity() && !form.elements._honey.value;
  }
  form.addEventListener('submit', event => {
    if (sending || !valid()) { event.preventDefault(); return; }
    if (!['http:', 'https:'].includes(location.protocol)) {
      event.preventDefault();
      status.textContent = 'Please open the hosted website to send an enquiry, or use WhatsApp or email below.';
      return;
    }
    sending = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending enquiry…';
    status.textContent = 'Continuing to the secure submission service. Complete the spam-prevention check if asked. Your enquiry is not confirmed until submission completes.';
    // Allow the browser's standard HTTPS POST. FormSubmit handles verification,
    // delivery and errors, then returns to thank-you.html. No mail client required.
  });
  window.addEventListener('pageshow', () => {
    sending = false;
    sendButton.disabled = false;
    sendButton.textContent = 'Send enquiry';
    if (status.textContent.startsWith('Continuing to')) status.textContent = 'If your previous submission did not finish, you can try again or contact us below.';
  });
  function draft(channel) {
    if (!valid()) return;
    const b = Object.fromEntries(new FormData(form));
    const lines = ['Hello Chami & Levi, we would love to discuss our wedding.',
      `Names: ${b.names}`, `Email: ${b.email}`, `Phone / WhatsApp: ${b.phone || 'Not provided'}`,
      `Date: ${b.date || 'Still deciding'}`, `Location: ${b.location || 'Open to ideas'}`,
      `Guests: ${b.guests || 'Still deciding'}`, `Support: ${b.service}`,
      `Preferred language: ${b.language}`, b.vision || ''];
    if (b.shortlisted_venues) lines.push('Shortlist: ' + b.shortlisted_venues, b.shortlist_link);
    const message = lines.filter(Boolean).join('\n');
    const url = channel === 'email'
      ? 'mailto:serandib.enquiries@gmail.com?subject=' + encodeURIComponent('Wedding planning enquiry') + '&body=' + encodeURIComponent(message)
      : 'https://wa.me/94707675485?text=' + encodeURIComponent(message);
    const link = document.createElement('a');
    link.href = url;
    link.textContent = channel === 'email' ? 'Open email draft' : 'Open WhatsApp draft';
    if (channel !== 'email') { link.target = '_blank'; link.rel = 'noopener'; }
    const preview = document.createElement('textarea');
    preview.readOnly = true; preview.rows = 10; preview.value = message;
    preview.setAttribute('aria-label', 'Your enquiry message — copy if the app does not open');
    const copy = document.createElement('button');
    copy.type = 'button'; copy.className = 'outline-button'; copy.textContent = 'Copy message';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(message); copy.textContent = 'Message copied'; }
      catch { preview.focus(); preview.select(); copy.textContent = 'Select and copy the message below'; }
    });
    status.replaceChildren(document.createTextNode('Alternative draft ready. This draft has not been sent. Open your app and press Send, or use the main Send enquiry button above. '), link, document.createElement('br'), copy, preview);
  }
  document.getElementById('email-draft').addEventListener('click', () => draft('email'));
  document.getElementById('whatsapp-draft').addEventListener('click', () => draft('whatsapp'));
})();
