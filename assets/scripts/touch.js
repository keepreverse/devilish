// Современная проверка на Internet Explorer
function isInternetExplorer() {
  return !!document.documentMode;
}

// Обработчик для запрета контекстного меню
function handleContextMenu(e) {
  if (isInternetExplorer()) {
  }
  e.preventDefault();
  return false;
}

// Обработчик для запрета перетаскивания
function handleDragStart(e) {
  e.preventDefault();
  return false;
}

// Обновим функцию для мобильных
function handleMiddleClick(e) {
  if (e.button === 1 || e.touches?.length > 1) {
    e.preventDefault();
  }
}

// Установка обработчиков событий
function setupEventHandlers() {
  // Современный способ добавления обработчиков
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('auxclick', handleMiddleClick); // auxclick - для средней кнопки мыши
  document.addEventListener('mousedown', handleMiddleClick); // Дополнительная проверка
  
  // Для полной совместимости
  document.oncontextmenu = function() { return false; };
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventHandlers);
} else {
  setupEventHandlers();
}