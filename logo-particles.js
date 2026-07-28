/* =========================================================
   logo-particles.js – Wavy Dotted Logo Particle Effect
   Vishwanatha Printers
   =========================================================
   Loads the logo image, samples its pixels, and renders them
   as animated particles with sine/cosine wave motion and
   mouse interactivity.
   ========================================================= */

class LogoParticleCanvas {
  constructor(canvasId, imageSrc) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.imageSrc = imageSrc;
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, radius: 100 };
    this.time = 0;
    this.animationId = null;
    this.isVisible = true;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Detect mobile
    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    // Sampling gap — controls dot density (smaller = more dots = sharper text)
    this.samplingGap = this.isMobile ? 5 : (this.isTablet ? 4 : 3);

    // Wave parameters — subtle enough to keep text readable
    this.waveAmplitude = 1.5;
    this.waveFrequency = 0.02;
    this.waveSpeed = 0.03;

    this.init();
  }

  async init() {
    try {
      await this.loadImage();
      this.setupCanvas();
      this.extractParticles();
      this.bindEvents();
      this.animate();
    } catch (err) {
      console.warn('LogoParticles: Could not initialize.', err);
    }
  }

  loadImage() {
    return new Promise((resolve, reject) => {
      this.logoImage = new Image();
      this.logoImage.crossOrigin = 'anonymous';
      this.logoImage.onload = () => resolve();
      this.logoImage.onerror = () => reject('Image load failed');
      this.logoImage.src = this.imageSrc;
    });
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;

    // Aspect ratio from the logo image
    const imgAspect = this.logoImage.width / this.logoImage.height;

    // Determine draw dimensions
    let drawWidth, drawHeight;
    if (this.isMobile) {
      drawWidth = Math.min(containerWidth * 0.95, 420);
    } else if (this.isTablet) {
      drawWidth = Math.min(containerWidth * 0.85, 650);
    } else {
      drawWidth = Math.min(containerWidth * 0.85, 850);
    }
    drawHeight = drawWidth / imgAspect;

    this.drawWidth = Math.round(drawWidth);
    this.drawHeight = Math.round(drawHeight);

    // Set CSS size
    this.canvas.style.width = this.drawWidth + 'px';
    this.canvas.style.height = this.drawHeight + 'px';

    // Set buffer size for retina
    this.canvas.width = this.drawWidth * this.dpr;
    this.canvas.height = this.drawHeight * this.dpr;

    // Scale context
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  extractParticles() {
    this.particles = [];

    // Offscreen canvas to read the logo pixels
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    offCanvas.width = this.drawWidth;
    offCanvas.height = this.drawHeight;

    // Draw logo scaled to our canvas dimensions
    offCtx.drawImage(this.logoImage, 0, 0, this.drawWidth, this.drawHeight);

    // Read pixel data
    const imageData = offCtx.getImageData(0, 0, this.drawWidth, this.drawHeight);
    const data = imageData.data;
    const gap = this.samplingGap;
    const w = this.drawWidth;

    for (let y = 0; y < this.drawHeight; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const index = (y * w + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        // Skip transparent pixels
        if (a < 100) continue;

        // Skip white and near-white background pixels
        // The logo has a white/light background — aggressively filter it out
        const brightness = (r + g + b) / 3;
        if (brightness > 180) continue;

        // Also skip very light grays (anti-aliased edges blending to white)
        if (r > 200 && g > 200 && b > 200) continue;

        // Smaller dots = sharper, more legible text
        const size = 0.8 + Math.random() * 0.5;

        // Color classification: red pixels (PRINTERS) get solid red,
        // blue pixels (VISHWANATHA) keep their sampled color
        let color;
        if (r > b && r > 120 && b < 150) {
          color = '#CC2829';
        } else {
          color = `rgb(${r},${g},${b})`;
        }

        this.particles.push({
          homeX: x,
          homeY: y,
          x: x,
          y: y,
          size: size,
          color: color,
          // Random phase offset for organic wave feel
          phase: Math.random() * Math.PI * 2,
          // Velocity for mouse repulsion
          vx: 0,
          vy: 0,
        });
      }
    }
  }

  bindEvents() {
    // Mouse tracking on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Touch support
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.samplingGap = this.isMobile ? 5 : (this.isTablet ? 4 : 3);
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.setupCanvas();
        this.extractParticles();
      }, 300);
    });

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) {
        this.animate();
      }
    });
  }

  animate() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.drawWidth, this.drawHeight);
    this.time += this.waveSpeed;

    const mouseR = this.mouse.radius;
    const mouseRSq = mouseR * mouseR;
    const amp = this.waveAmplitude;
    const freq = this.waveFrequency;
    const t = this.time;

    for (let i = 0, len = this.particles.length; i < len; i++) {
      const p = this.particles[i];

      // Wave displacement — gentle sine on Y, very subtle cosine on X
      const waveY = Math.sin(t + p.homeX * freq + p.phase) * amp;
      const waveX = Math.cos(t * 0.6 + p.homeY * freq * 0.4 + p.phase) * (amp * 0.2);

      // Target = home position + wave offset
      let targetX = p.homeX + waveX;
      let targetY = p.homeY + waveY;

      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < mouseRSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (mouseR - dist) / mouseR;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 4;
        p.vy += Math.sin(angle) * force * 4;
      }

      // Spring back towards target
      p.vx += (targetX - p.x) * 0.07;
      p.vy += (targetY - p.y) * 0.07;

      // Damping / friction
      p.vx *= 0.85;
      p.vy *= 0.85;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Draw the dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

/* ── Auto-initialize when DOM is ready ────────────────────── */
function initLogoParticles() {
  const canvas = document.getElementById('logo-particle-canvas');
  if (!canvas) return;

  // Short delay to ensure hero layout is computed
  setTimeout(() => {
    window._logoParticles = new LogoParticleCanvas(
      'logo-particle-canvas',
      'images/VPH landscape Logo.png'
    );
  }, 150);
}
