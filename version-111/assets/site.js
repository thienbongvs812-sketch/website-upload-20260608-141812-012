(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var section = panel.closest('.content-section') || document;
            var list = section.querySelector('[data-movie-list]');
            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var searchInput = panel.querySelector('[data-search-input]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = valueOf(searchInput);
                var region = valueOf(regionSelect);
                var type = valueOf(typeSelect);
                var year = valueOf(yearSelect);

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.category,
                        card.textContent
                    ].join(' ').toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchRegion = !region || (card.dataset.region || '').toLowerCase() === region;
                    var matchType = !type || (card.dataset.type || '').toLowerCase() === type;
                    var matchYear = !year || (card.dataset.year || '').toLowerCase() === year;
                    card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchType && matchYear));
                });
            }

            [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var source = shell.dataset.source;
            var hlsInstance = null;
            var isReady = false;

            if (!video || !button || !source) {
                return;
            }

            function attachSource() {
                if (isReady) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    isReady = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    isReady = true;
                    return;
                }

                video.src = source;
                isReady = true;
            }

            function play() {
                attachSource();
                button.classList.add('hidden');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        button.classList.remove('hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                button.classList.add('hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
