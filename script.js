// Rebind homepage tabs whenever navigation inserts a new main section.
let tabs = [];

function selectTab(selectedTab, updateAddress = true) {
  for (const tab of tabs) {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  }

  if (updateAddress) {
    const section = selectedTab.id === 'past-tab' ? 'past-projects' : 'projects';
    writeRoute(currentPage, section, false);
  }
}

function handleTabKeydown(event) {
  const index = tabs.indexOf(event.currentTarget);
  let nextIndex;

  switch (event.key) {
    case 'ArrowRight': nextIndex = (index + 1) % tabs.length; break;
    case 'ArrowLeft': nextIndex = (index + tabs.length - 1) % tabs.length; break;
    case 'Home': nextIndex = 0; break;
    case 'End': nextIndex = tabs.length - 1; break;
    default: return;
  }

  event.preventDefault();
  selectTab(tabs[nextIndex]);
  tabs[nextIndex].focus();
}

function initialiseTabs(section) {
  tabs = [...document.querySelectorAll('[role="tab"]')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', handleTabKeydown);
  }

  if (tabs.length) {
    const tabId = section === 'past-projects' ? 'past-tab' : 'current-tab';
    selectTab(document.getElementById(tabId), false);
  }
}

// Replace page content during internal navigation.
// Standalone HTML links still work when JavaScript is unavailable.
const pages = window.portfolioPages || {};
const siteDirectory = new URL('.', location.href);
const usesLocalFiles = location.protocol === 'file:';
const initialFilename = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
let currentPage = pages[initialFilename] ? initialFilename : 'index.html';
let currentSection = '';

function readRoute() {
  // Hash routes work when the site is opened directly from the Desktop.
  if (usesLocalFiles && location.hash.startsWith('#/')) {
    const route = new URL(location.hash.slice(2), 'https://portfolio.invalid/');
    const page = decodeURIComponent(route.pathname.slice(1));
    if (pages[page]) {
      return { page, section: route.searchParams.get('section') || '' };
    }
  }

  const page = usesLocalFiles
    ? initialFilename
    : decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
  return { page, section: decodeURIComponent(location.hash.slice(1)) };
}

function writeRoute(page, section, push) {
  let address;
  if (usesLocalFiles) {
    address = `#/${page}${section ? `?section=${encodeURIComponent(section)}` : ''}`;
  } else {
    address = new URL(page, siteDirectory);
    address.hash = section;
    address = address.href;
  }

  const state = { portfolio: { page, section } };
  if (push) {
    history.pushState(state, '', address);
  } else {
    history.replaceState(state, '', address);
  }
  currentSection = section;
}

function replaceFragment(selector, markup) {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  document.querySelector(selector).replaceWith(template.content.firstElementChild);
}

function scrollToSection(section) {
  const targetId = section === 'past-projects' ? 'projects' : section;
  const target = targetId ? document.getElementById(targetId) : null;
  if (target) {
    target.scrollIntoView();
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function showPage(page, section = '', moveFocus = true) {
  const content = pages[page];
  if (!content) {
    return;
  }

  const changedPage = page !== currentPage;
  if (changedPage) {
    replaceFragment('header.header', content.header);
    replaceFragment('main', content.main);
    replaceFragment('footer.footer', content.footer);
    document.title = content.title;
    document.querySelector('meta[name="description"]').setAttribute('content', content.description);
    currentPage = page;
    initialiseTabs(section);
  } else if (tabs.length) {
    const tabId = section === 'past-projects' ? 'past-tab' : 'current-tab';
    selectTab(document.getElementById(tabId), false);
  }

  currentSection = section;
  document.getElementById('year').textContent = new Date().getFullYear();

  if (changedPage && moveFocus) {
    const main = document.querySelector('main');
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
  }
  scrollToSection(section);
}

function routeForLink(anchor) {
  const href = anchor.getAttribute('href');
  if (!href) {
    return null;
  }
  if (href.startsWith('#')) {
    return { page: currentPage, section: decodeURIComponent(href.slice(1)) };
  }

  const target = new URL(href, siteDirectory);
  if (target.protocol !== siteDirectory.protocol || target.host !== siteDirectory.host) {
    return null;
  }
  if (new URL('.', target).pathname !== siteDirectory.pathname || target.search) {
    return null;
  }

  const page = decodeURIComponent(target.pathname.split('/').pop()) || 'index.html';
  return pages[page] ? { page, section: decodeURIComponent(target.hash.slice(1)) } : null;
}

// Delegate link handling so new project pages need no new navigation listeners.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }

  const anchor = event.target.closest('a[href]');
  if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) {
    return;
  }

  const route = routeForLink(anchor);
  if (!route) {
    return;
  }

  event.preventDefault();
  if (route.page !== currentPage || route.section !== currentSection) {
    writeRoute(route.page, route.section, true);
  }
  showPage(route.page, route.section);
});

function restoreRoute() {
  const route = readRoute();
  showPage(route.page, route.section);
}

window.addEventListener('popstate', restoreRoute);
window.addEventListener('hashchange', restoreRoute);

const initialRoute = readRoute();
initialiseTabs(initialRoute.section);
if (initialRoute.page !== currentPage) {
  showPage(initialRoute.page, initialRoute.section, false);
} else {
  currentSection = initialRoute.section;
  document.getElementById('year').textContent = new Date().getFullYear();
  if (initialRoute.section) {
    scrollToSection(initialRoute.section);
  }
}
