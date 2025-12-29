const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const Renderer = {
  info_elem: document.getElementById("renderer-info"),
  status_elem: document.getElementById("renderer-status"),
  debug: false,
  draw_particle_info: false,
  animate_particles: true,
  disable_drawing: false,
  
  particles_per_second: 30,
  particle_lifetime: 2,
  particle_speed: .2,
  particle_jitter: .1,
  particle_size: 10,
  hue_range: { from: 0, to: 15 },
  particle_saturation: 80, // Добавляем насыщенность по умолчанию
  
  // Для плавного FPS
  fps_samples: [],
  last_debug_update: 0,
  debug_update_interval: 0.05,
  
  prev_time: performance.now() / 1000,
  delta_time: 0.00,
  
  canvas: document.getElementById("canvas-background"),
  ctx: null,
  particles: [],
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },

  touchstart: function(e) {
    this.mouse.x = e.touches[0].clientX;
    this.mouse.y = e.touches[0].clientY;
  },

  touchmove: function(e) {
    this.mouse.x = e.touches[0].clientX;
    this.mouse.y = e.touches[0].clientY;
  },

  init: function() {
    if (isMobile) {
      this.particles_per_second = 8;
      this.particle_speed = 0.4;
      this.particle_size = 5;
    }
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    
    this.mouse = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
    
    window.main = this.main.bind(this);
    window.resize = this.resize.bind(this);
    window.mousemove = this.mousemove.bind(this);
    window.keydown = this.keydown.bind(this);
    
    document.addEventListener('touchstart', this.touchstart.bind(this));
    document.addEventListener('touchmove', this.touchmove.bind(this));
   
    this.main();
    
    // Применяем сохраненную тему сразу после инициализации
    this.applySavedTheme();
    
    // Уведомляем, что Renderer готов
    window.dispatchEvent(new CustomEvent('rendererReady'));
  },
  
  main: function() {
    requestAnimationFrame(this.draw.bind(this));
    setInterval(this.add_particle.bind(this), 1000 / this.particles_per_second);

    for(let i = 0; i < this.particles_per_second / 2; i++)
      this.add_particle();
  },
  
  resize: function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.mouse = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
  },
  
  mousemove: function(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  },
  
  keydown: function(e) {
    switch(e.keyCode) {
      case 32: // Space
        this.animate_particles = !this.animate_particles;
        break;
      case 81: // Q
        this.debug = !this.debug;
        if(!this.debug) {
          this.info_elem.innerHTML = "";
          this.status_elem.innerHTML = "";
          this.fps_samples = [];
        }
        break;
      case 87: // W
        this.draw_particle_info = !this.draw_particle_info;
        break;
      case 69: // E
        this.disable_drawing = !this.disable_drawing;
        break;
    }
  },
  
  getSystemStatus: function() {
    let status = [];
    
    if (!this.animate_particles) status.push("PAUSED");
    if (this.draw_particle_info) status.push("PARTICLES INFO");
    if (this.disable_drawing) status.push("DRAWING OFF");
    
    return status.length > 0 ? "[" + status.join(" | ") + "]" + " | " : "";
  },
  
  calculate_smoothed_fps: function() {
    const current_fps = 1 / this.delta_time;
    this.fps_samples.push(current_fps);
    
    if (this.fps_samples.length > 10) {
      this.fps_samples.shift();
    }
    
    return this.fps_samples.reduce((a, b) => a + b, 0) / this.fps_samples.length;
  },
  
  draw: function() {
    const now = performance.now() / 1000;
    this.delta_time = now - this.prev_time;
    this.prev_time = now;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if(this.debug && now - this.last_debug_update > this.debug_update_interval) {
      const smoothed_fps = Math.round(this.calculate_smoothed_fps());
      const frametime = Math.round(this.delta_time * 1000);
      const systemStatus = this.getSystemStatus();
      
      this.info_elem.innerHTML = `${smoothed_fps} fps (${frametime}ms) @ ${this.canvas.width}x${this.canvas.height}`;
      this.status_elem.innerHTML = `${systemStatus} mouse: [${Math.round(this.mouse.x)}, ${Math.round(this.mouse.y)}] | particles: ${this.particles.length}`;
      
      this.last_debug_update = now;
    }

    if(this.disable_drawing) {
      requestAnimationFrame(this.draw.bind(this));
      return;
    }

    for(let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];

      if(this.animate_particles) {
        p.animate(this.delta_time, this.mouse.x, this.mouse.y, this.canvas.width, this.canvas.height);
      }

      if(!p.is_alive()) {
        this.particles.splice(i, 1);
        i--;
        continue;
      }
       
      p.draw(this.ctx);

      if(this.draw_particle_info) {
        p.draw_info(this.ctx);
      }
    }

    requestAnimationFrame(this.draw.bind(this));
  },
  
  add_particle: function() {
    if(!this.animate_particles || this.disable_drawing)
      return;

    this.particles.push(new Particle(
      Math.random() * this.canvas.width, 
      Math.random() * this.canvas.height, 
      this.particle_size, 
      this.particle_speed, 
      this.particle_jitter, 
      this.particle_lifetime,
      this.hue_range,
      this.particle_saturation // Передаем насыщенность
    ));
  },

  updateParticleHueRange: function(newRange, newSaturation = 80) {
    // Обновляем диапазон для новых частиц
    this.hue_range = newRange;
    this.particle_saturation = newSaturation; // Обновляем насыщенность
    
    // Обновляем цвет существующих частиц
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].updateHue) {
        this.particles[i].updateHue(newRange, newSaturation);
      }
    }
  },

  applySavedTheme: function() {
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme === 'blue') {
      this.updateParticleHueRange({ from: 240, to: 250 }, 30); // 30% насыщенность для синих
    }
  }
};

// Делаем Renderer доступным глобально
window.Renderer = Renderer;

document.addEventListener('DOMContentLoaded', () => Renderer.init());