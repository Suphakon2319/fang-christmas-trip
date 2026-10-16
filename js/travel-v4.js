/* Adapt the single research database into the existing app without runtime APIs. */
(() => {
  const db=window.TripResearch,d=TripData;
  if(!db||db.version!==5)throw new Error('Missing V5 research bundle');
  d.legacyRouteKeys=Object.fromEntries(d.routes.map(r=>[r.id,[r.fromId,r.toId]]));
  d.dataVersion=5;d.research=db;
  const byPlace=new Map(db.places.map(p=>[p.id,p]));
  d.places=db.places.map(p=>{
    const photo=db.photos.find(x=>x.placeId===p.id&&x.allowedToDisplay&&x.rightsStatus==='licensed');
    return {...p,coordinates:p.latitude!==null&&p.longitude!==null?[p.latitude,p.longitude]:null,
      image:photo?.file||null,imageCredit:photo?.credit||'',imageSource:photo?.sourceUrl||p.sourceUrl,
      english:p.name,description:p.description||p.notes};
  });
  d.routePhotos=Object.fromEntries(db.photos.filter(p=>p.allowedToDisplay&&p.rightsStatus==='licensed').map(p=>[p.id,{id:p.id,name:p.name,image:p.file,imageCredit:p.credit,imageSource:p.sourceUrl,license:p.license,fit:'cover'}]));
  d.routes=db.routes.map(r=>{
    const a=byPlace.get(r.fromId),b=byPlace.get(r.toId),g=r.geometry;
    const approved=db.photos.find(p=>p.placeId===b.id&&p.allowedToDisplay&&p.rightsStatus==='licensed');
    const contact=b.phone?b:a;
    const refs=[...new Set([a.sourceUrl,b.sourceUrl,a.coordinateSourceUrl,b.coordinateSourceUrl,...r.sourceIds.map(id=>db.sources.find(s=>s.id===id)?.sourceUrl),g?.sourceUrl].filter(Boolean))];
    const areaId=({jr:'fang',lunch:'fang',laojang:'banyang',coffee:'hinoki',kodang:'fang'})[b.id]||({jr:'fang',coffee:'hinoki'})[a.id]||b.id;
    const area=RealMapData.areas?.[areaId]||RealMapData.area;
    const pointKeys=[a,b].map(p=>p.latitude!==null&&p.longitude!==null?p.id:null);
    const out=Object.assign(r,{from:a.name,to:b.name,title:r.name,plannedDurationMinutes:r.plannedDurationMinutes,durationMinutes:null,
      mapStatus:g?'approximate':'illustrative',distanceVerificationStatus:g?'estimated':null,roadMap:g,
      areaMap:area,mapEndpointKeys:pointKeys,photoIds:db.photos.filter(p=>p.placeId===b.id&&p.allowedToDisplay&&p.rightsStatus==='licensed').map(p=>p.id),photoPlaceIds:[],photoContext:'',
      sourceUrls:refs,phone:/รถบัส|รถตู้/.test(r.transport)?'053-215604':contact.phone,operator:contact.id==='jr'?contact.name:/รถบัส|รถตู้/.test(r.transport)?'ยานยนต์นครเชียงใหม่':null,
      priceTHB:null,optional:r.conditionalStop,roads:r.roadRefs.map(ref=>({name:ref,sourceUrl:r.sourceUrl,scope:'แบบจำลองถนน OSRM'})),
      preparation:'หมวกนิรภัย 2 ใบ ใบขับขี่ เสื้อคลุม น้ำดื่ม เงินสด และโทรศัพท์พร้อมแผนที่ในเครื่อง'});
    out.instructions=[['เริ่มตรงไหน',out.from],['ไปทางไหน',out.steps[0]],['รับ / ต่อรถ',out.transport.includes('มอเตอร์ไซค์')?'ใช้รถ JR ตามสัญญาที่ตกลง; เงื่อนไขยังต้องสอบถาม':out.transport.includes('รถบัส')?'ตั๋วและจุดขึ้นตามที่ผู้ประกอบการแจ้ง':'ตรวจทางเดินหรือรถรับจ้างจริง'],['ลง / จอดที่ไหน',out.to],['ถนนที่ใช้',out.roads.length?out.roads.map(x=>x.name).join(' · '):'ยังไม่มีหมายเลขถนนเฉพาะช่วงที่มีหลักฐาน'],['จุดสังเกต',b.address||b.name],['เตรียมอะไร',out.preparation]];
    return out;
  });
  for(const p of db.places.filter(p=>p.latitude!==null&&p.longitude!==null))RealMapData.locations[p.id]={coordinates:[p.longitude,p.latitude],sourceUrl:p.coordinateSourceUrl||p.sourceUrl};
  d.defaultExpenses=db.prices.expenses.map(e=>({...e,verificationStatus:e.priceStatus==='confirmed'?'confirmed':'estimated'}));
  d.day2Assessment={message:'เส้นทางต่อจากพิพิธภัณฑ์ไปบ้านดินเล่าจางและ Hinoki ใช้หมุดแยกกันแล้ว แต่การเข้าถึงด้วยมอเตอร์ไซค์ สภาพถนน และหมุดร้านมื้อเย็นยังต้องตรวจเพิ่ม ตั้งเป้ากลับที่พัก 17:30',alternative:'หากถึง Hinoki ช้าหรือโกดังเปิดไม่ทัน ให้ข้ามคาเฟ่และมื้อเย็นนอกที่พัก ไม่ใช้ทางลัดภูเขาที่ไม่มีข้อมูล'};
  d.sources=db.sources.filter(s=>s.sourceUrl).map(s=>({title:s.name,url:s.sourceUrl}));
  d.galleryPlaces=d.places.filter(p=>p.gallery);
  d.counts={places:d.places.length,routes:d.routes.length,mapped:d.routes.filter(r=>r.geometry).length,pending:d.routes.filter(r=>!r.geometry).length};
})();
