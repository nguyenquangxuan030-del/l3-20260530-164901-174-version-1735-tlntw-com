(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("open"));
      });
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-target") || "#movie-list");
      if (!target) {
        return;
      }
      var keyword = panel.querySelector("[data-filter-keyword]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" ").toLowerCase();
          var matchedText = !q || text.indexOf(q) !== -1;
          var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
          card.classList.toggle("is-hidden", !(matchedText && matchedType && matchedYear));
        });
      };
      [keyword, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;
      var show = function (nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      if (slides.length > 1) {
        if (prev) {
          prev.addEventListener("click", function () {
            show(index - 1);
            restart();
          });
        }
        if (next) {
          next.addEventListener("click", function () {
            show(index + 1);
            restart();
          });
        }
        dots.forEach(function (dot, i) {
          dot.addEventListener("click", function () {
            show(i);
            restart();
          });
        });
        restart();
      }
    });
  });
})();

function setupPlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var cover = document.getElementById("player-cover");
  if (!video || !streamUrl) {
    return;
  }
  var initialized = false;
  var init = function () {
    if (!initialized) {
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }
    }
    if (cover) {
      cover.classList.add("hidden");
    }
    video.controls = true;
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  };
  if (cover) {
    cover.addEventListener("click", init);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      init();
    }
  });
}
