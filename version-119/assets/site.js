(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === heroIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showHero(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var keyword = normalize(inputs.map(function (input) { return input.value; }).join(' '));
        var year = normalize((document.querySelector('[data-filter-year]') || {}).value);
        var type = normalize((document.querySelector('[data-filter-type]') || {}).value);
        var region = normalize((document.querySelector('[data-filter-region]') || {}).value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre'));
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okYear = !year || normalize(card.getAttribute('data-year')) === year;
            var okType = !type || normalize(card.getAttribute('data-type')) === type;
            var okRegion = !region || normalize(card.getAttribute('data-region')) === region;
            var visible = okKeyword && okYear && okType && okRegion;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        Array.prototype.slice.call(document.querySelectorAll('[data-empty-state]')).forEach(function (empty) {
            empty.classList.toggle('visible', cards.length > 0 && visibleCount === 0);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-input], [data-filter-year], [data-filter-type], [data-filter-region]')).forEach(function (field) {
        field.addEventListener('input', filterCards);
        field.addEventListener('change', filterCards);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-view]')).forEach(function (button) {
        button.addEventListener('click', function () {
            var view = button.getAttribute('data-view');
            var list = document.querySelector('[data-card-list]');
            if (!list) {
                return;
            }
            list.classList.toggle('list-view', view === 'list');
            Array.prototype.slice.call(document.querySelectorAll('[data-view]')).forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
        });
    });

    var playerShell = document.querySelector('[data-player-shell]');
    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-play-button]');
    var hlsInstance = null;
    var hlsLoading = false;

    function loadHls(done) {
        if (window.Hls) {
            done();
            return;
        }
        if (hlsLoading) {
            var wait = setInterval(function () {
                if (window.Hls) {
                    clearInterval(wait);
                    done();
                }
            }, 120);
            return;
        }
        hlsLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
        script.async = true;
        script.onload = done;
        script.onerror = done;
        document.head.appendChild(script);
    }

    function playMovie() {
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-video');
        if (!src) {
            return;
        }
        if (playerShell) {
            playerShell.classList.add('playing');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== src) {
                video.src = src;
            }
            video.play().catch(function () {});
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
            } else {
                if (video.src !== src) {
                    video.src = src;
                }
                video.play().catch(function () {});
            }
        });
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            playMovie();
        });
    }

    if (playerShell) {
        playerShell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            playMovie();
        });
    }
})();
