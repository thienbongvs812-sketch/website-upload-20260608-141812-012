document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(function (block) {
        var video = block.querySelector("video");
        var button = block.querySelector("[data-play]");
        var media = video ? video.querySelector("source") : null;
        var streamUrl = media ? media.getAttribute("src") : "";
        var controller = null;

        function start() {
            if (!video || !streamUrl) {
                return;
            }

            if (!controller && window.Hls && window.Hls.isSupported()) {
                controller = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                controller.loadSource(streamUrl);
                controller.attachMedia(video);
            } else if (!video.getAttribute("src")) {
                video.setAttribute("src", streamUrl);
            }

            block.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }

        block.addEventListener("click", function (event) {
            if (event.target === video || event.target.closest("button")) {
                return;
            }
            start();
        });

        if (video) {
            video.addEventListener("play", function () {
                block.classList.add("is-playing");
            });
        }
    });
});
