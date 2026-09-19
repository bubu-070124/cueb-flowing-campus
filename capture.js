(function(){
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function create(dialog,onAccept){
    const primary=document.getElementById('capture-primary');
    const cancel=document.getElementById('capture-cancel');
    const countdown=document.getElementById('countdown');
    const shoot=document.getElementById('shoot-step');
    const captionStep=document.getElementById('caption-step');
    const input=document.getElementById('caption-input');
    const video=document.getElementById('camera-preview');
    const canvas=document.getElementById('camera-particle-preview');
    const placeholder=document.getElementById('camera-placeholder');
    const uploadButton=document.getElementById('capture-upload');
    const uploadInput=document.getElementById('photo-upload');
    let stream=null,state='idle',particleImage='',busy=false,lastMethod='';

    function stopCamera(){
      if(stream)stream.getTracks().forEach(track=>track.stop());
      stream=null;video.pause();video.srcObject=null;video.removeAttribute('src');video.load();
    }

    function reset(){
      stopCamera();state='idle';particleImage='';busy=false;lastMethod='';input.value='';uploadInput.value='';
      shoot.style.display='block';captionStep.style.display='none';
      video.style.display='none';canvas.style.display='none';countdown.style.display='none';
      placeholder.style.display='block';placeholder.textContent='上传已有照片 · 或开启摄像头现场拍摄';
      uploadButton.style.display='block';uploadButton.disabled=false;
      primary.disabled=false;primary.textContent='开启摄像头';cancel.disabled=false;cancel.textContent='取消';
    }

    async function startCamera(){
      if(!navigator.mediaDevices?.getUserMedia){
        placeholder.textContent='当前浏览器无法调用摄像头，请使用 Chrome 或 Edge 打开本页。';return;
      }
      busy=true;primary.disabled=true;uploadButton.disabled=true;placeholder.style.display='block';placeholder.textContent='正在等待摄像头授权…';
      try{
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
        video.srcObject=stream;await video.play();state='live';
        placeholder.style.display='none';canvas.style.display='none';video.style.display='block';
        primary.textContent='3 秒后拍摄';cancel.textContent='取消';
      }catch(error){
        console.warn('摄像头不可用',error);
        placeholder.style.display='block';placeholder.textContent='没有获得摄像头权限。请允许访问后再试一次。';
        primary.textContent='重新开启';state='idle';
      }finally{busy=false;primary.disabled=false;uploadButton.disabled=false;}
    }

    function renderParticles(media,mirror=false){
      const width=540,height=720,source=document.createElement('canvas');
      source.width=72;source.height=96;
      const raw=source.getContext('2d',{willReadFrequently:true});
      const mediaWidth=media.videoWidth||media.naturalWidth,mediaHeight=media.videoHeight||media.naturalHeight;
      const mediaRatio=mediaWidth/mediaHeight,targetRatio=source.width/source.height;
      let sx=0,sy=0,sw=mediaWidth,sh=mediaHeight;
      if(mediaRatio>targetRatio){sw=mediaHeight*targetRatio;sx=(mediaWidth-sw)/2;}else{sh=mediaWidth/targetRatio;sy=(mediaHeight-sh)/2;}
      raw.save();if(mirror){raw.translate(source.width,0);raw.scale(-1,1);}raw.drawImage(media,sx,sy,sw,sh,0,0,source.width,source.height);raw.restore();
      const pixels=raw.getImageData(0,0,source.width,source.height).data;
      canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#17070b';ctx.fillRect(0,0,width,height);
      const step=width/source.width;
      for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++){
        const i=(y*source.width+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        const light=(r+g+b)/765;if(light<.055)continue;
        ctx.fillStyle=`rgba(${Math.min(255,r+18)},${Math.min(235,g+8)},${Math.min(225,b+5)},${.28+light*.68})`;
        ctx.beginPath();ctx.arc((x+.5)*step+(y%2?1.2:-1.2),(y+.5)*step,1.1+light*2.45,0,Math.PI*2);ctx.fill();
      }
      const glow=ctx.createRadialGradient(width*.5,height*.42,20,width*.5,height*.48,height*.7);
      glow.addColorStop(0,'rgba(255,216,187,.06)');glow.addColorStop(.72,'rgba(166,25,46,.05)');glow.addColorStop(1,'rgba(20,2,7,.48)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      raw.clearRect(0,0,source.width,source.height);
      particleImage=canvas.toDataURL('image/jpeg',.88);
    }

    function showCaption(method){
      lastMethod=method;video.style.display='none';canvas.style.display='block';placeholder.style.display='none';
      shoot.style.display='none';captionStep.style.display='block';uploadButton.style.display='none';
      state='caption';primary.textContent='确认留下';cancel.textContent=method==='upload'?'重选':'重拍';input.focus();
      busy=false;primary.disabled=false;cancel.disabled=false;
    }

    async function takePhoto(){
      busy=true;primary.disabled=true;cancel.disabled=true;countdown.style.display='block';
      for(let n=3;n>0;n--){countdown.textContent=n;await wait(720);}
      countdown.textContent='✓';renderParticles(video,true);stopCamera();
      await wait(380);countdown.style.display='none';showCaption('camera');
    }

    async function useUpload(file){
      if(!file)return;
      if(!file.type.startsWith('image/')||file.size>25*1024*1024){
        placeholder.style.display='block';placeholder.textContent='请选择 25 MB 以内的 JPG、PNG 或 HEIC 照片。';uploadInput.value='';return;
      }
      busy=true;primary.disabled=true;uploadButton.disabled=true;cancel.disabled=true;stopCamera();
      placeholder.style.display='block';placeholder.textContent='正在把照片变成粒子记忆…';
      const url=URL.createObjectURL(file),image=new Image();
      try{
        image.src=url;await image.decode();renderParticles(image);uploadInput.value='';showCaption('upload');
      }catch(error){
        console.warn('照片读取失败',error);uploadInput.value='';placeholder.textContent='这张照片无法读取，请换一张再试。';
        busy=false;primary.disabled=false;uploadButton.disabled=false;cancel.disabled=false;
      }finally{URL.revokeObjectURL(url);}
    }

    primary.onclick=async()=>{
      if(busy)return;
      if(state==='idle'){await startCamera();return;}
      if(state==='live'){await takePhoto();return;}
      if(state==='caption'){
        onAccept({caption:input.value.trim(),image:particleImage});
        particleImage='';dialog.close();
      }
    };

    uploadButton.onclick=()=>{if(!busy)uploadInput.click();};
    uploadInput.onchange=()=>useUpload(uploadInput.files[0]);

    cancel.onclick=async()=>{
      if(busy)return;
      if(state==='caption'){
        state='idle';particleImage='';shoot.style.display='block';captionStep.style.display='none';canvas.style.display='none';
        uploadButton.style.display='block';primary.textContent='开启摄像头';cancel.textContent='取消';
        placeholder.style.display='block';placeholder.textContent='上传已有照片 · 或开启摄像头现场拍摄';
        if(lastMethod==='upload'){uploadInput.click();return;}await startCamera();return;
      }
      dialog.close();
    };

    dialog.addEventListener('close',reset);
    dialog.addEventListener('cancel',reset);
    return{open(){reset();dialog.showModal();}};
  }
  window.MockCapture={create};
})();
