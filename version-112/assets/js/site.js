(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });

        var localInput = document.querySelector("[data-local-search]");
        var mainInput = document.querySelector("[data-main-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var currentFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
        }

        function applyFilter() {
            if (!cards.length) {
                return;
            }
            var query = normalize(localInput ? localInput.value : "");
            var filter = normalize(currentFilter);
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var queryMatch = !query || text.indexOf(query) !== -1;
                var filterMatch = filter === "all" || text.indexOf(filter) !== -1;
                var show = queryMatch && filterMatch;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                currentFilter = button.getAttribute("data-filter-value") || "all";
                applyFilter();
            });
        });

        if (localInput) {
            localInput.addEventListener("input", applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            if (localInput) {
                localInput.value = query;
                applyFilter();
            }
            if (mainInput) {
                mainInput.value = query;
            }
        }
    });
}());
