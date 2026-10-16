import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
execFileSync(process.execPath,['scripts/build-travel-data.mjs','--check'],{cwd:root,stdio:'inherit'});
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'travel_research',name+'.json'),'utf8'));
const places=read('places'),routes=read('routes'),photos=read('photos'),prices=read('prices');
const get=id=>places.find(p=>p.id===id);
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('All canonical routes connect across the three days',()=>routes.slice(1).forEach((r,i)=>assert.equal(r.fromId,routes[i].toId)));
check('Coordinates are sourced and unknown pins remain null',()=>places.forEach(p=>{assert.equal(p.latitude===null,p.longitude===null);if(p.latitude!==null){assert.ok(p.sourceUrl);assert.ok(p.latitude>=-90&&p.latitude<=90&&p.longitude>=-180&&p.longitude<=180)}}));
check('Geometry request endpoints match their actual canonical places',()=>routes.filter(r=>r.geometry).forEach(r=>{
  const input=new URL(r.geometry.sourceUrl).pathname.split('/').at(-1).split(';').map(p=>p.split(',').map(Number));
  const expected=[get(r.routingFromId),get(r.toId)].map(p=>[p.longitude,p.latitude]);
  input.forEach((point,i)=>point.forEach((n,k)=>assert.ok(Math.abs(n-expected[i][k])<1e-7,r.id)));
  assert.equal(r.distanceKm,Math.round(r.geometry.distanceMeters/100)/10);
}));
check('Planned travel duration agrees with departure and arrival slots',()=>routes.forEach(r=>{
 const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
 assert.equal(minutes(r.arrival)-minutes(r.departure),r.plannedDurationMinutes,r.id);
}));
check('Bus model times never replace planned bus times',()=>routes.filter(r=>/รถบัส|รถตู้/.test(r.transport)).forEach(r=>assert.ok(r.plannedDurationMinutes>r.modelDurationMinutes)));
check('Unknown prices are not converted into free services',()=>{prices.expenses.filter(e=>e.priceStatus==='unknown').forEach(e=>assert.equal(e.priceTHB,null));prices.unpricedItems.forEach(e=>assert.equal(e.priceTHB,null))});
check('Three days of meals have explicit allocation references',()=>prices.mealCoverage.forEach(day=>{assert.ok(day.meals.length>=2);assert.ok(prices.expenses.some(e=>e.id===day.budgetExpenseId))}));
check('Every renderable photo has an established reuse license and a local file',()=>photos.filter(p=>p.allowedToDisplay).forEach(p=>{assert.ok(['original','licensed'].includes(p.rightsStatus));assert.ok(p.license);assert.ok(fs.existsSync(path.join(root,p.file)));if(p.rightsStatus==='licensed')assert.ok(p.sourceUrl&&p.licenseUrl)}));
const context=vm.createContext({window:{}});context.window=context;
for(const file of ['js/data.js','assets/maps/route-geometries.js','assets/maps/real-map-data.js','js/travel-v3.js','js/travel-research-data.js','js/travel-v4.js','js/route-infographic.js','js/map.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
check('Timeline and presentation share canonical route objects',()=>context.TripData.routes.forEach((r,i)=>assert.equal(r,context.TripResearch.routes[i])));
check('Map navigation uses source pins, not snapped proxies',()=>context.TripData.routes.filter(r=>r.geometry).forEach(r=>{const q=new URL(context.TripMap.directions(r)).searchParams;const a=get(r.routingFromId),b=get(r.toId);assert.equal(q.get('origin'),a.latitude+','+a.longitude);assert.equal(q.get('destination'),b.latitude+','+b.longitude)}));
check('Fuel excludes buses, transfers and walking',()=>{const a=context.RouteInfographic.aggregate();assert.equal(a.count,routes.filter(r=>/มอเตอร์ไซค์/.test(r.transport)).length);assert.ok(Math.abs(a.knownKm-98.1)<.00001);assert.equal(a.pending,4)});
check('Default allocation remains 6110 with emergency reserve separate',()=>{assert.equal(prices.expenses.reduce((s,e)=>s+e.amount,0),6110);assert.equal(prices.expenses.filter(e=>e.category==='reserve').reduce((s,e)=>s+e.amount,0),700)});
check('Historical, unknown and estimated allocations reconcile without confirmed trip quotes',()=>{const sums={confirmed:0,historical:0,unknown:0,estimated:0};for(const e of prices.expenses.filter(e=>e.category!=='reserve'))sums[e.priceStatus]+=e.amount;assert.deepEqual(sums,{confirmed:0,historical:2400,unknown:600,estimated:2410})});
check('Every local file reference in index exists',()=>{const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^[a-z]+:/i.test(m[1]))assert.ok(fs.existsSync(path.join(root,m[1])),m[1])}});
console.log(`ALL ${checks} DATA CHECKS PASSED`);
