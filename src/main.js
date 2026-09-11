import * as THREE from 'three';

/* ==========================================================================
   KAIRAX LABS — DEEP-SEA BIOLUMINESCENT 3D ENGINE
   Cinematic Underwater Lighting • Organic Bioluminescent Creature & Branch
   Minimalist Premium Aesthetic
   ========================================================================== */

const state = {
  scrollY: 0,
  scrollProgress: 0,
  targetScrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  soundEnabled: false,
  audioCtx: null,
  simRunning: false,
};

/* ==========================================================================
   HYDRO-ACOUSTIC SOUND SYNTHESIZER (Deep Ocean Tones)
   ========================================================================== */
function initAudio() {
  if (!state.audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      state.audioCtx = new AudioContext();
    }
  }
}

function playHydroSound(type = 'bubble') {
  if (!state.soundEnabled || !state.audioCtx) return;

  try {
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    const now = state.audioCtx.currentTime;
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(state.audioCtx.destination);

    if (type === 'bubble') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'sonar') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'consensus') {
      const chords = [392.00, 493.88, 587.33, 783.99]; // G B D G harmonic
      chords.forEach((freq, idx) => {
        const o = state.audioCtx.createOscillator();
        const g = state.audioCtx.createGain();
        o.connect(g);
        g.connect(state.audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.07, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.55);
      });
    }
  } catch (err) {
    console.warn('Audio note suppressed:', err);
  }
}

// Sound toggle handler
const soundBtn = document.getElementById('sound-btn');
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    const textSpan = soundBtn.querySelector('.sound-text');

    if (state.soundEnabled) {
      textSpan.textContent = 'AUDIO: ON';
      soundBtn.classList.add('active');
      playHydroSound('sonar');
    } else {
      textSpan.textContent = 'AUDIO: OFF';
      soundBtn.classList.remove('active');
    }
  });
}

/* ==========================================================================
   THREE.JS 3D SCENE: SUBMERGED DRIFTWOOD & BIOLUMINESCENT CREATURE
   ========================================================================== */
const canvas = document.getElementById('bg-canvas');
let renderer, scene, camera;
let bioLight, surfaceLight;

function initDeepSeaScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02050b, 0.04);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Deep Sea Atmospheric Lighting
  const ambientOcean = new THREE.AmbientLight(0x06152d, 1.4);
  scene.add(ambientOcean);

  surfaceLight = new THREE.DirectionalLight(0x7dd3fc, 1.2);
  surfaceLight.position.set(2, 8, 4);
  scene.add(surfaceLight);

  // Soft bioluminescent point light responding to cursor
  bioLight = new THREE.PointLight(0x38bdf8, 1.8, 14);
  bioLight.position.set(0, 0, 3);
  scene.add(bioLight);

  window.addEventListener('resize', onWindowResize, { passive: true });
}



function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ==========================================================================
   SCROLL-DRIVEN 3D MOTION ENGINE
   ========================================================================== */
const titleElement = document.getElementById('scroll-3d-title');
const backdropLayer = document.getElementById('abyss-backdrop');
const hudCam = document.getElementById('hud-cam');
const hudDepth = document.getElementById('hud-depth');

