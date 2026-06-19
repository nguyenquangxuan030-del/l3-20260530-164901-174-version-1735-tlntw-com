(function () {
  var body = document.body;
  var navButton = document.querySelector('.nav-toggle');
  if (navButton) {
    navButton.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length) {
    var index = 0;
    var showSlide = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
      });
    });
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  forms.forEach(function (form) {
    var scope = form.parentElement || document;
    var grid = scope.querySelector('.movie-grid') || document.querySelector('.movie-grid');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    var empty = scope.querySelector('.search-empty') || (grid ? grid.parentElement.querySelector('.search-empty') : null);
    var input = form.querySelector('.search-input');
    var year = form.querySelector('.filter-year');
    var type = form.querySelector('.filter-type');
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-title'), card.getAttribute('data-tags'), card.getAttribute('data-region')].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (t && String(card.getAttribute('data-type') || '').indexOf(t) === -1) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    };
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    [input, year, type].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var hlsInstance = null;
    var ready = false;
    var play = function () {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!ready && stream) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }
      if (button) {
        button.classList.add('hidden');
      }
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video && ready) {
        return;
      }
      play();
    });
    shell.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        ready = false;
      });
    }
  });
})();
