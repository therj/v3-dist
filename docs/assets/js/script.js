const goDark = document.querySelector(`.goDark`);
const goLight = document.querySelector(`.goLight`);

const navToggleCheckbox = document.querySelector(`input.header__toggle-nav`);

const currentTheme = window.CURRENT_THEME;

function changeTheme(mode) {
  window.setTheme(mode);
  window.storeThemePreference(mode);
}

function hmsFormatter(seconds) {
  if (seconds < 0) {
    // eslint-disable-next-line no-param-reassign
    seconds = 0;
  }
  // eslint-disable-next-line no-param-reassign
  const h = Math.floor(seconds / 60 / 60);
  const m = Math.floor(seconds / 60 - h * 60);
  const s = Math.floor(seconds - m * 60 - h * 60 * 60);
  return `${h > 0 ? `${h}:` : ``}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
}
let hoverStartInterval;
function podcastHoverStartHandler(e, element, theAudio) {
  const itemSelector = `.recent__card__podcast__list--item`;
  const tooltipSelector = `.recent__card__podcast__list--item__progress--tooltip`;

  const theElement = theAudio.closest(itemSelector);
  const tooltipElement = theElement.querySelector(tooltipSelector);

  // not even metadata loaded => must be paused!
  if (!theAudio.duration) {
    theAudio.load();
    console.info(`No audio duration, podcastHoverStartHandler is waiting!`);
    hoverStartInterval = setInterval(() => {
      if (theAudio.duration) {
        clearInterval(hoverStartInterval);
        tooltipElement.classList.remove(`d-none`);
      }
    }, 200);
  } else {
    tooltipElement.classList.remove(`d-none`);
  }
}
function podcastHoverOutHandler(e, element, theAudio) {
  const itemSelector = `.recent__card__podcast__list--item`;
  const tooltipSelector = `.recent__card__podcast__list--item__progress--tooltip`;

  const theElement = theAudio.closest(itemSelector);
  const tooltipElement = theElement.querySelector(tooltipSelector);
  clearInterval(hoverStartInterval);
  tooltipElement.classList.add(`d-none`);
}
function podcastHoverHandler(e, element, theAudio) {
  const itemSelector = `.recent__card__podcast__list--item`;
  const tooltipSelector = `.recent__card__podcast__list--item__progress--tooltip`;
  const offsetLeft = e.currentTarget.getBoundingClientRect().left;
  const offsetRight = e.currentTarget.getBoundingClientRect().right;
  const barWidth = offsetRight - offsetLeft;
  const clickedAt = (e.clientX || e.pageX) - (offsetLeft % 1);
  const seekRatio = (clickedAt - offsetLeft) / barWidth;

  const theElement = theAudio.closest(itemSelector);
  const tooltipElement = theElement.querySelector(tooltipSelector);
  tooltipElement.style = `left: ${clickedAt - offsetLeft}px`;

  // not even metadata loaded => must be paused!
  if (!theAudio.duration) {
    // not loaded yet...
    const playIn = setInterval(() => {
      if (theAudio.duration) {
        clearInterval(playIn);
        // const seekTime = Math.min(seekRatio * theAudio.duration, theAudio.duration);
        const seekTime = seekRatio * theAudio.duration;
        // tooltipElement.style = `display: initial`;
        tooltipElement.innerText = hmsFormatter(seekTime);
      }
    }, 200);
  } else {
    // console.info(`isNan, playing!`);
    // const seekTime = Math.min(seekRatio * theAudio.duration, theAudio.duration);
    const seekTime = seekRatio * theAudio.duration;

    // tooltipElement.style = `display: initial`;
    tooltipElement.innerText = hmsFormatter(seekTime, theAudio.duration);
  }
}
function podcastSeekHandler(e, theAudio) {
  const offsetLeft = e.currentTarget.getBoundingClientRect().left;
  const offsetRight = e.currentTarget.getBoundingClientRect().right;
  const barWidth = offsetRight - offsetLeft;
  const clickedAt = (e.clientX || e.pageX) - (offsetLeft % 1);
  const seekRatio = (clickedAt - offsetLeft) / barWidth;
  //
  //
  // const wasPaused = theAudio.paused || theAudio.ended; // play on seek? Yes!
  // not even metadata loaded => must be paused!

  if (theAudio.duration) {
    const seekTime = seekRatio * theAudio.duration;
    theAudio.currentTime = seekTime;
    // theAudio.play();
  } else {
    const playIn = setInterval(() => {
      if (theAudio.duration) {
        clearInterval(playIn);
        const seekTime = seekRatio * theAudio.duration;
        theAudio.currentTime = seekTime;
      }
    }, 200);
  }

  if (theAudio.paused) {
    theAudio.play();
  }
}

function podcastPlayerHandler(_params) {
  const itemSelector = `.recent__card__podcast__list--item`;
  const toggleIconSelector = `${itemSelector}__heading--btn`;
  const progressSelector = `${itemSelector}__progress`;
  const progressSelectorMaster = `${progressSelector}--eventMaster`;

  const playedTimeSelector = `.recent__card__podcast__list--item__datetime--duration .played`;
  // const plusMinusSelector = `${itemSelector}__plusminus`
  const podcasts = document.querySelectorAll(itemSelector);

  for (let i = 0; i < podcasts.length; i++) {
    const element = podcasts[i];
    const theButton = element.querySelector(toggleIconSelector);
    const theAudio = element.querySelector(`audio`);
    const theBar = element.querySelector(progressSelectorMaster);
    const timeProgress = element.querySelector(playedTimeSelector);
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
      timeProgress.innerHTML = `${hmsFormatter(theAudio.currentTime)} / `;
    });

    theBar.addEventListener(`click`, (e) => podcastSeekHandler(e, theAudio));
    theBar.addEventListener(`mouseenter`, (e) => podcastHoverStartHandler(e, element, theAudio));
    theBar.addEventListener(`mousemove`, (e) => podcastHoverHandler(e, element, theAudio));
    theBar.addEventListener(`mouseleave`, (e) => podcastHoverOutHandler(e, element, theAudio));

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
      console.info(`Audio "play"`);
      element.classList.add(`started`);
      element.classList.add(`playing`);
    });

    theAudio.addEventListener(`playing`, (event) => {
      console.info(`Audio "playing"`);
      const audios = document.getElementsByTagName(`audio`);
      for (let i = 0, len = audios.length; i < len; i++) {
        if (audios[i] !== event.target) {
          audios[i].pause();
        }
      }
    });

    theAudio.addEventListener(`pause`, (_event) => {
      console.info(`Audio "pause"`);
      element.classList.remove(`playing`);
    });

    theAudio.addEventListener(`progress`, (_event) => {
      console.info(`Audio "progress"`);
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
      console.info(`Audio "loadstart"`);
    });
    theAudio.addEventListener(`loadeddata`, (_event) => {
      console.info(`Audio "loadeddata"`);
    });
    theAudio.addEventListener(`ended`, (_event) => {
      console.info(`Audio "ended"`);
    });
    theAudio.addEventListener(`canplay`, (_event) => {
      console.info(`Audio "canplay"`);
      element.classList.add(`canplay`);
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

const menuToggle = (e) => {
  e.stopPropagation();
  const { checked } = e.target;
  if (checked) {
    document.body.classList.add(`scroll-lock`);
  } else {
    document.body.classList.remove(`scroll-lock`);
  }
};

function init() {
  // These init
  // TODO: combine event listeners
  goDark.addEventListener(`click`, (_e) => {
    changeTheme(window.DARK_THEME_NAME);
  });

  goLight.addEventListener(`click`, (_e) => {
    changeTheme(window.LIGHT_THEME_NAME);
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

  // fixed menu on reverse scroll - DISABLED
  // window.addEventListener(`scroll`, checkScroll);
  // mid-scrolled reload
  // checkScroll();
}

init();
