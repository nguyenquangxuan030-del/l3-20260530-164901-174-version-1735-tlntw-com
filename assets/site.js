(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.getElementById('mobile-nav');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('.filter-page').forEach(function (page) {
      var search = page.querySelector('[data-filter-search]');
      var type = page.querySelector('[data-filter-type]');
      var year = page.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));

      function filterCards() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.dataset.region].join(' ').toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (typeValue && card.dataset.type !== typeValue) {
            matched = false;
          }
          if (yearValue && card.dataset.year !== yearValue) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }

      [search, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', filterCards);
          element.addEventListener('change', filterCards);
        }
      });
    });

    var results = document.getElementById('search-results');
    var searchInput = document.getElementById('search-input');
    var searchTitle = document.getElementById('search-title');
    if (results && window.MOVIE_SEARCH_DATA) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (searchInput) {
        searchInput.value = query;
      }
      if (query) {
        renderSearch(query);
      }
    }

    function renderSearch(query) {
      var normalized = query.trim().toLowerCase();
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.text.toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (searchTitle) {
        searchTitle.textContent = normalized ? '搜索结果' : '热门推荐';
      }
      if (!matched.length) {
        results.innerHTML = '<div class="card empty-result"><h2>没有找到相关影片</h2><p>换一个片名、地区、年份或标签继续搜索。</p></div>';
        return;
      }
      results.innerHTML = matched.map(function (movie) {
        return '<article class="movie-card card">' +
          '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.rating) + '</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }
  });
})();
