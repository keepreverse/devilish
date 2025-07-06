document.addEventListener('DOMContentLoaded', function() {
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
    music.loop = true;
    music.volume = 0.3;
    video.muted = true; // Обязательно для автовоспроизведения
    video.loop = true;
    
    // Форматирование времени в mm:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Обновление прогресса и времени
    function updateProgress() {
        if (!isSeeking && !isNaN(music.duration)) {
            const progressPercent = (music.currentTime / music.duration) * 100;
            progressSlider.value = progressPercent;
            currentTimeDisplay.textContent = formatTime(music.currentTime);
        }
    }
    
    // Синхронизация медиа
    function syncMedia() {
        video.currentTime = music.currentTime;
        if (music.paused) {
            video.pause();
        } else {
            video.play().catch(e => console.error('Video sync error:', e));
        }
    }
    
    // Показ видео и запуск медиа
    function showAndPlayMedia() {
        video.style.display = 'block';
        video.play().catch(e => console.error('Video play error:', e));
        music.play().catch(e => console.error('Audio play error:', e));
    }
    
    // Обработчик клика по надписи
    prompt.addEventListener('click', function() {
        prompt.style.display = 'none';
        controls.style.display = 'flex';
        controls.classList.add('visible');
        
        if (!isPlaying) {
            showAndPlayMedia();
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
            playPauseBtn.classList.remove('play-icon');
            playPauseBtn.classList.add('pause-icon');
            
            // Установка длительности после начала воспроизведения
            durationDisplay.textContent = formatTime(music.duration);
        }
    });

    // Кнопка play/pause
    playPauseBtn.addEventListener('click', function() {
        if (music.paused) {
            music.play()
                .then(() => {
                    playPauseBtn.textContent = '⏸';
                    playPauseBtn.classList.remove('play-icon');
                    playPauseBtn.classList.add('pause-icon');
                    
                    // Обновление длительности при первом запуске
                    if (durationDisplay.textContent === '0:00') {
                        durationDisplay.textContent = formatTime(music.duration);
                    }
                    
                    // Синхронизация видео
                    syncMedia();
                })
                .catch(e => {
                    console.error('Ошибка воспроизведения:', e);
                });
        } else {
            music.pause();
            playPauseBtn.textContent = '▶';
            playPauseBtn.classList.remove('pause-icon');
            playPauseBtn.classList.add('play-icon');
            video.pause();
        }
    });
    
    // Регулятор громкости
    volumeSlider.addEventListener('input', function() {
        music.volume = this.value;
    });
    
    // Перемотка трека
    progressSlider.addEventListener('input', function() {
        isSeeking = true;
        const seekTime = (this.value / 100) * music.duration;
        currentTimeDisplay.textContent = formatTime(seekTime);
    });
    
    progressSlider.addEventListener('change', function() {
        const seekTime = (this.value / 100) * music.duration;
        music.currentTime = seekTime;
        video.currentTime = seekTime; // Синхронизация видео
        isSeeking = false;
    });
    
    // Обновление прогресса в реальном времени
    music.addEventListener('timeupdate', updateProgress);
    
    // Синхронизация видео при обновлении времени аудио
    music.addEventListener('timeupdate', function() {
        if (!isSeeking && !video.paused) {
            video.currentTime = music.currentTime;
        }
    });
    
    // Обновляем иконку при паузе/воспроизведении
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
    });
    
    // Обновление длительности при загрузке метаданных
    music.addEventListener('loadedmetadata', () => {
        durationDisplay.textContent = formatTime(music.duration);
    });
    
    // Сброс прогресса при окончании трека (для loop)
    music.addEventListener('ended', () => {
        progressSlider.value = 0;
        currentTimeDisplay.textContent = '0:00';
        video.currentTime = 0;
    });
    
    // Обработка ошибок аудио
    music.addEventListener('error', (e) => {
        console.error('Ошибка аудио:', e);
        controls.style.display = 'flex';
        playPauseBtn.classList.remove('play-icon', 'pause-icon');
        playPauseBtn.textContent = '❌';
        playPauseBtn.style.color = '#ff0000';
    });
    
    // Обработка ошибок видео
    video.addEventListener('error', (e) => {
        console.error('Ошибка видео:', e);
        video.style.display = 'none';
    });
});