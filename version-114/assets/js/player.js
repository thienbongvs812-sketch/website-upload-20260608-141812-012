(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        var source = shell.getAttribute('data-video-url');
        var prepared = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function start() {
            prepare();
            shell.classList.add('is-playing');
            video.setAttribute('controls', 'controls');
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video && prepared) {
                return;
            }
            start();
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(setupPlayer);
})();
