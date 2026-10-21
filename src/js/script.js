'use strict';

// Progressive enhancement: every page and all projects remain readable without JS.
document.documentElement.classList.add('js');

function initNavigation() {
  const button = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  if (!button || !navigation) return;
  const close = () => setMenuState(button, navigation, false);
  button.addEventListener('click', () => {
    setMenuState(button, navigation, button.getAttribute('aria-expanded') !== 'true');
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  bindMenuDismissal(button, navigation, close);
}

function setMenuState(button, navigation, open) {
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  navigation.classList.toggle('open', open);
}

function bindMenuDismissal(button, navigation, close) {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || button.getAttribute('aria-expanded') !== 'true') return;
    close();
    button.focus();
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target) && !button.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (!navigation.contains(event.target) && !button.contains(event.target)) close();
  });
  const desktop = window.matchMedia('(min-width: 901px)');
  if (desktop.addEventListener) desktop.addEventListener('change', close);
  else desktop.addListener(close);
}

function initProjectFilters() {
  const controls = document.querySelector('[data-project-filters]');
  if (!controls) return;
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-project]')];
  controls.hidden = false;
  const selected = new URLSearchParams(window.location.search).get('filtre') || 'tous';
  const initial = buttons.some(button => button.dataset.filter === selected) ? selected : 'tous';
  applyProjectFilter(initial, buttons, projects);
  buttons.forEach(button => button.addEventListener('click', () => {
    applyProjectFilter(button.dataset.filter, buttons, projects);
    updateFilterUrl(button.dataset.filter);
  }));
}

function applyProjectFilter(filter, buttons, projects) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  projects.forEach(project => {
    project.hidden = filter !== 'tous' && !project.dataset.categories.split(' ').includes(filter);
  });
  const count = projects.filter(project => !project.hidden).length;
  const status = document.querySelector('[data-project-count]');
  if (status) status.textContent = `${count} projet${count > 1 ? 's' : ''} présenté${count > 1 ? 's' : ''}`;
}

function updateFilterUrl(filter) {
  const url = new URL(window.location.href);
  if (filter === 'tous') url.searchParams.delete('filtre');
  else url.searchParams.set('filtre', filter);
  // Some browsers restrict history changes when index.html is opened as a file.
  try { window.history.replaceState(null, '', url); } catch { /* Filtering still works. */ }
}

function initCopyButtons() {
  document.querySelectorAll('.copy-button, .copy-email').forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.dataset.email || button.parentElement.querySelector('code')?.textContent.trim();
      if (!text) return;
      const copied = await copyText(text);
      const message = copied ? 'Copié dans le presse-papiers.' : 'Copie indisponible : sélectionnez le texte, puis copiez-le.';
      announceCopy(button, message);
    });
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Try local-file fallback. */ }
  }
  return copyWithSelection(text);
}

function copyWithSelection(text) {
  const active = document.activeElement;
  const input = document.createElement('textarea');
  input.value = text;
  input.style.cssText = 'position:fixed;left:-9999px;top:0;';
  input.setAttribute('aria-label', 'Texte à copier');
  document.body.append(input);
  input.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* Display a useful fallback message. */ }
  input.remove();
  if (active instanceof HTMLElement) active.focus({ preventScroll: true });
  return copied;
}

function announceCopy(button, message) {
  const container = button.parentElement;
  let feedback = container.querySelector('.copy-feedback');
  if (!feedback) {
    feedback = document.createElement('span');
    feedback.className = 'copy-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    container.append(feedback);
  }
  feedback.textContent = message;
}

function initVideos() {
  const videos = [...document.querySelectorAll('video')];
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
}

initNavigation();
initProjectFilters();
initCopyButtons();
initVideos();
