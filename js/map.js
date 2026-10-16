// คง API เดิมเพื่อให้หน้าภาพรวมและส่วนอื่นใช้คอมโพเนนต์เดียวกัน
window.TripMap = (() => {
  const googleSearch = name => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' เชียงใหม่');
  const directions = r => {
    const coordinates=r.roadMap?.coordinates;
    const named=(key,fallback)=>{const p=window.RealMapData?.locations[key]?.coordinates;return p?p[1]+','+p[0]:fallback+' เชียงใหม่';};
    const origin=coordinates?coordinates[0][1]+','+coordinates[0][0]:named(r.mapEndpointKeys?.[0],r.from);
    const destination=coordinates?coordinates.at(-1)[1]+','+coordinates.at(-1)[0]:named(r.mapEndpointKeys?.[1],r.to);
    return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode='+(/รถบัส|รถตู้/.test(r.transport)?'transit':r.transport==='เดิน'?'walking':'driving');
  };
  function render(id,places=TripData.places,route=null) {
    const el=document.getElementById(id);if(!el)return;
    el.dataset.mapProvider='infographic';
    el.innerHTML=route?RouteInfographic.visual(route,{variant:'detail'}):RouteInfographic.overview();
  }
  const destroy = () => {};
  const routePlaces = r => [r.fromId,r.toId].map(id=>TripData.places.find(p=>p.id===id)).filter(Boolean);
  return {render,destroy,googleSearch,directions,routePlaces};
})();
