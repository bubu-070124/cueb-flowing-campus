(function(){
  const memories=[
    {id:'military',title:'初见 · 军训场',note:'从陌生走向同频',src:'assets/thumbs/military.webp',ratio:.75,coverZoom:1.13,memoryPath:'memory-inners/01-military/'},
    {id:'library',title:'进入 · 图书馆前',note:'一座楼，许多人的一天',src:'assets/thumbs/library.webp',ratio:1.33,memoryPath:'memory-inners/generic/?scene=library'},
    {id:'video-learning-building',title:'仰望 · 博学楼',note:'镜头向上，时间从楼面掠过',src:'assets/thumbs/campus-memory-2-poster.webp',ratio:.5625,video:true,memoryPath:'memory-inners/generic/?scene=video-learning-building'},
    {id:'stairs-a',title:'经过 · 楼梯间',note:'阳光沿着扶手向上',src:'assets/thumbs/stairs-wide.webp',ratio:.81,memoryPath:'memory-inners/04-stairs-light/'},
    {id:'stairs-sun',title:'下楼 · 午间光影',note:'脚步穿过一格一格的阳光',src:'assets/thumbs/stairs-sun.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=stairs-sun'},
    {id:'classroom',title:'共同 · 阶梯教室',note:'一排座位等待被坐满',src:'assets/thumbs/classroom.webp',ratio:2.13,memoryPath:'memory-inners/generic/?scene=classroom'},
    {id:'classroom-autumn',title:'窗边 · 秋日教室',note:'树叶替我们记住季节',src:'assets/thumbs/classroom-autumn.webp',ratio:1.33,memoryPath:'memory-inners/generic/?scene=classroom-autumn'},
    {id:'cafeteria',title:'午后 · 食堂',note:'阳光落在我们坐过的位置',src:'assets/thumbs/cafeteria.webp',ratio:1.53,memoryPath:'memory-inners/generic/?scene=cafeteria'},
    {id:'video-red-building',title:'环行 · 红砖楼前',note:'阳光沿弧形屋檐缓慢移动',src:'assets/thumbs/campus-memory-3-poster.webp',ratio:1.78,video:true,memoryPath:'memory-inners/generic/?scene=video-red-building'},
    {id:'coffee-corner',title:'停留 · 小白房子',note:'一杯咖啡的安静时间',src:'assets/thumbs/coffee-corner.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=coffee-corner'},
    {id:'campus-cat',title:'遇见 · 校园猫',note:'它也在这里度过午后',src:'assets/thumbs/campus-cat.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=campus-cat'},
    {id:'tulips',title:'春日 · 花开',note:'颜色在校园里醒来',src:'assets/thumbs/tulips.webp',ratio:1.33,memoryPath:'memory-inners/generic/?scene=tulips'},
    {id:'spring-road',title:'春天 · 林荫路',note:'我们从新绿下面走过',src:'assets/thumbs/spring-road.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=spring-road'},
    {id:'sunset',title:'黄昏 · 林荫小路',note:'阳光又从树影里活过来了',src:'assets/thumbs/campus-sunset.webp',ratio:.76,memoryPath:'memory-inners/generic/?scene=sunset'},
    {id:'autumn-road',title:'深秋 · 树影',note:'季节把路染成金色',src:'assets/thumbs/autumn-road.webp',ratio:1.33,memoryPath:'memory-inners/generic/?scene=autumn-road'},
    {id:'ginkgo-road',title:'同行 · 银杏路',note:'两个人走进同一个秋天',src:'assets/thumbs/ginkgo-road.webp',ratio:1.33,memoryPath:'memory-inners/generic/?scene=ginkgo-road'},
    {id:'tree-tunnel',title:'经过 · 树下',note:'一条每天都会经过的路',src:'assets/thumbs/tree-tunnel.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=tree-tunnel'},
    {id:'snow-road',title:'冬日 · 初雪',note:'脚印继续向前',src:'assets/thumbs/snow-road.webp',ratio:.75,memoryPath:'memory-inners/generic/?scene=snow-road'},
    {id:'road',title:'擦肩 · 校园日常',note:'每个人都在构成校园',src:'assets/thumbs/campus-road.webp',ratio:2.64,memoryPath:'memory-inners/generic/?scene=road'},
    {id:'video-campus-walk',title:'经过 · 放学路上',note:'脚步把普通一天带向前',src:'assets/thumbs/campus-memory-4-poster.webp',ratio:1.78,video:true,memoryPath:'memory-inners/generic/?scene=video-campus-walk'},
    {id:'video-teaching-building',title:'转身 · 教学楼前',note:'光从树影移向玻璃幕墙',src:'assets/thumbs/campus-memory-5-poster.webp',ratio:1.78,video:true,memoryPath:'memory-inners/generic/?scene=video-teaching-building'},
    {id:'video-memory',title:'流动 · 雨中同行',note:'这一帧仍在继续发生',src:'assets/thumbs/campus-memory-poster.webp',ratio:1.78,video:true,memoryPath:'memory-inners/generic/?scene=video-memory'},
    {id:'graduation',title:'毕业 · 操场',note:'毕业不是时间河的终点',src:'assets/thumbs/graduation.webp',ratio:1.41,coverZoom:1.22,memoryPath:'memory-inners/generic/?scene=graduation'},
    {id:'blank',title:'留下你的瞬间',note:'让时间河继续生长',ratio:.75,blank:true}
  ];
  const tilts=['-4deg','2deg','2.5deg','-2deg','1.5deg','-3deg'];
  function layout(item,index){
    const ratio=item.ratio||1.33;
    const w=item.blank||ratio<.95?230:ratio>1.85?400:350;
    const frameHeight=Math.round((w-24)/ratio);
    return{x:48+index*310,y:index%2?`${40+(index%3)*3}%`:`${4+(index%4)*2}%`,w,h:frameHeight+64,tilt:tilts[index%tilts.length],z:2+(index%5),back:index%5===1};
  }
  function card(item,position){
    const el=document.createElement('button');
    el.className=`polaroid ${item.blank?'blank-card ':''}${position.back?'is-back':''}`.trim();el.dataset.id=item.id;
    Object.entries({x:`${position.x}px`,y:position.y,w:`${position.w}px`,h:`${position.h}px`,tilt:position.tilt,z:position.z}).forEach(([key,value])=>el.style.setProperty(`--${key}`,value));
    const coverStyle=item.coverZoom?` style="transform:scale(${item.coverZoom});transform-origin:left top"`:'';
    const visual=item.blank?'<div class="frame"><div><div class="plus">+</div><div class="invite">留下你的瞬间<br>留下你的校园回忆</div></div></div>':item.demo&&!item.src?'<div class="frame"><div class="demo-photo"></div></div>':`<div class="frame"><img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" draggable="false"${coverStyle}></div>`;
    el.innerHTML=`${item.memoryPath?`<span class="tag">${item.video?'动态粒子':'触摸进入'}</span>`:''}${visual}<div class="meta"><b>${item.title}</b><span>${item.note}</span></div>`;el._memory=item;return el;
  }
  function section(items,onSelect){
    const el=document.createElement('div');el.className='wall-section';
    const width=items.length*310+190;el.style.width=`${width}px`;el.style.flexBasis=`${width}px`;
    items.forEach((item,index)=>{const cardEl=card(item,layout(item,index));cardEl.onclick=()=>onSelect(cardEl._memory,cardEl);el.append(cardEl);});return el;
  }
  function create(track,onSelect){
    const viewport=track.parentElement;
    let items=memories.slice(),x=0,last=performance.now(),paused=false,half=items.length*310+190,velocity=0,dragging=false,lastPointerX=0,lastPointerTime=0,dragDistance=0,suppressClick=false;
    function render(){track.replaceChildren(section(items,onSelect),section(items,onSelect));requestAnimationFrame(()=>{half=track.firstElementChild.offsetWidth;});}
    function tick(now){const dt=Math.min(40,now-last);last=now;if(!paused&&!matchMedia('(prefers-reduced-motion: reduce)').matches){x+=(-.018+velocity)*dt;velocity*=Math.exp(-dt/650);if(Math.abs(velocity)<.002)velocity=0;while(-x>=half)x+=half;track.style.transform=`translate3d(${x}px,0,0)`;}requestAnimationFrame(tick);}
    viewport.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;dragDistance=0;lastPointerX=event.clientX;lastPointerTime=performance.now();viewport.classList.add('dragging');});
    addEventListener('pointermove',event=>{if(!dragging)return;const now=performance.now(),dx=event.clientX-lastPointerX,dt=Math.max(8,now-lastPointerTime);dragDistance+=Math.abs(dx);if(dx<0){x+=dx*.9;velocity=Math.max(-.65,Math.min(0,dx/dt*.72));}lastPointerX=event.clientX;lastPointerTime=now;});
    function release(){if(!dragging)return;dragging=false;viewport.classList.remove('dragging');suppressClick=dragDistance>8;setTimeout(()=>{suppressClick=false;},0);}
    addEventListener('pointerup',release);addEventListener('pointercancel',release);viewport.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();}},true);
    render();requestAnimationFrame(tick);return{pause(){paused=true},resume(){paused=false},addDemo(caption,src){items.splice(items.length-1,0,{id:`demo-${Date.now()}`,title:'此刻 · 新的一帧',note:caption||'我们刚好都在这里',ratio:.75,demo:true,src});render();},items:()=>items.slice()};
  }
  console.assert(memories.filter(item=>item.memoryPath).length===23,'二十三个真实素材粒子场景应全部接入');window.CampusWall={create};
})();
