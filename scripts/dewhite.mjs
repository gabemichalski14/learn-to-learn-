import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';
const TH = 236; // near-white threshold
function walk(d){ return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name); return e.isDirectory()?walk(p):(e.name.endsWith('.png')?[p]:[]);}); }
function dewhite(file){
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width:w, height:h, data } = png;
  const c = 0; // corner (0,0)
  if (!(data[c+3]===255 && data[c]>240 && data[c+1]>240 && data[c+2]>240)) return false;
  const isWhite = (i)=> data[i+3]>10 && data[i]>=TH && data[i+1]>=TH && data[i+2]>=TH;
  const seen = new Uint8Array(w*h);
  const stack = [0, w-1, (h-1)*w, h*w-1];
  while(stack.length){
    const p = stack.pop(); if(p<0||p>=w*h||seen[p]) continue; seen[p]=1;
    const i=p*4; if(!isWhite(i)) continue;
    data[i+3]=0;
    const x=p%w, y=(p/w)|0;
    if(x>0)stack.push(p-1); if(x<w-1)stack.push(p+1); if(y>0)stack.push(p-w); if(y<h-1)stack.push(p+w);
  }
  fs.writeFileSync(file, PNG.sync.write(png));
  return true;
}
let n=0; for(const f of walk('public/art')){ if(dewhite(f)){ n++; console.log('de-whited', f.replace('public/art/','')); } }
console.log('done:', n, 'files');
