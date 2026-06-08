(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initSearch() {
    var inputs = document.querySelectorAll('[data-card-search]');
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      var target = input.getAttribute('data-card-search') || '.movie-card';
      var cards = Array.prototype.slice.call(document.querySelectorAll(target));
      var empty = document.querySelector('.empty-state');
      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var match = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle('hidden-card', !match);
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });
  }

  function initFilters() {
    var buttons = document.querySelectorAll('[data-filter-value]');
    if (!buttons.length) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value');
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search') || card.textContent);
          var match = value === 'all' || text.indexOf(normalize(value)) !== -1;
          card.classList.toggle('hidden-card', !match);
        });
      });
    });
  }

  function attachStream(video, url) {
    if (video.dataset.ready === 'true') {
      return;
    }
    video.dataset.ready = 'true';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      window.addEventListener('beforeunload', function () {
        hls.destroy();
      });
      return;
    }
    video.src = url;
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var layer = document.querySelector('.play-layer');
    var button = document.querySelector('.play-button');
    var stage = document.querySelector('.player-stage');
    var start = function () {
      attachStream(video, stream);
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    };
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (stage) {
      stage.addEventListener('click', function (event) {
        if (event.target === stage || event.target === layer) {
          start();
        }
      });
    }
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  }

  ready(function () {
    initMenu();
    initSearch();
    initFilters();
    initPlayer();
  });
}());
