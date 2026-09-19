import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { CONFIG } from './config.js?v=20260912-7';
import { PointCloudShader } from './shaders.js?v=20260912-7';

export class ArtEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.ripples = Array.from({ length: 2 }, () => ({
      active: false,
      startTime: 0,
      center: new THREE.Vector2(0, 0)
    }));
    this.nextRipple = 0;
    this.initScene();
    this.initPostProcessing();
    this.initInteraction();
    this.bindEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040507);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      aspect,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    this.camera.position.set(...CONFIG.camera.initialPos);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = CONFIG.postprocessing.exposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 400;
    this.controls.minDistance = 30;
    this.controls.target.set(...CONFIG.camera.targetPos);

    this.hitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  initPostProcessing() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      size,
      CONFIG.postprocessing.bloomStrength,
      CONFIG.postprocessing.bloomRadius,
      CONFIG.postprocessing.bloomThreshold
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  async loadSceneData() {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.buildPointCloud(img);
        resolve(true);
      };
      img.onerror = () => {
        console.warn('图片加载失败，使用占位图');
        this.buildPointCloud(this.createFallback());
        resolve(false);
      };
      img.src = CONFIG.image.src;
    });
  }

  createFallback() {
    const w = CONFIG.image.sampleWidth;
    const h = CONFIG.image.sampleHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a3036';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6b2b27';
    ctx.fillRect(0, h * 0.4, w, h * 0.1);
    ctx.fillStyle = '#385c2c';
    ctx.fillRect(0, h * 0.5, w, h * 0.5);
    return canvas;
  }

  computeRelief(r, g, b, v) {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const mode = CONFIG.image.reliefMode || 'generic';
    const amount = CONFIG.image.studentRelief ?? 2.0;

    if (mode === 'military') {
      if (v > 0.45) {
        const isGrass = (g > r * 1.14) && (g > b * 1.14);
        const isTrack = (r > g * 1.28) && (r > b * 1.28);
        if (!isGrass && !isTrack && lum < 0.44) {
          return { flag: 1.0, lift: amount };
        }
      }
      return { flag: 0.0, lift: 0.0 };
    }

    // generic: darker midtones gently lift (people/furniture/edges), avoid flat wall spikes
    if (lum < 0.18) return { flag: 1.0, lift: amount * 0.35 };
    if (lum < 0.38) return { flag: 0.6, lift: amount * (0.55 + (0.38 - lum)) };
    if (lum > 0.78) return { flag: 0.0, lift: -amount * 0.12 };
    return { flag: 0.0, lift: 0.0 };
  }

  buildPointCloud(imageSource) {
    const w = CONFIG.image.sampleWidth;
    const h = CONFIG.image.sampleHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(imageSource, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;
    const totalPoints = w * h;

    const positions = new Float32Array(totalPoints * 3);
    const origins = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const isCadre = new Float32Array(totalPoints);
    const angles = new Float32Array(totalPoints);
    const randoms = new Float32Array(totalPoints);
    const jitterDirs = new Float32Array(totalPoints * 2);

    const worldWidth = 146.0;
    const worldHeight = worldWidth * (h / w);
    let pIdx = 0;
    let aIdx = 0;
    let jIdx = 0;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = imgData[i] / 255.0;
        const g = imgData[i + 1] / 255.0;
        const b = imgData[i + 2] / 255.0;

        const subJitterX = (Math.random() - 0.5) * 0.85;
        const subJitterY = (Math.random() - 0.5) * 0.85;
        const px = ((x + subJitterX) / w - 0.5) * worldWidth;
        const py = (0.5 - (y + subJitterY) / h) * worldHeight;
        const groundZ = (0.5 - v) * worldHeight * CONFIG.image.fieldPitch;

        const relief = this.computeRelief(r, g, b, v);
        const pz = groundZ + relief.lift;

        positions[pIdx] = px;
        positions[pIdx + 1] = py;
        positions[pIdx + 2] = pz;
        origins[pIdx] = px;
        origins[pIdx + 1] = py;
        origins[pIdx + 2] = pz;
        colors[pIdx] = r;
        colors[pIdx + 1] = g;
        colors[pIdx + 2] = b;

        const randVal = Math.random();
        randoms[aIdx] = randVal;
        isCadre[aIdx] = relief.flag;
        angles[aIdx] = Math.atan2(py, px);
        const jAngle = Math.random() * 6.28;
        jitterDirs[jIdx] = Math.cos(jAngle);
        jitterDirs[jIdx + 1] = Math.sin(jAngle);

        pIdx += 3;
        aIdx += 1;
        jIdx += 2;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aIsCadre', new THREE.BufferAttribute(isCadre, 1));
    geometry.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('aJitterDir', new THREE.BufferAttribute(jitterDirs, 2));

    this.uniforms = {
      uTime: { value: 0.0 },
      uRippleTimes: { value: [0.0, 0.0] },
      uRippleCenters: { value: [new THREE.Vector2(), new THREE.Vector2()] },
      uRippleStrengths: { value: [0.0, 0.0] },
      uPointSize: { value: CONFIG.particles.baseSize },
      uGoldTint: { value: new THREE.Color(...CONFIG.particles.softGoldTint) },
      uCrimsonTint: { value: new THREE.Color(...CONFIG.particles.mutedCrimsonTint) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: PointCloudShader.vertexShader,
      fragmentShader: PointCloudShader.fragmentShader,
      uniforms: this.uniforms,
      vertexColors: true,
      transparent: false,
      depthTest: true,
      depthWrite: true
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  triggerRippleAt(worldX, worldY) {
    const index = this.nextRipple;
    const ripple = this.ripples[index];
    ripple.active = true;
    ripple.startTime = this.clock.getElapsedTime();
    ripple.center.set(worldX, worldY);
    this.nextRipple = (index + 1) % this.ripples.length;
    if (this.uniforms) {
      this.uniforms.uRippleCenters.value[index].copy(ripple.center);
      this.uniforms.uRippleTimes.value[index] = 0.0;
      this.uniforms.uRippleStrengths.value[index] = 1.0;
    }
    const tip = document.getElementById('instruction');
    if (tip) tip.style.opacity = '0';
  }

  initInteraction() {
    const handleInput = (clientX, clientY) => {
      this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.hitPlane, hit)) {
        this.triggerRippleAt(hit.x, hit.y);
      } else {
        this.triggerRippleAt(0, 0);
      }
    };
    window.addEventListener('pointerdown', (e) => handleInput(e.clientX, e.clientY));
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.composer.setSize(w, h);
    });
  }

  update() {
    const elapsed = this.clock.getElapsedTime();
    if (this.uniforms) {
      this.uniforms.uTime.value = elapsed;
      this.ripples.forEach((ripple, index) => {
        if (!ripple.active) return;
        const age = elapsed - ripple.startTime;
        this.uniforms.uRippleTimes.value[index] = age;
        if (age > CONFIG.interaction.duration) {
          ripple.active = false;
          this.uniforms.uRippleStrengths.value[index] = 0.0;
        } else {
          const p = age / CONFIG.interaction.duration;
          this.uniforms.uRippleStrengths.value[index] = Math.pow(1.0 - p, 2.2);
        }
      });
    }
    this.controls.update();
  }

  render() {
    this.composer.render();
  }
}
