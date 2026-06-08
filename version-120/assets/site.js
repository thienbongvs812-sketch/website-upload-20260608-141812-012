document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    document.querySelectorAll(".poster-img, .hero-poster img, .detail-poster img, .rank-thumb img").forEach(function (img) {
        img.addEventListener("error", function () {
            var holder = img.closest(".poster-frame, .hero-poster, .detail-poster, .rank-thumb");
            if (holder) {
                holder.classList.add("no-image");
            }
            img.remove();
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var hero = document.querySelector("[data-hero]");
    var current = 0;

    function showSlide(index) {
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
        if (hero) {
            var image = slides[current].getAttribute("data-image");
            if (image) {
                hero.style.setProperty("--hero-image", "url('" + image + "')");
            }
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var keyword = input ? input.value.trim() : "";
            var base = form.getAttribute("data-search-base") || "search.html";
            window.location.href = keyword ? base + "?q=" + encodeURIComponent(keyword) : base;
        });
    });

    var filterForm = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-year]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function textOf(value) {
        return String(value || "").toLowerCase();
    }

    function applyFilters() {
        if (!filterForm || !cards.length) {
            return;
        }
        var keywordInput = filterForm.querySelector("[name='q']");
        var yearInput = filterForm.querySelector("[name='year']");
        var typeInput = filterForm.querySelector("[name='type']");
        var regionInput = filterForm.querySelector("[name='region']");
        var genreInput = filterForm.querySelector("[name='genre']");
        var keyword = textOf(keywordInput && keywordInput.value).trim();
        var year = textOf(yearInput && yearInput.value).trim();
        var type = textOf(typeInput && typeInput.value).trim();
        var region = textOf(regionInput && regionInput.value).trim();
        var genre = textOf(genreInput && genreInput.value).trim();
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags
            ].map(textOf).join(" ");
            var ok = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && textOf(card.dataset.year) !== year) {
                ok = false;
            }
            if (type && textOf(card.dataset.type).indexOf(type) === -1) {
                ok = false;
            }
            if (region && textOf(card.dataset.region).indexOf(region) === -1) {
                ok = false;
            }
            if (genre && textOf(card.dataset.genre).indexOf(genre) === -1 && textOf(card.dataset.tags).indexOf(genre) === -1) {
                ok = false;
            }
            card.classList.toggle("hidden-card", !ok);
            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("show", visible === 0);
        }
    }

    if (filterForm) {
        var params = new URLSearchParams(window.location.search);
        ["q", "year", "type", "region", "genre"].forEach(function (name) {
            var field = filterForm.querySelector("[name='" + name + "']");
            if (field && params.has(name)) {
                field.value = params.get(name);
            }
        });
        filterForm.addEventListener("input", applyFilters);
        filterForm.addEventListener("change", applyFilters);
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
        });
        applyFilters();
    }

    document.querySelectorAll("[data-jump-player]").forEach(function (button) {
        button.addEventListener("click", function (event) {
            var target = document.querySelector("#player");
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
});
