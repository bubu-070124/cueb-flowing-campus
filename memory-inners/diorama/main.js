import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { architecturalMaterial, addSkyEnvironment, detailedTree } from './materials.js';

const canvas=document.getElementById('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.98;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xa8bdc0,150,280);

const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,500);
const homePosition=new THREE.Vector3(62,35,104);
camera.position.copy(homePosition);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,10,-7);
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.enablePan=false;
controls.minDistance=58;
controls.maxDistance=220;
controls.minPolarAngle=.25;
controls.maxPolarAngle=1.48;
controls.autoRotate=true;
controls.autoRotateSpeed=.45;
controls.update();

scene.add(new THREE.HemisphereLight(0xe8f5ff,0x5c4937,.8));
addSkyEnvironment(renderer,scene);
const sun=new THREE.DirectionalLight(0xfff2dc,3.1);
sun.position.set(-65,100,80);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.normalBias=.045;
sun.shadow.camera.left=-100;
sun.shadow.camera.right=100;
sun.shadow.camera.top=100;
sun.shadow.camera.bottom=-100;
scene.add(sun);
const fill=new THREE.PointLight(0xb20e15,120,190,2);
fill.position.set(55,20,38);
scene.add(fill);

const model=new THREE.Group();
model.rotation.y=-.08;
scene.add(model);

function surfaceTexture(base,detail,grid=0){
  const size=512;
  const surface=document.createElement('canvas');
  surface.width=surface.height=size;
  const context=surface.getContext('2d');
  context.fillStyle=base;
  context.fillRect(0,0,size,size);
  context.fillStyle=detail;
  for(let i=0;i<3800;i++){
    const alpha=.025+Math.random()*.07;
    context.globalAlpha=alpha;
    const radius=.3+Math.random()*1.7;
    context.fillRect(Math.random()*size,Math.random()*size,radius,radius);
  }
  context.globalAlpha=grid?.22:1;
  if(grid){
    context.strokeStyle=detail;
    context.lineWidth=1;
    for(let p=0;p<=size;p+=grid){context.beginPath();context.moveTo(p,0);context.lineTo(p,size);context.stroke();context.beginPath();context.moveTo(0,p);context.lineTo(size,p);context.stroke();}
  }
  context.globalAlpha=1;
  const texture=new THREE.CanvasTexture(surface);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(grid?3:2,grid?3:2);
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const wallTexture=surfaceTexture('#d9cbb6','#7c6a57');
const redTexture=surfaceTexture('#9e1829','#4b0711');
const pavingTexture=surfaceTexture('#b8aa96','#76695a',64);
const barkTexture=surfaceTexture('#64442e','#27180f');
const materials={
  crimson:new THREE.MeshStandardMaterial({map:redTexture,color:0xffffff,roughness:.78,metalness:.02}),
  deepRed:new THREE.MeshStandardMaterial({color:0x67131d,roughness:.82}),
  concrete:new THREE.MeshStandardMaterial({map:wallTexture,color:0xfff4df,roughness:.94}),
  concreteDark:new THREE.MeshStandardMaterial({map:wallTexture,color:0xb5a184,roughness:.94}),
  window:new THREE.MeshPhysicalMaterial({color:0x294454,roughness:.12,metalness:.14,clearcoat:1,clearcoatRoughness:.12,emissive:0x10252d,emissiveIntensity:.28}),
  glass:new THREE.MeshPhysicalMaterial({color:0x779cab,roughness:.08,metalness:.08,clearcoat:1,clearcoatRoughness:.08,emissive:0x213b44,emissiveIntensity:.18}),
  frame:new THREE.MeshStandardMaterial({color:0xe7dfd0,roughness:.48,metalness:.32}),
  metal:new THREE.MeshStandardMaterial({color:0x5a5e5d,roughness:.28,metalness:.76}),
  plaza:new THREE.MeshStandardMaterial({map:pavingTexture,color:0xf0e4ce,roughness:.96}),
  soil:new THREE.MeshStandardMaterial({color:0x493125,roughness:1}),
  trunk:new THREE.MeshStandardMaterial({map:barkTexture,color:0x8a6246,roughness:1}),
  leaf:new THREE.MeshStandardMaterial({color:0x44672f,roughness:.88}),
  leafLight:new THREE.MeshStandardMaterial({color:0x718e49,roughness:.86}),
  base:new THREE.MeshStandardMaterial({color:0x5e5850,roughness:.88,metalness:.04})
};
const edges=[];
materials.crimson=architecturalMaterial('brick','#79504c');
materials.concrete=architecturalMaterial('stone','#b3afa2');
materials.concreteDark=architecturalMaterial('stone','#8e8b80');
materials.plaza=architecturalMaterial('stone','#b8b5aa');
materials.window.color.set('#7a9dad');materials.window.emissiveIntensity=0;materials.window.roughness=.18;materials.window.metalness=.3;
materials.glass.color.set('#a0b6bf');materials.glass.emissiveIntensity=0;
let solidCount=0;

function finishMesh(mesh,outline=true){
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  model.add(mesh);
  solidCount++;
  if(outline){
    const line=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,28),new THREE.LineBasicMaterial({color:0x2a2522,transparent:true,opacity:0}));
    line.position.copy(mesh.position);
    line.rotation.copy(mesh.rotation);
    line.scale.copy(mesh.scale);
    model.add(line);
    edges.push(line);
  }
  return mesh;
}

