document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('mainNav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.from(hero.querySelectorAll('.hero-slide'));
        var dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function startTimer() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current - 1);
                resetTimer();
            });
        });

        hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current + 1);
                resetTimer();
            });
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                resetTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterGrid = document.querySelector('[data-filter-grid]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterForm && filterGrid) {
        var keyword = filterForm.querySelector('[name="keyword"]');
        var year = filterForm.querySelector('[name="year"]');
        var category = filterForm.querySelector('[name="category"]');
        var region = filterForm.querySelector('[name="region"]');
        var cards = Array.from(filterGrid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (keyword && initial) {
            keyword.value = initial;
        }

        function normalize(text) {
            return String(text || '').toLowerCase().trim();
        }

        function applyFilter() {
            var q = normalize(keyword ? keyword.value : '');
            var y = year ? year.value : '';
            var c = category ? category.value : '';
            var r = region ? region.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.innerText + ' ' + card.dataset.title);
                var ok = true;

                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }

                if (y && card.dataset.year !== y) {
                    ok = false;
                }

                if (c && card.dataset.category !== c) {
                    ok = false;
                }

                if (r && card.dataset.region !== r) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        filterForm.querySelectorAll('input, select').forEach(function (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        });

        applyFilter();
    }
});
