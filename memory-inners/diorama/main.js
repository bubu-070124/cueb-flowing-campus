import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.getElementById('scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x090507);
scene.fog=new THREE.Fog(0x090507,145,260);

const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,500);
const homePosition=new THREE.Vector3(86,56,112);
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

scene.add(new THREE.HemisphereLight(0xfff2dd,0x341018,2.1));
const sun=new THREE.DirectionalLight(0xffead1,4.4);
sun.position.set(-65,100,80);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
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

const materials={
  crimson:new THREE.MeshStandardMaterial({color:0x9f1727,roughness:.72,metalness:.03}),
  deepRed:new THREE.MeshStandardMaterial({color:0x66101b,roughness:.78}),
  concrete:new THREE.MeshStandardMaterial({color:0xd7c9ad,roughness:.9}),
  concreteDark:new THREE.MeshStandardMaterial({color:0xa69579,roughness:.9}),
  window:new THREE.MeshStandardMaterial({color:0x253845,roughness:.3,metalness:.38}),
  glass:new THREE.MeshStandardMaterial({color:0x6d8b96,roughness:.24,metalness:.18}),
  plaza:new THREE.MeshStandardMaterial({color:0xb6a48a,roughness:.96}),
  soil:new THREE.MeshStandardMaterial({color:0x4b3328,roughness:1}),
  trunk:new THREE.MeshStandardMaterial({color:0x5b3d28,roughness:1}),
  leaf:new THREE.MeshStandardMaterial({color:0x48662d,roughness:.95}),
  leafLight:new THREE.MeshStandardMaterial({color:0x708141,roughness:.95}),
  base:new THREE.MeshStandardMaterial({color:0x720b17,roughness:.48,metalness:.24})
};
const edges=[];
let solidCount=0;

function finishMesh(mesh,outline=true){
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  model.add(mesh);
  solidCount++;
  if(outline){
    const line=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,28),new THREE.LineBasicMaterial({color:0x2a1415,transparent:true,opacity:.32}));
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

function cylinder(radius,height,x,y,z,material,segments=24){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material);
  mesh.position.set(x,y,z);
  return finishMesh(mesh,true);
}

function addTree(x,z,height=15,scale=1){
  cylinder(.62*scale,height,x,height/2,z,materials.trunk,12);
  const foliage=[[0,0,0],[2.7,0,-.5],[-2.5,.2,.5],[.4,2.7,.3]];
  foliage.forEach(([dx,dy,dz],index)=>{
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry((3.7+(index%2)*.55)*scale,1),index===3?materials.leafLight:materials.leaf);
    mesh.position.set(x+dx*scale,height-1.3+dy*scale,z+dz*scale);
    finishMesh(mesh,false);
  });
}

const plinth=new THREE.Mesh(new THREE.CylinderGeometry(73,78,5.5,72),materials.base);
plinth.position.y=-3.6;
finishMesh(plinth,true);
box(132,1.1,94,0,-.25,-1,materials.plaza,true);
const grid=new THREE.GridHelper(126,18,0x846f5d,0x846f5d);
grid.position.set(0,.32,4);
grid.material.transparent=true;
grid.material.opacity=.34;
model.add(grid);

// shortcut: photo-matched concept massing, replace with measured/multi-view capture for survey accuracy.
box(66,30,20,4,15,-31,materials.concrete,true);
box(54,20,2,0,20,-20,materials.crimson,true);
box(11,33,22,7,16.5,-30,materials.concreteDark,true);
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
    box(3.7,2.2,.55,x,14+row*4.7,-18.65,materials.window,false);
  }
}
for(let row=0;row<5;row++) box(5.8,2.2,.6,7,10+row*4.7,-18.55,materials.glass,false);

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

console.assert(solidCount>70,'3D block model should contain more than 70 independent solids');
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
  edges.forEach(line=>{line.material.opacity=strongEdges ? .82 : .32;});
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
