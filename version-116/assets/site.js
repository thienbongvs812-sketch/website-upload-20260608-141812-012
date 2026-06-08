import { H as Hls } from "./hls-vendor-dru42stk.js";

function qs(selector, root = document) {
    return root.querySelector(selector);
}

function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

function setupMobileMenu() {
    const toggle = qs(".menu-toggle");
    const panel = qs(".mobile-panel");
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
    });
}

function setupHeroSlider() {
    const slides = qsa(".hero-slide");
    const dots = qsa(".hero-dot");
    const previous = qs("[data-hero-prev]");
    const next = qs("[data-hero-next]");
    const hero = qs(".hero");
    if (!slides.length || !hero) {
        return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
        const activeSlide = slides[current];
        const image = activeSlide.style.getPropertyValue("--hero-image");
        if (image) {
            hero.style.setProperty("--hero-bg", image);
        }
    };
    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5600);
    };
    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });
    if (previous) {
        previous.addEventListener("click", () => {
            show(current - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener("click", () => {
            show(current + 1);
            start();
        });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function setupFilters() {
    const scope = qs("[data-filter-scope]");
    if (!scope) {
        return;
    }
    const input = qs("[data-filter-input]", scope);
    const year = qs("[data-filter-year]", scope);
    const genre = qs("[data-filter-genre]", scope);
    const category = qs("[data-filter-category]", scope);
    const cards = qsa(".movie-card", scope);
    const empty = qs("[data-empty-state]", scope);
    const apply = () => {
        const keyword = normalize(input ? input.value : "");
        const yearValue = normalize(year ? year.value : "");
        const genreValue = normalize(genre ? genre.value : "");
        const categoryValue = normalize(category ? category.value : "");
        let visible = 0;
        cards.forEach((card) => {
            const searchText = normalize(card.dataset.search);
            const cardYear = normalize(card.dataset.year);
            const cardGenre = normalize(card.dataset.genre);
            const cardCategory = normalize(card.dataset.category);
            const matchedKeyword = !keyword || searchText.includes(keyword);
            const matchedYear = !yearValue || cardYear === yearValue;
            const matchedGenre = !genreValue || cardGenre.includes(genreValue);
            const matchedCategory = !categoryValue || cardCategory === categoryValue;
            const matched = matchedKeyword && matchedYear && matchedGenre && matchedCategory;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    };
    [input, year, genre, category].forEach((element) => {
        if (!element) {
            return;
        }
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
    });
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && input) {
        input.value = query;
    }
    apply();
}

function setupCardHover() {
    qsa(".movie-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            card.style.setProperty("--mx", `${x}px`);
            card.style.setProperty("--my", `${y}px`);
        });
    });
}

function initializePage() {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupCardHover();
}

export function startVideoPlayer(options) {
    const video = qs(options.videoSelector || "#movie-player");
    const button = qs(options.buttonSelector || "#movie-play-button");
    const cover = qs(options.coverSelector || "#movie-cover-layer");
    const source = options.source;
    if (!video || !source) {
        return;
    }
    let hlsInstance = null;
    const prepare = () => {
        if (video.dataset.ready === "true") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
        video.dataset.ready = "true";
    };
    const play = () => {
        prepare();
        if (cover) {
            cover.hidden = true;
        }
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
        }
    };
    if (button) {
        button.addEventListener("click", play);
    }
    if (cover) {
        cover.addEventListener("click", play);
    }
    video.addEventListener("dblclick", () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });
    window.addEventListener("pagehide", () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
} else {
    initializePage();
}
