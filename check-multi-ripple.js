const assert=require('node:assert');
const fs=require('node:fs');
const roots=['memory-inners/generic','memory-inners/01-military','memory-inners/04-stairs-light'];
for(const root of roots){
  const engine=fs.readFileSync(`${root}/engine.js`,'utf8');
  const shader=fs.readFileSync(`${root}/shaders.js`,'utf8');
  assert(engine.includes('Array.from({ length: 2 }'),'engine must retain two ripple slots');
  assert(shader.includes('uRippleStrengths[2]'),'shader must retain two simultaneous ripples');
}
console.log('multi-ripple check passed');
