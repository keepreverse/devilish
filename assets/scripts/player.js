// В начале файла добавим фикс для iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS) {
  document.querySelectorAll('video, audio').forEach(media => {
    media.setAttribute('playsinline', '');
    media.setAttribute('muted', '');
  });
}

document.addEventListener('DOMContentLoaded', function () {

    /* ================================
       ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ И ТЕМЫ
    ================================= */

    const savedMedia = JSON.parse(localStorage.getItem('mediaState') || '{}');
    const savedTheme = savedMedia.theme === 'blue';

    const isBlueTheme =
        typeof savedTheme === 'boolean'
            ? savedTheme
            : document.body.classList.contains('blue-theme');

    const audioSrc = isBlueTheme
        ? 'assets/music/db.mp3'
        : 'assets/music/hp.mp3';

    const videoSrc = isBlueTheme
        ? 'assets/music/db.mp4'
        : 'assets/music/hp.mp4';

    const music = new Audio(audioSrc);
    const video = document.getElementById('background-video');
    video.src = videoSrc;

    const prompt = document.getElementById('music-prompt');
    const controls = document.getElementById('music-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');

    let isPlaying = false;
    let isSeeking = false;
    let videoPlayPromise = null;

    music.loop = true;
    music.volume = 0.3;
    video.muted = true;
    video.loop = false;

    /* ================================
       СОХРАНЕНИЕ СОСТОЯНИЯ
    ================================= */

    function saveMediaState() {
        localStorage.setItem('mediaState', JSON.stringify({
            theme: document.body.classList.contains('blue-theme') ? 'blue' : 'red',
            time: music.currentTime || 0,
            playing: !music.paused
        }));
    }

    music.addEventListener('pause', saveMediaState);
    music.addEventListener('play', saveMediaState);
    window.addEventListener('beforeunload', saveMediaState);

    /* ================================
       СМЕНА ТЕМЫ (вызывается извне)
    ================================= */

    window.changeMediaTheme = function(isBlue) {
        const wasPlaying = !music.paused;
        const currentTime = music.currentTime || 0;

        music.pause();
        video.pause();
        videoPlayPromise = null;

        const newAudioSrc = isBlue
            ? 'assets/music/db.mp3'
            : 'assets/music/hp.mp3';

        const newVideoSrc = isBlue
            ? 'assets/music/db.mp4'
            : 'assets/music/hp.mp4';

        music.src = newAudioSrc;
        video.src = newVideoSrc;
        video.load();

        music.currentTime = currentTime;
        video.currentTime = currentTime;

        if (wasPlaying) {
            music.play().then(() => {
                video.play().catch(() => {});
            }).catch(() => {});
        }

        saveMediaState();

        music.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = formatTime(music.duration);
        }, { once: true });
    };

    /* ================================
       ВОССТАНОВЛЕНИЕ ПОСЛЕ ЗАГРУЗКИ
    ================================= */

    music.addEventListener('loadedmetadata', () => {
        if (savedMedia.time) {
            music.currentTime = savedMedia.time;
            video.currentTime = savedMedia.time;
        }

        if (savedMedia.playing) {
            music.play().then(() => {
                video.play().catch(() => {});
            }).catch(() => {});
        }

        durationDisplay.textContent = formatTime(music.duration);
    }, { once: true });

    /* ================================
       УТИЛИТЫ
    ================================= */

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgress() {
        if (!isSeeking && !isNaN(music.duration)) {
            const progressPercent = (music.currentTime / music.duration) * 100;
            progressSlider.value = progressPercent;
            currentTimeDisplay.textContent = formatTime(music.currentTime);
        }
    }

    function syncMedia() {
        if (!video.src) return;

        const timeDiff = Math.abs(video.currentTime - music.currentTime);
        if (timeDiff > 0.3) {
            video.currentTime = music.currentTime;
        }

        if (music.paused) {
            if (!video.paused) {
                video.pause();
                videoPlayPromise = null;
            }
        } else {
            if (video.paused && !video.seeking && !videoPlayPromise) {
                videoPlayPromise = video.play()
                    .catch(() => {})
                    .finally(() => {
                        videoPlayPromise = null;
                    });
            }
        }
    }

    function showAndPlayMedia() {
        video.style.display = 'block';

        music.play().then(() => {
            video.currentTime = music.currentTime;
            if (!videoPlayPromise) {
                videoPlayPromise = video.play()
                    .catch(() => {})
                    .finally(() => {
                        videoPlayPromise = null;
                    });
            }
        }).catch(() => {});
    }

    /* ================================
       UI СОБЫТИЯ
    ================================= */

    prompt.addEventListener('click', function () {
        prompt.style.display = 'none';
        controls.style.display = 'flex';
        controls.classList.add('visible');

        if (!isPlaying) {
            showAndPlayMedia();
            isPlaying = true;
            playPauseBtn.classList.remove('play-icon');
            playPauseBtn.classList.add('pause-icon');
        }
    });

    playPauseBtn.addEventListener('click', function () {
        if (music.paused) {
            music.play().catch(() => {});
        } else {
            music.pause();
            video.pause();
            videoPlayPromise = null;
        }
    });

    volumeSlider.addEventListener('input', function () {
        music.volume = this.value;
    });

    progressSlider.addEventListener('input', function () {
        isSeeking = true;
        const seekTime = (this.value / 100) * music.duration;
        currentTimeDisplay.textContent = formatTime(seekTime);
    });

    progressSlider.addEventListener('change', function () {
        const seekTime = (this.value / 100) * music.duration;
        music.currentTime = seekTime;
        video.currentTime = seekTime;
    });

    /* ================================
       MEDIA EVENTS
    ================================= */

    music.addEventListener('timeupdate', () => {
        updateProgress();
        if (!isSeeking) syncMedia();
    });

    music.addEventListener('play', () => {
        playPauseBtn.classList.remove('play-icon');
        playPauseBtn.classList.add('pause-icon');
        isPlaying = true;
        syncMedia();
    });

    music.addEventListener('pause', () => {
        playPauseBtn.classList.remove('pause-icon');
        playPauseBtn.classList.add('play-icon');
        isPlaying = false;
        video.pause();
        videoPlayPromise = null;
    });

    music.addEventListener('ended', () => {
        progressSlider.value = 0;
        currentTimeDisplay.textContent = '0:00';
        video.currentTime = 0;
    });

    music.addEventListener('error', () => {
        controls.style.display = 'flex';
        playPauseBtn.textContent = '❌';
        playPauseBtn.style.color = '#ff0000';
    });

    video.addEventListener('error', () => {
        video.style.display = 'none';
    });

    video.addEventListener('seeked', () => {
        isSeeking = false;
    });

    playPauseBtn.classList.add('play-icon');
});
