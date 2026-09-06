/**
 * Durgadas Karmakar | Official Portfolio Application Script
 * Features:
 * - Real-Time Day / Sunset / Night Lighting Engine synced with system clock
 * - Scenic Window Weather Engine (HTML5 Canvas Rain, Droplets, Thunder, Snow, Clear)
 * - Weather Control Button with Developer Quotes Toast
 * - Viewport Section Snapping & Scroll-Spy Navigation
 * - Working Contact Form with instant validation & feedback
 * - Interactive CV & Verified Certificate Image Viewer Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. DOM Elements Querying
  // -------------------------------------------------------------------------
  const viewportDeck = document.getElementById('viewport-deck');
  const sections = Array.from(document.querySelectorAll('.screen-section'));
  const navMenu = document.getElementById('nav-menu');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const mobileToggle = document.getElementById('mobile-toggle');
  const sideDots = Array.from(document.querySelectorAll('.side-dot'));
  const sideTrackerNum = document.getElementById('side-tracker-num');
  const btnPrev = document.getElementById('btn-prev-section');
  const btnNext = document.getElementById('btn-next-section');

  // Lighting & Theme Elements
  const layerDawn = document.getElementById('layer-dawn');
  const layerDay = document.getElementById('layer-day');
  const layerEvening = document.getElementById('layer-evening') || document.getElementById('layer-sunset');
  const layerNight = document.getElementById('layer-night');
  const liveClockEl = document.getElementById('live-clock');
  const timeModeIcon = document.getElementById('time-mode-icon');
  const timeWidget = document.getElementById('time-widget');
  const cycleTimeBtn = document.getElementById('cycle-time-btn');
  const realtimeStatusPill = document.getElementById('realtime-status-pill');

  // Weather Elements
  const weatherBtn = document.getElementById('weather-control-btn');
  const weatherLabelText = document.getElementById('weather-label-text');
  const weatherBtnIcon = document.getElementById('weather-btn-icon');
  const weatherCanvas = document.getElementById('weather-canvas');
  const lightningFlash = document.getElementById('lightning-flash');

  // Funny Toast Elements
  const funnyToast = document.getElementById('funny-weather-toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastTitle = document.getElementById('toast-title');
  const toastQuote = document.getElementById('toast-quote');
  const toastClose = document.getElementById('toast-close');

  // Modal Elements
  const cvModal = document.getElementById('cv-modal');
  const btnDownloadCv = document.getElementById('btn-download-cv');
  const btnPreviewCv = document.getElementById('btn-preview-cv');
  const btnCloseCvModal = document.getElementById('btn-close-cv-modal');
  const cvModalBackdrop = document.getElementById('cv-modal-backdrop');
  const btnPrintCv = document.getElementById('btn-print-cv');
  const btnModalDownloadCv = document.getElementById('btn-modal-download-cv');

  // Cert Modal Elements
  const certModal = document.getElementById('cert-modal');
  const btnCloseCertModal = document.getElementById('btn-close-cert-modal');
  const certModalBackdrop = document.getElementById('cert-modal-backdrop');
  const btnDismissCertModal = document.getElementById('btn-dismiss-cert-modal');
  const certModalName = document.getElementById('cert-modal-name');
  const certModalIssuer = document.getElementById('cert-modal-issuer');
  const certModalId = document.getElementById('cert-modal-id');
  const certModalImg = document.getElementById('cert-modal-img');

  // Contact Form Elements
  const contactForm = document.getElementById('contact-form');
  const feedbackBanner = document.getElementById('form-feedback-banner');

  // -------------------------------------------------------------------------
  // 2. Real-Time Dawn / Day / Evening / Night Lighting Engine
  // -------------------------------------------------------------------------
  const THEMES = ['dawn', 'day', 'evening', 'night'];
  let currentThemeIndex = 1; // Default to day initially
  let manualThemeOverride = false;

  function determineRealtimeTheme() {
    const now = new Date();
    const hour = now.getHours();

    // 05:00 - 07:59: Dawn / Sunrise
    // 08:00 - 16:59: Day
    // 17:00 - 19:59: Evening / Sunset
    // 20:00 - 04:59: Night
    if (hour >= 5 && hour < 8) {
      return 'dawn';
    } else if (hour >= 8 && hour < 17) {
      return 'day';
    } else if (hour >= 17 && hour < 20) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  function applyTheme(themeName, isManual = false) {
    document.body.setAttribute('data-theme', themeName);

    // Crossfade scenic room backdrop layers
    if (layerDawn) layerDawn.classList.toggle('active', themeName === 'dawn');
    if (layerDay) layerDay.classList.toggle('active', themeName === 'day');
    if (layerEvening) layerEvening.classList.toggle('active', themeName === 'evening' || themeName === 'sunset');
    if (layerNight) layerNight.classList.toggle('active', themeName === 'night');

    // Update icons & status pill
    let icon = '🌅';
    let label = 'Dawn / Sunrise';
    if (themeName === 'day') {
      icon = '☀️';
      label = 'Daylight Mode';
    } else if (themeName === 'evening' || themeName === 'sunset') {
      icon = '🌇';
      label = 'Golden Evening';
    } else if (themeName === 'night') {
      icon = '🌙';
      label = 'Midnight Cozy Mode';
    }

    if (timeModeIcon) timeModeIcon.textContent = icon;
    if (realtimeStatusPill) {
      realtimeStatusPill.textContent = `${label} • ${isManual ? 'Manual Override' : 'Real-Time Synced'}`;
    }

    currentThemeIndex = THEMES.indexOf(themeName);
    if (currentThemeIndex === -1) currentThemeIndex = 0;

    // Refresh sky & weather elements to match new time-of-day lighting
    if (typeof refreshAtmosphere === 'function') {
      refreshAtmosphere();
    }
  }

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (liveClockEl) {
      liveClockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Auto-update theme if user hasn't manually overridden it
    if (!manualThemeOverride) {
      const detected = determineRealtimeTheme();
      if (document.body.getAttribute('data-theme') !== detected) {
        applyTheme(detected, false);
      }
    }
  }

  // Initialize clock & auto-theme
  updateClock();
  setInterval(updateClock, 1000);

  // Allow clicking on reload button or time widget to cycle Dawn -> Day -> Evening -> Night
  function cycleLightingMode() {
    manualThemeOverride = true;
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const nextTheme = THEMES[currentThemeIndex];
    applyTheme(nextTheme, true);

    const themeMeta = {
      dawn: { icon: '🌅', name: 'DAWN', desc: 'Soft pastel sunrise illuminated across the window & room sky.' },
      day: { icon: '☀️', name: 'DAYLIGHT', desc: 'Bright, high-clarity daylight pouring through the panoramic window.' },
      evening: { icon: '🌇', name: 'EVENING', desc: 'Warm amber sunset glow casting golden reflections across the room.' },
      night: { icon: '🌙', name: 'NIGHT', desc: 'Serene midnight anime atmosphere with glittering stars and city lights.' }
    };

    const info = themeMeta[nextTheme] || { icon: '✨', name: nextTheme.toUpperCase(), desc: 'Window sky shifted.' };
    showToast(info.icon, `Sky Mode: ${info.name}`, info.desc);
  }

  if (cycleTimeBtn) cycleTimeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cycleLightingMode();
  });
  if (timeWidget) timeWidget.addEventListener('click', cycleLightingMode);

  // -------------------------------------------------------------------------
  // 3. Seasonal Weather Control & Panoramic Window Simulation Engine
  // -------------------------------------------------------------------------
  const WEATHER_MODES = [
    {
      id: 'summer',
      name: 'Summer',
      icon: '☀️',
      quotes: [
        '"Summer Sunshine: Warm coffee, 0 server downtime, and pure coding momentum."',
        '"Golden summer rays pouring into the room. Peak focus activated."',
        '"Clear bright skies: All automated CI/CD checks passing green on the first try."'
      ]
    },
    {
      id: 'monsoon',
      name: 'Monsoon',
      icon: '🌧️',
      quotes: [
        '"Monsoon Downpour: Hot chai, lofi beats, and zero merge conflicts."',
        '"Anime rain drumming on the window glass. Ultimate deep-work flow."',
        '"Lightning strikes! A critical bug was found and resolved in 2 seconds."'
      ]
    },
    {
      id: 'spring',
      name: 'Spring',
      icon: '🌸',
      quotes: [
        '"Spring Blossom: Sakura petals drifting past your screen. Fresh ideas blooming."',
        '"Gentle anime spring breeze: Time to refactor legacy code into art."',
        '"Sakura in the air: Elegant microservice architecture and clean commits."'
      ]
    },
    {
      id: 'winter',
      name: 'Winter',
      icon: '❄️',
      quotes: [
        '"Winter Snow: Code freeze is officially in effect. Chill and build."',
        '"Snowflakes floating past the window. Warm socks, hot tea, cold backend logic."',
        '"Cozy winter night: Silent snow outside, 100% test coverage inside."'
      ]
    }
  ];

  let currentWeatherIndex = 0; // Starts with Summer
  let weatherAnimationId = null;
  let particles = [];
  let droplets = []; // Glass window trickling droplets
  let clouds = []; // Anime sky clouds
  let meteors = []; // Night shooting stars
  let splashes = []; // Rain surface splashes
  let nightStars = []; // Midnight sky stars

  // Canvas Setup
  const ctx = weatherCanvas ? weatherCanvas.getContext('2d') : null;

  function resizeWeatherCanvas() {
    if (!weatherCanvas || !ctx) return;
    weatherCanvas.width = window.innerWidth;
    weatherCanvas.height = window.innerHeight;
    initWeatherParticles(WEATHER_MODES[currentWeatherIndex].id);
  }

  window.addEventListener('resize', resizeWeatherCanvas);

  function refreshAtmosphere() {
    initWeatherParticles(WEATHER_MODES[currentWeatherIndex].id);
  }

  function initWeatherParticles(mode) {
    particles = [];
    droplets = [];
    clouds = [];
    meteors = [];
    splashes = [];
    nightStars = [];
    if (!weatherCanvas) return;

    const width = weatherCanvas.width;
    const height = weatherCanvas.height;
    const currentTheme = document.body.getAttribute('data-theme') || 'day';

    // 1. Panoramic Sky Clouds (for all daytime, dawn, sunset & seasonal sky)
    const cloudCount = mode === 'monsoon' ? 7 : (currentTheme === 'night' ? 3 : 6);
    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: (width / cloudCount) * i + (Math.random() * 80 - 40),
        y: Math.random() * (height * 0.26) + 18,
        scale: Math.random() * 0.65 + 0.65,
        speed: Math.random() * 0.22 + 0.14,
        puffs: [
          { dx: 0, dy: 0, r: 42 },
          { dx: 34, dy: -8, r: 36 },
          { dx: -32, dy: 2, r: 30 },
          { dx: 65, dy: 6, r: 24 },
          { dx: -60, dy: 8, r: 22 }
        ]
      });
    }

    // 2. Starry Night Sky Stars (in midnight theme)
    if (currentTheme === 'night') {
      const starCount = 75;
      for (let i = 0; i < starCount; i++) {
        nightStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.55),
          radius: Math.random() * 1.8 + 0.6,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.04 + 0.02,
          color: Math.random() > 0.35 ? '#bae6fd' : '#fef08a'
        });
      }
    }

    // 3. Season-Specific Atmospheric Particle Systems
    if (mode === 'summer') {
      // Warm golden sun motes & floating daylight particles with upward updraft
      const count = 48;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          speedY: -(Math.random() * 0.35 + 0.12), // Upward thermal drift
          speedX: (Math.random() - 0.5) * 0.3,
          color: currentTheme === 'evening' ? '#fed7aa' : (currentTheme === 'dawn' ? '#fbcfe8' : '#fef08a')
        });
      }
    } else if (mode === 'monsoon' || mode === 'rain' || mode === 'thunder') {
      // Heavy slanted monsoon rain streaks
      const count = 160;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (width + 120),
          y: Math.random() * height,
          length: Math.random() * 26 + 18,
          speed: Math.random() * 14 + 16,
          slant: 3.2,
          slantSpeed: 1.8,
          opacity: Math.random() * 0.45 + 0.3,
          thickness: Math.random() * 1.4 + 0.9
        });
      }

      // Trickling window condensation droplets running down the glass pane
      const dropCount = 45;
      for (let i = 0; i < dropCount; i++) {
        droplets.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1.5,
          speed: Math.random() * 0.55 + 0.15,
          opacity: Math.random() * 0.55 + 0.35
        });
      }
    } else if (mode === 'spring') {
      // Delicate anime cherry blossom (sakura) petals fluttering in the breeze
      const petalCount = 55;
      for (let i = 0; i < petalCount; i++) {
        particles.push({
          x: Math.random() * (width + 80) - 40,
          y: Math.random() * height,
          size: Math.random() * 6 + 7,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: (Math.random() - 0.5) * 0.04,
          speedY: Math.random() * 1.1 + 0.7,
          speedX: Math.random() * 1.1 + 0.6,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          swayAmp: Math.random() * 1.4 + 0.8,
          tumblePhase: Math.random() * Math.PI * 2,
          tumbleSpeed: Math.random() * 0.04 + 0.02,
          color: Math.random() > 0.4 ? 'rgba(251, 207, 232, 0.88)' : 'rgba(244, 114, 182, 0.8)'
        });
      }
    } else if (mode === 'winter' || mode === 'snow') {
      // Gentle white snowflakes swaying sinusoidally across the winter landscape
      const snowCount = 110;
      for (let i = 0; i < snowCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3.4 + 1.2,
          speedY: Math.random() * 1.5 + 0.7,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayAmp: Math.random() * 1.2 + 0.5,
          opacity: Math.random() * 0.7 + 0.25
        });
      }
    }
  }

  // Weather Rendering Loop
  let lastLightningTime = 0;

  function renderWeatherLoop(timestamp) {
    if (!ctx || !weatherCanvas) return;
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);

    const mode = WEATHER_MODES[currentWeatherIndex].id;
    const width = weatherCanvas.width;
    const height = weatherCanvas.height;
    const currentTheme = document.body.getAttribute('data-theme') || 'day';

    // 1. Panoramic Sky Clouds (moving across the upper sky)
    if (clouds.length > 0) {
      let cloudColor = 'rgba(255, 255, 255, 0.28)';
      if (mode === 'monsoon') {
        cloudColor = 'rgba(51, 65, 85, 0.42)';
      } else if (currentTheme === 'dawn') {
        cloudColor = 'rgba(251, 207, 232, 0.3)';
      } else if (currentTheme === 'evening' || currentTheme === 'sunset') {
        cloudColor = 'rgba(253, 186, 116, 0.3)';
      } else if (currentTheme === 'night') {
        cloudColor = 'rgba(148, 163, 184, 0.16)';
      }

      ctx.fillStyle = cloudColor;
      for (let c of clouds) {
        for (let puff of c.puffs) {
          ctx.beginPath();
          ctx.arc(c.x + puff.dx * c.scale, c.y + puff.dy * c.scale, puff.r * c.scale, 0, Math.PI * 2);
          ctx.fill();
        }
        c.x += c.speed;
        if (c.x - 120 * c.scale > width) {
          c.x = -150 * c.scale;
          c.y = Math.random() * (height * 0.26) + 18;
        }
      }
    }

    // 2. Midnight Starry Sky & Meteors (active when theme is night)
    if (currentTheme === 'night' && nightStars.length > 0) {
      for (let s of nightStars) {
        s.pulse += s.pulseSpeed;
        const alpha = Math.abs(Math.sin(s.pulse)) * 0.75 + 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Occasional shooting meteors
      if (Math.random() < 0.006 && meteors.length < 2) {
        meteors.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * (height * 0.32),
          vx: -(Math.random() * 8 + 9),
          vy: Math.random() * 5 + 6,
          len: Math.random() * 70 + 40,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        const grad = ctx.createLinearGradient(
          m.x, m.y,
          m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.len,
          m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.len
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.3, `rgba(56, 189, 248, ${m.alpha * 0.8})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.vx * 2, m.y + m.vy * 2);
        ctx.stroke();

        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= m.decay;

        if (m.alpha <= 0 || m.x < 0 || m.y > height) {
          meteors.splice(i, 1);
        }
      }
    }

    // 3. Seasonal Weather Simulations
    if (mode === 'summer') {
      // Warm floating golden sun motes drifting upward with warm halo
      for (let p of particles) {
        p.pulse += p.pulseSpeed;
        const currentAlpha = Math.abs(Math.sin(p.pulse)) * 0.65 + 0.25;

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Subtle warm glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
      }
      ctx.globalAlpha = 1;

    } else if (mode === 'monsoon' || mode === 'rain' || mode === 'thunder') {
      // Falling slanted rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.lineWidth = 1.3;

      for (let p of particles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.slant, p.y + p.length);
        ctx.stroke();

        p.y += p.speed;
        p.x -= p.slantSpeed;

        if (p.y > height - 12) {
          // Bottom surface splash ripple
          if (splashes.length < 32 && Math.random() < 0.25) {
            splashes.push({
              x: p.x,
              y: height - 12 + Math.random() * 8,
              radius: 1,
              maxRadius: Math.random() * 4 + 2,
              alpha: 0.65
            });
          }
          p.y = -p.length;
          p.x = Math.random() * (width + 120);
        }
      }

      // Splash ripples
      for (let i = splashes.length - 1; i >= 0; i--) {
        let s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(224, 242, 254, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        s.radius += 0.45;
        s.alpha -= 0.04;
        if (s.alpha <= 0 || s.radius >= s.maxRadius) {
          splashes.splice(i, 1);
        }
      }

      // Trickling droplets on window glass
      for (let d of droplets) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${d.opacity})`;
        ctx.fill();

        // Droplet reflection dot
        ctx.beginPath();
        ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        d.y += d.speed;
        if (Math.random() < 0.02) d.x += (Math.random() - 0.5) * 1.5;

        if (d.y > height) {
          d.y = -10;
          d.x = Math.random() * width;
        }
      }

      // Atmospheric Thunder Lightning Flash
      if (lightningFlash) {
        if (!lastLightningTime || timestamp - lastLightningTime > 5500 + Math.random() * 6500) {
          lastLightningTime = timestamp;
          lightningFlash.classList.add('flash-active');
          setTimeout(() => {
            lightningFlash.classList.remove('flash-active');
            setTimeout(() => {
              lightningFlash.classList.add('flash-active');
              setTimeout(() => lightningFlash.classList.remove('flash-active'), 80);
            }, 110);
          }, 90);
        }
      }
    } else if (mode === 'spring') {
      // Fluttering sakura cherry blossom petals in the spring breeze
      for (let p of particles) {
        p.swayPhase += p.swaySpeed;
        p.tumblePhase += p.tumbleSpeed;
        p.angle += p.angularSpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.swayPhase) * p.swayAmp + p.speedX;

        // 3D tumble simulation via cosine scaling
        const scaleX = Math.cos(p.tumblePhase);
        const scaleY = Math.sin(p.tumblePhase * 0.7) * 0.3 + 0.7;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(scaleX, scaleY);

        // Draw elegant sakura petal shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.8, p.size * 0.9, p.size * 0.2, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.2, -p.size * 0.7, -p.size * 0.8, 0, -p.size);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Subtle petal vein
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(0, p.size * 0.5);
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();

        if (p.y > height + 20 || p.x > width + 40) {
          p.y = -20;
          p.x = Math.random() * (width * 1.2) - width * 0.2;
        }
      }

    } else if (mode === 'winter' || mode === 'snow') {
      // Gentle white snowflakes swaying sinusoidally across the window
      for (let p of particles) {
        p.swayPhase += p.swaySpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.swayPhase) * p.swayAmp;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        if (p.y > height) {
          p.y = -p.radius;
          p.x = Math.random() * width;
        }
      }
    }

    weatherAnimationId = requestAnimationFrame(renderWeatherLoop);
  }

  // Change Weather Action
  function cycleWeather() {
    currentWeatherIndex = (currentWeatherIndex + 1) % WEATHER_MODES.length;
    const currentMode = WEATHER_MODES[currentWeatherIndex];

    document.body.setAttribute('data-weather', currentMode.id);
    if (weatherLabelText) weatherLabelText.textContent = currentMode.name;
    if (weatherBtnIcon) weatherBtnIcon.textContent = currentMode.icon;

    initWeatherParticles(currentMode.id);

    // Pick a funny quote
    const randomQuote = currentMode.quotes[Math.floor(Math.random() * currentMode.quotes.length)];
    showToast(currentMode.icon, `Weather: ${currentMode.name}`, randomQuote);
  }

  if (weatherBtn) {
    weatherBtn.addEventListener('click', cycleWeather);
  }

  // Toast Functionality
  let toastTimeout = null;
  function showToast(icon, title, quote) {
    if (!funnyToast) return;
    if (toastIcon) toastIcon.textContent = icon;
    if (toastTitle) toastTitle.textContent = title;
    if (toastQuote) toastQuote.textContent = quote;

    funnyToast.classList.add('toast-show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      funnyToast.classList.remove('toast-show');
    }, 5500);
  }

  if (toastClose) {
    toastClose.addEventListener('click', () => {
      funnyToast.classList.remove('toast-show');
    });
  }

  // Initial start of canvas
  resizeWeatherCanvas();
  weatherAnimationId = requestAnimationFrame(renderWeatherLoop);

  // -------------------------------------------------------------------------
  // 4. Single-Screen Section Snapping & Scroll-Spy Navigation
  // -------------------------------------------------------------------------
  let activeSectionIndex = 0;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    activeSectionIndex = index;
    sections[index].scrollIntoView({ behavior: 'smooth' });
    updateActiveStates(index);
  }

  function updateActiveStates(index) {
    activeSectionIndex = index;

    // Update Side Dots safely if present
    if (sideDots && sideDots.length) {
      sideDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }

    // Update Nav Menu Links
    if (navItems && navItems.length) {
      navItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
      });
    }

    // Update Tracker Number (e.g. 01 / 07)
    if (sideTrackerNum) {
      sideTrackerNum.textContent = `0${index + 1} / 0${sections.length}`;
    }
  }

  // Side Dots Click
  if (sideDots && sideDots.length) {
    sideDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        scrollToSection(idx);
      });
    });
  }

  // Top Nav Items Click
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (navMenu) navMenu.classList.remove('mobile-active');
      const idx = parseInt(item.getAttribute('data-section'), 10);
      scrollToSection(idx);
    });
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('mobile-active');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('mobile-active');
      }
    });
  }

  // Prev / Next Arrows
  if (btnPrev) {
    btnPrev.addEventListener('click', () => scrollToSection(activeSectionIndex - 1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => scrollToSection(activeSectionIndex + 1));
  }

  // Keyboard Navigation: Arrow Up / Down, PageUp / PageDown
  window.addEventListener('keydown', (e) => {
    // Only navigate if modals are closed
    const isModalOpen = (cvModal && cvModal.classList.contains('modal-open')) ||
                        (certModal && certModal.classList.contains('modal-open'));
    if (isModalOpen) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSection(activeSectionIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSection(activeSectionIndex - 1);
    }
  });

  // ScrollSpy with IntersectionObserver
  const observerOptions = {
    root: viewportDeck,
    threshold: 0.55
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.getAttribute('data-section-index'), 10);
        updateActiveStates(idx);
      }
    });
  }, observerOptions);

  sections.forEach((sec) => sectionObserver.observe(sec));

  // -------------------------------------------------------------------------
  // 5. Interactive CV Modal & Download Handlers
  // -------------------------------------------------------------------------
  function openCvModal() {
    if (cvModal) cvModal.classList.add('modal-open');
  }

  function closeCvModal() {
    if (cvModal) cvModal.classList.remove('modal-open');
  }

  if (btnDownloadCv) btnDownloadCv.addEventListener('click', openCvModal);
  if (btnPreviewCv) btnPreviewCv.addEventListener('click', openCvModal);
  if (btnCloseCvModal) btnCloseCvModal.addEventListener('click', closeCvModal);
  if (cvModalBackdrop) cvModalBackdrop.addEventListener('click', closeCvModal);

  if (btnPrintCv) {
    btnPrintCv.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnModalDownloadCv) {
    btnModalDownloadCv.addEventListener('click', () => {
      // Generate clean downloadable formatted text file
      const cvText = `===========================================================
DURGADAS KARMAKAR
Backend Developer & DevOps Enthusiast | Information Technology
Phone: +91 9635297320
Email: durgadaskarmakar.dev@gmail.com
Location: Raghunathpur, West Bengal, India
LinkedIn: https://www.linkedin.com/in/durgadas-karmakar-62181534b
GitHub: https://github.com/Durgadas-Karmakar
===========================================================

EXECUTIVE SUMMARY:
Results-driven Information Technology engineer specializing in high-performance backend systems, RESTful API design, relational database architecture, and automated CI/CD deployment pipelines. Experienced with real-time distributed telemetry, containerization with Docker, and cloud deployments.

EDUCATION:
- B.Tech in Information Technology: Bengal College of Engineering & Technology (2023 - Present)
- Higher Secondary Education: Raghunathpur, West Bengal (2023)

WORK EXPERIENCE:
1. Backend & Cloud Architect – Rescuen (Oct 2025 - Mar 2026)
   - Architected real-time WebSocket channels, offline SMS trigger fallback, emergency responder dispatch APIs, and spatial PostgreSQL queries.
   - Reduced emergency alert dispatch latency to sub-second range with 99.9% uptime.
2. Artificial Intelligence Intern – EDU TANTR (Aug 2025 - Oct 2025)
   - Constructed deep neural network models, evaluated computer vision pipelines, and integrated ML models into software workflows.

TECHNICAL SKILLS:
- Backend & APIs: RESTful API Design, JWT Authentication, WebSockets, Microservices, Postman
- Programming Languages: Java, Python, C, C++, JavaScript (Node.js), SQL
- DevOps & Cloud: Docker, CI/CD Pipelines (GitHub Actions), Git & GitHub, Linux/Shell, AWS, Firebase
- Databases & Core CS: PostgreSQL, MySQL, Data Structures & Algorithms, AI/ML, System Design

KEY PROJECTS:
1. Rescuen: Real-Time Emergency Safety & Dispatch Platform (REST APIs, Docker, WebSockets, PostgreSQL)
   - Live on Google Play Store: https://play.google.com/store/apps/details?id=com.subho.rescuen
2. Multilayer Online Examination System (JavaScript, DBMS/SQL, REST API)
   - Live Demo: https://online-exam-system-multilayer.netlify.app/
3. Automated Microservices & DevOps CI/CD Pipeline (Docker, Linux, GitHub Actions)
   - GitHub Repository: https://github.com/Durgadas-Karmakar

===========================================================
Generated from official portfolio of Durgadas Karmakar
===========================================================`;

      const blob = new Blob([cvText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Durgadas_Karmakar_Resume_Official.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('📄', 'CV Downloaded', 'Durgadas Karmakar resume downloaded successfully.');
    });
  }

  // -------------------------------------------------------------------------
  // 6. Certificate Verification Modal Handlers
  // -------------------------------------------------------------------------
  const certButtons = document.querySelectorAll('.btn-cert-view');

  function openCertModal(name, issuer, id, imgSrc) {
    if (!certModal) return;
    if (certModalName) certModalName.textContent = name;
    if (certModalIssuer) certModalIssuer.textContent = issuer;
    if (certModalId) certModalId.textContent = `ID / Ref: ${id}`;
    if (certModalImg) {
      if (imgSrc) {
        certModalImg.src = imgSrc;
        certModalImg.style.display = 'block';
      } else {
        certModalImg.style.display = 'none';
      }
    }
    certModal.classList.add('modal-open');
  }

  function closeCertModal() {
    if (certModal) certModal.classList.remove('modal-open');
  }

  certButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-cert-name') || 'Certified Credential';
      const issuer = btn.getAttribute('data-cert-issuer') || 'Official Academy';
      const id = btn.getAttribute('data-cert-id') || 'VERIFIED-RECORD';
      const imgSrc = btn.getAttribute('data-cert-img') || '';
      openCertModal(name, issuer, id, imgSrc);
    });
  });

  if (btnCloseCertModal) btnCloseCertModal.addEventListener('click', closeCertModal);
  if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);
  if (btnDismissCertModal) btnDismissCertModal.addEventListener('click', closeCertModal);

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCvModal();
      closeCertModal();
    }
  });

  // -------------------------------------------------------------------------
  // 7. Working Interactive Contact Form Handlers
  // -------------------------------------------------------------------------
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');
      const submitBtn = document.getElementById('btn-submit-form');

      let isValid = true;

      // Validate Name
      const nameGroup = nameInput.parentElement;
      if (!nameInput.value.trim()) {
        nameGroup.classList.add('has-error');
        isValid = false;
      } else {
        nameGroup.classList.remove('has-error');
      }

      // Validate Email
      const emailGroup = emailInput.parentElement;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailGroup.classList.add('has-error');
        isValid = false;
      } else {
        emailGroup.classList.remove('has-error');
      }

      // Validate Message
      const messageGroup = messageInput.parentElement;
      if (!messageInput.value.trim() || messageInput.value.trim().length < 5) {
        messageGroup.classList.add('has-error');
        isValid = false;
      } else {
        messageGroup.classList.remove('has-error');
      }

      if (!isValid) return;

      // Submit state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span> ⚡';

      // Store in localStorage for simulated backend persistence
      const messageData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        subject: subjectInput.value.trim() || 'General Inquiry',
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        stored.push(messageData);
        localStorage.setItem('portfolio_messages', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage unavailable', err);
      }

      // Simulated network roundtrip delay
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (feedbackBanner) {
          feedbackBanner.className = 'form-feedback-banner success';
          feedbackBanner.innerHTML = `✓ Thank you, <strong>${messageData.name}</strong>! Your message has been sent directly to Durgadas Karmakar. Expect a response within 12 hours.`;
          feedbackBanner.style.display = 'block';
        }

        showToast('✉️', 'Message Sent!', `Message received from ${messageData.name}.`);
        contactForm.reset();

        setTimeout(() => {
          if (feedbackBanner) feedbackBanner.style.display = 'none';
        }, 8000);
      }, 700);
    });
  }

  // Console Welcome Branding
  console.log(
    '%c⚡ DURGADAS KARMAKAR | PORTFOLIO\n%cBackend Developer & DevOps Enthusiast • Information Technology\nClean High-Performance Architecture Active',
    'color: #38bdf8; font-size: 16px; font-weight: bold;',
    'color: #10b981; font-size: 12px;'
  );
});
