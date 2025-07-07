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
    if (!('ontouchstart' in window)) {
      document.documentElement.classList.remove('no-focus-outline');
    }
  }



  handleMouseInteraction() {

    document.documentElement.classList.add('no-focus-outline');

  }

}



// Инициализация

document.addEventListener('DOMContentLoaded', () => new FocusManager());