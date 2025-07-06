class EventManager {
  constructor() {
    this.debounceDelay = 100;
    this.resizeTimer = null;

    this.init();
  }

  init() {
    // Инициализация после загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof Renderer?.main === 'function') {
        Renderer.main(); // Стартовая инициализация из renderer.js
      }
    });

    // Назначение глобальных слушателей
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleResize(event) {
    // Используем debounce, чтобы не вызывать Renderer.resize слишком часто
    if (this.resizeTimer) clearTimeout(this.resizeTimer);

    this.resizeTimer = setTimeout(() => {
      if (typeof Renderer?.resize === 'function') {
        Renderer.resize(event);
      }
    }, this.debounceDelay);
  }

  handleMouseMove(event) {
    if (typeof Renderer?.mousemove === 'function') {
      Renderer.mousemove(event);
    }
  }

  handleKeyDown(event) {
    if (typeof Renderer?.keydown === 'function') {
      Renderer.keydown(event);
    }
  }
}

// Инициализация EventManager
new EventManager();
