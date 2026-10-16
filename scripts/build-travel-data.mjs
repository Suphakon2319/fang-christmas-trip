// Compile the research JSON for both file:// and GitHub Pages. No runtime fetch.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const names=['places','routes','transport','restaurants','accommodation','prices','photos','sources'];
const data={version:5,verifiedAt:'2026-10-16'};
for(const name of names)data[name]=JSON.parse(fs.readFileSync(path.join(root,'travel_research',name+'.json'),'utf8'));
const ids=new Set(data.places.map(p=>p.id));
if(ids.size!==data.places.length)throw new Error('Duplicate place IDs');
const states=['official','third_party','estimated','unconfirmed'];
for(const name of names.filter(n=>n!=='prices'))for(const item of data[name]){
  for(const field of ['id','name','address','latitude','longitude','phone','sourceUrl','verifiedAt','verificationStatus','notes'])if(!(field in item))throw new Error(name+': missing '+field);
  if(!states.includes(item.verificationStatus))throw new Error(name+': invalid status');
}
const routeIds=new Set();
for(const r of data.routes){
  if(routeIds.has(r.id)||!ids.has(r.fromId)||!ids.has(r.toId))throw new Error('Invalid route '+r.id);
  routeIds.add(r.id);
  if(r.distanceKm!==null&&!r.geometry)throw new Error('Distance has no geometry '+r.id);
  if(r.geometry){
    const a=data.places.find(p=>p.id===r.routingFromId),b=data.places.find(p=>p.id===r.toId);
    if(!a||!b||[a.latitude,a.longitude,b.latitude,b.longitude].some(n=>n===null))throw new Error('Route uses unknown coordinates '+r.id);
    if(Math.abs(r.distanceKm-Math.round(r.geometry.distanceMeters/100)/10)>.01)throw new Error('Distance mismatch '+r.id);
  }
}
for(let i=1;i<data.routes.length;i++)if(data.routes[i-1].toId!==data.routes[i].fromId)throw new Error('Broken route chain at '+data.routes[i].id);
for(const p of data.photos.filter(p=>p.allowedToDisplay)){
  if(!['licensed','original'].includes(p.rightsStatus)||!p.license||!fs.existsSync(path.join(root,p.file)))throw new Error('Invalid photo rights '+p.id);
}
if(new Set(data.photos.map(p=>p.id)).size!==data.photos.length)throw new Error('Duplicate photo IDs');
if(new Set(data.prices.routeAllocations.map(a=>a.routeId)).size!==data.routes.length)throw new Error('Missing route activity allocation');
for(const allocation of data.prices.routeAllocations){
  if(!routeIds.has(allocation.routeId))throw new Error('Allocation uses an unknown route');
  for(const item of allocation.items)if(!data.prices.expenses.some(e=>e.id===item.expenseId)||!Number.isFinite(item.share)||item.share<0||item.share>1)throw new Error('Invalid ledger allocation');
}
for(const e of data.prices.expenses)if(data.prices.routeAllocations.flatMap(a=>a.items).filter(a=>a.expenseId===e.id).reduce((sum,a)=>sum+a.share,0)>1.0000001)throw new Error('Duplicate activity charge '+e.id);
const result='/* Generated from travel_research/*.json. Run node scripts/build-travel-data.mjs. */\nwindow.TripResearch='+JSON.stringify(data)+';\n';
const target=path.join(root,'js/travel-research-data.js');
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==result)throw new Error('Research bundle is stale; rebuild it');}
else fs.writeFileSync(target,result);
console.log(`${process.argv.includes('--check')?'CHECKED':'BUILT'} V${data.version}: ${data.places.length} places, ${data.routes.length} routes, ${data.routes.filter(r=>r.geometry).length} road geometries`);
