(function(){
  function create(stage,frame,closeButton){
    let active=false,onDone=()=>{};
    function close(){if(!active)return;active=false;stage.classList.remove('active');stage.setAttribute('aria-hidden','true');setTimeout(()=>{frame.src='about:blank';onDone();},420);}
    function open(item,_card,done){if(!item.memoryPath)return;onDone=done;frame.title=`${item.title} · 粒子回忆`;frame.src=`${item.memoryPath}${item.memoryPath.includes('?')?'&':'?'}v=20260912-7`;stage.classList.add('active');stage.setAttribute('aria-hidden','false');active=true;}
    closeButton.onclick=close;addEventListener('keydown',event=>{if(event.key==='Escape')close();});return{open,close};
  }
  window.ParticleMemory={create};
})();