function box(w,h,d,x,y,z,material,outline=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  return finishMesh(mesh,outline);
}

function cylinder(radius,height,x,y,z,material,segments=32){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material);
  mesh.position.set(x,y,z);
  return finishMesh(mesh,true);
}

function beamBetween(start,end,radius,material){
  const direction=new THREE.Vector3().subVectors(end,start);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,direction.length(),12),material);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
  return finishMesh(mesh,false);
}

function framedWindow(x,y,z,w=3.7,h=2.2){
  box(w,h,.55,x,y,z,materials.window,false);
  box(w+.35,.16,.32,x,y+h/2+.08,z+.34,materials.frame,false);
  box(w+.35,.16,.32,x,y-h/2-.08,z+.34,materials.frame,false);
  box(.16,h+.16,.32,x-w/2-.08,y,z+.34,materials.frame,false);
  box(.16,h+.16,.32,x+w/2+.08,y,z+.34,materials.frame,false);
  box(.11,h,.36,x,y,z+.37,materials.frame,false);
  box(w,.08,.36,x,y+.15,z+.38,materials.frame,false);
  box(w+.5,.18,.8,x,y-h/2-.2,z+.45,materials.concrete,false);
  for(const side of [-1,1]){
    box(.95,h+.35,.14,x+side*(w/2+.7),y,z+.15,materials.frame,false);
    for(let slat=0;slat<12;slat++)box(.9,.055,.19,x+side*(w/2+.7),y-h/2+slat*h/11,z+.26,materials.concreteDark,false);
  }
}

function addTree(x,z,height=15,scale=1){
  detailedTree(THREE,model,x,z,height,scale);
}

const plinth=new THREE.Mesh(new THREE.CylinderGeometry(73,78,5.5,72),materials.base);
plinth.position.y=-3.6;
finishMesh(plinth,true);
box(132,1.1,94,0,-.25,-1,materials.plaza,true);
const grid=new THREE.GridHelper(126,18,0x846f5d,0x846f5d);
grid.position.set(0,.32,4);
grid.material.transparent=true;
grid.material.opacity=0;
model.add(grid);

// shortcut: photo-matched concept massing, replace with measured/multi-view capture for survey accuracy.
box(66,30,20,4,15,-31,materials.concrete,true);
box(54,20,2,0,20,-20,materials.crimson,true);
box(11,33,22.5,7,16.5,-30,materials.concreteDark,true);
box(14,6,3,7,4,-18.8,materials.deepRed,true);
box(5,5.2,1,3.8,4,-17.25,materials.glass,false);
box(5,5.2,1,10.2,4,-17.25,materials.glass,false);

cylinder(13,28,-45,14,-33,materials.concrete,32);
box(22,24,22,-31,12,-32,materials.concrete,true);
box(8,22,2,-45,14,-19.7,materials.glass,true);

for(let row=0;row<4;row++){
  for(let column=0;column<8;column++){
    const x=-23+column*6.5;
    if(x>2&&x<12) continue;
    framedWindow(x,14+row*4.7,-18.65);
  }
}

for(let floor=0;floor<5;floor++) box(54,.1,.18,0,11.65+floor*4.7,-18.75,materials.crimson,false);

box(68,1.2,22,4,30.6,-31,materials.concreteDark,true);
box(54,.75,2.8,0,30.1,-19.7,materials.concreteDark,true);
for(let row=0;row<3;row++){
  box(.55,2.2,11,37.3,14+row*5,-31,materials.window,false);
  box(.55,2.2,11,-29.3,14+row*5,-31,materials.window,false);
}

