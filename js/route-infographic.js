/* Shared static route component. Decorative SVGs never imply road geometry. */
window.RouteInfographic = (() => {
  const STORAGE_KEY = 'fang-route-overrides-v2';
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let serial = 0;
  const states = {
    verified: ['Verified Route','มี Geometry พร้อมแหล่งอ้างอิง'],
    approximate: ['Approximate Route','แนวถนนจากแบบจำลองรถยนต์ ไม่ใช่เส้นทางรถโดยสารที่รับรอง'],
    illustrative: ['Illustrative Only','แผนภาพประกอบ ไม่ใช่เส้นทางนำทางจริง']
  };
  function geometry(r) {
    const g = r.geometry;
    const points = g?.coordinates;
    return g?.sourceUrl && g?.license && Array.isArray(points) && points.length > 1 &&
      points.every(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90) ? points : null;
  }
  function status(r) { return geometry(r) && ['verified','approximate'].includes(r.mapStatus) ? r.mapStatus : 'illustrative'; }
  function distance(r) {
    if (typeof r.userDistanceKm === 'number') return {km:r.userDistanceKm,verified:false,label:'ผู้ใช้ประมาณ'};
    if (typeof r.distanceKm === 'number' && Number.isFinite(r.distanceKm) && r.distanceKm >= 0)
      return {km:r.distanceKm,verified:r.distanceVerificationStatus==='verified'&&!!r.sourceUrl,label:r.distanceVerificationStatus==='verified'?'ระยะมีแหล่งอ้างอิง':'ระยะประมาณ'};
    return {km:null,verified:false,label:'รอยืนยันระยะ'};
  }
  function aggregate() {
    const days = [1,2,3].map(day => {
      const routes = TripData.routes.filter(r=>r.day===day&&/มอเตอร์ไซค์/.test(r.transport));
      const details = routes.map(r=>distance(r));
      return {day,count:routes.length,knownKm:details.reduce((s,x)=>s+(x.km??0),0),
        verifiedKm:details.filter(x=>x.verified).reduce((s,x)=>s+x.km,0),
        estimatedKm:details.filter(x=>!x.verified&&x.km!==null).reduce((s,x)=>s+x.km,0),
        pending:details.filter(x=>x.km===null).length};
    });
    return {days,knownKm:days.reduce((s,d)=>s+d.knownKm,0),verifiedKm:days.reduce((s,d)=>s+d.verifiedKm,0),
      pending:days.reduce((s,d)=>s+d.pending,0),count:days.reduce((s,d)=>s+d.count,0)};
  }
  function duration(minutes) {
    if (!Number.isFinite(minutes)) return 'รอยืนยัน';
    return [Math.floor(minutes/60)?Math.floor(minutes/60)+' ชม.':'',minutes%60?minutes%60+' นาที':''].filter(Boolean).join(' ') || '0 นาที';
  }
  function timeInfo(r) {
    const n = r.userDurationMinutes ?? r.durationMinutes ?? r.plannedDurationMinutes;
    return {minutes:n,label:r.durationMinutes!==null&&r.durationMinutes!==undefined?'เวลาอ้างอิง':'เวลาที่เผื่อ',text:duration(n)};
  }
  function metrics(r) {
    const dist = distance(r),time = timeInfo(r);
    const fields = [
      ['ระยะทาง',dist.km===null?'—':(dist.verified?'':'≈ ')+dist.km.toLocaleString('th-TH')+' กม.',dist.label,'distance'],
      [time.label,time.text,time.label==='เวลาที่เผื่อ'?'แผนเบื้องต้น':'ตรวจวันเดินทางอีกครั้ง','duration'],
      ['เวลาออกตามแผน',r.departure,'','departure'],['ถึงตามแผน',r.arrival,'','arrival'],
      ['พาหนะ',r.transport,'สำหรับช่วงนี้','transport'],
      ['ค่าเดินทาง / 2 คน',r.costTHB===null?'—':'฿'+r.costTHB.toLocaleString('th-TH'),r.costTHB===null?'ไม่ใช้แทนงบทั้งวัน':'ตรวจวันเดินทางอีกครั้ง','cost']
    ];
    return '<div class="ri-metrics">'+fields.map(([label,value,note,key])=>`<div class="ri-metric"><small>${esc(label)}</small><strong data-route-value="${key}" data-route-id="${esc(r.id)}">${esc(value)}</strong></div>`).join('')+'</div>';
  }
  function seed(id) { return [...id].reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),17); }
  function tree(x,y,scale=1) {return `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="-3" y="14" width="6" height="20" rx="2" fill="#b39471"/><path d="M0-25 22 10H12L28 29H-28L-12 10H-22Z" fill="#8ab59b"/><path d="M0-25 0 29H-28L-12 10H-22Z" fill="#a8c6a2"/></g>`;}
  function house(x,y,color='#e9b3a8') {return `<g transform="translate(${x} ${y})"><rect x="-25" y="0" width="50" height="37" rx="4" fill="#fff8e7"/><path d="M-33 1 0-25 33 1Z" fill="${color}"/><rect x="-5" y="15" width="12" height="22" rx="2" fill="#ba9d7f"/><rect x="-17" y="10" width="8" height="9" rx="1" fill="#b9d5d7"/><rect x="13" y="10" width="8" height="9" rx="1" fill="#b9d5d7"/></g>`;}
  function decoration(r,n) {
    const theme=r.theme;
    let out = `<path d="M0 135 95 54 190 135 303 28 424 140 555 48 680 137 800 57V0H0Z" fill="#d6e6c2"/><path d="m125 110 65-62 67 63m240-4 56-47 58 48" fill="#edf2d9"/>`;
    if (['lake','stay','spring','forest'].includes(theme)) out += '<path d="M800 320C640 285 670 395 487 340S210 389 0 345V430H800Z" fill="#c6e4de"/><path d="M25 379c150-40 198 25 315-7m190-10c93 24 125-10 220-1" stroke="#f3faf0" stroke-width="4" fill="none"/>';
    else out += '<ellipse cx="585" cy="345" rx="160" ry="50" fill="#d6e4bf"/><ellipse cx="160" cy="278" rx="140" ry="60" fill="#e4eccf"/>';
    if (theme==='japan'||theme==='cafe') out += `<g transform="translate(540 140)"><path d="M-65-30h130l-10 17H-55Z" fill="#d78679"/><path d="M-55 5H55" stroke="#bd6c62" stroke-width="10"/><path d="M-40-15v90m80-90v90" stroke="#d78679" stroke-width="11"/></g>${house(675,155,'#a28c75')}`;
    else if(theme==='spring') out += '<g transform="translate(540 210)"><ellipse rx="72" ry="30" fill="#9ab8aa"/><ellipse rx="54" ry="19" fill="#c2e4e0"/><path d="M-20-25c-24-25 20-35 0-66m25 66c-20-25 20-35 0-75m25 75c-15-30 22-38 5-65" stroke="#fffdf4" fill="none" stroke-width="9" stroke-linecap="round"/></g>';
    else if (['village','urban','food','rental','bus'].includes(theme)) {
      out += house(540,128) + house(618,158,'#a8b8a0') + house(690,112,'#d8bc7d');
      if(theme==='food')out+='<g transform="translate(337 81)"><rect x="-42" width="84" height="30" rx="12" fill="#fff7e7"/><text text-anchor="middle" y="22" font-size="19">มื้ออร่อย</text></g>';
    } else out += house(570,130,'#afab8e');
    const xs=[70,242,385,737];
    xs.forEach((x,i)=>out+=tree(x+(n%15),i%2?345:170,.65+(i%2)*.18));
    out+='<g fill="#edb1a8"><circle cx="332" cy="360" r="4"/><circle cx="340" cy="353" r="4"/><circle cx="347" cy="360" r="4"/></g>';
    return out;
  }
  function project(points) {
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const cos=Math.cos((minY+maxY)/2*Math.PI/180);
    const width=Math.max((maxX-minX)*cos,1e-6),height=Math.max(maxY-minY,1e-6);
    const scale=Math.min(550/width,240/height);
    return points.map(([x,y])=>[400+(x-(minX+maxX)/2)*cos*scale,225-(y-(minY+maxY)/2)*scale]);
  }
  function visual(r,{variant='card'}={}) {
    const uid='ri-'+(++serial),g=r.roadMap,area=r.areaMap||RealMapData.area;
    const image=g?.mapImage||area.image,extent=g?.mapExtent||area.extent;
    const merc=([lon,lat])=>[lon*20037508.342789244/180,Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*6378137];
    const projectPoint=p=>{const [x,y]=merc(p);return [(x-extent.xmin)/(extent.xmax-extent.xmin)*800,(extent.ymax-y)/(extent.ymax-extent.ymin)*500];};
    const coords=g?.coordinates||[];
    const path=coords.map((p,i)=>(i?'L':'M')+projectPoint(p).map(x=>x.toFixed(2)).join(' ')).join(' ');
    const endpoints=g?[[coords[0],'A'],[coords[coords.length-1],'B']]:r.mapEndpointKeys.map((key,i)=>key?[RealMapData.locations[key].coordinates,i?'B':'A']:null).filter(Boolean);
    const pins=endpoints.map(([p,l])=>{
      let [x,y]=projectPoint(p);x=Math.max(22,Math.min(778,x));y=Math.max(35,Math.min(475,y));
      return `<g class="road-pin" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><path d="M0 9C-6 0-22-15-22-29a22 22 0 1 1 44 0C22-15 6 0 0 9Z" fill="${l==='A'?'#6b9d79':'#db718c'}" stroke="white" stroke-width="4"/><text y="-21" text-anchor="middle" font-family="Prompt,sans-serif" font-size="20" font-weight="600" fill="white">${l}</text></g>`;
    }).join('');
    const roads=r.roads.map(x=>x.name).join(' · ');
    return `<figure class="ri-visual ri-real-map ri-${variant}" data-route-visual="${esc(r.id)}" data-map-status="${status(r)}" data-map-kind="${g?'road-route':'area'}">
      <div class="ri-map-top"><span>วันที่ ${r.day} · ช่วงที่ ${String(r.number).padStart(2,'0')}</span><span>${g?(roads?'ถนน '+esc(roads):'เส้นทาง A → B'):'แผนที่พื้นที่ช่วงนี้'}</span></div>
      <div class="road-map-canvas"><svg class="ri-svg" viewBox="0 0 800 500" role="img" aria-labelledby="${uid}-title ${uid}-desc" xmlns="http://www.w3.org/2000/svg">
        <title id="${uid}-title">${esc(r.from)} ไป ${esc(r.to)}</title><desc id="${uid}-desc">${g?'เส้นทางตามแนวถนนบนแผนที่ภูมิประเทศ':'แผนที่พื้นที่ แสดงเฉพาะหมุดที่มีข้อมูล ยังไม่วาดเส้นถึงร้านที่ไม่ได้เลือก'} จุด A ต้นทาง จุด B ปลายทาง</desc>
        <image class="road-basemap" href="${esc(image)}" x="0" y="0" width="800" height="500" preserveAspectRatio="none"/>
        ${g?`<path class="ri-route-halo" d="${path}" fill="none" stroke="white" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path class="ri-route-path" d="${path}" fill="none" stroke="#4761e8" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`:''}
        ${pins}
        <g transform="translate(758 38)"><circle r="23" fill="white" fill-opacity=".95"/><path d="m0-12-7 20 7-5 7 5Z" fill="#697f6d"/><text y="-28" text-anchor="middle" font-size="11" fill="#53664f">N</text></g>
      </svg><div class="road-map-caption">${g?`<span class="road-caption-distance">≈ ${r.distanceKm.toLocaleString('th-TH')} กม.</span><span>แนวถนนจากหมุดต้นทาง → ปลายทาง</span>`:'<span>เลือกหมุดร้านเพื่อแสดงเส้นทางช่วงนี้</span>'}<a href="${esc(TripMap.directions(r))}" target="_blank" rel="noopener noreferrer" aria-label="เปิดเส้นทาง ${esc(r.from)} ไป ${esc(r.to)}">เปิดนำทาง ↗</a></div></div>
      <div class="ri-endpoints"><div><b class="ri-letter a">A</b><span><small>เริ่มจาก</small><strong>${esc(r.from)}</strong></span></div><span class="ri-endpoint-arrow" aria-hidden="true">→</span><div><b class="ri-letter b">B</b><span><small>ไปที่</small><strong>${esc(r.to)}</strong></span></div></div>
      <figcaption class="ri-map-credit"><details class="ri-attribution"><summary>© Esri, HERE, Garmin · © OpenStreetMap${g?' / OSRM':''} · เครดิตแผนที่</summary><p>แผนที่ © 2026 Esri และผู้ให้สิทธิ์ สงวนสิทธิ์ แหล่งข้อมูล: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), © OpenStreetMap contributors, and the GIS User Community.</p><a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer" target="_blank" rel="noopener noreferrer">Esri World Topographic Map</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap / ODbL</a>${g?` · <a href="${esc(g.sourceUrl)}" target="_blank" rel="noopener noreferrer">OSRM</a>`:''}</details></figcaption>
    </figure>`;
  }

  function photos(r,{compact=false}={}) {
    const images=(r.photoIds||[]).map(id=>TripData.routePhotos[id]).filter(Boolean).slice(0,compact?1:2);
    if(!images.length)return `<div class="ri-photo-note"><span>🛵</span><h3>คืนรถ แล้วเดินทางต่อ</h3><p>ตรวจสัมภาระ รับเอกสารและเงินมัดจำคืน แล้วไปสถานีรถโดยสาร</p></div>`;
    return `<div class="ri-photos ${images.length===1?'single':''}">${images.map(p=>`<figure class="ri-destination-photo" data-photo-id="${esc(p.id)}"><div class="ri-photo ${p.fit==='contain'?'ri-photo-contain':''}">${TripApp.photo(p)}</div><figcaption><strong>${esc(p.name)}</strong>${r.photoContext?`<small>${esc(r.photoContext)}</small>`:''}<a href="${esc(p.imageSource)}" target="_blank" rel="noopener noreferrer">${esc(p.imageCredit)} ↗</a></figcaption></figure>`).join('')}</div>`;
  }
  function instructions(r,{compact=false}={}) {
    return `<ol class="ri-instructions">${r.steps.slice(0,compact?3:10).map((step,i)=>`<li><span>${i+1}</span><p>${esc(step)}</p></li>`).join('')}</ol>`;
  }
  function facts(r) {
    return `<dl class="ri-facts">${r.instructions.map(([label,text])=>`<div><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`).join('')}<div><dt>ผู้ให้บริการ / ติดต่อ</dt><dd>${esc(r.operator||'ยังไม่ยืนยันผู้ให้บริการ')}${r.phone?' · '+esc(r.phone):''}</dd></div></dl>`;
  }
  function sources(r) {
    return `<div class="ri-sources"><strong>แหล่งข้อมูลเดินทาง</strong><p>พบแหล่งข้อมูลสถานที่หรือรายชื่อ ${r.verifiedAt?esc(r.verifiedAt):'ยังไม่มีข้อมูลยืนยัน'} · รอบรถ ราคา และระยะของวันเดินทางยังรอยืนยัน แผนเวลาไม่ใช่เวลารับรองจากผู้ให้บริการ</p>${r.geometryNote?`<p>${esc(r.geometryNote)} · ระยะ ${r.distanceKm} กม. เวลารถยนต์จำลอง ${r.modelDurationMinutes} นาที ไม่ใช้แทนเวลารถโดยสาร</p>`:''}${r.sourceUrls.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">แหล่งอ้างอิง ${i+1} ↗</a>`).join(' ')}${!r.sourceUrls.length?'<p>ยังไม่พบแหล่งยืนยันเฉพาะช่วงนี้</p>':''}</div>`;
  }
  function editor(r) {
    return `<details class="ri-editor"><summary>เติมระยะทางที่เช็กแล้ว / จดประมาณการ</summary><p>ตัวเลขที่กรอกเป็นประมาณการของคุณ จะอัปเดตค่าน้ำมันอัตโนมัติ ไม่เปลี่ยนแผนภาพให้เป็นเส้นทางยืนยัน</p><div><label>ระยะช่วงนี้ (กม.)<input data-route-edit="distance" data-route-id="${esc(r.id)}" type="number" min="0" max="5000" step="0.1" value="${r.userDistanceKm??''}" placeholder="ยังไม่ทราบ"></label><label>เวลาเดินทางที่เผื่อ (นาที)<input data-route-edit="duration" data-route-id="${esc(r.id)}" type="number" min="0" max="1440" step="1" value="${r.userDurationMinutes??''}" placeholder="${r.plannedDurationMinutes??''}"></label><label class="ri-editor-source">ที่มาหรือโน้ตการวัด<input data-route-edit="note" data-route-id="${esc(r.id)}" maxlength="500" value="${esc(r.userDistanceNote||'')}" placeholder="เช่น วัดจากหมุดเจ้าของที่พัก วันที่…"></label></div></details>`;
  }
  function overview() {
    return `<div class="ri-overview"><div class="ri-overview-heading"><span>🗺️ สมุดเส้นทางของเรา</span><span>3 วัน · ${TripData.routes.length} ช่วงการเดินทาง</span></div>${TripData.days.map(d=>{
      const routes=TripData.routes.filter(r=>r.day===d.id);
      const stops=[routes[0].from,...routes.map(r=>r.to)];
      return `<div class="ri-day-lane"><a href="#itinerary" data-overview-day="${d.id}" class="ri-day-badge">วันที่ ${d.id}<small>${23+d.id} ธ.ค.</small></a><div class="ri-day-stops">${stops.map((name,i)=>`<span>${i===0?'A':i===stops.length-1?'B':'•'} ${esc(name.replace(/ \(.+\)$/,''))}</span>`).join('<b aria-hidden="true">→</b>')}</div></div>`;
    }).join('')}<p class="ri-overview-note">แผนภาพลำดับจุดแวะ ไม่ใช่แผนที่นำทาง · เปิดแต่ละช่วงเพื่อดู A → B เวลา ภาพ และวิธีเดินทาง</p></div>`;
  }
  function init() {
    let records={};
    try {const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))records=parsed;}catch(e){}
    TripData.routes.forEach(r=>{
      const record=Object.hasOwn(records,r.id)?records[r.id]:null;
      if(!record||typeof record!=='object')return;
      if(Number.isFinite(record.distance)&&record.distance>=0&&record.distance<=5000)r.userDistanceKm=record.distance;
      if(Number.isFinite(record.duration)&&record.duration>=0&&record.duration<=1440)r.userDurationMinutes=record.duration;
      if(typeof record.note==='string')r.userDistanceNote=record.note.slice(0,500);
    });
    document.addEventListener('change',e=>{
      const field=e.target.closest('[data-route-edit]');if(!field)return;
      const r=TripData.routes.find(r=>r.id===field.dataset.routeId);if(!r||!field.checkValidity())return;
      const key=field.dataset.routeEdit;
      if(key==='note')r.userDistanceNote=field.value;
      else {const property=key==='distance'?'userDistanceKm':'userDurationMinutes';if(field.value==='')delete r[property];else r[property]=Number(field.value);}
      records[r.id]={distance:r.userDistanceKm??null,duration:r.userDurationMinutes??null,note:r.userDistanceNote||''};
      try {localStorage.setItem(STORAGE_KEY,JSON.stringify(records));}catch(e){TripApp.toast('บันทึกระยะทางไม่ได้ แต่คำนวณต่อในหน้านี้ได้');}
      document.querySelectorAll('[data-route-value]').forEach(node=>{if(node.dataset.routeId!==r.id)return;const field=node.dataset.routeValue;if(field==='distance'){const x=distance(r);node.textContent=x.km===null?'รอยืนยัน':x.km+' กม.';}if(field==='duration')node.textContent=timeInfo(r).text;});
      window.dispatchEvent(new CustomEvent('trip:routes-changed',{detail:{id:r.id}}));
    });
    document.addEventListener('click',e=>{const a=e.target.closest('[data-overview-day]');if(a)TripApp.selectDay(Number(a.dataset.overviewDay));});
  }
  return {visual,metrics,photos,instructions,facts,sources,editor,overview,distance,aggregate,timeInfo,status,init};
})();
