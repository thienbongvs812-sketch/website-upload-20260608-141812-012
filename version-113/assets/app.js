(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-tab]'));
    var current = 0;
    var timer = null;

    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      tabs.forEach(function (tab, itemIndex) {
        tab.classList.toggle('is-active', itemIndex === current);
      });
    };

    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        show(Number(tab.getAttribute('data-hero-tab')) || 0);
        start();
      });
    });

    start();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var activeFilter = '全部';

  var applyFilter = function () {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var typeText = (card.getAttribute('data-type') || '') + ' ' + (card.getAttribute('data-genre') || '');
      var matchFilter = activeFilter === '全部' || typeText.indexOf(activeFilter) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchQuery && matchFilter));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || '全部';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  if (filterButtons.length) {
    filterButtons[0].classList.add('is-active');
  }
})();
