(function () {
  function query(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = query('[data-menu-toggle]');
    var nav = query('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = queryAll('[data-hero-slide]');
    var dots = queryAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(next) {
      active = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === active);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initFilters() {
    var input = query('[data-filter-input]');
    var grid = query('[data-filterable="true"]');
    if (!input || !grid) {
      return;
    }
    var cards = queryAll('.movie-card', grid);
    var empty = query('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      input.value = q;
    }
    function apply() {
      var value = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-filter'));
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initPlayer() {
    var shell = query('[data-player-shell]');
    var video = query('video[data-stream]');
    if (!shell || !video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var button = query('[data-play-button]', shell);
    var loaded = false;
    var hlsInstance = null;
    function load() {
      if (loaded || !stream) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }
    function play() {
      load();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
