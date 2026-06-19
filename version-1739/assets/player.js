(function () {
  function boot(video, url, cover) {
    if (!video || !url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  window.initPlayer = function (videoId, coverId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);

    if (!video) {
      return;
    }

    if (cover) {
      cover.addEventListener('click', function () {
        boot(video, url, cover);
      });
    }

    video.addEventListener('click', function () {
      if (!video.src) {
        boot(video, url, cover);
      }
    });
  };
})();
