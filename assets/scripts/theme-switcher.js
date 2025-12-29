document.addEventListener('DOMContentLoaded', function () {
    const themeSwitchBtn = document.getElementById('reality-switch-btn');
    const body = document.body;
    const profileImage = document.querySelector('.header img');
    const isMobile = 'ontouchstart' in window;

    let isBlueTheme = false;
    let isTransitioning = false;

    const redParticleRange = { from: 0, to: 10 };
    const redParticleSaturation = 80; // 100% насыщенность для красных
    
    const blueParticleRange = { from: 240, to: 250 };
    const blueParticleSaturation = 30; // 80% насыщенность для синих

    // Функция для создания дождя
    function createDiagonalRain(color) {
        const oldRain = document.querySelector('.rain-container');
        const oldOverlay = document.querySelector('.transition-overlay');
        if (oldRain) oldRain.remove();
        if (oldOverlay) oldOverlay.remove();

        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-container';
        rainContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;

        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: ${isBlueTheme ? '#000010' : '#100000'};
            opacity: 0;
            z-index: 9998;
            pointer-events: none;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(rainContainer);

        setTimeout(() => {
            overlay.style.opacity = '0.4';
        }, 50);

        const dropCount = isMobile ? 50 : 120;

        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            
            let startX, startY;
            
            if (Math.random() < 0.5) {
                startX = 50 + Math.random() * 50;
                startY = -10 - Math.random() * 20;
            } else {
                startX = 100 + Math.random() * 20;
                startY = Math.random() * 50;
            }
            
            const length = 15 + Math.random() * 15;
            const width = 1 + Math.random() * 3;
            const speed = 1.0 + Math.random() * 1.2;
            const angle = -40 - Math.random() * 10;
            const endX = startX - 80;
            const endY = startY + 80;
            
            drop.style.cssText = `
                position: absolute;
                width: ${width}px;
                height: ${length}px;
                left: ${startX}vw;
                top: ${startY}vh;
                background: linear-gradient(to bottom, 
                    transparent 0%, 
                    ${color} 40%, 
                    ${color} 70%, 
                    transparent 100%);
                border-radius: 1px;
                opacity: 0;
                transform: rotate(${angle}deg);
                transform-origin: center;
                animation: rainFallEnhanced ${speed}s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                animation-delay: ${Math.random() * 0.3}s;
                z-index: 9999;
            `;
            
            drop.style.setProperty('--start-x', `${startX}vw`);
            drop.style.setProperty('--start-y', `${startY}vh`);
            drop.style.setProperty('--end-x', `${endX}vw`);
            drop.style.setProperty('--end-y', `${endY}vh`);
            
            rainContainer.appendChild(drop);
        }

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 1000);
        }, 700);

        setTimeout(() => {
            if (rainContainer.parentNode) rainContainer.remove();
        }, 2000);
    }

    // Функция для обновления изображения профиля
    function updateProfileImage(isBlue) {
        if (!profileImage) return;
        
        const tempImage = new Image();
        
        if (isBlue) {
            tempImage.src = 'assets/images/pic_b.png';
            tempImage.onload = () => {
                profileImage.style.opacity = '0';
                setTimeout(() => {
                    profileImage.src = 'assets/images/pic_b.png';
                    profileImage.style.opacity = '0.8';
                }, 300);
            };
        } else {
            tempImage.src = 'assets/images/pic_a.png';
            tempImage.onload = () => {
                profileImage.style.opacity = '0';
                setTimeout(() => {
                    profileImage.src = 'assets/images/pic_a.png';
                    profileImage.style.opacity = '0.8';
                }, 300);
            };
        }
    }

    // Функция для обновления цвета частиц
    function updateParticlesColor() {
        let range, saturation;
        
        if (isBlueTheme) {
            range = blueParticleRange;
            saturation = blueParticleSaturation;
        } else {
            range = redParticleRange;
            saturation = redParticleSaturation;
        }
        
        // Пробуем сразу обновить
        if (window.Renderer && window.Renderer.updateParticleHueRange) {
            window.Renderer.updateParticleHueRange(range, saturation);
            return true;
        }
        
        // Если Renderer не доступен, пробуем через небольшую задержку
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryUpdate = () => {
            attempts++;
            if (window.Renderer && window.Renderer.updateParticleHueRange) {
                window.Renderer.updateParticleHueRange(range, saturation);
                return true;
            } else if (attempts < maxAttempts) {
                setTimeout(tryUpdate, 50);
                return false;
            }
            return false;
        };
        
        setTimeout(tryUpdate, 50);
        return false;
    }

    function switchTheme() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        themeSwitchBtn.disabled = true;
        themeSwitchBtn.style.opacity = '0.5';
        themeSwitchBtn.style.cursor = 'not-allowed';

        const container = document.querySelector('.container');
        if (!container) return;

        // Создаем дождь
        createDiagonalRain(isBlueTheme ? '#ff0000' : '#7a7cb8');
        
        // Запускаем анимацию выхода
        container.classList.add('horizontal-transition');
        
        // Через короткое время начинаем менять тему
        setTimeout(() => {
            isBlueTheme = !isBlueTheme;
            body.classList.toggle('blue-theme', isBlueTheme);
            
            // Обновляем цвет частиц с насыщенностью
            updateParticlesColor();
            
            // Меняем медиа (трек и видео)
            if (window.changeMediaTheme) {
                window.changeMediaTheme(isBlueTheme);
            }
            
            // Меняем изображение профиля
            updateProfileImage(isBlueTheme);
            
            localStorage.setItem('preferredTheme', isBlueTheme ? 'blue' : 'red');
        }, 400);

        // Завершаем анимацию
        setTimeout(() => {
            container.classList.remove('horizontal-transition');
            container.classList.add('blue-theme-enter');
            
            setTimeout(() => {
                container.classList.remove('blue-theme-enter');
                themeSwitchBtn.disabled = false;
                themeSwitchBtn.style.opacity = '1';
                themeSwitchBtn.style.cursor = 'pointer';
                isTransitioning = false;
                
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            }, 900);
        }, 900);
    }

    themeSwitchBtn.addEventListener('click', switchTheme);

    document.addEventListener('keydown', function(e) {
        if (e.code === 'KeyR' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            switchTheme();
        }
    });

    // Загружаем сохраненную тему
    const saved = localStorage.getItem('preferredTheme');
    if (saved === 'blue') {
        isBlueTheme = true;
        body.classList.add('blue-theme');
        updateProfileImage(true);
        
        // Применяем синюю тему к частицам после загрузки Renderer
        const applyBlueTheme = () => {
            if (window.Renderer && window.Renderer.updateParticleHueRange) {
                window.Renderer.updateParticleHueRange(blueParticleRange, blueParticleSaturation);
                return true;
            }
            return false;
        };
        
        // Пробуем сразу
        if (!applyBlueTheme()) {
            // Если не получилось, ждем события rendererReady
            window.addEventListener('rendererReady', applyBlueTheme);
        }
    } else {
        updateProfileImage(false);
    }
});