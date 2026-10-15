/* V2 reads V1 without changing it. Saves only to its own versioned key. */
window.TripBudget = (() => {
  const KEY='fang-trip-budget-v2',OLD_KEY='fang-trip-budget-v1';
  let state,chart=null,migrated=false,storageBlocked=false;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const round=x=>Math.round((x+Number.EPSILON)*100)/100;
  const money=x=>'฿'+Number(x).toLocaleString('th-TH',{maximumFractionDigits:2});
  const defaults=()=>({schemaVersion:2,budget:6000,expenses:clone(TripData.defaultExpenses),
    fuel:{mode:'routes',distance:null,efficiency:35,price:40,date:'',detour:15,allowance:160},origin:'v2'});
  const validNumber=(x,max=10000000)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=max;
  function validate(x) {
    return x&&validNumber(x.budget)&&Array.isArray(x.expenses)&&x.expenses.length<=500&&
      x.expenses.every(e=>typeof e.id==='string'&&typeof e.name==='string'&&validNumber(e.amount)&&[0,1,2,3].includes(e.day)&&Object.hasOwn(TripData.categories,e.category))&&
      new Set(x.expenses.map(e=>e.id)).size===x.expenses.length&&x.expenses.filter(e=>e.id==='fuel').length===1&&
      x.fuel&&validNumber(x.fuel.efficiency,200)&&x.fuel.efficiency>=1&&validNumber(x.fuel.price,1000)&&typeof x.fuel.date==='string'&&
      (x.fuel.distance===null||validNumber(x.fuel.distance,100000));
  }
  function normalize(x,legacy=false) {
    x=clone(x);x.schemaVersion=2;
    x.expenses.forEach(e=>{if(!['estimated','confirmed'].includes(e.verificationStatus))e.verificationStatus='estimated';});
    x.fuel.mode=legacy?'manual':(['manual','routes'].includes(x.fuel.mode)?x.fuel.mode:'routes');
    x.fuel.detour=legacy?0:(validNumber(x.fuel.detour,100)?x.fuel.detour:15);
    x.fuel.allowance=validNumber(x.fuel.allowance,100000)?x.fuel.allowance:x.expenses.find(e=>e.id==='fuel').amount;
    x.origin=legacy?'migrated_v1':(x.origin||'v2');
    return x;
  }
  function save() {
    const el=document.getElementById('save-state');
    if(storageBlocked){el.textContent='พบข้อมูลเดิมอ่านไม่ได้ · ยังไม่บันทึกทับ';el.classList.add('storage-error');return;}
    try {localStorage.setItem(KEY,JSON.stringify(state));el.textContent='บันทึก V2 แล้ว ✓';el.classList.remove('storage-error');}
    catch(e){el.textContent='บันทึกไม่ได้ · ใช้ต่อในหน้านี้ได้';el.classList.add('storage-error');}
  }
  function total(){return round(state.expenses.reduce((s,e)=>s+e.amount,0));}
  function allocation() {
    const reserve=round(state.expenses.filter(e=>e.category==='reserve').reduce((s,e)=>s+e.amount,0));
    const confirmed=round(state.expenses.filter(e=>e.category!=='reserve'&&e.verificationStatus==='confirmed').reduce((s,e)=>s+e.amount,0));
    return {reserve,confirmed,operating:round(total()-reserve),estimated:round(total()-reserve-confirmed),unallocated:round(state.budget-total())};
  }
  function fuelCalculation() {
    const aggregate=RouteInfographic.aggregate(),f=state.fuel;
    const km=f.mode==='manual'?f.distance:(aggregate.knownKm>0||aggregate.pending===0?aggregate.knownKm:null);
    const complete=f.mode==='manual'?km!==null:aggregate.pending===0;
    const litres=km===null?null:km/f.efficiency;
    const base=litres===null?null:round(litres*f.price);
    const detour=base===null?null:round(base*f.detour/100);
    const cost=base===null?null:round(base+detour);
    const amount=complete&&cost!==null?cost:Math.max(f.allowance,cost??0);
    return {aggregate,km,complete,litres,base,detour,cost,amount};
  }
  function calculateFuel(){return fuelCalculation().cost;}
  function renderRows() {
    const tbody=document.getElementById('expense-rows');tbody.replaceChildren();
    state.expenses.forEach(e=>{
      const tr=document.createElement('tr');tr.dataset.id=e.id;
      const td=()=>document.createElement('td');
      const nameTd=td(),name=document.createElement('input');name.value=e.name;name.maxLength=90;
      name.setAttribute('aria-label','ชื่อรายการค่าใช้จ่าย');name.dataset.field='name';name.readOnly=e.id==='fuel';nameTd.append(name);
      if(e.sourceUrl){const a=document.createElement('a');a.href=e.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';a.className='expense-source';a.textContent='ที่มางบ / ราคาเก่า ↗';a.title=e.notes||'ไม่ใช่ราคายืนยันของทริป';nameTd.append(a);}
      const dayTd=td(),day=document.createElement('select');day.setAttribute('aria-label','วันของ '+e.name);day.dataset.field='day';
      [[0,'ทั้งทริป'],[1,'วันที่ 1'],[2,'วันที่ 2'],[3,'วันที่ 3']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;o.selected=e.day===v;day.append(o);});dayTd.append(day);
      const amountTd=td(),amount=document.createElement('input');Object.assign(amount,{type:'number',min:0,max:10000000,step:'.01',value:e.amount,readOnly:e.id==='fuel'});amount.dataset.field='amount';amount.setAttribute('aria-label','งบ '+e.name);amountTd.append(amount);
      const statusTd=td(),status=document.createElement('select');status.dataset.field='verificationStatus';status.setAttribute('aria-label','สถานะราคา '+e.name);
      [['estimated','ประมาณการ'],['confirmed','ผู้ใช้ยืนยันแล้ว']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;o.selected=e.verificationStatus===v;status.append(o);});
      status.disabled=e.id==='fuel';statusTd.append(status);
      const removeTd=td();if(e.id!=='fuel'){const b=document.createElement('button');b.type='button';b.textContent='×';b.dataset.remove=e.id;b.setAttribute('aria-label','ลบ '+e.name);removeTd.append(b);}else{removeTd.textContent='↻';removeTd.title='คำนวณจากระยะหรือใช้งบตั้งเผื่อเพียงรายการเดียว';}
      tr.append(nameTd,dayTd,amountTd,statusTd,removeTd);tbody.append(tr);
    });
  }
  function renderTotals() {
    const spent=total(),a=allocation();
    document.getElementById('planned-total').textContent=money(spent);
    document.getElementById('remaining-total').textContent=money(a.unallocated);
    document.getElementById('person-total').textContent=money(spent/2);
    const warning=document.getElementById('budget-warning');warning.hidden=a.unallocated>=0;
    warning.textContent=`งบจัดสรรเกิน ${money(-a.unallocated)} · ยังมีราคาที่ยังไม่ยืนยัน ควรขอราคาให้ครบก่อนจอง ไม่ลดตัวเลขเพื่อให้พอดีงบ`;
    document.getElementById('remaining-total').style.color=a.unallocated<0?'#ad4e53':'';
    const health=document.getElementById('budget-health'),pending=RouteInfographic.aggregate().pending;
    const status=a.unallocated<0?'over':a.estimated>0||pending>0?'caution':'good';
    health.dataset.health=status;
    const title=status==='over'?'ต้องปรับแผนก่อนจอง':status==='caution'?'อยู่ในกรอบ แต่ยังต้องเช็กราคาและเส้นทาง':'งบมีพื้นที่เผื่อ';
    health.innerHTML=`<div class="health-heading"><strong>${status==='over'?'!':'♡'} สุขภาพงบทริป: ${title}</strong><span>จัดสรร ${state.budget?Math.round(spent/state.budget*100):0}% ของงบ</span></div><div class="health-track"><span style="width:${state.budget?Math.min(100,a.operating/state.budget*100):100}%"></span><i style="width:${state.budget?Math.min(100,a.reserve/state.budget*100):0}%"></i></div><div class="health-values"><span>ค่าใช้จ่าย <b>${money(a.operating)}</b></span><span>เงินสำรองฉุกเฉิน <b>${money(a.reserve)}</b></span><span>ยังไม่จัดสรร <b>${money(a.unallocated)}</b></span><span>ค่าใช้จ่ายต่อคน / ไม่รวมสำรอง <b>${money(a.operating/2)}</b></span></div><p>${migrated?'อ่านงบ V1 เดิมมาใช้โดยคงยอด รายการ และระยะเดิมไว้ · บันทึกเฉพาะคีย์ V2 เมื่อคุณแก้ไข · ':''}ยังไม่รวมราคาที่ไม่ทราบของรถรับจ้างเชื่อมจุดและเงินมัดจำที่คืนได้ หากงบเกินให้พิจารณาข้ามคาเฟ่ เลือกอาหารง่ายขึ้น หรือขอราคาที่พักทางเลือกก่อนเปลี่ยนแผน</p>`;
    document.getElementById('daily-expenses').innerHTML=[1,2,3,0].map(d=>{const sum=state.expenses.filter(e=>e.day===d).reduce((s,e)=>s+e.amount,0);return `<span>${d?'วันที่ '+d:'ทั้งทริป / รวมสำรอง'}<b>${money(sum)}</b></span>`;}).join('');
    renderChart();
  }
  function renderChart(){const groups=Object.entries(TripData.categories).map(([key,[name,color]])=>({name,color,amount:state.expenses.filter(e=>e.category===key).reduce((s,e)=>s+e.amount,0)})).filter(e=>e.amount>0);
    const legend=document.getElementById('chart-legend');legend.replaceChildren();groups.forEach(e=>{const row=document.createElement('div');row.className='legend-row';const label=document.createElement('span');const dot=document.createElement('i');dot.className='legend-dot';dot.style.background=e.color;label.append(dot,document.createTextNode(e.name));const sum=document.createElement('span');sum.textContent=money(e.amount);row.append(label,sum);legend.append(row);});
    if(window.Chart){document.getElementById('chart-fallback').hidden=true;document.getElementById('budget-chart').hidden=false;if(chart){chart.data.labels=groups.map(e=>e.name);chart.data.datasets[0].data=groups.map(e=>e.amount);chart.data.datasets[0].backgroundColor=groups.map(e=>e.color);chart.update('none');}else{chart=new Chart(document.getElementById('budget-chart'),{type:'doughnut',data:{labels:groups.map(e=>e.name),datasets:[{data:groups.map(e=>e.amount),backgroundColor:groups.map(e=>e.color),borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'76%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.label+': '+money(ctx.raw)}}}}});}}
    else {document.getElementById('budget-chart').hidden=true;const fallback=document.getElementById('chart-fallback');fallback.hidden=false;let offset=0;const sum=total();fallback.style.background=sum?'conic-gradient('+groups.map(e=>{const from=offset;offset+=e.amount/sum*100;return `${e.color} ${from}% ${offset}%`;}).join(',')+')':'var(--line)';fallback.setAttribute('role','img');fallback.setAttribute('aria-label','สัดส่วนค่าใช้จ่าย ดูยอดแต่ละหมวดใต้กราฟ');}
  }

  function renderFuel() {
    const f=state.fuel,c=fuelCalculation();
    document.getElementById('fuel-distance').disabled=f.mode==='routes';
    document.getElementById('fuel-litres').textContent=c.litres===null?'ปริมาณน้ำมัน: รอระยะทาง':c.litres.toFixed(2)+' ลิตร'+(!c.complete?' · เฉพาะช่วงที่ทราบ':'');
    document.getElementById('fuel-total').textContent=c.cost===null?'รอระยะทาง':money(c.cost);
    document.getElementById('fuel-state').textContent=c.complete?'ประมาณการรวมเผื่อขี่อ้อม '+money(c.detour)+' · อยู่ในงบ 1 รายการ':'ยังขาดระยะ '+c.aggregate.pending+' ช่วง · ตั้งงบไว้ '+money(state.expenses.find(e=>e.id==='fuel').amount);
    const block=document.getElementById('fuel-route-breakdown');
    block.innerHTML=`<div class="fuel-breakdown-title"><strong>ระยะมอเตอร์ไซค์จากแผน</strong><span>${c.aggregate.count} ช่วง · ไม่รวมรถโดยสาร รถรับจ้าง และการเดิน</span></div><div class="fuel-days">${c.aggregate.days.map(d=>`<div><strong>วันที่ ${d.day}</strong><span>มีแหล่งยืนยัน ${d.verifiedKm.toFixed(1)} กม.</span><span>ผู้ใช้ / ประมาณ ${d.estimatedKm.toFixed(1)} กม.</span><small>${d.pending?'ยังขาด '+d.pending+' ช่วง':'ระยะครบตามข้อมูลที่กรอก'}</small></div>`).join('')}<div><strong>รวมที่ทราบ ${c.aggregate.knownKm.toFixed(1)} กม.</strong><span>${c.aggregate.pending?'ยังไม่ใช่ระยะทั้งทริป':'ครบทุกช่วงที่ใช้มอเตอร์ไซค์'}</span><small>ราคา ${f.price} บาท/ลิตร · ${f.date?'วันที่อ้างอิง '+f.date:'ราคาสมมติ ไม่มีวันที่อ้างอิง'}</small></div></div><p class="fuel-precision-note">${f.mode==='manual'?'กำลังใช้ระยะประมาณเอง '+(f.distance??'ยังไม่กรอก')+' กม. ตัวเลขรายวันด้านบนยังแสดงจาก Route Data แยกไว้ ไม่ได้ถูกนำมาบวกซ้ำ':'ค่าน้ำมันคำนวณใหม่เมื่อเติมระยะในรายละเอียดเส้นทาง หากยังมีช่วงที่ไม่ทราบ จะคงงบตั้งเผื่อหรือยอดขั้นต่ำที่คำนวณได้ซึ่งมากกว่าไว้ก่อน'} · ไม่แสดงเป็นราคาจริงที่ยืนยัน</p>`;
  }
  function updateFuel({initial=false}={}) {
    const c=fuelCalculation();
    if(!(initial&&migrated))state.expenses.find(e=>e.id==='fuel').amount=c.amount;
    const field=document.querySelector('tr[data-id="fuel"] input[data-field="amount"]');if(field)field.value=state.expenses.find(e=>e.id==='fuel').amount;
    renderFuel();renderTotals();
  }
  function loadInputs() {
    document.getElementById('budget-limit').value=state.budget;
    for(const k of ['distance','efficiency','price','date','mode','detour','allowance'])document.getElementById('fuel-'+k).value=state.fuel[k]??'';
  }
  function init() {
    state=defaults();let note='';
    try {
      const v2=localStorage.getItem(KEY);
      if(v2!==null){const x=JSON.parse(v2);if(validate(x))state=normalize(x);else{storageBlocked=true;note='ข้อมูล V2 เดิมอ่านไม่ได้ · ยังไม่บันทึกทับ';}}
      else {const old=localStorage.getItem(OLD_KEY);if(old!==null){const x=JSON.parse(old);if(validate(x)){state=normalize(x,true);migrated=true;}else{note='ข้อมูล V1 อ่านไม่ได้ · เก็บต้นฉบับไว้ ไม่แก้คีย์เดิม';}}}
    } catch(e){storageBlocked=true;note='อ่านข้อมูลเดิมไม่ได้ · เก็บข้อมูลเดิมไว้';}
    document.getElementById('budget-summary').innerHTML='<div class="budget-stat"><small>งบทั้งหมด · แก้ไขได้</small><strong>฿<input id="budget-limit" aria-label="งบทั้งหมด" type="number" min="0" max="10000000" step="100"></strong></div><div class="budget-stat"><small>จัดสรรรวมเงินสำรอง</small><strong id="planned-total"></strong></div><div class="budget-stat"><small>เงินที่ยังไม่จัดสรร</small><strong id="remaining-total"></strong></div><div class="budget-stat"><small>ยอดจัดสรรต่อคน / รวมสำรอง</small><strong id="person-total"></strong></div>';
    loadInputs();renderRows();updateFuel({initial:true});
    if(note)document.getElementById('save-state').textContent=note;
    document.getElementById('budget-limit').addEventListener('input',e=>{if(e.target.value===''||!e.target.checkValidity())return;state.budget=Number(e.target.value);renderTotals();save();});
    document.getElementById('expense-rows').addEventListener('input',e=>{
      const field=e.target.dataset.field;if(!field)return;
      const item=state.expenses.find(x=>x.id===e.target.closest('tr').dataset.id);if(!item)return;
      if(field==='amount'){if(e.target.value===''||!e.target.checkValidity()||item.id==='fuel')return;item.amount=Number(e.target.value);}
      if(field==='day')item.day=Number(e.target.value);
      if(field==='name')item.name=e.target.value;
      if(field==='verificationStatus'&&item.id!=='fuel'&&['estimated','confirmed'].includes(e.target.value))item.verificationStatus=e.target.value;
      renderTotals();save();
    });
    document.getElementById('expense-rows').addEventListener('click',e=>{const id=e.target.dataset.remove;if(!id||id==='fuel')return;state.expenses=state.expenses.filter(x=>x.id!==id);renderRows();renderTotals();save();});
    document.getElementById('add-expense').addEventListener('click',()=>{
      if(state.expenses.length>=500){TripApp.toast('เพิ่มรายการได้สูงสุด 500 รายการ');return;}
      state.expenses.push({id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:'รายการใหม่',category:'other',day:1,amount:0,verificationStatus:'estimated',priceTHB:null});
      renderRows();renderTotals();save();const input=document.querySelector('#expense-rows tr:last-child input');input.focus();input.select();
    });
    document.getElementById('reset-budget').addEventListener('click',()=>{
      if(!confirm('ใช้ค่างบ V2 เริ่มต้นแทนงบที่แก้ใน V2? งบ V1 ต้นฉบับยังเก็บไว้'))return;
      state=defaults();migrated=false;storageBlocked=false;loadInputs();renderRows();updateFuel();save();
    });
    for(const key of ['distance','efficiency','price','date','mode','detour','allowance'])document.getElementById('fuel-'+key).addEventListener('input',e=>{
      if(!e.target.checkValidity()||(e.target.value===''&&!['date','distance'].includes(key)))return;
      state.fuel[key]=['date','mode'].includes(key)?e.target.value:(e.target.value===''?null:Number(e.target.value));
      updateFuel();save();
    });
    window.addEventListener('trip:routes-changed',()=>{updateFuel();save();});
  }
  return {init,total,money,allocation,calculateFuel,fuelCalculation,getState:()=>clone(state)};
})();
