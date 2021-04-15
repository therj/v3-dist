const goDark = document.querySelector(`.goDark`);
const goLight = document.querySelector(`.goLight`);
const navBar = document.querySelector(`nav`);
const navPoly = document.querySelector(`.nav__poly`);
// const navHam = document.querySelector(`.nav__ham`);
const navToggleCheckbox = document.querySelector(`input.nav__toggle`);
// const navMenu = document.querySelector(`.nav__menu`);

// const storeThemePreference = window.storeThemePreference;
// const setTheme = window.setTheme;
const currentTheme = window.CURRENT_THEME;
// const DARK_THEME_NAME = window.DARK_THEME_NAME
// const LIGHT_THEME_NAME = window.LIGHT_THEME_NAME

const NAV_POLY_SCROLL_SHOW = 32; // 24;
const NAV_POLY_SCROLL_HIDE = 48; // 48
// hide nav scroll position Y!
const HIDE_NAV_SCROLL_POS = 256;

function setThemeIcons(_mode) {
  // if (mode == LIGHT_THEME_NAME) {
  //   goLight.classList.add('hidden')
  //   goDark.classList.remove('hidden')
  // }
  // else if (mode == DARK_THEME_NAME) {
  //   goDark.classList.add('hidden')
  //   goLight.classList.remove('hidden')
  // }
}

let prevScroll = window.scrollY || document.documentElement.scrollTop;
let curScroll;
let direction = 0;
let prevDirection = 0;
function toggleHeader(dirCurrent, scroll) {
  if (dirCurrent === `DOWN` && scroll > HIDE_NAV_SCROLL_POS) {
    // replace HIDE_NAV_SCROLL_POS with height of your header in px
    navBar.classList.add(`nav--hide`);
    // hide ploygon explicitly -> shouldn't come back on reverse scroll
    if (navPoly) navPoly.classList.add(`nav__poly--hide`);
    prevDirection = dirCurrent;
  } else if (dirCurrent === `UP`) {
    navBar.classList.remove(`nav--hide`);
    prevDirection = dirCurrent;
  }
}
function checkScroll() {
  /*
   ** Find the direction of scroll
   ** 0 - initial, 1 - up, 2 - down
   */
  curScroll = window.scrollY || document.documentElement.scrollTop;
  if (curScroll > prevScroll) {
    // scrolled up
    direction = `DOWN`;
  } else if (curScroll < prevScroll) {
    // scrolled down
    direction = `UP`;
  }
  if (curScroll >= NAV_POLY_SCROLL_HIDE) {
    navPoly.classList.add(`nav__poly--hide`);
  } else if (curScroll <= NAV_POLY_SCROLL_SHOW) {
    navPoly.classList.remove(`nav__poly--hide`);
  }

  if (direction !== prevDirection) {
    toggleHeader(direction, curScroll);
  }
  prevScroll = curScroll;
}

function changeTheme(mode) {
  window.setTheme(mode);
  window.storeThemePreference(mode);
}

function menuToggle() {
  // do NOT toggle: menu can exist before JS loads
  // That'd reverse required scroll-lock behaviour in some cases!
  if (navToggleCheckbox.checked) {
    document.body.classList.add(`scroll-lock`);
  } else {
    document.body.classList.remove(`scroll-lock`);
  }
}

// function setObserver() {
//   const targetNode = document.querySelector(`body`);
//   const options = {
//     attributes: true,
//     childList: false,
//     subtree: false,
//   };

//   // const observer = new MutationObserver(observeMe);

//   // observer.observe(targetNode, options)

//   function observeMe(mutation, observer) {
//     const theBody = mutation[0];
//     if (theBody.attributeName === `class`) {
//       // BUG: FIX THIS !!
//       scrollLock();
//       if ([...document.body.classList].includes(`scroll-lock`)) {
//         console.log(`Obeserverbee`);
//         scrollLock.disableScroll();
//         // console.log("🚀 ~ file: script.js ~ line 139 ~ observeMe ~ blocker", blocker)
//       } else {
//         console.log(`OUT!`);
//         scrollLock.enableScroll();
//       }
//     }
//   }

//   // call this to Disable
//   function scrollLock() {
//     // left: 37, up: 38, right: 39, down: 40,
//     // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
//     const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
//     function preventDefault(e) {
//       e.preventDefault();
//     }
//     function preventDefaultForScrollKeys(e) {
//       if (keys[e.keyCode]) {
//         preventDefault(e);
//         return false;
//       }
//     }
//     // modern Chrome requires { passive: false } when adding event
//     let supportsPassive = false;
//     try {
//       window.addEventListener(
//         `test`,
//         null,
//         Object.defineProperty({}, `passive`, {
//           get() {
//             supportsPassive = true;
//           },
//         })
//       );
//     } catch (e) {}

//     const wheelOpt = supportsPassive ? { passive: false } : false;
//     const wheelEvent = `onwheel` in document.createElement(`div`) ? `wheel` : `mousewheel`;

