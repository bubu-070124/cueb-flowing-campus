const SCENES={
  library:{title:'图书馆前',src:'../../assets/library.jpg',sampleWidth:577,sampleHeight:433,fieldPitch:-.2,relief:2},
  cafeteria:{title:'食堂',src:'../../assets/cafeteria.jpg',sampleWidth:619,sampleHeight:404,fieldPitch:-.2,relief:2},
  road:{title:'林荫路',src:'../../assets/campus-road.jpg',sampleWidth:813,sampleHeight:308,fieldPitch:-.18,relief:2.2},
  sunset:{title:'夕阳小路',src:'../../assets/campus-sunset.jpg',sampleWidth:435,sampleHeight:575,fieldPitch:-.28,relief:2.4},
  classroom:{title:'阶梯教室',src:'../../assets/classroom.jpg',sampleWidth:730,sampleHeight:342,fieldPitch:-.18,relief:1.8},
  'stairs-sun':{title:'午间楼梯',src:'../../assets/stairs-sun.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.24,relief:2.2},
  'classroom-autumn':{title:'秋日教室',src:'../../assets/classroom-autumn.jpg',sampleWidth:577,sampleHeight:433,fieldPitch:-.18,relief:1.8},
  'coffee-corner':{title:'小白房子',src:'../../assets/coffee-corner.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.24,relief:2.2},
  'campus-cat':{title:'校园猫',src:'../../assets/campus-cat.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.22,relief:2.1},
  tulips:{title:'春日花开',src:'../../assets/tulips.jpg',sampleWidth:577,sampleHeight:433,fieldPitch:-.2,relief:2},
  'spring-road':{title:'春日林荫路',src:'../../assets/spring-road.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.27,relief:2.4},
  'autumn-road':{title:'深秋树影',src:'../../assets/autumn-road.jpg',sampleWidth:577,sampleHeight:433,fieldPitch:-.23,relief:2.3},
  'ginkgo-road':{title:'银杏路',src:'../../assets/ginkgo-road.jpg',sampleWidth:577,sampleHeight:433,fieldPitch:-.23,relief:2.3},
  'tree-tunnel':{title:'树下小路',src:'../../assets/tree-tunnel.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.27,relief:2.4},
  'snow-road':{title:'冬日初雪',src:'../../assets/snow-road.jpg',sampleWidth:433,sampleHeight:577,fieldPitch:-.27,relief:2.4},
  graduation:{title:'毕业时刻',src:'../../assets/graduation.jpg',sampleWidth:594,sampleHeight:422,fieldPitch:-.2,relief:2.6},
  'video-memory':{title:'雨中同行',src:'../../assets/campus-memory.mp4',sampleWidth:320,sampleHeight:180,fieldPitch:-.2,relief:2.2,mediaType:'video'},
  'video-learning-building':{title:'仰望博学楼',src:'../../assets/campus-memory-2.mp4',sampleWidth:180,sampleHeight:320,fieldPitch:-.12,relief:2.1,mediaType:'video',cameraZ:330},
  'video-red-building':{title:'红砖楼前',src:'../../assets/campus-memory-3.mp4',sampleWidth:320,sampleHeight:180,fieldPitch:-.18,relief:2.1,mediaType:'video'},
  'video-campus-walk':{title:'放学路上',src:'../../assets/campus-memory-4.mp4',sampleWidth:320,sampleHeight:180,fieldPitch:-.2,relief:2.3,mediaType:'video'},
  'video-teaching-building':{title:'教学楼前',src:'../../assets/campus-memory-5.mp4',sampleWidth:320,sampleHeight:180,fieldPitch:-.18,relief:2.1,mediaType:'video'}
};
const requested=new URLSearchParams(location.search).get('scene');
export const SCENE=SCENES[requested]||SCENES.library;
export const CONFIG={
  image:{src:SCENE.src,mediaType:SCENE.mediaType||'image',sampleWidth:SCENE.sampleWidth,sampleHeight:SCENE.sampleHeight,fieldPitch:SCENE.fieldPitch,baseDepthScale:7.5,studentRelief:SCENE.relief,reliefMode:'generic'},
  particles:{baseSize:2.1,idleFloating:.28,softGoldTint:[.88,.72,.45],mutedCrimsonTint:[.72,.22,.22]},
  interaction:{duration:5,bloomRadius:40,scatterSpread:1.35},
  postprocessing:{bloomStrength:.12,bloomRadius:.2,bloomThreshold:.94,exposure:.78},
  camera:{fov:45,near:.1,far:2000,initialPos:[0,-8,SCENE.cameraZ||178],targetPos:[0,2,0]}
};
