(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.remove();
        });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startSlider() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startSlider();
            });
        });

        if (slides.length > 1) {
            startSlider();
        }
    }

    var homeSearch = document.querySelector('.home-search');
    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    var filterList = document.querySelector('.filter-list');
    if (filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var queryInput = document.querySelector('.filter-input');
        var yearInput = document.querySelector('.filter-year');
        var typeSelect = document.querySelector('.filter-type');
        var categorySelect = document.querySelector('.filter-category');
        var categoryJump = document.querySelector('.category-jump');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(queryInput && queryInput.value);
            var year = normalize(yearInput && yearInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var category = normalize(categorySelect && categorySelect.value);

            cards.forEach(function (card) {
                var text = normalize(card.dataset.text + ' ' + card.dataset.title);
                var cardYear = normalize(card.dataset.year);
                var cardType = normalize(card.dataset.type);
                var cardCategory = normalize(card.dataset.category);
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && cardYear.indexOf(year) === -1) {
                    matched = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
            });
        }

        [queryInput, yearInput, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (categoryJump) {
            categoryJump.addEventListener('change', function () {
                if (categoryJump.value) {
                    window.location.href = './category-' + categoryJump.value + '.html';
                }
            });
        }

        applyFilters();
    }
})();