//     function disableScroll() {
//       console.log(`🚀 disableScroll`);
//       // FIXME: keydown for fn+home/end/pgUp/pgDown & space!

//       window.addEventListener(`DOMMouseScroll`, preventDefault, false); // older FF
//       window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
//       window.addEventListener(`touchmove`, preventDefault, wheelOpt); // mobile
//       window.addEventListener(`keydown`, preventDefaultForScrollKeys, false);
//     }
//     function enableScroll() {
//       console.log(`🚀 Enable Scroll`);
//       // FIXME: wheelEvent/keyup 'wheel' NOT removed!
//       window.removeEventListener(`DOMMouseScroll`, preventDefault, false);
//       window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
//       window.removeEventListener(`touchmove`, preventDefault, wheelOpt);
//       window.removeEventListener(`keydown`, preventDefaultForScrollKeys, false);
//     }
//     scrollLock.disableScroll = disableScroll;
//     scrollLock.enableScroll = enableScroll;
//   }
// }
function podcastSeekHandler(e, theAudio) {
  const clickedAt = e.clientX || e.pageX;
  const offsetLeft = e.currentTarget.getBoundingClientRect().left;
  const seekRatio = (clickedAt - offsetLeft) / e.currentTarget.offsetWidth;
  // const wasPaused = theAudio.paused || theAudio.ended; // play on seek? Yes!
  const playIn = setInterval(() => {
    // not even metadata loaded => must be paused!
    if (Number.isNaN(theAudio.duration)) {
      console.info(`isNan, playing!`);
      theAudio.play();
    } else {
      // if (wasPaused) {
      //   theAudio.pause()
      // }
      clearInterval(playIn);
      const seekTime = seekRatio * theAudio.duration;
      theAudio.currentTime = seekTime;
    }
  }, 200);

  if (theAudio.paused) {
    theAudio.play();
  }
}

function podcastPlayerHandler(_params) {
  const itemSelector = `.recent__card__podcast__list--item`;
  const toggleIconSelector = `${itemSelector}__heading--btn`;
  const progressSelector = `${itemSelector}__progress`;
  // const plusMinusSelector = `${itemSelector}__plusminus`
  const podcasts = document.querySelectorAll(itemSelector);

  for (let i = 0; i < podcasts.length; i++) {
    const element = podcasts[i];
    const theButton = element.querySelector(toggleIconSelector);
    const theAudio = element.querySelector(`audio`);
    const theBar = element.querySelector(progressSelector);
    // const plusMinus = element.querySelector(plusMinusSelector)
    // const plus10 = plusMinus.querySelector('.plus10')
    // const plus30 = plusMinus.querySelector('.plus30')
    // const minus10 = plusMinus.querySelector('.minus10')
    // const minus30 = plusMinus.querySelector('.minus30')

    // eslint-disable-next-line no-continue
    if (!theAudio) continue;

    // Play pause button
    theButton.addEventListener(`click`, (_e) => {
      if (theAudio.paused) {
        theAudio.play();
        console.info(`Playing!`);
      } else {
        theAudio.pause();
        console.info(`Paused!`);
      }
    });
    //
    // change progress bar
    theAudio.addEventListener(`timeupdate`, () => {
      const progress = element.querySelector(progressSelector);
      const played = progress.querySelector(`${progressSelector}--played`);
      played.style.width = `${(theAudio.currentTime / theAudio.duration) * 100}%`;
    });

    theBar.addEventListener(`mouseup`, (e) => podcastSeekHandler(e, theAudio));

    // plus minus 10 & 30
    // plus10.addEventListener('click', (e) => {
    //   theAudio.currentTime = theAudio.currentTime + 10
    // })
    // plus30.addEventListener('click', (e) => {
    //   theAudio.currentTime = theAudio.currentTime + 30
    // })
    // minus10.addEventListener('click', (e) => {
    //   theAudio.currentTime = theAudio.currentTime - 10
    // })
    // minus30.addEventListener('click', (e) => {
    //   theAudio.currentTime = theAudio.currentTime - 30
    // })

    // When audio plays, do XYZ!
    theAudio.addEventListener(`play`, (_event) => {
      console.info(`Video is playing`);
      element.classList.add(`playing`);
    });

    theAudio.addEventListener(`playing`, (event) => {
      // console.log('Video is playing');
      const audios = document.getElementsByTagName(`audio`);
      for (let i = 0, len = audios.length; i < len; i++) {
        if (audios[i] !== event.target) {
          audios[i].pause();
        }
      }
    });

    theAudio.addEventListener(`pause`, (_event) => {
      console.info(`Video is  paused`);
      element.classList.remove(`playing`);
    });

    theAudio.addEventListener(`progress`, (_event) => {
      const progress = element.querySelector(progressSelector);
      const buffered = progress.querySelector(`${progressSelector}--buffered`);
      buffered.innerHTML = ``;
      const { duration } = theAudio;
      for (let i = 0; i < theAudio.buffered.length; i++) {
        const start = (theAudio.buffered.start(i) / duration) * 100;
        const end = (theAudio.buffered.end(i) / duration) * 100;
        const loaded = document.createElement(`span`);
        loaded.style.left = `${start}%`;
        loaded.style.right = `${100 - end}%`;
        if (start !== 0) {
          loaded.style.borderTopLeftRadius = 0;
          loaded.style.borderBottomLeftRadius = 0;
        }
        if (end !== 100) {
          loaded.style.borderTopRightRadius = 0;
          loaded.style.borderBottomRightRadius = 0;
        }
        buffered.appendChild(loaded);
      }
    });

    theAudio.addEventListener(`loadstart`, (_event) => {
      console.info(`Video is  loadstart`);
    });
    theAudio.addEventListener(`loadeddata`, (_event) => {
      console.info(`Video is  loadeddata`);
    });
    theAudio.addEventListener(`ended`, (_event) => {
      console.info(`Video is  ended`);
    });
    theAudio.addEventListener(`canplay`, (_event) => {
      console.info(`Video is  canplay`);
    });
  }
}

