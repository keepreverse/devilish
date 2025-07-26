// Конфигурация прелоадера
const preloaderConfig = {
  minShowTime: 800, // Минимальное время показа прелоадера (мс)
  fadeOutDuration: 300 // Длительность анимации исчезновения (мс)
};

// Элемент прелоадера (кэшируем для производительности)
const preloader = document.getElementById('preloader');

// Функция показа прелоадера
function showPreloader() {
  if (preloader) {
    preloader.classList.remove('hidden');
    preloader.classList.add('visible');
    // Для плавного появления (если нужно)
    preloader.style.opacity = '1';
    preloader.style.display = 'flex'; // Явно указываем display
  }
}

// Функция скрытия прелоадера
function hidePreloader() {
  if (preloader) {
    // Добавляем анимацию fade-out
    preloader.style.transition = `opacity ${preloaderConfig.fadeOutDuration}ms ease-out`;
    preloader.style.opacity = '0';
    
    // После завершения анимации скрываем полностью
    setTimeout(() => {
      preloader.classList.remove('visible');
      preloader.classList.add('hidden');
      preloader.style.display = 'none';
      preloader.style.transition = '';
    }, preloaderConfig.fadeOutDuration);
  }
}

// Показываем прелоадер как можно раньше
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'interactive') {
    showPreloader();
  }
});

// Скрываем прелоадер после полной загрузки
window.addEventListener('load', () => {
  // Вычисляем оставшееся время до минимального времени показа
  const loadTime = performance.now();
  const remainingTime = preloaderConfig.minShowTime - loadTime;
  
  // Если страница загрузилась быстро, ждем оставшееся время
  if (remainingTime > 0) {
    setTimeout(hidePreloader, remainingTime);
  } else {
    hidePreloader();
  }
});

// Запасной вариант: скрыть прелоадер через максимальное время
const maxLoadTime = 5000; // 5 секунд максимум
setTimeout(hidePreloader, maxLoadTime);

// Парящая анимация для иконок
// (реализация по предложению пользователя)
document.addEventListener('DOMContentLoaded', () => {
    const icons = document.querySelectorAll('.content .links img');
    const amplitude = 5; // px
    const period = 4000; // ms
    const scaleHover = 1.1;
    const scaleSpeed = 0.12;
    const yLerpSpeed = 0.12;

    icons.forEach(icon => {
        let scale = 1;
        let targetScale = 1;
        let start = performance.now() * Math.random();
        let hover = false;
        let frozenY = 0;
        let y = 0;
        let t = 0;
        let lerpBack = false;

        function animate(now) {
            if (!hover && !lerpBack) {
                t = ((now + start) % period) / period;
                y = Math.sin(t * 2 * Math.PI) * amplitude;
            }
            
            scale += (targetScale - scale) * scaleSpeed;
            
            if (lerpBack) {
                t = ((now + start) % period) / period;
                const targetY = Math.sin(t * 2 * Math.PI) * amplitude;
                y += (targetY - y) * yLerpSpeed;
                if (Math.abs(targetY - y) < 0.2) {
                    lerpBack = false;
                }
            }
            
            if (!hover) {
                icon.style.transform = `translateY(${y}px) scale(${scale})`;
            }
            
            requestAnimationFrame(animate);
        }
        animate(performance.now());

        icon.addEventListener('mouseenter', () => {
            hover = true;
            targetScale = scaleHover;
            const now = performance.now();
            t = ((now + start) % period) / period;
            frozenY = Math.sin(t * 2 * Math.PI) * amplitude;
            icon.style.transform = `translateY(${frozenY}px) scale(${scaleHover})`;
        });

        icon.addEventListener('mouseleave', () => {
            hover = false;
            targetScale = 1;
            lerpBack = true;
        });
    });
});