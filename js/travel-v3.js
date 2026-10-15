/* Presentation content: sourced locations, local road maps and destination photographs. */
(() => {
  const d=TripData, maps=window.RealMapData;
  if(!maps)return;
  d.dataVersion=3;
  const staySource='https://www.tripniceday.com/place/'+encodeURIComponent('สส-โฮมสเตย์-1744002127365');
  const photo=(id,name,image,credit,source,fit='cover')=>({id,name,image:'assets/images/'+image,imageCredit:credit,imageSource:source,fit});
  d.routePhotos={
    bus:photo('bus','รถโดยสารของทริปเรา','chiangmai-fang-bus.jpg','ภาพบริษัท ยานยนต์นครเชียงใหม่','https://www.yanyonnakornchiangmai.co.th/'),
    stay:photo('stay','สส โฮมสเตย์ · บ้านไม้ริมน้ำ','homestay-riverside.jpg','สดชื่น กัญชนะ / TripNiceDay',staySource),
    stream:photo('stream','ลำน้ำหน้าที่พัก สส โฮมสเตย์','homestay-room.jpg','สดชื่น กัญชนะ / TripNiceDay',staySource),
    stayRiver:photo('stayRiver','มุมพักริมน้ำที่ สส โฮมสเตย์','homestay-terrace.jpg','สดชื่น กัญชนะ / TripNiceDay',staySource),
    reservoir:photo('reservoir','อ่างเก็บน้ำแม่มาว','mae-mao-5.jpg','เรา ไป แล้ว / Trip.com','https://www.trip.com/moments/detail/chiang-mai-province-23189-146980920/','contain'),
    village:photo('village','วัดจีนในชุมชนบ้านยาง','ban-yang.png','อบต.แม่งอน','https://www.maengon.go.th/catalog/travels/196'),
    museum:photo('museum','พิพิธภัณฑ์โรงงานหลวงฯ บ้านยาง','ban-yang-village.jpg','อบต.แม่งอน','https://www.maengon.go.th/catalog/travels/196'),
    hinoki:photo('hinoki','Hinoki Land · บรรยากาศญี่ปุ่น','hinoki-banner.png','Hinoki Land','https://hinokiland.com/'),
    torii:photo('torii','อุโมงค์เสาโทริอิ · Hinoki Land','hinoki-torii.png','Hinoki Land','https://hinokiland.com/','contain'),
    coffee:photo('coffee','ฮิโนกิคอฟฟี่ · พักจิบกาแฟในสวน','hinoki-coffee.jpg','Hinoki Land','https://hinokiland.com/'),
    spring:photo('spring','น้ำพุร้อนฝาง · ลานไอน้ำกลางสวน','fang-hot-springs-park.jpg','อุทยานฯ / TripNiceDay','https://www.tripniceday.com/place/'+encodeURIComponent('น้ำพุร้อนฝาง')),
    lunch:photo('lunch','ฮักแกะ@ฝาง · เมนูจากรีวิวร้าน','hug-sheep-restaurant.jpg','ภาพรีวิวร้าน / Wongnai','https://www.wongnai.com/restaurants/230497ij')
  };
  const photos={
    'day1-route1':['bus'],'day1-route2':['lunch'],'day1-route3':['lunch'],
    'day1-route4':['stay'],'day1-route5':['reservoir'],'day1-route6':['stayRiver'],
    'day2-route1':['village'],'day2-lunch':['museum'],'day2-route2':['hinoki'],
    'day2-route3':['coffee'],'day2-route4':['hinoki'],'day2-route5':['stay'],
    'day3-route1':['spring'],'day3-route2':['spring'],'day3-route3':[],
    'day3-transfer':['bus'],'day3-route4':['bus']
  };
  const points={
    'day1-route2':['fang','lunch'],'day1-route3':['lunch',null],
    'day1-route4':[null,'homestay'],'day1-route5':['homestay','reservoir'],
    'day1-route6':['reservoir','homestay'],'day2-route1':['homestay','banyang'],
    'day2-lunch':['banyang',null],'day2-route2':['banyang','hinoki'],
    'day2-route3':['hinoki',null],'day2-route4':['hinoki',null],
    'day2-route5':[null,'homestay'],'day3-route1':['homestay','hotspring'],
    'day3-route2':['hotspring',null],'day3-route3':[null,null],'day3-transfer':[null,'fang']
  };
  const clean=text=>String(text||'').replace(/\s*\((?:ตัวเลือก\s*\/\s*)?รอยืนยัน\)/g,'').replace(/\s*\/\s*รอยืนยัน/g,'').replace(/\s*\(แผน\)/g,'').replace(/\s*\(แผนรถบัส\)/g,'');
  d.routes.forEach(r=>{
    r.from=clean(r.from);r.to=clean(r.to);r.departure=clean(r.departure);r.arrival=clean(r.arrival);
    r.photoIds=photos[r.id]||[];
    r.photoContext=({'day1-route3':'ต้นทาง: ร้านมื้อกลางวัน','day2-lunch':'บรรยากาศชุมชนบ้านยาง','day2-route4':'ต้นทาง: Hinoki Land','day3-route2':'ต้นทาง: น้ำพุร้อนฝาง','day3-transfer':'ภาพรถโดยสารสำหรับช่วงถัดไป'})[r.id]||'';
    r.mapEndpointKeys=points[r.id]||[];
    const g=maps.routes[r.id];
    const areaSource=maps.routes[({'day1-route3':'day1-route2','day1-route4':'day1-route5','day2-lunch':'day2-route1','day2-route3':'day2-route2','day2-route4':'day2-route2','day2-route5':'day1-route5','day3-route2':'day3-route1','day3-route3':'day1-route2','day3-transfer':'day1-route2'})[r.id]];
    if(areaSource)r.areaMap={image:areaSource.mapImage,extent:areaSource.mapExtent};
    const detailArea=({'day1-route3':'fang','day2-lunch':'banyang','day2-route3':'hinoki','day2-route4':'hinoki','day3-route3':'fang','day3-transfer':'fang'})[r.id];
    if(maps.areas?.[detailArea])r.areaMap=maps.areas[detailArea];
    if(g){
      r.geometry={...g};r.mapStatus='approximate';r.distanceKm=Math.round(g.distanceMeters/100)/10;
      r.distanceVerificationStatus='approximate';r.roadMap=g;
      r.sourceUrls=[...new Set([...r.sourceUrls,...g.endpointSourceUrls,g.sourceUrl])];
      r.modelDurationMinutes=Math.round(g.durationSeconds/60);
      r.roads=g.roadRefs.map(ref=>({name:ref,sourceUrl:g.sourceUrl,scope:'แนวถนนจาก OSRM'}));
    }
    if(r.id==='day2-route1')r.to='บ้านยาง · พิพิธภัณฑ์โรงงานหลวงฯ';
    if(r.id==='day2-route2')r.from='บ้านยาง · จุดเริ่มใกล้พิพิธภัณฑ์ฯ';
    r.instructions=r.instructions.map(([label,text])=>[label,clean(text)]);
    r.instructions[0][1]=r.from;
  });
  d.places.forEach(p=>{
    if(maps.locations[p.id])p.coordinates={lat:maps.locations[p.id].coordinates[1],lng:maps.locations[p.id].coordinates[0]};
    if(p.id==='homestay'){p.image=d.routePhotos.stay.image;p.imageCredit=d.routePhotos.stay.imageCredit;p.imageSource=staySource;}
    if(p.id==='hotspring'){p.image=d.routePhotos.spring.image;p.imageCredit=d.routePhotos.spring.imageCredit;}
  });
})();
