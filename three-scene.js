/**
 * Three.js 3D Nature, Dynamic Weather & Studio Background Scene
 * Features:
 * - 4 Dynamic Seasonal Weather Environments:
 *   1. SUMMER: Bright golden sun rays, floating green leaves, rising sun dust pollen
 *   2. MONSOON: Heavy dynamic 3D rainfall, wind sway, dramatic lightning flashes, wet floor
 *   3. SPRING: Fluttering pink Sakura (cherry blossom) petals, fresh green buds, pastel blossom aura
 *   4. WINTER: Swirling 3D crystalline snowflakes, frosty arctic mist, icy blue ambiance
 * - Smooth cinematic lerping of lights, fog, and floor reflections
 * - Mouse parallax camera lerping
 * - Global window.setWeather() & window.cycleWeather() API
 */

(function () {
  'use strict';

  // Check Three.js availability
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded!');
    return;
  }

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // =========================================================================
  // 1. Scene, Camera, Renderer Setup
  // =========================================================================
  const scene = new THREE.Scene();
  
  // Weather configuration definitions
  const WEATHER_CONFIGS = {
    summer: {
      fogColor: 0xfffbeb,
      fogDensity: 0.014,
      clearColor: 0xfffbeb,
      clearAlpha: 0.25,
      ambientColor: 0xffedd5,
      ambientIntensity: 0.95,
      keyColor: 0xfbbf24, // Warm Golden Sun
      keyIntensity: 1.8,
      fillColor: 0xfef08a,
      fillIntensity: 0.7,
      accentColor: 0x22c55e,
      floorColor: 0xfefce8,
      studioGlow: 'summer'
    },
    monsoon: {
      fogColor: 0x0f172a, // Deep Stormy Slate
      fogDensity: 0.022,
      clearColor: 0x090d16,
      clearAlpha: 0.65,
      ambientColor: 0x1e293b,
      ambientIntensity: 0.45,
      keyColor: 0x38bdf8, // Cool Storm Cyan
      keyIntensity: 0.75,
      fillColor: 0x0284c7,
      fillIntensity: 0.4,
      accentColor: 0x06b6d4,
      floorColor: 0x0b1120, // Wet Reflective Slate
      studioGlow: 'monsoon'
    },
    spring: {
      fogColor: 0xfdf2f8, // Soft Rose Blossom
      fogDensity: 0.015,
      clearColor: 0xfdf2f8,
      clearAlpha: 0.25,
      ambientColor: 0xfce7f3,
      ambientIntensity: 0.9,
      keyColor: 0xf472b6, // Soft Pink Blossom Light
      keyIntensity: 1.4,
      fillColor: 0xbbf7d0, // Fresh Mint
      fillIntensity: 0.8,
      accentColor: 0xec4899,
      floorColor: 0xfdf2f8,
      studioGlow: 'spring'
    },
    winter: {
      fogColor: 0xe0f2fe, // Crisp Arctic Ice
      fogDensity: 0.019,
      clearColor: 0xf0f9ff,
      clearAlpha: 0.35,
      ambientColor: 0xf0f9ff,
      ambientIntensity: 0.85,
      keyColor: 0x7dd3fc, // Frost Icy Blue
      keyIntensity: 1.3,
      fillColor: 0xe0f2fe,
      fillIntensity: 0.75,
      accentColor: 0x38bdf8,
      floorColor: 0xf8fafc,
      studioGlow: 'winter'
    }
  };

  const initialWeather = 'summer';
  let currentWeather = initialWeather;
  const currentConfig = Object.assign({}, WEATHER_CONFIGS[initialWeather]);

  // Initial Fog
  scene.fog = new THREE.FogExp2(currentConfig.fogColor, currentConfig.fogDensity);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 32);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(currentConfig.clearColor, currentConfig.clearAlpha);

  // =========================================================================
  // 2. Dynamic Lighting System
  // =========================================================================
  const ambientLight = new THREE.AmbientLight(currentConfig.ambientColor, currentConfig.ambientIntensity);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(currentConfig.keyColor, currentConfig.keyIntensity);
  keyLight.position.set(20, 30, 25);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(currentConfig.fillColor, currentConfig.fillIntensity);
  fillLight.position.set(-20, -10, 15);
  scene.add(fillLight);

  const accentLight = new THREE.PointLight(currentConfig.accentColor, 2, 50);
  accentLight.position.set(0, 5, 10);
  scene.add(accentLight);

  // =========================================================================
  // 3. Studio Floor Grid & Disc
  // =========================================================================
  const floorGeo = new THREE.PlaneGeometry(160, 160);
  const floorMat = new THREE.MeshStandardMaterial({
    color: currentConfig.floorColor,
    roughness: 0.8,
    metalness: 0.08,
    transparent: true,
    opacity: 0.75
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -22;
  scene.add(floor);

  // =========================================================================
  // 4. In-Memory Procedural Canvas Textures
  // =========================================================================
  function createGlowTexture(colorInner, colorOuter) {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, colorInner || 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, colorOuter || 'rgba(74, 222, 128, 0.85)');
    grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(texCanvas);
  }

  function createRainTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 16;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(8, 0, 8, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(0.4, 'rgba(186, 230, 253, 0.4)');
    grad.addColorStop(0.9, 'rgba(224, 242, 254, 0.95)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(6, 0, 4, 64);
    return new THREE.CanvasTexture(texCanvas);
  }

  function createSnowflakeTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');
    ctx.translate(32, 32);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // 6 branches
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -26);
      // branch barbs
      ctx.moveTo(0, -14);
      ctx.lineTo(-7, -19);
      ctx.moveTo(0, -14);
      ctx.lineTo(7, -19);
      ctx.stroke();
      ctx.rotate((Math.PI * 2) / 6);
    }

    // Central soft glow
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(texCanvas);
  }

  function createSakuraPetalTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');
    
    ctx.translate(32, 32);
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.bezierCurveTo(20, 18, 22, -10, 8, -26);
    ctx.bezierCurveTo(3, -21, -3, -21, -8, -26);
    ctx.bezierCurveTo(-22, -10, -20, 18, 0, 24);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(249, 168, 212, 0.9)');
    grad.addColorStop(0.85, 'rgba(236, 72, 153, 0.7)');
    grad.addColorStop(1, 'rgba(219, 39, 119, 0.4)');
    ctx.fillStyle = grad;
    ctx.fill();

    return new THREE.CanvasTexture(texCanvas);
  }

  // =========================================================================
  // 5. Procedural 3D Leaves Geometry & Mesh
  // =========================================================================
  function createLeafGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, -1.2);
    shape.bezierCurveTo(0.9, -0.6, 1.1, 0.5, 0, 1.5);
    shape.bezierCurveTo(-1.1, 0.5, -0.9, -0.6, 0, -1.2);

    const extrudeSettings = {
      steps: 1,
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  const leafGeometry = createLeafGeometry();
  leafGeometry.center();

  const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35, metalness: 0.1, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4, metalness: 0.12, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.3, metalness: 0.08, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide })
  ];

  const leaves = [];
  const LEAF_COUNT = 50;

  for (let i = 0; i < LEAF_COUNT; i++) {
    const mat = leafMaterials[Math.floor(Math.random() * leafMaterials.length)];
    const mesh = new THREE.Mesh(leafGeometry, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 45 + 5,
      (Math.random() - 0.5) * 30 - 2
    );

    const scale = 0.5 + Math.random() * 0.7;
    mesh.scale.set(scale, scale, scale);

    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    mesh.userData = {
      fallSpeed: 0.015 + Math.random() * 0.025,
      driftSpeed: 0.01 + Math.random() * 0.02,
      wobbleFreq: 0.8 + Math.random() * 1.5,
      wobbleAmp: 0.015 + Math.random() * 0.02,
      spinSpeedX: (Math.random() - 0.5) * 0.02,
      spinSpeedY: (Math.random() - 0.5) * 0.025,
      spinSpeedZ: (Math.random() - 0.5) * 0.03,
      baseX: mesh.position.x,
      phase: Math.random() * Math.PI * 2
    };

    scene.add(mesh);
    leaves.push(mesh);
  }

  // =========================================================================
  // 6. SEASON 1: SUMMER - Golden Sun Dust & Shimmer Particles
  // =========================================================================
  const SUN_DUST_COUNT = 120;
  const sunDustGeo = new THREE.BufferGeometry();
  const sunDustPositions = new Float32Array(SUN_DUST_COUNT * 3);
  const sunDustData = [];

  for (let i = 0; i < SUN_DUST_COUNT; i++) {
    const i3 = i * 3;
    sunDustPositions[i3] = (Math.random() - 0.5) * 60;
    sunDustPositions[i3 + 1] = (Math.random() - 0.5) * 45;
    sunDustPositions[i3 + 2] = (Math.random() - 0.5) * 25 + 5;

    sunDustData.push({
      vy: 0.015 + Math.random() * 0.025, // Gentle warm updraft
      vx: (Math.random() - 0.5) * 0.015,
      phase: Math.random() * Math.PI * 2,
      scaleSpeed: 1.2 + Math.random() * 2
    });
  }

  sunDustGeo.setAttribute('position', new THREE.BufferAttribute(sunDustPositions, 3));

  const sunDustMat = new THREE.PointsMaterial({
    size: 1.3,
    map: createGlowTexture('rgba(255, 255, 220, 1)', 'rgba(251, 191, 36, 0.85)'),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const sunDustPoints = new THREE.Points(sunDustGeo, sunDustMat);
  scene.add(sunDustPoints);

  // =========================================================================
  // 7. SEASON 2: MONSOON - 3D Vertical Rain System & Lightning Flash
  // =========================================================================
  const RAIN_COUNT = 650;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(RAIN_COUNT * 3);
  const rainData = [];

  for (let i = 0; i < RAIN_COUNT; i++) {
    const i3 = i * 3;
    rainPositions[i3] = (Math.random() - 0.5) * 70;
    rainPositions[i3 + 1] = Math.random() * 60 - 25;
    rainPositions[i3 + 2] = (Math.random() - 0.5) * 35;

    rainData.push({
      speed: 0.9 + Math.random() * 0.7, // Fast downpour
      slant: -0.06 - Math.random() * 0.08 // Wind slant
    });
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  const rainMat = new THREE.PointsMaterial({
    size: 2.8,
    map: createRainTexture(),
    transparent: true,
    opacity: 0, // Starts at 0 (Summer is default)
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const rainPoints = new THREE.Points(rainGeo, rainMat);
  scene.add(rainPoints);

  // Lightning Flash state
  let isLightningActive = false;
  let lightningTimer = null;
  let lightningIntensity = 0;

  function triggerLightning() {
    if (currentWeather !== 'monsoon') return;
    isLightningActive = true;
    lightningIntensity = 3.2;

    // Flash screen overlay if element exists
    const flashOverlay = document.getElementById('storm-flash-overlay');
    if (flashOverlay) {
      flashOverlay.style.opacity = '0.45';
      setTimeout(() => { flashOverlay.style.opacity = '0'; }, 80);
      setTimeout(() => {
        if (currentWeather === 'monsoon') {
          flashOverlay.style.opacity = '0.3';
          setTimeout(() => { flashOverlay.style.opacity = '0'; }, 60);
        }
      }, 140);
    }

    setTimeout(() => {
      isLightningActive = false;
      lightningIntensity = 0;
    }, 220);

    // Schedule next random lightning strike in 4-9 seconds
    scheduleNextLightning();
  }

  function scheduleNextLightning() {
    if (lightningTimer) clearTimeout(lightningTimer);
    if (currentWeather === 'monsoon') {
      const delay = 4000 + Math.random() * 6000;
      lightningTimer = setTimeout(triggerLightning, delay);
    }
  }

  // =========================================================================
  // 8. SEASON 3: SPRING - Sakura (Cherry Blossom) Petals System
  // =========================================================================
  const SAKURA_COUNT = 90;
  const sakuraGeo = new THREE.BufferGeometry();
  const sakuraPositions = new Float32Array(SAKURA_COUNT * 3);
  const sakuraData = [];

  for (let i = 0; i < SAKURA_COUNT; i++) {
    const i3 = i * 3;
    sakuraPositions[i3] = (Math.random() - 0.5) * 65;
    sakuraPositions[i3 + 1] = Math.random() * 55 - 20;
    sakuraPositions[i3 + 2] = (Math.random() - 0.5) * 30;

    sakuraData.push({
      fallSpeed: 0.035 + Math.random() * 0.03,
      swaySpeed: 1.0 + Math.random() * 1.5,
      swayAmp: 0.03 + Math.random() * 0.03,
      driftX: 0.02 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2
    });
  }

  sakuraGeo.setAttribute('position', new THREE.BufferAttribute(sakuraPositions, 3));

  const sakuraMat = new THREE.PointsMaterial({
    size: 2.4,
    map: createSakuraPetalTexture(),
    transparent: true,
    opacity: 0, // Starts 0 in Summer
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const sakuraPoints = new THREE.Points(sakuraGeo, sakuraMat);
  scene.add(sakuraPoints);

  // =========================================================================
  // 9. SEASON 4: WINTER - Swirling 3D Snowflakes System
  // =========================================================================
  const SNOW_COUNT = 450;
  const snowGeo = new THREE.BufferGeometry();
  const snowPositions = new Float32Array(SNOW_COUNT * 3);
  const snowData = [];

  for (let i = 0; i < SNOW_COUNT; i++) {
    const i3 = i * 3;
    snowPositions[i3] = (Math.random() - 0.5) * 65;
    snowPositions[i3 + 1] = Math.random() * 55 - 20;
    snowPositions[i3 + 2] = (Math.random() - 0.5) * 30;

    snowData.push({
      fallSpeed: 0.04 + Math.random() * 0.045,
      wobbleFreq: 1.2 + Math.random() * 2,
      wobbleAmp: 0.02 + Math.random() * 0.025,
      windDrift: (Math.random() - 0.4) * 0.02,
      phase: Math.random() * Math.PI * 2
    });
  }

  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

  const snowMat = new THREE.PointsMaterial({
    size: 1.8,
    map: createSnowflakeTexture(),
    transparent: true,
    opacity: 0, // Starts 0 in Summer
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const snowPoints = new THREE.Points(snowGeo, snowMat);
  scene.add(snowPoints);

  // =========================================================================
  // 10. Fireflies & Ambient Orbs
  // =========================================================================
  const FIREFLY_COUNT = 80;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPositions = new Float32Array(FIREFLY_COUNT * 3);
  const fireflyData = [];

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const i3 = i * 3;
    fireflyPositions[i3] = (Math.random() - 0.5) * 60;
    fireflyPositions[i3 + 1] = (Math.random() - 0.5) * 45;
    fireflyPositions[i3 + 2] = (Math.random() - 0.5) * 25 + 5;

    fireflyData.push({
      vx: (Math.random() - 0.5) * 0.025,
      vy: (Math.random() - 0.5) * 0.025,
      vz: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 1.5 + Math.random() * 2.5
    });
  }

  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));

  const fireflyMat = new THREE.PointsMaterial({
    size: 1.2,
    map: createGlowTexture('rgba(255, 255, 255, 1)', 'rgba(74, 222, 128, 0.85)'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
  scene.add(fireflyPoints);

  // Ambient Glass Orbs
  const ambientOrbs = [];
  const orbGeo = new THREE.SphereGeometry(1.5, 32, 32);
  const orbMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.9,
    opacity: 0.9,
    transparent: true,
    roughness: 0.1,
    ior: 1.4,
    thickness: 1.2
  });

  for (let i = 0; i < 5; i++) {
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(
      (Math.random() - 0.5) * 45,
      (Math.random() - 0.5) * 30,
      -10 + Math.random() * 8
    );
    const s = 0.6 + Math.random() * 0.9;
    orb.scale.set(s, s, s);
    orb.userData = {
      baseY: orb.position.y,
      speed: 0.5 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    };
    scene.add(orb);
    ambientOrbs.push(orb);
  }

  // =========================================================================
  // 11. Mouse Camera Parallax
  // =========================================================================
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    targetCamX = mouseX * 4;
    targetCamY = mouseY * 3;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // =========================================================================
  // 12. Dynamic Weather Transition Engine
  // =========================================================================
  const SEASONS_SEQUENCE = ['summer', 'monsoon', 'spring', 'winter'];

  // Lerp helper
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // Target values for smooth interpolation
  const currentTargets = {
    fogColor: new THREE.Color(currentConfig.fogColor),
    fogDensity: currentConfig.fogDensity,
    ambientColor: new THREE.Color(currentConfig.ambientColor),
    ambientIntensity: currentConfig.ambientIntensity,
    keyColor: new THREE.Color(currentConfig.keyColor),
    keyIntensity: currentConfig.keyIntensity,
    fillColor: new THREE.Color(currentConfig.fillColor),
    fillIntensity: currentConfig.fillIntensity,
    accentColor: new THREE.Color(currentConfig.accentColor),
    floorColor: new THREE.Color(currentConfig.floorColor),
    sunDustOpacity: 0.85,
    rainOpacity: 0.0,
    sakuraOpacity: 0.0,
    snowOpacity: 0.0
  };

  function setWeather(weatherName) {
    const season = (weatherName || '').toLowerCase();
    if (!WEATHER_CONFIGS[season]) return;

    currentWeather = season;
    window.currentWeather = season;
    const cfg = WEATHER_CONFIGS[season];

    // Set target colors and intensities
    currentTargets.fogColor.setHex(cfg.fogColor);
    currentTargets.fogDensity = cfg.fogDensity;
    currentTargets.ambientColor.setHex(cfg.ambientColor);
    currentTargets.ambientIntensity = cfg.ambientIntensity;
    currentTargets.keyColor.setHex(cfg.keyColor);
    currentTargets.keyIntensity = cfg.keyIntensity;
    currentTargets.fillColor.setHex(cfg.fillColor);
    currentTargets.fillIntensity = cfg.fillIntensity;
    currentTargets.accentColor.setHex(cfg.accentColor);
    currentTargets.floorColor.setHex(cfg.floorColor);

    // Weather particle target opacities
    currentTargets.sunDustOpacity = (season === 'summer') ? 0.85 : 0.0;
    currentTargets.rainOpacity = (season === 'monsoon') ? 0.95 : 0.0;
    currentTargets.sakuraOpacity = (season === 'spring') ? 0.9 : 0.0;
    currentTargets.snowOpacity = (season === 'winter') ? 0.95 : 0.0;

    // Body data attribute for CSS atmospheric styling
    document.body.setAttribute('data-weather', season);

    // Trigger lightning if monsoon
    if (season === 'monsoon') {
      setTimeout(triggerLightning, 600);
    } else {
      if (lightningTimer) clearTimeout(lightningTimer);
    }

    console.log(`🌤️ Weather transitioned to: ${season.toUpperCase()}`);
  }

  function cycleWeather() {
    const currentIndex = SEASONS_SEQUENCE.indexOf(currentWeather);
    const nextIndex = (currentIndex + 1) % SEASONS_SEQUENCE.length;
    const nextSeason = SEASONS_SEQUENCE[nextIndex];
    setWeather(nextSeason);
    return nextSeason;
  }

  // Expose global APIs for UI controls
  window.setWeather = setWeather;
  window.cycleWeather = cycleWeather;
  window.currentWeather = currentWeather;
  window.triggerLightning = triggerLightning;

  // Initialize data-weather attribute
  document.body.setAttribute('data-weather', initialWeather);

  // =========================================================================
  // 13. Main 60fps Animation Loop
  // =========================================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // -------------------------------------------------------------
    // Smooth Weather Interpolation (Lerp)
    // -------------------------------------------------------------
    const LERP_SPEED = 0.045;

    // Fog
    scene.fog.color.lerp(currentTargets.fogColor, LERP_SPEED);
    scene.fog.density = lerp(scene.fog.density, currentTargets.fogDensity, LERP_SPEED);

    // Lights
    ambientLight.color.lerp(currentTargets.ambientColor, LERP_SPEED);
    ambientLight.intensity = lerp(
      ambientLight.intensity,
      currentTargets.ambientIntensity + (isLightningActive ? lightningIntensity : 0),
      isLightningActive ? 0.6 : LERP_SPEED
    );

    keyLight.color.lerp(currentTargets.keyColor, LERP_SPEED);
    keyLight.intensity = lerp(keyLight.intensity, currentTargets.keyIntensity, LERP_SPEED);

    fillLight.color.lerp(currentTargets.fillColor, LERP_SPEED);
    fillLight.intensity = lerp(fillLight.intensity, currentTargets.fillIntensity, LERP_SPEED);

    accentLight.color.lerp(currentTargets.accentColor, LERP_SPEED);

    // Floor
    floorMat.color.lerp(currentTargets.floorColor, LERP_SPEED);

    // Particle Opacities
    sunDustMat.opacity = lerp(sunDustMat.opacity, currentTargets.sunDustOpacity, LERP_SPEED);
    rainMat.opacity = lerp(rainMat.opacity, currentTargets.rainOpacity, LERP_SPEED);
    sakuraMat.opacity = lerp(sakuraMat.opacity, currentTargets.sakuraOpacity, LERP_SPEED);
    snowMat.opacity = lerp(snowMat.opacity, currentTargets.snowOpacity, LERP_SPEED);

    // -------------------------------------------------------------
    // Camera Lerp
    // -------------------------------------------------------------
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    // -------------------------------------------------------------
    // 1. Update Leaves (Active in Summer, Spring & Wind)
    // -------------------------------------------------------------
    const leavesSpeedMultiplier = (currentWeather === 'monsoon') ? 1.6 : ((currentWeather === 'winter') ? 0.35 : 1.0);
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      const data = leaf.userData;

      leaf.position.y -= data.fallSpeed * leavesSpeedMultiplier;
      leaf.position.x = data.baseX + Math.sin(elapsedTime * data.wobbleFreq + data.phase) * 2;
      leaf.position.z += Math.cos(elapsedTime * 0.5 + data.phase) * 0.015;

      leaf.rotation.x += data.spinSpeedX * leavesSpeedMultiplier;
      leaf.rotation.y += data.spinSpeedY * leavesSpeedMultiplier;
      leaf.rotation.z += (data.spinSpeedZ + Math.sin(elapsedTime * 2 + data.phase) * data.wobbleAmp) * leavesSpeedMultiplier;

      if (leaf.position.y < -22) {
        leaf.position.y = 25;
        leaf.position.x = (Math.random() - 0.5) * 60;
        data.baseX = leaf.position.x;
      }
    }

    // -------------------------------------------------------------
    // 2. Update Summer Sun Dust
    // -------------------------------------------------------------
    if (sunDustMat.opacity > 0.02) {
      const pos = sunDustGeo.attributes.position;
      for (let i = 0; i < SUN_DUST_COUNT; i++) {
        const i3 = i * 3;
        const d = sunDustData[i];
        pos.array[i3 + 1] += d.vy; // Rising sun motes
        pos.array[i3] += Math.sin(elapsedTime * 0.8 + d.phase) * 0.012;

        if (pos.array[i3 + 1] > 25) {
          pos.array[i3 + 1] = -20;
          pos.array[i3] = (Math.random() - 0.5) * 60;
        }
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------
    // 3. Update Monsoon Rain
    // -------------------------------------------------------------
    if (rainMat.opacity > 0.02) {
      const pos = rainGeo.attributes.position;
      for (let i = 0; i < RAIN_COUNT; i++) {
        const i3 = i * 3;
        const d = rainData[i];
        pos.array[i3 + 1] -= d.speed;
        pos.array[i3] += d.slant;

        if (pos.array[i3 + 1] < -22) {
          pos.array[i3 + 1] = 30 + Math.random() * 5;
          pos.array[i3] = (Math.random() - 0.5) * 70;
        }
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------
    // 4. Update Spring Sakura Petals
    // -------------------------------------------------------------
    if (sakuraMat.opacity > 0.02) {
      const pos = sakuraGeo.attributes.position;
      for (let i = 0; i < SAKURA_COUNT; i++) {
        const i3 = i * 3;
        const d = sakuraData[i];
        pos.array[i3 + 1] -= d.fallSpeed;
        pos.array[i3] += d.driftX + Math.sin(elapsedTime * d.swaySpeed + d.phase) * d.swayAmp;
        pos.array[i3 + 2] += Math.cos(elapsedTime + d.phase) * 0.01;

        if (pos.array[i3 + 1] < -22) {
          pos.array[i3 + 1] = 28;
          pos.array[i3] = (Math.random() - 0.5) * 65;
        }
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------
    // 5. Update Winter Snowflakes
    // -------------------------------------------------------------
    if (snowMat.opacity > 0.02) {
      const pos = snowGeo.attributes.position;
      for (let i = 0; i < SNOW_COUNT; i++) {
        const i3 = i * 3;
        const d = snowData[i];
        pos.array[i3 + 1] -= d.fallSpeed;
        pos.array[i3] += d.windDrift + Math.sin(elapsedTime * d.wobbleFreq + d.phase) * d.wobbleAmp;

        if (pos.array[i3 + 1] < -22) {
          pos.array[i3 + 1] = 28;
          pos.array[i3] = (Math.random() - 0.5) * 65;
        }
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------
    // 6. Update Fireflies
    // -------------------------------------------------------------
    const posAttr = fireflyGeo.attributes.position;
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const i3 = i * 3;
      const data = fireflyData[i];

      posAttr.array[i3] += data.vx + Math.sin(elapsedTime + data.phase) * 0.015;
      posAttr.array[i3 + 1] += data.vy + Math.cos(elapsedTime * 0.8 + data.phase) * 0.02;
      posAttr.array[i3 + 2] += data.vz;

      if (posAttr.array[i3 + 1] > 25) posAttr.array[i3 + 1] = -22;
      if (posAttr.array[i3 + 1] < -22) posAttr.array[i3 + 1] = 25;
      if (posAttr.array[i3] > 35) posAttr.array[i3] = -35;
      if (posAttr.array[i3] < -35) posAttr.array[i3] = 35;
    }
    posAttr.needsUpdate = true;

    // Firefly pulse
    fireflyMat.size = 1.0 + Math.sin(elapsedTime * 2.5) * 0.3;

    // -------------------------------------------------------------
    // 7. Update Ambient Glass Orbs
    // -------------------------------------------------------------
    for (let i = 0; i < ambientOrbs.length; i++) {
      const orb = ambientOrbs[i];
      orb.position.y = orb.userData.baseY + Math.sin(elapsedTime * orb.userData.speed + orb.userData.phase) * 1.5;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
