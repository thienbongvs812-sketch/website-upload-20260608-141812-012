(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var next = document.querySelector('[data-hero-next]');
  var prev = document.querySelector('[data-hero-prev]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startHero();
      });
    });
  }

  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var keywordInput = filterBar.querySelector('[data-filter-keyword]');
    var regionSelect = filterBar.querySelector('[data-filter-region]');
    var typeSelect = filterBar.querySelector('[data-filter-type]');
    var yearSelect = filterBar.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function matchCard(card) {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var keywordOk = !keyword || title.indexOf(keyword) !== -1 || cardRegion.toLowerCase().indexOf(keyword) !== -1 || cardType.toLowerCase().indexOf(keyword) !== -1;
      var regionOk = !region || cardRegion === region;
      var typeOk = !type || cardType === type;
      var yearOk = !year || cardYear === year;
      return keywordOk && regionOk && typeOk && yearOk;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchCard(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.MovieSearchData) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var queryInput = document.querySelector('[data-main-search]');
    var regionFilter = document.querySelector('[data-main-region]');
    var typeFilter = document.querySelector('[data-main-type]');
    var yearFilter = document.querySelector('[data-main-year]');
    if (queryInput) {
      queryInput.value = query;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '">' +
          '<a class="poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />' +
            '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
          '</a>' +
          '<div class="card-body">' +
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-list">' + tags + '</div>' +
          '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function runSearch() {
      var keyword = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var results = window.MovieSearchData.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var regionOk = !region || movie.region === region;
        var typeOk = !type || movie.type === type;
        var yearOk = !year || movie.year === year;
        return keywordOk && regionOk && typeOk && yearOk;
      }).slice(0, 120);
      searchRoot.innerHTML = results.map(cardTemplate).join('');
      var empty = document.querySelector('.empty-state');
      if (empty) {
        empty.classList.toggle('show', results.length === 0);
      }
    }

    [queryInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });
    runSearch();
  }
})();
