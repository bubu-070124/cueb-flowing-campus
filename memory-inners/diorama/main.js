import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.getElementById('scene');
const loading=document.getElementById('loading');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x080507);
scene.fog=new THREE.FogExp2(0x080507,.0042);

const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,600);
camera.position.set(0,4,154);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,-4,0);
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.enablePan=false;
controls.minDistance=66;
controls.maxDistance=235;
controls.minPolarAngle=.4;
controls.maxPolarAngle=2.3;
controls.autoRotate=true;
controls.autoRotateSpeed=.55;
controls.update();

const world=new THREE.Group();
scene.add(world);

scene.add(new THREE.HemisphereLight(0xfff1dc,0x23070d,1.65));
const key=new THREE.DirectionalLight(0xffdbc1,2.8);
key.position.set(-45,75,72);
scene.add(key);
const rim=new THREE.PointLight(0xb20e15,85,180,2);
rim.position.set(56,8,-38);
scene.add(rim);

const baseMaterial=new THREE.MeshStandardMaterial({color:0x6f0914,roughness:.55,metalness:.25});
const base=new THREE.Mesh(new THREE.CylinderGeometry(64,71,5.2,72),baseMaterial);
base.position.y=-51;
world.add(base);
const baseTop=new THREE.Mesh(new THREE.CylinderGeometry(62.5,62.5,.5,72),new THREE.MeshStandardMaterial({color:0xc9ad84,roughness:.78,metalness:.04}));
baseTop.position.y=-48.15;
world.add(baseTop);
const ring=new THREE.Mesh(new THREE.TorusGeometry(65.8,.42,10,96),new THREE.MeshBasicMaterial({color:0xe6c995}));
ring.rotation.x=Math.PI/2;
ring.position.y=-48.05;
world.add(ring);

function depthForPixel(r,g,b,u,v){
  const lum=.299*r+.587*g+.114*b;
  const green=Math.max(0,g-Math.max(r,b));
  let depth=-12+(v-.48)*27;
  if(v<.34) depth-=10+(.34-v)*34;
  if(v>.58) depth+=(v-.58)*47;
  if((u<.24||u>.78)&&green>.035) depth+=green*34+4;
  depth+=(.48-lum)*4.2;
  return depth;
}

function buildDiorama(image){
  const sampleWidth=260;
  const sampleHeight=Math.round(sampleWidth*image.naturalHeight/image.naturalWidth);
  const sampler=document.createElement('canvas');
  sampler.width=sampleWidth;
  sampler.height=sampleHeight;
  const context=sampler.getContext('2d',{willReadFrequently:true});
  context.drawImage(image,0,0,sampleWidth,sampleHeight);
  const pixels=context.getImageData(0,0,sampleWidth,sampleHeight).data;
  const count=sampleWidth*sampleHeight;
  const positions=new Float32Array(count*3);
  const colors=new Float32Array(count*3);
  const worldWidth=118;
  const worldHeight=worldWidth*sampleHeight/sampleWidth;
  let target=0;
  for(let y=0;y<sampleHeight;y++){
    const v=y/(sampleHeight-1);
    for(let x=0;x<sampleWidth;x++){
      const u=x/(sampleWidth-1);
      const source=(y*sampleWidth+x)*4;
      const r=pixels[source]/255;
      const g=pixels[source+1]/255;
      const b=pixels[source+2]/255;
      const edgeFade=Math.min(1,Math.min(u,1-u,v,1-v)*25);
      const jitter=(Math.sin(x*12.9898+y*78.233)*43758.5453)%1;
      positions[target]=(u-.5)*worldWidth+(jitter-.5)*.22;
      positions[target+1]=(.5-v)*worldHeight-3;
      positions[target+2]=depthForPixel(r,g,b,u,v)+(jitter-.5)*.55;
      colors[target]=r*edgeFade;
      colors[target+1]=g*edgeFade;
      colors[target+2]=b*edgeFade;
      target+=3;
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.computeBoundingSphere();
  const material=new THREE.PointsMaterial({size:.72,sizeAttenuation:true,vertexColors:true,transparent:false,fog:true});
  const points=new THREE.Points(geometry,material);
  points.position.y=2;
  world.add(points);

  const shadow=new THREE.Mesh(new THREE.CircleGeometry(53,72),new THREE.MeshBasicMaterial({color:0x160208,transparent:true,opacity:.56,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;
  shadow.position.set(0,-47.7,3);
  world.add(shadow);
  loading.classList.add('done');
}

const image=document.getElementById('source-photo');
if(image.complete&&image.naturalWidth) buildDiorama(image);
else{
  image.addEventListener('load',()=>buildDiorama(image),{once:true});
  image.addEventListener('error',()=>{loading.textContent='照片加载失败，请刷新重试';},{once:true});
}

let resumeTimer=0;
controls.addEventListener('start',()=>{controls.autoRotate=false;clearTimeout(resumeTimer);});
controls.addEventListener('end',()=>{resumeTimer=setTimeout(()=>{controls.autoRotate=true;},2600);});
document.getElementById('reset').addEventListener('click',()=>{
  controls.autoRotate=false;
  camera.position.set(0,4,154);
  controls.target.set(0,-4,0);
  controls.update();
  clearTimeout(resumeTimer);
  resumeTimer=setTimeout(()=>{controls.autoRotate=true;},1800);
});

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
});

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}
animate();
