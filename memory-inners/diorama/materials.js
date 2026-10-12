import * as THREE from 'three';

// Surface appearance inferred from the reference, not a specification of actual building products.
export function architecturalMaterial(kind, color, roughness=.85){
  const size=512, canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=color;ctx.fillRect(0,0,size,size);
  let seed=43;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<28000;i++){
    ctx.fillStyle=random()>.5?'#ffffff':'#24201c';ctx.globalAlpha=random()*.14;
    ctx.fillRect(random()*size,random()*size,random()*2+1,random()*2+1);
  }
  ctx.globalAlpha=1;
  const row=kind==='brick'?32:128, col=kind==='brick'?128:256;
  ctx.strokeStyle=kind==='brick'?'#61504b':'#827e75';ctx.lineWidth=2;
  for(let y=0;y<size;y+=row){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke();
    for(let x=-(y/row%2)*col/2;x<size;x+=col){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+row);ctx.stroke();}
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  map.wrapS=map.wrapT=THREE.RepeatWrapping;
  const bump=map.clone();bump.colorSpace=THREE.NoColorSpace;
  const mat=new THREE.MeshStandardMaterial({map,bumpMap:bump,bumpScale:kind==='brick'?.035:.018,roughness});
  // World-space mapping keeps joints consistent on differently sized geometry.
  mat.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 surfacePosition; varying vec3 surfaceNormal;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsurfacePosition=(modelMatrix*vec4(position,1.0)).xyz;surfaceNormal=normalize(mat3(modelMatrix)*normal);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 surfacePosition; varying vec3 surfaceNormal;');
    const uv='(abs(surfaceNormal.y)>.7 ? surfacePosition.xz : (abs(surfaceNormal.x)>.7 ? surfacePosition.zy : surfacePosition.xy))/8.0';
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`diffuseColor *= texture2D(map,${uv});`);
  };
  return mat;
}

export function addSkyEnvironment(renderer,scene){
  const sky=new THREE.Scene();sky.background=new THREE.Color('#afc9de');
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:'#797869'}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-35;sky.add(ground);
  for(let i=0;i<8;i++){
    const panel=new THREE.Mesh(new THREE.BoxGeometry(30,20,10),new THREE.MeshBasicMaterial({color:i%2?'#647458':'#e1d9c5'}));
    panel.position.set(Math.cos(i)*90,-10,Math.sin(i)*90);sky.add(panel);
  }
  const pmrem=new THREE.PMREMGenerator(renderer);
  const target=pmrem.fromScene(sky,.06);scene.environment=target.texture;pmrem.dispose();
}

export function detailedTree(THREE,model,x,z,height,scale){
  let seed=Math.round((x+100)*913+z*31);
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const bark=new THREE.MeshStandardMaterial({color:'#5e5849',roughness:1});
  function branch(a,b,r){
    const delta=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.52,r,delta.length(),7),bark);
    mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;model.add(mesh);
  }
  branch(new THREE.Vector3(x,0,z),new THREE.Vector3(x,height,z),.34*scale);
  const leafMaterial=new THREE.MeshStandardMaterial({color:'#688247',roughness:.95,side:THREE.DoubleSide});
  const leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,4,2),leafMaterial,2800);
  const dummy=new THREE.Object3D();const color=new THREE.Color();let count=0;
  for(let b=0;b<22;b++){
    const angle=rand()*Math.PI*2;const radius=(2+rand()*3)*scale;
    const center=new THREE.Vector3(x+Math.cos(angle)*radius,height-3+rand()*6,z+Math.sin(angle)*radius);
    branch(new THREE.Vector3(x,height*.57,z),center,.09*scale);
    for(let i=0;i<125;i++){
      const u=rand()*Math.PI*2,v=Math.acos(2*rand()-1),r=Math.cbrt(rand())*2.7*scale;
      dummy.position.set(center.x+r*Math.sin(v)*Math.cos(u),center.y+r*Math.cos(v)*1.25,center.z+r*Math.sin(v)*Math.sin(u));
      dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.scale.set(.18+rand()*.19,.04,.1+rand()*.16);dummy.updateMatrix();leaves.setMatrixAt(count,dummy.matrix);
      color.setHSL(.22+rand()*.055,.30+rand()*.22,.19+rand()*.19);leaves.setColorAt(count++,color);
    }
  }
  leaves.count=count;leaves.castShadow=true;leaves.receiveShadow=true;model.add(leaves);
}
