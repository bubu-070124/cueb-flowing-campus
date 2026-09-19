import { ArtEngine } from './engine.js?v=20260914-1';
import { SCENE } from './config.js?v=20260914-1';

window.addEventListener('DOMContentLoaded',async()=>{
  document.title=`CUEB Campus Memory - ${SCENE.title}`;
  document.getElementById('scene-title').textContent=`「${SCENE.title}」`;
  if(SCENE.mediaType==='video'){
    document.querySelector('.sub').textContent='LIVING PARTICLE MEMORY · VIDEO';
    document.querySelector('.hint').textContent='画面正在粒子中流动 · 连续轻触可叠加涟漪';
  }
  const engine=new ArtEngine(document.getElementById('webgl-canvas'));
  await engine.loadSceneData();
  function animate(){requestAnimationFrame(animate);engine.update();engine.render();}
  animate();
});
