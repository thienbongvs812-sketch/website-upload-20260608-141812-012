(function() {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
      menuButton.textContent = expanded ? "☰" : "×";
    });
  }

  document.querySelectorAll(".header-search, .mobile-search").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      const action = form.getAttribute("action") || "search.html";
      window.location.href = action + "?q=" + encodeURIComponent(query);
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.dataset.slide || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const filterWrap = document.querySelector("[data-filter]");
  if (filterWrap) {
    const textInput = filterWrap.querySelector("[data-filter-input]");
    const yearSelect = filterWrap.querySelector("[data-filter-year]");
    const regionSelect = filterWrap.querySelector("[data-filter-region]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));

    function filterCards() {
      const text = (textInput && textInput.value || "").trim().toLowerCase();
      const year = yearSelect && yearSelect.value || "";
      const region = regionSelect && regionSelect.value || "";

      cards.forEach(function(card) {
        const title = (card.dataset.title || "").toLowerCase();
        const genre = (card.dataset.genre || "").toLowerCase();
        const cardYear = card.dataset.year || "";
        const cardRegion = card.dataset.region || "";
        const textMatch = !text || title.includes(text) || genre.includes(text) || cardRegion.toLowerCase().includes(text);
        const yearMatch = !year || cardYear === year;
        const regionMatch = !region || cardRegion.includes(region);
        card.style.display = textMatch && yearMatch && regionMatch ? "" : "none";
      });
    }

    [textInput, yearSelect, regionSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  }

  const searchResults = document.querySelector("[data-search-results]");
  const searchPanel = document.querySelector("[data-search-panel]");

  if (searchResults && typeof SITE_MOVIES !== "undefined") {
    const searchBox = document.querySelector("[data-search-box]");
    const categorySelect = document.querySelector("[data-search-category]");
    const yearSelect = document.querySelector("[data-search-year]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (searchBox) {
      searchBox.value = initialQuery;
    }

    function movieCard(movie) {
      return [
        "<article class=\"movie-card\">",
        "  <a class=\"movie-cover\" href=\"" + movie.href + "\">",
        "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "    <span class=\"movie-badge\">" + escapeHtml(movie.category) + "</span>",
        "    <span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
        "    <span class=\"play-hover\">▶</span>",
        "  </a>",
        "  <div class=\"movie-info\">",
        "    <h3><a href=\"" + movie.href + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "    <p>" + escapeHtml(movie.description) + "</p>",
        "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.score) + "分</span></div>",
        "  </div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function(character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[character];
      });
    }

    function runSearch() {
      const query = (searchBox && searchBox.value || "").trim().toLowerCase();
      const category = categorySelect && categorySelect.value || "";
      const year = yearSelect && yearSelect.value || "";
      const results = SITE_MOVIES.filter(function(movie) {
        const haystack = [movie.title, movie.description, movie.region, movie.genre, movie.tags].join(" ").toLowerCase();
        const queryMatch = !query || haystack.includes(query);
        const categoryMatch = !category || movie.category === category;
        const yearMatch = !year || movie.year === year;
        return queryMatch && categoryMatch && yearMatch;
      }).slice(0, 96);

      searchResults.innerHTML = results.map(movieCard).join("");
    }

    if (searchPanel) {
      searchPanel.addEventListener("submit", function(event) {
        event.preventDefault();
        runSearch();
      });
    }

    [searchBox, categorySelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", runSearch);
        control.addEventListener("change", runSearch);
      }
    });

    runSearch();
  }
}());
