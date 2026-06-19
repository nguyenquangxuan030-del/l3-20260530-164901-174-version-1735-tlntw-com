(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card card\">" +
        "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"poster-play\">▶</span>" +
        "</a>" +
        "<div class=\"movie-body\">" +
          "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
          "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"movie-tags\">" + tags + "</div>" +
          "<div class=\"movie-foot\"><span class=\"score\">" + escapeHtml(movie.score) + "分</span><a href=\"" + escapeHtml(movie.url) + "\">立即观看</a></div>" +
        "</div>" +
      "</article>";
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var grid = scope.querySelector("[data-card-grid]");
      var input = scope.querySelector("[data-card-filter]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-sort]"));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));

      function filterCards() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.category,
            card.dataset.year
          ].join(" "));
          card.classList.toggle("is-hidden-card", query && text.indexOf(query) === -1);
        });
      }

      function sortCards(type) {
        var sorted = cards.slice().sort(function (a, b) {
          if (type === "year") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (type === "views") {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener("input", filterCards);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          sortCards(button.dataset.sort);
          filterCards();
        });
      });
    });

    var playerVideo = document.querySelector("[data-player-video]");
    if (playerVideo) {
      var source = playerVideo.dataset.src || "";
      var startButton = document.querySelector("[data-player-start]");
      if (source) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(playerVideo);
        } else if (playerVideo.canPlayType("application/vnd.apple.mpegurl")) {
          playerVideo.src = source;
        } else {
          playerVideo.src = source;
        }
      }
      function startPlayback() {
        var playPromise = playerVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (startButton) {
        startButton.addEventListener("click", startPlayback);
        playerVideo.addEventListener("play", function () {
          startButton.classList.add("is-hidden");
        });
        playerVideo.addEventListener("pause", function () {
          if (!playerVideo.ended) {
            startButton.classList.remove("is-hidden");
          }
        });
        playerVideo.addEventListener("ended", function () {
          startButton.classList.remove("is-hidden");
        });
      }
    }

    var results = document.querySelector("[data-search-results]");
    if (results && window.MOVIE_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get("q") || "");
      var status = document.querySelector("[data-search-status]");
      var pageForm = document.querySelector("[data-search-page-form]");
      var pageInput = pageForm ? pageForm.querySelector("input[name='q']") : null;
      if (pageInput) {
        pageInput.value = params.get("q") || "";
      }
      var matches = query ? window.MOVIE_INDEX.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));
        return text.indexOf(query) !== -1;
      }) : window.MOVIE_INDEX.slice(0, 32);
      results.innerHTML = matches.slice(0, 120).map(movieCard).join("");
      if (status) {
        status.textContent = query ? "搜索结果已更新" : "输入关键词后可按片名、地区、年份或题材检索";
      }
    }
  });
})();
