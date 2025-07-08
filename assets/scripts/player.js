// В начале файла добавим фикс для iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS) {
  document.querySelectorAll('video, audio').forEach(media => {
    media.setAttribute('playsinline', '');
    media.setAttribute('muted', '');
  });
}

document.addEventListener('DOMContentLoaded', function () {
    const music = new Audio('assets/music/hp.mp3');
    const video = document.getElementById('background-video');
    const prompt = document.getElementById('music-prompt');
    const controls = document.getElementById('music-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');

    let isPlaying = false;
    let isSeeking = false;
    let videoPlayPromise = null;  // для предотвращения конфликтов play()

    music.loop = true;
    music.volume = 0.3;
    video.muted = true;
    video.loop = false; // отключаем loop

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
            if (video.paused && !video.seeking) {
                // Если уже пытаемся играть — не вызываем повторно
                if (!videoPlayPromise) {
                    videoPlayPromise = video.play()
                        .catch(e => {
                            videoPlayPromise = null;
                        })
                        .then(() => {
                            videoPlayPromise = null;
                        });
                }
            }
        }
    }

    function showAndPlayMedia() {
        video.style.display = 'block';

        music.play()
            .then(() => {
                video.currentTime = music.currentTime;
                if (!videoPlayPromise) {
                    videoPlayPromise = video.play()
                        .catch(e => {
                            console.error('Ошибка воспроизведения видео:', e);
                            videoPlayPromise = null;
                        })
                        .then(() => {
                            videoPlayPromise = null;
                        });
                }
            })
            .catch(e => {
                console.error('Ошибка воспроизведения аудио:', e);
            });
    }

    prompt.addEventListener('click', function () {
        prompt.style.display = 'none';
        controls.style.display = 'flex';
        controls.classList.add('visible');

        if (!isPlaying) {
            showAndPlayMedia();
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
            playPauseBtn.classList.remove('play-icon');
            playPauseBtn.classList.add('pause-icon');
        }
    });

    playPauseBtn.addEventListener('click', function () {
        if (music.paused) {
            music.play()
                .then(() => {
                    playPauseBtn.textContent = '⏸';
                    playPauseBtn.classList.remove('play-icon');
                    playPauseBtn.classList.add('pause-icon');

                    if (durationDisplay.textContent === '0:00') {
                        durationDisplay.textContent = formatTime(music.duration);
                    }

                    syncMedia();
                })
                .catch(e => console.error('Ошибка воспроизведения аудио:', e));
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
        // isSeeking сбросится в video.seeked
    });

    music.addEventListener('timeupdate', () => {
        updateProgress();
        if (!isSeeking) syncMedia();
    });

    music.addEventListener('play', () => {
        playPauseBtn.textContent = '⏸';
        playPauseBtn.classList.remove('play-icon');
        playPauseBtn.classList.add('pause-icon');
        isPlaying = true;
        syncMedia();
    });

    music.addEventListener('pause', () => {
        playPauseBtn.textContent = '▶';
        playPauseBtn.classList.remove('pause-icon');
        playPauseBtn.classList.add('play-icon');
        isPlaying = false;
        video.pause();
        videoPlayPromise = null;
    });

    music.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(music.duration);
    });

    music.addEventListener('ended', () => {
        progressSlider.value = 0;
        currentTimeDisplay.textContent = '0:00';
        video.currentTime = 0;
    });

    music.addEventListener('error', (e) => {
        console.error('Ошибка аудио:', e);
        controls.style.display = 'flex';
        playPauseBtn.classList.remove('play-icon', 'pause-icon');
        playPauseBtn.textContent = '❌';
        playPauseBtn.style.color = '#ff0000';
    });

    video.addEventListener('error', (e) => {
        console.error('Ошибка видео:', e);
        video.style.display = 'none';
    });

    video.addEventListener('seeked', () => {
        isSeeking = false;
    });
});
