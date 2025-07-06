document.addEventListener("DOMContentLoaded", () => {
    let cursorActive = false;
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);

    // Исправленный метод проверки на кликабельные элементы
    const isClickable = (el) => {
        if (el instanceof HTMLElement) {
            return el.closest('a, button, input, textarea, select, [role="button"], label');
        }
        return false;
    };

    function activateCursor(e) {
        if (!cursorActive) {
            cursor.style.opacity = '1';
            cursorActive = true;
        }
        moveCursor(e);
    }

    let lastX = 0, lastY = 0;

    function moveCursor(e) {
        const x = e.clientX;
        const y = e.clientY;

        cursor.style.top = `${y}px`;
        cursor.style.left = `${x}px`;

        // Анимированный трейл с рандомизацией
        const trail = document.createElement('div');
        trail.classList.add('cursor-trail');
        trail.style.top = `${y + (Math.random() - 0.5) * 10}px`;
        trail.style.left = `${x + (Math.random() - 0.5) * 10}px`;
        trail.style.width = `${6 + Math.random() * 6}px`;
        trail.style.height = trail.style.width;
        trail.style.opacity = `${0.3 + Math.random() * 0.2}`;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 500);

        // Тянущий эффект при наведении
        if (isClickable(e.target)) {
            cursor.classList.add('clickable');
        } else {
            cursor.classList.remove('clickable');
        }

        lastX = x;
        lastY = y;
    }

    function flashEffect(e) {
        const flash = document.createElement('div');
        flash.classList.add('cursor-flash');
        flash.style.top = `${e.clientY}px`;
        flash.style.left = `${e.clientX}px`;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
    }

    document.addEventListener('mousemove', activateCursor);

    document.addEventListener('pointerdown', e => {
        cursor.classList.add('active');
        flashEffect(e);
        splashEffect(e.clientX, e.clientY);
    });

    document.addEventListener('pointerup', () => {
        cursor.classList.remove('active');
    });

    document.addEventListener('pointerleave', () => {
        cursor.style.opacity = '0';
        cursorActive = false;
    });

    document.addEventListener('pointerenter', e => {
        activateCursor(e);
    });
});

function splashEffect(x, y) {
    const splashCount = 10 + Math.floor(Math.random() * 5);

    for (let i = 0; i < splashCount; i++) {
        const drop = document.createElement('div');
        drop.classList.add('cursor-splash');
        drop.style.top = `${y}px`;
        drop.style.left = `${x}px`;

        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        drop.style.setProperty('--x', `${offsetX}px`);
        drop.style.setProperty('--y', `${offsetY}px`);

        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 600);
    }
}
