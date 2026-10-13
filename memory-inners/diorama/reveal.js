const cover=document.getElementById('photo-reveal');
const picture=cover.querySelector('img');
const status=cover.querySelector('p');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let started=false;

export async function revealModel(){
  if(started)return;
  started=true;
  try{await picture.decode();}catch{}
  status.textContent='走进这一帧 · 拖动探索图书馆';
  await new Promise(resolve=>setTimeout(resolve,reduced?0:850));
  cover.classList.add('revealed');
  cover.setAttribute('aria-hidden','true');
}

setTimeout(()=>{if(!started){status.textContent='场景仍在加载，你可以返回照片墙后重试';}},12000);
document.getElementById('back-wall').addEventListener('click',()=>{
  if(parent!==window)parent.postMessage({type:'campus-close'},location.origin);
  else location.href='../../?v=20261012-6';
});
addEventListener('keydown',event=>{
  if(event.key==='Escape')document.getElementById('back-wall').click();
});
