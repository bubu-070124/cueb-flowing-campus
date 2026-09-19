import { ArtEngine } from './engine.js?v=20260912-7';

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('webgl-canvas');
  const engine = new ArtEngine(canvas);
  await engine.loadSceneData();
  function animate() {
    requestAnimationFrame(animate);
    engine.update();
    engine.render();
  }
  animate();
});
