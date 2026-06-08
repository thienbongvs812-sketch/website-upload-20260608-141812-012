import { H as Hls } from './hls.js';

(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var button = box.querySelector('[data-play]');
    var url = box.getAttribute('data-url');
    var ready = false;
    var instance = null;

    var bind = function () {
      if (!video || !url || ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (Hls && Hls.isSupported()) {
        instance = new Hls({ enableWorker: true, lowLatencyMode: true });
        instance.loadSource(url);
        instance.attachMedia(video);
      } else {
        video.src = url;
      }
      ready = true;
    };

    var play = function () {
      bind();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        video.setAttribute('controls', 'controls');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
        instance = null;
      }
    });
  });
})();