for(let step=0;step<8;step++){
  const height=.45*(step+1);
  box(45-step*.8,height,2.35,7,height/2,-4.3-step*2.05,materials.concrete,true);
}

const railLeftBottom=new THREE.Vector3(-15,1.1,-3.2);
const railLeftTop=new THREE.Vector3(-15,5.1,-20.2);
const railRightBottom=new THREE.Vector3(29,1.1,-3.2);
const railRightTop=new THREE.Vector3(29,5.1,-20.2);
beamBetween(railLeftBottom,railLeftTop,.11,materials.metal);
beamBetween(railRightBottom,railRightTop,.11,materials.metal);
for(let i=0;i<5;i++){
  const t=i/4;
  const z=THREE.MathUtils.lerp(-3.2,-20.2,t);
  const y=THREE.MathUtils.lerp(.2,4.2,t);
  beamBetween(new THREE.Vector3(-15,y,z),new THREE.Vector3(-15,y+1.05,z),.08,materials.metal);
  beamBetween(new THREE.Vector3(29,y,z),new THREE.Vector3(29,y+1.05,z),.08,materials.metal);
}

box(8,2.4,5,-5,32.3,-32,materials.concreteDark,true);
box(6,1.6,4,20,31.9,-30,materials.concreteDark,true);

box(31,1.8,8,-42,.9,-4,materials.concreteDark,true);
box(29,1.35,6,-42,1.65,-4,materials.soil,false);
box(29,1.8,8,44,.9,-7,materials.concreteDark,true);
box(27,1.35,6,44,1.65,-7,materials.soil,false);
addTree(-51,-3,16,1.05);
addTree(-38,-5,14,.9);
addTree(39,-8,17,1.08);
addTree(51,-6,15,.92);

function person(x,z,color){
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.7,4,8),new THREE.MeshStandardMaterial({color,roughness:.85}));
  body.position.set(x,1.55,z);
  finishMesh(body,false);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.43,12,8),new THREE.MeshStandardMaterial({color:0xd3a682,roughness:.9}));
  head.position.set(x,3.25,z);
  finishMesh(head,false);
}
person(-8,10,0x263746);
person(18,2,0x8e1a28);
person(31,18,0x5a6848);

const brickPaving=architecturalMaterial('brick','#89675b');
for(let x=-54;x<=54;x+=18)for(let z=7;z<=39;z+=16)box(10,.04,8,x,.33,z,brickPaving,false);
for(let i=0;i<22;i++)box(40,.035,.06,7,.35+i*.15,-4.2-i*.7,materials.concreteDark,false);
for(let row=0;row<5;row++)for(let column=0;column<5;column++){
  const angle=(column-2)*.16;
  const pane=box(1.7,2.2,.22,7+Math.sin(angle)*12,10+row*4.7,-18.4+Math.cos(angle)*1.3,materials.glass,false);
  pane.rotation.y=angle;
  box(.075,2.3,.23,7+Math.sin(angle)*12,10+row*4.7,-18.18+Math.cos(angle)*1.3,materials.frame,false);
}
const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;
const signContext=signCanvas.getContext('2d');signContext.fillStyle='#33352e';signContext.fillRect(0,0,512,128);signContext.fillStyle='#b6a566';signContext.font='64px serif';signContext.textAlign='center';signContext.fillText('图 书 馆',256,86);
const signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;
box(7.8,1.9,.18,7,7.25,-17.1,new THREE.MeshStandardMaterial({map:signTexture,roughness:.65}),false);

console.assert(solidCount>160,'Detailed 3D model should contain more than 160 independent solids');
document.getElementById('loading').classList.add('done');

let resumeTimer=0;
controls.addEventListener('start',()=>{controls.autoRotate=false;clearTimeout(resumeTimer);});
controls.addEventListener('end',()=>{resumeTimer=setTimeout(()=>{controls.autoRotate=true;},2600);});
document.getElementById('reset').addEventListener('click',()=>{
  controls.autoRotate=false;
  camera.position.copy(homePosition);
  controls.target.set(0,10,-7);
  controls.update();
  clearTimeout(resumeTimer);
  resumeTimer=setTimeout(()=>{controls.autoRotate=true;},1800);
});
let strongEdges=false;
document.getElementById('structure').addEventListener('click',event=>{
  strongEdges=!strongEdges;
  edges.forEach(line=>{line.material.opacity=strongEdges ? .72 : 0;});
  event.currentTarget.textContent=strongEdges?'柔化结构线':'看清几何体';
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
