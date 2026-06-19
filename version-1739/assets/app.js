(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('.hero-prev');
      var next = hero.querySelector('.hero-next');
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });

      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    var search = document.getElementById('siteSearch');
    var yearFilter = document.getElementById('yearFilter');
    var regionFilter = document.getElementById('regionFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var keyword = normalize(search && search.value);
      var year = normalize(yearFilter && yearFilter.value);
      var region = normalize(regionFilter && regionFilter.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchedRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear && matchedRegion));
      });
    }

    [search, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });
})();
