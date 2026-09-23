(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-set-theme]')];
  const allowedThemes = new Set(['light', 'system', 'dark']);

  function setTheme(theme, persist = true) {
    const nextTheme = allowedThemes.has(theme) ? theme : 'system';
    root.dataset.theme = nextTheme;
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setTheme === nextTheme));
    });
    if (persist) localStorage.setItem('theme', nextTheme);
  }

  let storedTheme = 'system';
  try { storedTheme = localStorage.getItem('theme') || 'system'; } catch (_) {}
  setTheme(storedTheme, false);
  buttons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.setTheme)));

  document.getElementById('year').textContent = new Date().getFullYear();

  const chart = document.getElementById('contribution-chart');
  const total = document.getElementById('contribution-total');
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  function renderContributions(data) {
    const contributions = data.contributions || [];
    chart.replaceChildren(...contributions.map((item) => {
      const day = document.createElement('span');
      day.className = 'contribution-day';
      day.dataset.level = item.level;
      day.title = `${item.count} contribution${item.count === 1 ? '' : 's'} on ${formatter.format(new Date(`${item.date}T12:00:00`))}`;
      day.setAttribute('aria-hidden', 'true');
      return day;
    }));
    const count = data.total?.lastYear ?? contributions.reduce((sum, day) => sum + day.count, 0);
    total.textContent = `${count.toLocaleString()} contributions in the last year`;
    chart.setAttribute('aria-label', `${count.toLocaleString()} GitHub contributions in the past year. Open Joe Gasper's GitHub profile for daily details.`);
  }

  fetch('https://github-contributions-api.jogruber.de/v4/joegasper?y=last')
    .then((response) => {
      if (!response.ok) throw new Error('Contribution data unavailable');
      return response.json();
    })
    .then(renderContributions)
    .catch(() => {
      total.innerHTML = '<a href="https://github.com/joegasper">View current activity on GitHub ↗</a>';
      chart.remove();
    });
})();
