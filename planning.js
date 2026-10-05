(() => {
  'use strict';
  const form = document.getElementById('budget-planner');
  const categories = [['venue','Hotel / venue'], ['planning','Planning & coordination'], ['attire','Attire & beauty'], ['photography','Photography & video'], ['design','Flowers & styling'], ['other','Ceremonies, travel & other costs'], ['contingency','Contingency']];
  const tasks = ['Agree on a guest estimate and overall budget', 'Request written venue quotes and confirm inclusions', 'Agree on the planning scope and key suppliers', 'Confirm ceremony, food and accessibility needs', 'Review guest replies and final numbers', 'Confirm payment dates and the wedding-day running order'];
  document.getElementById('budget-allocations').innerHTML = categories.map(([key,label]) => `<label>${label} (LKR)<input name="${key}" type="number" min="0" max="1000000000" value="0" required step="1" inputmode="numeric"></label>`).join('');
  const note = document.createElement('p'); note.className = 'small-note'; note.id = 'plan-save-status'; note.setAttribute('role','status'); form.append(note);
  const checklist = document.createElement('fieldset'); checklist.className = 'admin-package';
  checklist.innerHTML = '<legend>Your planning checklist</legend>' + tasks.map((text,i) => `<label class="check-label"><input type="checkbox" name="task-${i}">${text}</label>`).join('');
  form.append(checklist);
  const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'outline-button'; clear.textContent = 'Reset saved plan'; form.append(clear);
  const saved = Serandib.storage.read('plan');
  if (saved && typeof saved === 'object') {
    for (const key of ['total', ...categories.map(([key]) => key)]) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0 && saved[key] <= 1e9) form.elements[key].value = saved[key];
    }
    tasks.forEach((_,i) => form.elements['task-'+i].checked = saved['task-'+i] === true);
  }
  function update(persist = false) {
    const total = Number(form.elements.total.value);
    const spent = categories.reduce((n,[key]) => n + Number(form.elements[key].value), 0);
    const balance = total - spent;
    document.getElementById('budget-balance').textContent = balance >= 0 ? Serandib.money(balance) + ' still to allocate' : Serandib.money(-balance) + ' above your total budget';
    if (persist) {
      const value = Object.fromEntries(['total', ...categories.map(([key]) => key)].map(key => [key, Number(form.elements[key].value)]));
      tasks.forEach((_,i) => value['task-'+i] = form.elements['task-'+i].checked);
      note.textContent = Serandib.storage.write('plan', value) ? 'Saved on this browser. Clear browser data to remove it, or use Reset saved plan.' : 'Browser saving is unavailable. Print this plan to keep a copy.';
    }
    return balance;
  }
  form.addEventListener('input', () => update(true));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (update(true) < 0) { document.getElementById('budget-balance').textContent += ' — adjust your allowances before continuing.'; return; }
    const venue = Number(form.elements.venue.value);
    if (venue < 1) { form.elements.venue.setCustomValidity('Enter a hotel / venue allowance.'); form.elements.venue.reportValidity(); return; }
    location.href = 'venues.html?budget=' + venue;
  });
  form.elements.venue.addEventListener('input', () => form.elements.venue.setCustomValidity(''));
  clear.addEventListener('click', () => {
    if (!Serandib.storage.remove('plan')) { note.textContent = 'Could not clear browser storage. Use your browser’s site-data settings.'; return; }
    form.reset(); form.elements.venue.setCustomValidity(''); update(); note.textContent = 'Saved plan cleared.';
  });
  document.getElementById('print-plan').addEventListener('click', () => window.print());
  note.textContent = saved ? 'Your saved plan has been restored from this browser.' : 'Your edits are saved on this browser when storage is available.';
  update();
})();
