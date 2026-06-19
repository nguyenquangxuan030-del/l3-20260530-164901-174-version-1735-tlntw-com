(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    qsa('form.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var shell = qs('[data-hero-slider]');
    if (!shell) {
      return;
    }
    var slides = qsa('.hero-slide', shell);
    var dots = qsa('.hero-dot', shell);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var lists = qsa('.filter-list');
    if (!lists.length) {
      return;
    }
    var input = qs('.filter-input');
    var selects = qsa('.filter-select');
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = '';
      var type = '';
      selects.forEach(function (select) {
        if (select.getAttribute('data-filter') === 'year') {
          year = select.value;
        }
        if (select.getAttribute('data-filter') === 'type') {
          type = select.value;
        }
      });
      lists.forEach(function (list) {
        qsa('[data-title]', list).forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okYear = !year || card.getAttribute('data-year') === year;
          var okType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden-card', !(okQuery && okYear && okType));
        });
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function initSearchPage() {
    var box = qs('[data-search-results]');
    if (!box || !window.MovieList) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('.large-search input[name="q"]');
    if (input) {
      input.value = query;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var list = window.MovieList.filter(function (movie) {
      if (!words.length) {
        return true;
      }
      var haystack = [
        movie.title,
        movie.genre,
        movie.region,
        movie.year,
        movie.tags,
        movie.type,
        movie.category,
        movie.oneLine
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    box.innerHTML = list.map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="movie-card-link" href="' + movie.url + '" title="' + escapeHtml(movie.title) + ' 在线观看">',
        '<div class="poster-frame">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
        '<span class="play-mark">▶</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video.movie-video', shell);
      var cover = qs('.player-cover', shell);
      if (!video || !cover) {
        return;
      }
      function start() {
        var streamUrl = video.getAttribute('data-play');
        if (!streamUrl) {
          return;
        }
        if (!video.getAttribute('data-ready')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
          } else {
            video.src = streamUrl;
          }
          video.setAttribute('data-ready', '1');
        }
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      cover.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!video.getAttribute('data-ready')) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
