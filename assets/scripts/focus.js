class FocusManager {
  constructor() {
    this.init();
  }

  init() {
    document.documentElement.classList.add('no-focus-outline');
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleKeyboardNavigation();
      }
    });
    
    document.addEventListener('click', this.handleMouseInteraction.bind(this));
  }

  handleKeyboardNavigation() {
    document.documentElement.classList.remove('no-focus-outline');
    // Добавляем стиль для элементов в фокусе
    document.querySelectorAll('a, button, input, [tabindex]').forEach(el => {
      el.addEventListener('focus', () => {
        el.classList.add('keyboard-focused');
      });
      el.addEventListener('blur', () => {
        el.classList.remove('keyboard-focused');
      });
    });
  }

  handleMouseInteraction() {
    document.documentElement.classList.add('no-focus-outline');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => new FocusManager());