function podcastPlayerHandlerObserver() {
  // TODO: enable preload here (if)!
  const options = {
    root: document.querySelector(`.recent`),
    rootMargin: `0px`,
    threshold: 0.5,
  };
  const observer = new IntersectionObserver(podcastPlayerHandler, options);
  // target = document.querySelector(`.recent__card__podcast`)
  const target = document.querySelector(`.recent__card__podcast`);
  if (target) observer.observe(target);
}

// eslint-disable-next-line no-unused-vars
function abs(num) {
  const sign = num > 0 ? 1 : -1;
  return num * sign;
}
function tabsChangeListener() {
  const tabNames = [`experience`, `foss`];

  tabNames.forEach((tabName) => {
    const allTabs = document.querySelectorAll(`input[type=radio][name="${tabName}"]`);
    allTabs.forEach((tab) => {
      tab.addEventListener(`change`, (e) => {
        e.preventDefault();
        const contentContainer = e.target
          .closest(`.${tabName}__tablist`)
          .closest(`.${tabName}`)
          .querySelector(`.${tabName}__content`);
        const content = contentContainer.querySelector(`#${e.target.id}-content`);
        // content.classList.add('active')
        // remove active
        if (contentContainer.hasChildNodes()) {
          const children = contentContainer.childNodes;
          for (let i = 0; i < children.length; i++) {
            // children[i].id
            const { id } = children[i];
            if (id && id.startsWith(`${tabName}-`) && id.endsWith(`-content`) && children[i] !== content) {
              const otherChild = children[i];
              setTimeout(() => otherChild.classList.remove(`animate`), 0);
              setTimeout(() => otherChild.classList.remove(`active`), 200);
              // children[i].classList.remove('active')
              // children[i].classList.remove('animate')
            }
          }
        }
        // add new active
        setTimeout(() => content.classList.add(`active`), 200);
        setTimeout(() => content.classList.add(`animate`), 210);
      });
    });
  });
}

function moreProjectsClickHandler() {
  const moreButton = document.querySelector(`.projects__other__more--link`);
  const lessButton = document.querySelector(`.projects__other__less--link`);
  const otherProjectsContainer = document.querySelector(`.projects__other`);

  // TODO:make transition smooth
  const buttons = [moreButton, lessButton];
  buttons.forEach(
    (button) =>
      button &&
      button.addEventListener(`click`, () => {
        otherProjectsContainer.classList.toggle(`display-all`);
        if (button === lessButton) {
          const y = moreButton.offsetTop - 200;
          window.scroll({
            top: y,
            behavior: `auto`,
          });
        }
      })
  );
}

function init() {
  // These init
  setThemeIcons(currentTheme);
  // TODO: combine event listeners
  goDark.addEventListener(`click`, (_e) => {
    changeTheme(window.DARK_THEME_NAME);
    setThemeIcons(window.DARK_THEME_NAME);
  });

  goLight.addEventListener(`click`, (_e) => {
    changeTheme(window.LIGHT_THEME_NAME);
    setThemeIcons(window.LIGHT_THEME_NAME);
  });
  // for scrolling experience tabs
  // experienceRadioChangeListener()
  // for scrolling foss tabs
  // fossRadioChangeListener()

  tabsChangeListener();

  // for podcasts
  podcastPlayerHandlerObserver();

  // more projects button
  moreProjectsClickHandler();

  // for scroll lock
  // setObserver();
  navToggleCheckbox.addEventListener(`change`, menuToggle);
  // fixed menu on reverse scroll
  window.addEventListener(`scroll`, checkScroll);
  // mid-scrolled reload
  checkScroll();
}

init();
