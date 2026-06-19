(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function startVideo(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = url;
    }
    video.controls = true;
    video.dataset.ready = '1';
    video.play().catch(function () {});
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var button = shell.querySelector('[data-play]');
      var source = video ? video.getAttribute('data-video') : '';

      function play() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        startVideo(video, source);
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      if (cover) {
        cover.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      shell.addEventListener('click', function () {
        if (video && video.dataset.ready !== '1') {
          play();
        }
      });
    });
  });
})();
