// คง API เดิมเพื่อให้หน้าภาพรวมและส่วนอื่นใช้คอมโพเนนต์เดียวกัน
window.TripMap = (() => {
  const googleSearch = name => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' เชียงใหม่');
  const placeUrl = place => 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place.latitude!==null&&place.latitude!==undefined&&place.longitude!==null&&place.longitude!==undefined?place.latitude+','+place.longitude:place.name+' '+(place.address||'ฝาง เชียงใหม่'));
  const directions = r => {
    const endpoint=id=>{const p=TripData.places.find(p=>p.id===id);if(!p)return '';return p.latitude!==null&&p.longitude!==null?p.latitude+','+p.longitude:p.name+' '+(p.address||'ฝาง เชียงใหม่');};
    const origin=endpoint(r.routingFromId||r.fromId);
    const destination=endpoint(r.toId);
    return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode='+(/รถบัส|รถตู้/.test(r.transport)?'transit':r.transport==='เดิน'?'walking':'driving');
  };
  function render(id,places=TripData.places,route=null) {
    const el=document.getElementById(id);if(!el)return;
    el.dataset.mapProvider='infographic';
    el.innerHTML=route?RouteInfographic.visual(route,{variant:'detail'}):RouteInfographic.overview();
  }
  const destroy = () => {};
  const routePlaces = r => [r.fromId,r.toId].map(id=>TripData.places.find(p=>p.id===id)).filter(Boolean);
  return {render,destroy,googleSearch,placeUrl,directions,routePlaces};
})();
