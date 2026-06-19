(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var panel = document.querySelector('[data-search-panel]');
    var input = document.querySelector('[data-site-search]');
    var resultBox = document.querySelector('[data-search-results]');
    var openButtons = document.querySelectorAll('[data-search-open]');
    var closeButton = document.querySelector('[data-search-close]');

    function openSearch() {
        if (!panel) return;
        panel.classList.add('open');
        setTimeout(function () {
            if (input) input.focus();
        }, 30);
    }

    function closeSearch() {
        if (!panel) return;
        panel.classList.remove('open');
    }

    openButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeSearch);
    }

    if (panel) {
        panel.addEventListener('click', function (event) {
            if (event.target === panel) closeSearch();
        });
    }

    function renderResults(keyword) {
        if (!resultBox) return;
        var q = keyword.trim().toLowerCase();
        if (!q) {
            resultBox.innerHTML = '';
            return;
        }
        var source = window.SITE_MOVIES || [];
        var matched = source.filter(function (item) {
            return [item.title, item.year, item.region, item.type, item.genre].join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, 30);
        resultBox.innerHTML = matched.map(function (item) {
            return '<a class="search-result-item" href="./' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.display=\'none\'">' +
                '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[match];
        });
    }

    if (input) {
        input.addEventListener('input', function () {
            renderResults(input.value);
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }
        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                showSlide(idx);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var players = document.querySelectorAll('[data-player]');
    var hlsLoading = false;
    var hlsReadyCallbacks = [];

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsReadyCallbacks.push(callback);
        if (hlsLoading) return;
        hlsLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.onload = function () {
            hlsReadyCallbacks.splice(0).forEach(function (fn) { fn(); });
        };
        document.head.appendChild(script);
    }

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        if (!video || !button) return;
        var source = video.getAttribute('data-hls');
        var attached = false;

        function attachSource(done) {
            if (attached) {
                done();
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                done();
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                } else {
                    video.src = source;
                    done();
                }
            });
        }

        function start() {
            button.classList.add('hidden');
            attachSource(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('hidden');
                    });
                }
            });
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) start();
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
    });
})();
