const rootEl = document.querySelector(`:root`);
const defaultTheme = rootEl.dataset.theme;

const DARK_THEME_NAME = `dark`;
const LIGHT_THEME_NAME = `light`;
const RESET_THEME_NAME = `RESET_THEME`;
const DEFAULT_THEME_NAME = defaultTheme || LIGHT_THEME_NAME;

function getDefaultTheme() {
  const systemPrefersDarkMode = window.matchMedia(`(prefers-color-scheme:dark)`)
    .matches;
  if (systemPrefersDarkMode) {
    return DARK_THEME_NAME;
  }

  return DEFAULT_THEME_NAME;
}

function getTheme() {
  // If user took time to enable dark theme on their device, respect their choice!
  const systemPrefersDarkMode = window.matchMedia(`(prefers-color-scheme:dark)`)
    .matches;
  const themeLocal = localStorage.getItem(`theme`);

  // User set > system
  if (themeLocal === LIGHT_THEME_NAME) {
    return LIGHT_THEME_NAME;
  }
  if (themeLocal === DARK_THEME_NAME || systemPrefersDarkMode) {
    return DARK_THEME_NAME;
  }
  return DEFAULT_THEME_NAME;
}

function isThemeValid(mode) {
  return [LIGHT_THEME_NAME, DARK_THEME_NAME].includes(mode);
}

function setTheme(mode) {
  if (mode === RESET_THEME_NAME) {
    return rootEl.setAttribute(`data-theme`, getDefaultTheme());
  }
  const isValid = isThemeValid(mode);
  if (isValid) {
    rootEl.setAttribute(`data-theme`, mode);
    window.CURRENT_THEME = mode;
  }
}

function storeThemePreference(mode) {
  if (mode === RESET_THEME_NAME) {
    return localStorage.removeItem(`theme`);
  }

  let isValid = isThemeValid(mode);
  // nullify if falsy value
  if (!mode) {
    isValid = true;
    // eslint-disable-next-line no-param-reassign
    mode = ``;
  }
  if (isValid) localStorage.setItem(`theme`, mode);
}
function startListeningToOSTheme() {
  const matchMediaPrefDark = window.matchMedia(`(prefers-color-scheme: dark)`);
  matchMediaPrefDark.addEventListener(`change`, setTheme(getTheme()));
}

function init() {
  window.DARK_THEME_NAME = DARK_THEME_NAME;
  window.LIGHT_THEME_NAME = LIGHT_THEME_NAME;
  window.DEFAULT_THEME_NAME = DEFAULT_THEME_NAME;
  window.RESET_THEME_NAME = RESET_THEME_NAME;
  window.setTheme = setTheme;
  window.storeThemePreference = storeThemePreference;

  setTheme(getTheme());

  startListeningToOSTheme();
  // TIP: avoid local storage events, if possible.
  window.addEventListener(`storage`, () => {
    // nobody needs this, but dev for devs!
    const themeLocal = window.localStorage.getItem(`theme`);
    setTheme(themeLocal);
    // Defaulters not welcome!
    if (!isThemeValid(themeLocal)) {
      storeThemePreference(RESET_THEME_NAME);
    }
  });
}

init();
