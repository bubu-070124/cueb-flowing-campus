(function(){
  const track=document.getElementById('photo-track'),toast=document.getElementById('toast');let wall;
  const particles=ParticleMemory.create(document.getElementById('memory-stage'),document.getElementById('memory-frame'),document.getElementById('memory-close'));
  const capture=MockCapture.create(document.getElementById('capture-panel'),result=>{wall.addDemo(result.caption,result.image);wall.resume();show('已收下 · 你的粒子拍立得已加入时间河');});
  function show(message){toast.textContent=message;toast.classList.add('show');clearTimeout(show.timer);show.timer=setTimeout(()=>toast.classList.remove('show'),2600);}
  wall=CampusWall.create(track,item=>{if(item.blank){wall.pause();capture.open();return;}if(!item.memoryPath){show(item.placeholder?'这里正在等待一张真实校园照片':'这一处记忆将在下一阶段苏醒');return;}wall.pause();particles.open(item,null,()=>wall.resume());});
  document.getElementById('capture-panel').addEventListener('close',()=>wall.resume());
})();
