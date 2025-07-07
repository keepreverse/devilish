// Конфигурация прелоадера
const preloaderConfig = {
  minShowTime: 800, // Минимальное время показа прелоадера (мс)
  fadeOutDuration: 300 // Длительность анимации исчезновения (мс)
};


// Оптимизация прелоадера для медленных соединений
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

if (connection) {
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    preloaderConfig.minShowTime = 1500;
  }
}

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