(function(){
  function create(stage,frame,closeButton){
    let active=false,onDone=()=>{},closeTimer=0,returnFocus=null;
    function close(){if(!active)return;active=false;stage.classList.remove('active');stage.setAttribute('aria-hidden','true');const done=onDone;closeTimer=setTimeout(()=>{frame.src='about:blank';done();returnFocus?.focus({preventScroll:true});},420);}
    function open(item,_card,done){if(!item.memoryPath)return;clearTimeout(closeTimer);returnFocus=_card||document.activeElement;onDone=done;frame.title=`${item.title} · ${item.diorama?'3D 微缩场景':'粒子回忆'}`;frame.src=`${item.memoryPath}${item.memoryPath.includes('?')?'&':'?'}v=20261012-6`;stage.classList.add('active');stage.setAttribute('aria-hidden','false');active=true;closeButton.focus();}
    addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='campus-close')close();});
    closeButton.onclick=close;addEventListener('keydown',event=>{if(event.key==='Escape')close();});return{open,close};
  }
  window.ParticleMemory={create};
})();
