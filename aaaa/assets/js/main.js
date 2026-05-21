(function () {
  const data = window.AAAA_DATA;

  if (!data) {
    console.error("AAAA_DATA introuvable.");
    return;
  }

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char]));
  }

  function setText(selector, value) {
    const element = $(selector);
    if (element && value !== undefined) element.textContent = value;
  }

  function setHref(selector, value) {
    const element = $(selector);
    if (element && value !== undefined) element.setAttribute("href", value);
  }

  function initGlobalContent() {
    document.title = `${data.site.shortName} - ${data.site.fullName}`;
    $$('[data-site-short]').forEach((element) => { element.textContent = data.site.shortName; });
    $$('[data-site-full]').forEach((element) => { element.textContent = data.site.fullName; });
    $$('[data-site-tagline]').forEach((element) => { element.textContent = data.site.tagline; });
    $$('[data-site-email]').forEach((element) => { element.textContent = data.site.contactEmail; });
    $$('[data-site-email-link]').forEach((element) => { element.href = `mailto:${data.site.contactEmail}`; });
    $$('[data-site-year]').forEach((element) => { element.textContent = data.site.year; });
  }

  function initNavigation() {
    const page = document.body.dataset.page;
    const toggle = $('[data-nav-toggle]');
    const menu = $('[data-nav-menu]');

    $$('[data-nav-link]').forEach((link) => {
      if (link.dataset.navLink === page) link.classList.add('is-active');
    });

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    $$('.nav-link', menu).forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function injectScrollDinos() {
    const layer = document.createElement('div');
    layer.className = 'scroll-dino-layer';
    layer.setAttribute('aria-hidden', 'true');

    const dinos = [
      { src: 'assets/img/dinos/pterodactyl.png', side: 'left', top: '12%', threshold: 0.04, size: '118px' },
      { src: 'assets/img/dinos/trex.png', side: 'right', top: '26%', threshold: 0.18, size: '128px' },
      { src: 'assets/img/dinos/brachiosaurus.png', side: 'left', top: '40%', threshold: 0.33, size: '132px' },
      { src: 'assets/img/dinos/diplodocus.png', side: 'right', top: '55%', threshold: 0.48, size: '130px' },
      { src: 'assets/img/dinos/stegosaurus.png', side: 'left', top: '70%', threshold: 0.64, size: '126px' },
      { src: 'assets/img/dinos/parasaurolophus.png', side: 'right', top: '84%', threshold: 0.80, size: '126px' }
    ];

    layer.innerHTML = dinos.map((dino, index) => `
      <div class="scroll-dino ${dino.side}" data-threshold="${dino.threshold}" style="top:${dino.top}; --dino-size:${dino.size}; --delay:${index * 0.12}s;">
        <img src="${dino.src}" alt="" loading="lazy">
      </div>
    `).join('');

    document.body.appendChild(layer);

    const items = $$('.scroll-dino', layer);
    function updateDinos() {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / maxScroll, 1);
      items.forEach((item) => {
        const threshold = Number(item.dataset.threshold || 0);
        item.classList.toggle('is-visible', progress >= threshold);
      });
    }

    updateDinos();
    window.addEventListener('scroll', updateDinos, { passive: true });
    window.addEventListener('resize', updateDinos);
  }

  function renderStats() {
    const grid = $('[data-stats-grid]');
    if (!grid) return;

    grid.innerHTML = data.stats.map((stat) => `
      <div class="stat">
        <strong>${escapeHtml(stat.value)}</strong>
        <span>${escapeHtml(stat.label)}</span>
      </div>
    `).join('');
  }

  function renderMembers() {
    const grid = $('[data-members-grid]');
    if (!grid) return;

    grid.innerHTML = data.members.map((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.trim();
      const hasPhoto = Boolean(member.photo);
      return `
        <article class="card member">
          <div class="avatar">
            ${hasPhoto ? `<img class="avatar-image" src="${escapeHtml(member.photo)}" alt="Photo de ${escapeHtml(fullName)}" loading="lazy" onerror="this.remove(); this.nextElementSibling.classList.remove('is-hidden');">` : ''}
            <div class="avatar-fallback ${hasPhoto ? 'is-hidden' : ''}">${escapeHtml(member.initials || 'AA')}</div>
          </div>
          <h3>${escapeHtml(fullName)}</h3>
          <span class="role">${escapeHtml(member.role)}</span>
          <a class="email" href="mailto:${escapeHtml(member.email)}">${escapeHtml(member.email)}</a>
        </article>
      `;
    }).join('');
  }

  function renderGoalCards(limit) {
    const grid = $('[data-goals-grid]');
    if (!grid) return;
    const goals = typeof limit === 'number' ? data.goals.slice(0, limit) : data.goals;
    grid.innerHTML = goals.map((goal) => `
      <a class="card card-link" href="but.html?id=${encodeURIComponent(goal.id)}">
        <article>
          <div class="icon" aria-hidden="true">${escapeHtml(goal.icon)}</div>
          <h3>${escapeHtml(goal.title)}</h3>
          <p>${escapeHtml(goal.shortText)}</p>
          <span class="read-more">Découvrir →</span>
        </article>
      </a>
    `).join('');
  }

  function renderGoalDetail() {
    const container = $('[data-goal-detail]');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const goal = data.goals.find((item) => item.id === requestedId) || data.goals[0];

    const pageTitle = $('[data-goal-page-title]');
    if (pageTitle) pageTitle.textContent = goal.title;
    const pageLead = $('[data-goal-page-lead]');
    if (pageLead) pageLead.textContent = goal.shortText;

    container.innerHTML = `
      <article class="detail-card">
        <div class="detail-icon" aria-hidden="true">${escapeHtml(goal.icon)}</div>
        <p class="eyebrow">But de l'association</p>
        <h2>${escapeHtml(goal.title)}</h2>
        <p>${escapeHtml(goal.intro)}</p>
        <ul>
          ${goal.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      </article>
    `;
  }

  function initHome() {
    setText('[data-home-eyebrow]', data.home.eyebrow);
    setText('[data-home-title-start]', data.home.titleStart);
    setText('[data-home-title-highlight]', data.home.titleHighlight);
    setText('[data-home-title-end]', data.home.titleEnd);
    setText('[data-home-lead]', data.home.lead);
    setText('[data-home-presentation-title]', data.home.presentationTitle);
    setText('[data-home-presentation-text]', data.home.presentationText);
    setText('[data-home-primary-button]', data.home.primaryButton);
    setText('[data-home-secondary-button]', data.home.secondaryButton);
    setHref('[data-home-primary-link]', 'buts.html');
    setHref('[data-home-secondary-link]', 'contact.html');
  }

  function initPageCopy() {
    setText('[data-bureau-eyebrow]', data.bureauPage?.eyebrow);
    setText('[data-bureau-title]', data.bureauPage?.title);
    setText('[data-bureau-lead]', data.bureauPage?.lead);

    setText('[data-goals-eyebrow]', data.goalsPage?.eyebrow);
    setText('[data-goals-title]', data.goalsPage?.title);
    setText('[data-goals-lead]', data.goalsPage?.lead);

    setText('[data-contact-eyebrow]', data.contactPage?.eyebrow);
    setText('[data-contact-title]', data.contactPage?.title);
    setText('[data-contact-lead]', data.contactPage?.lead);
  }

  function renderContactCards() {
    const grid = $('[data-contact-cards]');
    if (!grid || !data.contactPage?.cards) return;
    grid.innerHTML = data.contactPage.cards.map((card) => `
      <article class="card contact-card">
        <div class="icon" aria-hidden="true">✉️</div>
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.text)}</p>
        <a class="button secondary contact-card-button" href="mailto:${encodeURIComponent(data.site.contactEmail)}?subject=${encodeURIComponent(card.subject || '')}">${escapeHtml(card.label)}</a>
      </article>
    `).join('');
  }

  initGlobalContent();
  initNavigation();
  injectScrollDinos();
  initHome();
  initPageCopy();
  renderStats();
  renderMembers();
  renderGoalCards(document.body.dataset.goalPreview === 'limited' ? 3 : undefined);
  renderGoalDetail();
  renderContactCards();
}());