function handleScroll() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const currentScroll = window.scrollY;
  state.scrollY = currentScroll;
  state.scrollProgress = docHeight > 0 ? Math.min(Math.max(currentScroll / docHeight, 0), 1) : 0;

  // 1. Kinetic 3D Scroll Motion for the startup name "Kairax Labs"
  if (titleElement) {
    const heroHeight = window.innerHeight * 0.85;
    const heroProgress = Math.min(Math.max(currentScroll / heroHeight, 0), 1.6);

    // Smooth, clean 3D perspective translation, subtle tilt, and z-displacement
    const rotX = heroProgress * 22;
    const rotY = Math.sin(heroProgress * Math.PI) * 14;
    const transZ = -heroProgress * 110;
    const scale = 1 - heroProgress * 0.18;
    const opacity = Math.max(1 - heroProgress * 0.7, 0.25);
    const blur = heroProgress * 4;

    titleElement.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${transZ.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    titleElement.style.opacity = opacity.toFixed(3);
    titleElement.style.filter = `blur(${blur.toFixed(1)}px)`;
  }

  // 2. Parallax on deep sea backdrop layer
  if (backdropLayer) {
    const backdropShift = state.scrollProgress * -60;
    const backdropScale = 1 + state.scrollProgress * 0.06;
    backdropLayer.style.transform = `translateY(${backdropShift.toFixed(1)}px) scale(${backdropScale.toFixed(3)})`;
  }

  // 3. Telemetry Depth counter
  if (hudDepth) {
    const currentMeters = Math.round(420 + state.scrollProgress * 680);
    hudDepth.textContent = `${currentMeters}m`;
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Mouse coordinates
window.addEventListener('mousemove', (e) => {
  state.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  state.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

/* ==========================================================================
   RENDER LOOP (Organic Swimming Waves & Parallax)
   ========================================================================== */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Smooth lerp mouse coordinates
  state.mouseX += (state.targetMouseX - state.mouseX) * 0.04;
  state.mouseY += (state.targetMouseY - state.mouseY) * 0.04;

  // Smooth lerp scroll
  state.targetScrollProgress += (state.scrollProgress - state.targetScrollProgress) * 0.06;
  const sp = state.targetScrollProgress;

  // 1. Subtle 3D Perspective Motion on Deep Sea Backdrop Image
  if (backdropLayer) {
    const rotX = -state.mouseY * 2.8;
    const rotY = state.mouseX * 2.8;
    const transY = -sp * 80;
    const scale = 1.05 + sp * 0.08;
    backdropLayer.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(${transY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
  }

  // 2. Cursor-Responsive Bioluminescent Light
  if (bioLight) {
    bioLight.position.x += (state.mouseX * 3.5 - bioLight.position.x) * 0.08;
    bioLight.position.y += (-state.mouseY * 2.5 - bioLight.position.y) * 0.08;
  }



  // 4. Underwater Camera Waypoints
  const targetCamZ = 8.5 - sp * 3.8;
  const targetCamY = 0.2 - sp * 2.8 + state.mouseY * 0.3;
  const targetCamX = state.mouseX * 0.5;

  camera.position.z += (targetCamZ - camera.position.z) * 0.05;
  camera.position.y += (targetCamY - camera.position.y) * 0.05;
  camera.position.x += (targetCamX - camera.position.x) * 0.05;

  camera.lookAt(0, -sp * 1.2, 0);

  // Update telemetry HUD
  if (hudCam) {
    hudCam.textContent = `Z: ${camera.position.z.toFixed(2)}`;
  }

  renderer.render(scene, camera);
}


/* ==========================================================================
   MINIMALIST 3D CARD TILT EFFECT
   ========================================================================== */
function initTiltCards() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   PROJECT DETAILS MODALS
   ========================================================================== */
function initModals() {
  const triggers = document.querySelectorAll('.btn-modal-trigger');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('open');
        targetModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        playHydroSound('bubble');
      }
    });
  });

  backdrops.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      playHydroSound('bubble');
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      backdrops.forEach(modal => {
        if (modal.classList.contains('open')) {
          modal.classList.remove('open');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    }
  });
}

/* ==========================================================================
   CONTACT FORM DISPATCH
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const interest = document.getElementById('interest').value;

    playHydroSound('bubble');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span>';
    }

    setTimeout(() => {
      if (feedback) {
        feedback.className = 'clean-toast font-mono';
        feedback.innerHTML = `✓ Transmission Confirmed. Thank you ${name}. Your message regarding "${interest}" has been received at hello@kairaxlabs.com.`;
        feedback.classList.remove('hidden');
      }

      form.reset();
      playHydroSound('consensus');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Message Delivered</span>';
      }
    }, 900);
  });
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    playHydroSound('bubble');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initDeepSeaScene();
  animate();
  initTiltCards();
  initModals();
  initContactForm();
  initMobileMenu();
  handleScroll();
});
