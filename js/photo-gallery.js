/* Licensed destination gallery shared by timeline, slides and destination cards. */
window.TripGallery = (()=>{
  let activePlace=null,activeIndex=0,opener=null;
  const esc=v=>RouteInfographic.escape(v);
  function illustration(place){
    const id=place?.id,theme=TripData.routes.find(r=>r.toId===id)?.theme||'stay';
    const glyph=({rental:'🛵',bus:'🚌',food:'🍜',japan:'⛩',cafe:'☕',lake:'🏞',stay:'🏡',village:'🏘',spring:'♨'})[theme]||'🌿';
    return `<div class="photo-placeholder v4-photo-placeholder v5-illustration" data-illustration="${esc(id)}"><svg viewBox="0 0 500 180" aria-hidden="true"><circle cx="385" cy="42" r="24" fill="#f4d391"/><path d="M0 150 100 45 200 150 320 35 500 165V180H0Z" fill="#c6dac0"/><path d="M0 170 140 100 265 170 400 95 500 170V180H0Z" fill="#a9cbbd"/><path d="M0 170Q120 125 255 166T500 155V180H0Z" fill="#c4e3e2"/><text x="250" y="140" text-anchor="middle" font-size="70">${glyph}</text></svg><span>${esc(place?.name||'จุดหมายของเรา')}</span><small>ภาพประกอบทั่วไป ไม่ใช่ภาพถ่ายสถานที่จริง<br>ยังไม่มีภาพที่อนุญาตให้เผยแพร่ซ้ำ</small></div>`;
  }
  function render(placeId,index=0){
    const place=TripData.places.find(p=>p.id===placeId),images=TripMedia.list(placeId);
    if(!place)return '';
    const p=images[Math.max(0,Math.min(index,images.length-1))];
    return `<div class="ri-photos single v5-gallery" data-gallery-place="${esc(placeId)}" data-gallery-index="${index}"><figure class="ri-destination-photo" data-photo-place="${esc(placeId)}"${p?' data-photo-id="'+esc(p.id)+'"':''}><div class="ri-photo">${p?`<button class="v5-photo-open" data-photo-open="${esc(placeId)}" data-photo-index="${index}" aria-label="ขยายภาพ ${esc(place.name)}"><img class="photo" src="${esc(p.file)}" alt="${esc(p.name)}" loading="lazy" data-place-image="${esc(placeId)}"><span>ขยายภาพ ⤢</span></button>`:illustration(place)}</div><figcaption><strong>${esc(place.name)}</strong>${p?`<small class="v5-photo-credit">${TripMedia.credit(p)}</small>`:place.sourceUrl?`<a href="${esc(place.sourceUrl)}" target="_blank" rel="noopener noreferrer">ชมภาพที่ต้นฉบับ ↗</a>`:''}</figcaption></figure>${images.length>1?`<nav class="v5-thumbnails" aria-label="ภาพ ${esc(place.name)}"><button data-gallery-step="-1" aria-label="ภาพก่อนหน้า">‹</button>${images.map((x,i)=>`<button data-gallery-select="${i}" aria-label="ภาพที่ ${i+1}" aria-pressed="${i===index}"><img src="${esc(x.file)}" alt="${esc(x.name)}" loading="lazy"></button>`).join('')}<button data-gallery-step="1" aria-label="ภาพถัดไป">›</button></nav>`:''}</div>`;
  }
  const viewer=()=>document.querySelector('#photo-viewer');
  function draw(){
    const images=TripMedia.list(activePlace);if(!images.length){viewer().close();return}
    activeIndex=(activeIndex+images.length)%images.length;const p=images[activeIndex];
    viewer().innerHTML=`<div class="v5-viewer-header"><strong>${esc(p.name)} · ${activeIndex+1} / ${images.length}</strong><button data-photo-close aria-label="ปิดภาพ">✕</button></div><div class="v5-viewer-image"><button data-photo-step="-1" aria-label="ภาพก่อนหน้า" ${images.length<2?'disabled':''}>‹</button><img src="${esc(p.file)}" alt="${esc(p.name)}"><button data-photo-step="1" aria-label="ภาพถัดไป" ${images.length<2?'disabled':''}>›</button></div><p>${TripMedia.credit(p)}</p>`;
  }
  function init(){
    document.querySelectorAll('[data-hero-place]').forEach(img=>{const p=TripMedia.list(img.dataset.heroPlace)[0];if(p){img.src=p.file;img.alt=p.name;document.querySelector('.photo-footnote').innerHTML=TripMedia.credit(p)+' · ภาพวาดต้นฉบับของโปรเจกต์'}else{const box=document.createElement('div');box.innerHTML=illustration(TripData.places.find(x=>x.id===img.dataset.heroPlace));img.replaceWith(box.firstElementChild)}});
    const dlg=document.createElement('dialog');dlg.id='photo-viewer';dlg.className='v5-photo-viewer';dlg.setAttribute('aria-label','ภาพสถานที่แบบขยาย');document.body.append(dlg);
    dlg.addEventListener('close',()=>{if(opener?.isConnected)opener.focus()});
    document.addEventListener('click',event=>{
      const open=event.target.closest('[data-photo-open]');if(open){opener=open;activePlace=open.dataset.photoOpen;activeIndex=Number(open.dataset.photoIndex);draw();dlg.showModal();return}
      if(event.target.closest('[data-photo-close]')){dlg.close();return}
      const step=event.target.closest('[data-photo-step]');if(step){activeIndex+=Number(step.dataset.photoStep);draw();return}
      const thumb=event.target.closest('[data-gallery-select],[data-gallery-step]');if(thumb){const gallery=thumb.closest('[data-gallery-place]'),id=gallery.dataset.galleryPlace,images=TripMedia.list(id),index=thumb.dataset.gallerySelect!==undefined?Number(thumb.dataset.gallerySelect):(Number(gallery.dataset.galleryIndex)+Number(thumb.dataset.galleryStep)+images.length)%images.length;const box=document.createElement('div');box.innerHTML=render(id,index);const current=box.firstElementChild;gallery.replaceWith(current);TripApp.bindImages(current);current?.querySelector(`[data-gallery-select="${index}"]`)?.focus()}
      if(event.target.closest('[data-edit-route-budget]')){if(document.querySelector('#details-dialog').open)document.querySelector('#details-dialog').close();if(document.querySelector('#presentation').open)TripPresentation.close();document.querySelector('#budget').scrollIntoView({behavior:'smooth'});document.querySelector('#expense-rows input')?.focus({preventScroll:true})}
    });
    document.addEventListener('keydown',e=>{if(!dlg.open)return;if(['ArrowLeft','ArrowRight','Escape'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')dlg.close();else{activeIndex+=e.key==='ArrowRight'?1:-1;draw()}}},true);
    let touch=null;dlg.addEventListener('touchstart',e=>{touch=e.changedTouches[0].clientX},{passive:true});dlg.addEventListener('touchend',e=>{if(touch!==null&&Math.abs(e.changedTouches[0].clientX-touch)>65){activeIndex+=e.changedTouches[0].clientX<touch?1:-1;draw()}touch=null},{passive:true});
  }
  return {render,illustration,init};
})();
