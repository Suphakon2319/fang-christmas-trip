/* แก้ข้อมูลทริปที่นี่ ใช้ null เมื่อยังไม่ยืนยัน ห้ามเติมพิกัดโดยคาดเดา */
window.TripData = (() => {
  const verifiedAt = '2026-10-15';
  const place = (id, name, english, type, day, duration, description, extra = {}) => ({id,name,english,type,day,duration,description,coordinates:null,image:null,openingHours:null,entryTHB:null,sourceUrl:null,verifiedAt:null,notes:'รอยืนยันข้อมูล — ต้องตรวจสอบพิกัด ราคา และเวลาเปิดก่อนเดินทาง',...extra});
  const places = [
    place('chiangmai','เชียงใหม่','เชียงใหม่','เมืองเริ่มต้น',1,'ก่อน 09:00','นัดพบที่จุดขึ้นรถซึ่งต้องยืนยันกับผู้ให้บริการก่อนวันเดินทาง'),
    place('fang','ตัวเมืองฝาง','ตัวเมืองฝาง','เมืองปลายทาง',1,'ช่วงเที่ยง','แวะอาหารกลางวัน ติดต่อร้านเช่ารถ และเตรียมตัวเข้าที่พัก'),
    place('homestay','สส โฮมสเตย์ ริมน้ำแม่มาว','นอนฟังเสียงลำธาร','ที่พักของเรา',1,'2 คืน','พักผ่อนริมลำน้ำ ใช้เวลาช้า ๆ ด้วยกัน ต้องยืนยันห้องว่างและราคากับเจ้าของที่พัก',{image:'assets/images/homestay.jpg',imageCredit:'ภาพปกรีวิว ผมม้าพาเที่ยว / Lemon8 ปี 2025',imageSource:'https://www.lemon8-app.com/@pommapartiew/7543073580175589904?region=th',notes:'ภาพปกมีสัญลักษณ์วิดีโอและราคารีวิวปี 2025 ไม่ใช่ราคายืนยันสำหรับธันวาคม 2026 กดที่มาภาพเพื่อดูรีวิวต้นฉบับ'}),
    place('reservoir','อ่างเก็บน้ำแม่มาว','บ่ายสบาย ๆ ริมอ่างเก็บน้ำ','ธรรมชาติ',1,'แผนเที่ยว 1–2 ชม.','ช่วงบ่ายสำหรับนั่งคุย รับลม และชมวิว ตรวจสอบทางเข้าและสภาพถนนก่อนออกเดินทาง',{image:'assets/images/mae-mao-5.jpg',imageCredit:'เรา ไป แล้ว / Trip.com',imageSource:'https://www.trip.com/moments/detail/chiang-mai-province-23189-146980920/'}),
    place('banyang','หมู่บ้านบ้านยาง','เดินเล่นในชุมชนกลางหุบเขา','ชุมชน',2,'แผนเที่ยว 2 ชม.','เดินเล่นในหมู่บ้านและวางแผนมื้ออาหารจีนยูนนาน โดยเลือกร้านหลังตรวจสอบที่ตั้งและวันเปิด',{image:'assets/images/ban-yang.png',imageCredit:'ภาพวัดจีนในชุมชนบ้านยาง / อบต.แม่งอน',imageSource:'https://www.maengon.go.th/catalog/travels/196',sourceUrl:'https://www.maengon.go.th/catalog/travels/196',verifiedAt}),
    place('hinoki','Hinoki Land','ญี่ปุ่นเล็ก ๆ ในไชยปราการ','สถาปัตยกรรม',2,'แผนเที่ยว 2 ชม.','จุดแวะชมสถาปัตยกรรมญี่ปุ่นในไชยปราการ เวลาของวันนี้อาจต้องปรับตามเส้นทางจริง', {coordinates:[19.6558652,99.1479735],image:'assets/images/hinoki-banner.png',imageCredit:'ภาพจากเว็บไซต์ Hinoki Land',phone:'094-731-0731 / 089-837-3373',sourceUrl:'https://hinokiland.com/contactus/',verifiedAt,notes:'พิกัดจาก Google Maps ที่ฝังในหน้าติดต่อเว็บไซต์ผู้ให้บริการ ค่าเข้าและเวลาช่วงคริสต์มาสยังรอตรวจสอบ'}),
    place('hotspring','น้ำพุร้อนฝาง','เช้าอุ่น ๆ กลางลมหนาว','ธรรมชาติ',3,'แผนเที่ยว 1–2 ชม.','น้ำพุร้อนภายในอุทยานแห่งชาติดอยผ้าห่มปก ตามข้อมูลกระทรวงการท่องเที่ยวฯ ค่าเข้าและเวลาในวันเดินทางยังต้องยืนยัน',{image:'assets/images/fang-hot-springs.jpg',imageCredit:'ภาพน้ำพุร้อนฝาง · PublicDomainPictures.net',sourceUrl:'https://www.thailandtourismdirectory.go.th/attraction/5157',verifiedAt,notes:'ยืนยันตัวสถานที่จากกระทรวงการท่องเที่ยวและกีฬาแล้ว พิกัด เวลาเปิด และค่าบริการยังรอตรวจสอบ'})
  ];
  const route = (day,number,from,to,departure,arrival,durationMinutes,transport,description,extra={}) => ({id:`day${day}-route${number}`,day,number,from,to,departure,arrival,durationMinutes,transport,description,distanceKm:null,costTHB:null,status:'needs_verification',sourceUrl:null,verifiedAt:null,notes:'เวลาเป็นกำหนดการเบื้องต้น ไม่ใช่รอบรถหรือระยะทางที่ยืนยันแล้ว',image:null,boardingPoint:null,operator:null,dropoffPoint:null,rentalShop:null,phone:null,...extra});
  const routes = [
    route(1,1,'เชียงใหม่','ตัวเมืองฝาง','09:00','12:00–13:00',210,'รถบัส / รถตู้','ถึงจุดขึ้นรถเวลา 08:30 เผื่อเวลาซื้อตั๋วและจัดสัมภาระ รอบ 09:00 เป็นเวลาที่ต้องการ ยังไม่ยืนยัน',{fromId:'chiangmai',toId:'fang',steps:['ยืนยันจุดขึ้นรถ ผู้ให้บริการ และรอบเดินทางล่วงหน้า','ไปถึงจุดขึ้นรถก่อนเวลาอย่างน้อย 30 นาที','ยืนยันจุดลงในตัวเมืองฝางก่อนขึ้นรถ']}),
    route(1,2,'จุดลงรถในฝาง','ร้านอาหารกลางวัน','13:00','13:15',15,'เดิน / รถรับจ้าง','เลือกร้านใกล้จุดลงรถหลังทราบจุดจอดจริง ยังไม่ได้ระบุร้าน',{fromId:'fang',steps:['ตรวจสอบจุดลงรถจริง','เลือกร้านใกล้จุดลงรถและตกลงราคาเดินทางก่อนใช้บริการ']}),
    route(1,3,'ร้านอาหารกลางวัน','ร้านเช่ามอเตอร์ไซค์','14:00','14:15',15,'เดิน / รถรับจ้าง','ยังไม่ยืนยันร้านเช่า ตรวจสภาพรถ หมวกนิรภัย เอกสาร และเงื่อนไขมัดจำก่อนรับรถ',{toId:'fang',steps:['โทรยืนยันว่ามีรถว่างและตรวจเงื่อนไขการเช่า','ตรวจเบรก ยาง ไฟ และถ่ายภาพสภาพรถ','ขอหมวกนิรภัยครบทั้ง 2 คน']}),
    route(1,4,'ร้านเช่ารถในฝาง','สส โฮมสเตย์ ริมน้ำแม่มาว','14:30','15:00',30,'มอเตอร์ไซค์','เวลาขับเป็นช่องเวลาที่เผื่อไว้ ต้องยืนยันพิกัดที่พักก่อนคำนวณระยะจริง',{fromId:'fang',toId:'homestay',steps:['ขอหมุดที่พักจากเจ้าของโดยตรง','ตรวจเส้นทางและสภาพถนนก่อนออกตัว','เช็กอินและพักก่อนออกเที่ยว']}),
    route(1,5,'สส โฮมสเตย์','อ่างเก็บน้ำแม่มาว','16:00','16:30',30,'มอเตอร์ไซค์','เผื่อเวลาเที่ยวชมประมาณ 1 ชั่วโมง และวางแผนกลับก่อนมืดตามสภาพเส้นทาง',{fromId:'homestay',toId:'reservoir'}),
    route(1,6,'อ่างเก็บน้ำแม่มาว','สส โฮมสเตย์ / มื้อเย็น','17:30','18:00',30,'มอเตอร์ไซค์','กลับที่พักและกินอาหารเย็น ตรวจสอบว่าที่พักมีอาหารหรือต้องแวะซื้อก่อน',{fromId:'reservoir',toId:'homestay'}),
    route(2,1,'สส โฮมสเตย์','หมู่บ้านบ้านยาง','08:30','09:00',30,'มอเตอร์ไซค์','อาหารเช้า 07:30 ก่อนออกเดินทาง เที่ยวหมู่บ้านและวางแผนอาหารจีนยูนนานช่วง 11:00',{fromId:'homestay',toId:'banyang'}),
    route(2,2,'หมู่บ้านบ้านยาง','Hinoki Land','12:00','13:00',60,'มอเตอร์ไซค์','เผื่อช่วงเดินทาง 1 ชั่วโมง แต่ยังไม่ยืนยันจากถนนจริง หากไม่พอให้ลดเวลาแวะหรือปรับกำหนดการ',{fromId:'banyang',toId:'hinoki'}),
    route(2,3,'Hinoki Land','คาเฟ่ระหว่างทาง','15:00','15:15',15,'มอเตอร์ไซค์','เลือกคาเฟ่หลังตรวจสอบเส้นทางกลับและเวลาเปิดจริง ยังไม่ได้ระบุร้าน',{fromId:'hinoki'}),
    route(2,4,'คาเฟ่ระหว่างทาง','ตัวเมืองฝาง / มื้อเย็น','15:45','17:00',75,'มอเตอร์ไซค์','เผื่อเวลาเดินทางและพัก วางแผนมื้อหมูกระทะประมาณ 17:30 โดยยังไม่ยืนยันร้าน',{toId:'fang'}),
    route(2,5,'ตัวเมืองฝาง','สส โฮมสเตย์','18:30','19:00',30,'มอเตอร์ไซค์','กลับที่พักหลังอาหาร หากเส้นทางมืดหรือไม่คุ้นเคยให้เลื่อนกลับเร็วขึ้น',{fromId:'fang',toId:'homestay'}),
    route(3,1,'สส โฮมสเตย์','น้ำพุร้อนฝาง','08:00','08:30',30,'มอเตอร์ไซค์','อาหารเช้า 07:30 เตรียมของเช็กเอาต์ และสอบถามเวลาเปิดก่อนเดินทาง',{fromId:'homestay',toId:'hotspring'}),
    route(3,2,'น้ำพุร้อนฝาง','ร้านข้าวซอยในฝาง','10:00','10:30',30,'มอเตอร์ไซค์','มื้อข้าวซอยก่อนกลับ เลือกร้านที่สะดวกต่อการคืนรถและไปจุดขึ้นรถ',{fromId:'hotspring',toId:'fang'}),
    route(3,3,'ร้านข้าวซอย','ร้านคืนมอเตอร์ไซค์','11:30','12:00',30,'มอเตอร์ไซค์','เติมน้ำมันตามเงื่อนไข ตรวจสภาพรถ รับมัดจำคืน และเผื่อเวลาไปขึ้นรถกลับ',{fromId:'fang',toId:'fang'}),
    route(3,4,'ตัวเมืองฝาง','เชียงใหม่','13:00–15:00','16:00–19:00',210,'รถบัส / รถตู้','13:00–15:00 คือช่วงที่ตั้งใจออกจากฝาง ไม่ใช่เวลาถึงเชียงใหม่ ต้องยืนยันรอบและเผื่อเดินทาง 3–4 ชม.',{fromId:'fang',toId:'chiangmai'})
  ];
  return {title:'ทริปฝางคริสต์มาสของเรา 2026',start:'2026-12-24T09:00:00+07:00',budget:6000,travelers:2,places,routes,days:[
    {id:1,date:'24 ธันวาคม 2026',title:'ออกเดินทางไปหาความสุข',thai:'ออกจากเมือง ไปหาความสงบริมน้ำ — แล้วใช้บ่ายแรกด้วยกัน'},
    {id:2,date:'25 ธันวาคม 2026',title:'คริสต์มาสในอ้อมกอดภูเขา',thai:'เดินเล่นในหมู่บ้าน แวะญี่ปุ่นเล็ก ๆ และฉลองคริสต์มาสแบบเรา'},
    {id:3,date:'26 ธันวาคม 2026',title:'เช้าช้า ๆ ก่อนบอกลาฝาง',thai:'น้ำพุร้อน มื้ออร่อย และความทรงจำอุ่น ๆ ระหว่างทางกลับ'}
  ],defaultExpenses:[
    {id:'bus-out',name:'รถบัส / รถตู้ ขาไป',category:'transport',day:1,amount:360},
    {id:'bus-back',name:'รถบัส / รถตู้ ขากลับ',category:'transport',day:3,amount:360},
    {id:'rental',name:'มอเตอร์ไซค์ 2 วัน',category:'rental',day:1,amount:600},
    {id:'stay-1',name:'ที่พัก คืนที่ 1',category:'stay',day:1,amount:650},
    {id:'stay-2',name:'ที่พัก คืนที่ 2',category:'stay',day:2,amount:650},
    {id:'food-1',name:'อาหาร วันที่ 1',category:'food',day:1,amount:450},
    {id:'food-2',name:'อาหาร วันที่ 2',category:'food',day:2,amount:700},
    {id:'food-3',name:'อาหาร วันที่ 3',category:'food',day:3,amount:350},
    {id:'cafe',name:'คาเฟ่สำหรับสองคน',category:'cafe',day:2,amount:250},
    {id:'fuel',name:'น้ำมัน (คำนวณอัตโนมัติ)',category:'fuel',day:2,amount:160},
    {id:'entrance',name:'ค่าเข้าชม ตั้งเผื่อไว้',category:'entry',day:2,amount:500},
    {id:'reserve',name:'เงินสำรองทั้งทริป',category:'reserve',day:0,amount:700}
  ],categories:{transport:['รถโดยสาร','#cf7f93'],rental:['เช่ารถ','#e5b18e'],stay:['ที่พัก','#8ab8aa'],food:['อาหาร','#b4c992'],cafe:['คาเฟ่','#baa3c9'],fuel:['น้ำมัน','#e8c876'],entry:['ค่าเข้าชม','#b5c9e1'],reserve:['สำรอง','#efc8b5'],other:['อื่น ๆ','#c9b9ab']},
  checklist:['ยืนยันที่พัก 2 คืน และขอหมุดจากเจ้าของ','ตรวจรอบรถ จุดขึ้น–ลง และซื้อตั๋วไป–กลับ','ยืนยันร้านเช่ารถ ราคา และเงื่อนไขมัดจำ','ตรวจค่าเข้าและเวลาเปิดของสถานที่','เตรียมใบขับขี่ เสื้อกันหนาว และหมวกนิรภัย','ดาวน์โหลดแผนที่ออฟไลน์และชาร์จพาวเวอร์แบงก์'],
  sources:[{title:'Hinoki Land · เว็บไซต์ผู้ให้บริการ',url:'https://hinokiland.com/'},{title:'น้ำพุร้อนฝาง · กระทรวงการท่องเที่ยวและกีฬา',url:'https://www.thailandtourismdirectory.go.th/attraction/5157'},{title:'อุทยานแห่งชาติ · ระบบกรมอุทยานฯ',url:'https://booking.dnp.go.th/reservation.php?option=home'}]};
})();

/* V2: ข้อเท็จจริงที่พบ แผนเวลา และภาพสัญลักษณ์แยกจากกัน */
(() => {
  const d = TripData;
  d.dataVersion = 2;
  const date = '2026-10-15';
  const refs = {
    bus: 'https://www.yanyonnakornchiangmai.co.th/timetables.php?lang=th&type=1',
    busBack: 'https://www.yanyonnakornchiangmai.co.th/timetables.php?bus=&lang=th&route=0&type=2',
    busContact: 'https://www.yanyonnakornchiangmai.co.th/contents.php?id=contact&lang=th',
    highway: 'https://chiangmai.mots.go.th/news/565',
    village: 'https://www.maengon.go.th/catalog/travels/196',
    villageRoad: 'https://elibrary.tsri.or.th/fullP/RDG5610035/RDG5610035_full.pdf',
    hinoki: 'https://hinokiland.com/contactus/',
    cafe: 'https://hinokiland.com/',
    stay: 'https://www.youtube.com/watch?v=101k2lkG0Oc',
    lunch: 'https://www.wongnai.com/restaurants/230497ij',
    yunnan: 'https://www.youtube.com/watch?v=1GpIkAlbwcs',
    bbq: 'https://privilege.trueid.net/th/articles/DdgowrVB0mod',
    khao: 'https://restaurantguru.com/Mae-Sun'
  };
  d.verificationSources = Object.entries(refs).map(([id,url]) => ({id,url,verifiedAt:date}));
  d.places.forEach(p => {
    p.verificationStatus = p.coordinates ? 'location_source_found' : 'pending';
    p.priceTHB = p.entryTHB;
    p.distanceKm = null;
    p.durationMinutes = null;
  });
  const stay = d.places.find(p => p.id === 'homestay');
  stay.sourceUrl = refs.stay; stay.verifiedAt = date;
  stay.phone = '084-739-4476';
  stay.phoneStatus = 'published_2025_not_reconfirmed';
  stay.notes += ' รีวิว Travel 101 มิ.ย. 2025 ลงเบอร์ 084-739-4476 และราคา 350 บาท/คน ต้องตรวจสอบกับที่พักอีกครั้ง ยังไม่มีหมุดที่ยืนยัน';
  const extra = (id,day,from,to,fromId,toId,departure,arrival,minutes,transport) => ({
    id,day,number:0,from,to,fromId,toId,departure,arrival,durationMinutes:minutes,transport,
    distanceKm:null,costTHB:null,status:'needs_verification',sourceUrl:null,verifiedAt:null,
    notes:'ช่องเวลาสำหรับวางแผน ยังไม่ใช่ระยะเวลาที่วัดจากถนน',description:''
  });
  d.routes.splice(d.routes.findIndex(r => r.id === 'day2-route2'),0,
    extra('day2-lunch',2,'หมู่บ้านบ้านยาง','ร้านเล่าจาง (ตัวเลือก / รอยืนยัน)','banyang',null,'10:30','10:40',10,'เดิน / มอเตอร์ไซค์'));
  d.routes.splice(d.routes.findIndex(r => r.id === 'day3-route4'),0,
    extra('day3-transfer',3,'จุดคืนมอเตอร์ไซค์','จุดขึ้นรถกลับเชียงใหม่',null,'fang','12:15','12:30',15,'เดิน / รถรับจ้าง'));
  const details = {
    'day1-route1': {title:'ออกจากเมือง ไปหาภูเขา',theme:'bus',from:'จุดขึ้นรถเชียงใหม่',to:'จุดลงรถในฝาง',
      operator:'บริษัท ยานยนต์นครเชียงใหม่ จำกัด',phone:'053-215604',boardingPoint:'รถตู้ VIP: ตรงข้ามสำนักงานใหญ่ ถนนสนามกีฬา; รถบัส: สถานีขนส่งช้างเผือก',
      dropoffPoint:'เว็บบริษัทระบุสถานีข้างโรงพยาบาลฝางสำหรับรถบัส ส่วนรถตู้ต้องยืนยันจุดลงแยก',
      sourceUrl:refs.bus,sourceUrls:[refs.bus,refs.busBack,refs.busContact,refs.highway],
      description:'เว็บบริษัทมีรถตู้ VIP 09:00 และรถบัส 08:30 / 09:30 โดยจุดขึ้นต่างกัน หน้าเว็บยังมีประกาศปี 2020 จึงต้องโทรยืนยันรอบ 24 ธ.ค. ก่อนซื้อตั๋ว',
      roads:[{name:'ทล. 107',sourceUrl:refs.highway,scope:'แนวเส้นทางหลักเชียงใหม่–ฝาง ไม่ใช่ Geometry ของรถตู้'}],
      waypoints:['เชียงใหม่','เชียงดาว','ไชยปราการ','ฝาง'],photoPlaceIds:['reservoir','homestay'],
      steps:['โทร 053-215604 ยืนยันรอบ 09:00 ประเภทรถ ราคา และจุดลง','08:30 ไปถึงจุดขึ้นที่บริษัทแจ้ง ไม่เหมารวมรถตู้กับท่ารถบัส','เก็บตั๋วและยืนยันกับพนักงานว่าจะลงฝาง ไม่ใช่ท่าตอน'],
      preparation:'ตั๋วหรือหลักฐานจอง เงินสด เสื้อคลุม ยาประจำตัว',landmark:'ถนนสนามกีฬา / สถานีช้างเผือก เลือกตามประเภทรถ'},
    'day1-route2': {title:'มื้อแรกในฝาง',theme:'food',to:'ฮักแกะ@ฝาง (ตัวเลือก / รอยืนยัน)',sourceUrl:refs.lunch,
      description:'พบรายชื่อฮักแกะ@ฝางในตัวเมือง ใช้เป็นตัวเลือกมื้อกลางวัน ไม่ยืนยันว่าอยู่ใกล้จุดลงรถจนกว่าจะได้หมุดจริง ราคาบนรีวิวเก่าไม่ใช้เป็นราคาทริป',
      candidate:'ฮักแกะ@ฝาง',photoPlaceIds:['reservoir'],landmark:'รายการร้านระบุซอยสันป่าไหน่ ต.เวียง',
      steps:['ยืนยันจุดลงรถกับบริษัทก่อนเลือกวิธีไปร้าน','ตรวจวันเปิดของร้านและขอหมุดก่อนเดินทาง','หากไม่เปิด เลือกอาหารใกล้จุดลงรถและตกลงราคากับรถรับจ้างก่อนขึ้น']},
    'day1-route3': {title:'รับสองล้อคู่ใจ',theme:'rental',from:'ร้านอาหารกลางวัน',
      description:'ยังไม่พบผู้ให้เช่าในฝางที่ยืนยันชื่อร้าน ราคา และรถว่างได้ จึงไม่ใส่ชื่อหรือเบอร์ที่คาดเดา ต้องให้ที่พักช่วยแนะนำและได้คำยืนยันก่อนซื้อแผนรถโดยสาร',
      photoPlaceIds:['homestay'],steps:['ขอชื่อร้านและหมุดรับรถจากที่พัก','ยืนยันราคา 48 ชั่วโมง มัดจำ ประกัน และคืนรถก่อนจ่าย','ตรวจใบขับขี่ เบรก ยาง ไฟ ถ่ายภาพรถ และรับหมวกครบสองคน'],
      preparation:'ใบขับขี่ เอกสารตามเงื่อนไขร้าน เงินมัดจำที่อาจต้องจ่ายเพิ่ม',landmark:'จุดรับรถยังรอยืนยัน'},
    'day1-route4': {title:'เช็กอินริมลำธาร',theme:'stay',sourceUrl:refs.stay,phone:stay.phone,
      description:'ใช้หมุดที่เจ้าของ สส โฮมสเตย์ส่งให้ก่อนออกจากร้านเช่า เบอร์ที่พบมาจากรีวิวปี 2025 ต้องตรวจสอบว่ายังเป็นช่องทางเดิม',
      photoPlaceIds:['homestay','reservoir'],steps:['ขอหมุดและคำแนะนำทางเข้าจากเจ้าของโดยตรง','ตรวจว่าเส้นทางเหมาะกับมอเตอร์ไซค์ซ้อนสองและสัมภาระ','เช็กอิน ยืนยันมื้อเย็นและอาหารเช้าก่อนออกเที่ยว'],landmark:'ริมลำน้ำแม่มาว; ทางเข้าและพิกัดรอยืนยัน'},
    'day1-route5': {title:'เย็นแรกที่แม่มาว',theme:'lake',photoPlaceIds:['reservoir','homestay'],
      description:'เส้นทางเข้าอ่างและระดับน้ำอาจเปลี่ยนตามฤดูกาล อย่านำภาพฤดูฝนมาใช้ยืนยันสภาพถนนเดือนธันวาคม',
      steps:['ยืนยันจุดเข้าชมและทางเข้ากับที่พัก','ตรวจระยะขี่จริงก่อนออกจากที่พัก','แวะชมวิวและเผื่อขากลับก่อนมืด'],landmark:'อ่างแม่มาว / เขื่อนบ้านลาน; จุดจอดรอยืนยัน'},
    'day1-route6': {title:'กลับไปพัก เติมพลังให้พรุ่งนี้',theme:'stay',photoPlaceIds:['homestay','reservoir'],
      departure:'17:00',arrival:'17:30',description:'ปรับกลับเร็วขึ้นจากแผนเดิมเพื่อเผื่อแสงช่วงเย็น มื้อเย็นที่พักยังต้องยืนยันว่ามีบริการและคิดราคาแยกหรือไม่',
      steps:['ออกจากจุดชมวิวตามเวลาที่ตกลงไว้','ย้อนกลับทางที่ยืนยันไว้กับที่พัก ไม่เลือกทางลัดไม่คุ้นเคย','มื้อเย็นและพักผ่อน เตรียมรถกับเสื้อคลุมสำหรับเช้า']},
    'day2-route1': {title:'เช้าในชุมชนจีนยูนนาน',theme:'village',departure:'08:00',arrival:'09:00',durationMinutes:60,
      sourceUrl:refs.village,sourceUrls:[refs.village,refs.villageRoad],photoPlaceIds:['banyang','homestay'],
      roads:[{name:'ทล. 1249',sourceUrl:refs.villageRoad,scope:'ถนนบริบทบ้านยาง; ทางต่อจากที่พักรอยืนยัน'}],
      description:'อบต.ระบุบ้านยางห่างที่ว่าการฝางประมาณ 25 กม. ตัวเลขนี้ไม่ใช่ระยะจากที่พัก จึงยังไม่รวมเป็นระยะน้ำมันของทริป',
      steps:['อาหารเช้า 07:15 แล้วเช็กพยากรณ์และสภาพถนน','ขอทางจากที่พักไปทางเข้าบ้านยางโดยไม่ขึ้นดอยอ่างขาง','เดินเล่นในชุมชนและเผื่อเวลาหามื้อกลางวัน'],landmark:'ชุมชนบ้านยาง ต.แม่งอน / พิพิธภัณฑ์โรงงานหลวงที่ 1'},
    'day2-lunch': {title:'มื้อยูนนานในหมู่บ้าน',theme:'food',sourceUrl:refs.yunnan,photoPlaceIds:['banyang'],
      description:'มีรีวิวสุกี้ยูนนานร้านเล่าจางในบ้านยางปี 2021 ใช้เป็นรายชื่อให้โทรสอบถาม ไม่ใช่การยืนยันว่าร้านยังเปิดหรือราคาเดิม',
      candidate:'เล่าจาง (ข้อมูลรีวิวเก่า)',steps:['ขอที่พักหรือคนในชุมชนช่วยตรวจว่าร้านยังให้บริการ','ตกลงเมนูสำหรับสองคนและราคาก่อนสั่ง','หากร้านไม่เปิด เลือกร้านยูนนานที่คนในชุมชนยืนยันในวันนั้น'],landmark:'ร้านในบ้านยาง; หมุดและเบอร์รอยืนยัน'},
    'day2-route2': {title:'แวะญี่ปุ่นเล็ก ๆ ในไชยปราการ',theme:'japan',from:'ร้านอาหารยูนนานในบ้านยาง',departure:'11:30',arrival:'13:00',durationMinutes:90,
      sourceUrl:refs.hinoki,photoPlaceIds:['hinoki','banyang'],
      description:'จัดช่องเวลา 90 นาทีไว้ก่อนจนกว่าจะได้ระยะจริง ให้กลับจากบ้านยางสู่ทางหลักก่อนลงไชยปราการ ไม่ใช้ทางลัดข้ามภูเขาผ่านดอยอ่างขางโดยไม่ได้ตรวจถนน',
      steps:['ตรวจเส้นทางจากบ้านยางกลับสู่ถนนหลัก','ยืนยันค่าเข้าและเวลาเปิดกับ Hinoki Land','ตั้งเป้าเที่ยว 13:00–14:30 ถ้าไปถึงช้าตัดคาเฟ่เพื่อรักษาเวลาขากลับ'],landmark:'ฮิโนกิแลนด์ ต.ศรีดงเย็น อ.ไชยปราการ',phone:'094-731-0731 / 089-837-3373'},
    'day2-route3': {title:'พักขา จิบอะไรอุ่น ๆ',theme:'cafe',to:'ฮิโนกิคอฟฟี่ (ในพื้นที่ / รอยืนยัน)',toId:'hinoki',departure:'14:30',arrival:'14:35',durationMinutes:5,transport:'เดิน',
      sourceUrl:refs.cafe,photoPlaceIds:['hinoki'],optional:true,
      description:'เลือกคาเฟ่ภายใน Hinoki Land เพื่อลดการขี่เพิ่ม เว็บไซต์สถานที่ระบุฮิโนกิคอฟฟี่ แต่ต้องตรวจบริการในวันที่ไป แวะได้ถึง 15:00 แล้วเดินทางกลับ',
      steps:['หากถึง Hinoki Land ช้ากว่าแผนให้ข้ามคาเฟ่','ตรวจราคาเครื่องดื่มก่อนสั่ง','ออกจากพื้นที่ไม่เกิน 15:00 เพื่อเหลือเวลาขากลับ']},
    'day2-route4': {title:'มื้ออุ่น ๆ ก่อนกลับบ้านพัก',theme:'food',from:'ฮิโนกิคอฟฟี่ / Hinoki Land',fromId:'hinoki',to:'ซุบซิบ หมูกระทะ (ตัวเลือก / รอยืนยัน)',toId:null,
      departure:'15:00',arrival:'16:00',durationMinutes:60,sourceUrl:refs.bbq,photoPlaceIds:['hinoki','homestay'],
      description:'พบรายชื่อซุบซิบ หมูกระทะ ต.แม่ข่า แต่ยังไม่ทราบเวลาเปิด 25 ธ.ค. และพิกัดที่ยืนยัน หากเปิดช้าหรือทางอ้อมให้เปลี่ยนเป็นอาหารที่พัก ไม่รอจนขี่กลับมืด',
      candidate:'ซุบซิบ หมูกระทะ',steps:['ก่อนออกจาก Hinoki Land ตรวจร้านและเวลาเปิด','หากร้านเปิดทันและอยู่บนทางกลับจึงแวะ','หากไม่ยืนยัน เปลี่ยนเป็นอาหารกลับไปกินที่พักและเก็บงบไว้'],landmark:'รายชื่อร้านระบุ ต.แม่ข่า อ.ฝาง; ตำแหน่งจริงรอยืนยัน'},
    'day2-route5': {title:'กลับทันแสงเย็น',theme:'stay',from:'ร้านมื้อเย็น / จุดแวะสุดท้าย',departure:'16:45',arrival:'17:30',durationMinutes:45,
      photoPlaceIds:['homestay','reservoir'],description:'17:30 เป็นเวลาเป้าหมายเพื่อกันการขี่ค่ำ ไม่ใช่เวลาพระอาทิตย์ตกที่คำนวณแล้ว ถ้าระยะจริงใช้เวลามากกว่านี้ต้องออกเร็วขึ้น',
      steps:['ใช้เวลาจริงจากหมุดที่พักกำหนดเวลาออก','ตัดคาเฟ่หรือซื้ออาหารกลับหากแผนเริ่มช้า','ถึงที่พัก ตรวจน้ำมันและเตรียมคืนรถวันถัดไป']},
    'day3-route1': {title:'อุ่นไอเช้าวันสุดท้าย',theme:'spring',departure:'08:00',arrival:'08:45',durationMinutes:45,
      sourceUrl:'https://www.thailandtourismdirectory.go.th/attraction/5157',photoPlaceIds:['hotspring','homestay'],
      description:'พักค้าง 2 คืนแล้วเช็กเอาต์ก่อนออก หรือยืนยันฝากของกับที่พัก การเดินทางเริ่มที่โฮมสเตย์ซึ่งยังไม่มีหมุด จึงไม่ใช้ระยะจากตัวเมืองแทน',
      steps:['อาหารเช้า 07:15 เช็กเอาต์หรือฝากของตามที่ตกลง','ตรวจทางเข้าพื้นที่อุทยานและเวลาบริการ','ชมบริเวณน้ำพุร้อนในเขตที่อนุญาตและเผื่อเวลาออก 10:00'],landmark:'น้ำพุร้อนฝาง ในอุทยานแห่งชาติดอยผ้าห่มปก'},
    'day3-route2': {title:'ข้าวซอยส่งท้ายทริป',theme:'food',to:'ร้านข้าวซอยใกล้จุดคืนรถ (รอยืนยัน)',departure:'10:00',arrival:'10:30',durationMinutes:30,
      photoPlaceIds:['hotspring'],description:'ยังไม่มีร้านข้าวซอยที่ตรวจหมุด วันเปิด และเส้นทางกลับได้ครบ จึงเลือกตามจุดคืนรถจริง ไม่ใส่ร้านอาลีที่อาจต้องย้อนลงแม่สูน',
      steps:['ขอร้านใกล้จุดคืนรถจากผู้ให้เช่า','หากเวลาไม่พอ เลือกอาหารใกล้ท่ารถแทน','ตรวจสัมภาระและหลักฐานเช่ารถให้ครบ']},
    'day3-route3': {title:'คืนรถอย่างสบายใจ',theme:'rental',departure:'11:30',arrival:'11:45',durationMinutes:15,
      photoPlaceIds:['homestay'],description:'การคืนรถเป็นจุดสุดท้ายที่ใช้มอเตอร์ไซค์ หลังจากนี้ห้ามรวมระยะรถรับจ้างหรือรถตู้ในค่าน้ำมัน',
      steps:['เติมน้ำมันตามสัญญาและให้ร้านตรวจรถ','รับเงินมัดจำและเอกสารคืน','ตกลงวิธีไปจุดขึ้นรถกลับก่อนออกจากร้าน']},
    'day3-transfer': {title:'จากร้านคืนรถ ไปจุดขึ้นรถ',theme:'urban',photoPlaceIds:['reservoir'],
      description:'ต้องเผื่อค่าเดินหรือรถรับจ้างช่วงนี้แยกไว้ ยังไม่ได้ยืนยันราคาและระยะ เพราะไม่ทราบตำแหน่งร้านเช่ารถ',
      steps:['เช็กว่าบริษัทให้ขึ้นรถที่สถานีใด','หากใช้รถรับจ้างตกลงราคารวมสัมภาระก่อนขึ้น','ถึงจุดขึ้นก่อนรถออกอย่างน้อย 30 นาที']},
    'day3-route4': {title:'พาความทรงจำกลับเชียงใหม่',theme:'bus',from:'จุดขึ้นรถฝาง',departure:'13:00 (รอยืนยัน)',arrival:'16:30 (แผน)',
      sourceUrl:refs.busBack,sourceUrls:[refs.busBack,refs.busContact],operator:'บริษัท ยานยนต์นครเชียงใหม่ จำกัด',phone:'053-215604',
      boardingPoint:'จุดรถตู้ต้องยืนยัน; เว็บบริษัทระบุสถานีข้างโรงพยาบาลฝางสำหรับรถบัส',dropoffPoint:'เชียงใหม่ตามจุดปลายทางที่ระบุบนตั๋ว',
      roads:[{name:'ทล. 107',sourceUrl:refs.highway,scope:'แนวทางหลักฝาง–เชียงใหม่ ไม่ใช่ Geometry ของรอบรถ'}],
      photoPlaceIds:['reservoir','banyang'],description:'ใช้ 13:00 เป็นเป้าหมายจองรอบกลับ โทรยืนยันก่อนคืนรถ ไม่สรุปว่ารอบในเว็บเก่าให้บริการวันที่ 26 ธ.ค. แน่นอน',
      steps:['ยืนยันเที่ยวกลับและจุดขึ้นก่อนวันเดินทาง','12:30 พร้อมขึ้นรถและตรวจจำนวนสัมภาระ','เผื่อเดินทาง 3–4 ชั่วโมงตามสภาพจราจร']} 
  };
  d.routes.forEach(r => {
    const patch = details[r.id] || {};
    Object.assign(r,patch);
    r.plannedDurationMinutes = r.durationMinutes;
    r.durationMinutes = null;
    r.priceTHB = null;
    r.distanceKm = null;
    r.costTHB = null;
    r.geometry = null;
    r.mapStatus = 'illustrative';
    r.verificationStatus = 'pending';
    r.verifiedAt = r.sourceUrl ? date : null;
    r.sourceUrls = r.sourceUrls || (r.sourceUrl ? [r.sourceUrl] : []);
    r.roads = r.roads || [];
    r.title = r.title || r.to;
    r.theme = r.theme || 'forest';
    r.steps = r.steps || ['ยืนยันหมุดต้นทางและปลายทาง','ตรวจเวลาและระยะจริงก่อนออกเดินทาง','เผื่อเวลาพักและกลับก่อนค่ำ'];
    r.preparation = r.preparation || 'หมวกนิรภัยครบสองคน ใบขับขี่ เสื้อคลุม เงินสด และน้ำดื่ม';
    r.landmark = r.landmark || 'จุดสังเกตของทางเข้ายังรอยืนยัน';
    r.instructions = [
      ['เริ่มตรงไหน',r.from],['ไปทางไหน',r.steps[0]],
      ['ขึ้น / รับรถ',r.boardingPoint || (/มอเตอร์ไซค์/.test(r.transport) ? 'ใช้รถเช่าที่จองไว้ / ร้านยังรอยืนยัน' : /เดิน/.test(r.transport) ? 'ตรวจทางเดินหรือเรียกรถรับจ้างตามจริง' : 'รอยืนยัน')],
      ['ลง / จอดที่ไหน',r.dropoffPoint || r.to+' · จุดจอดรอยืนยัน'],
      ['ถนนที่ใช้',r.roads.length ? r.roads.map(x => x.name+' ('+x.scope+')').join(' / ') : 'ยังไม่มีถนนที่ยืนยันสำหรับช่วงนี้'],
      ['จุดสังเกต',r.landmark],['เตรียมอะไร',r.preparation]
    ];
  });
  d.days.forEach(day => d.routes.filter(r => r.day === day.id).forEach((r,i) => r.number = i+1));
  d.day2Assessment = {
    status:'pending',targetReturn:'17:30',
    message:'ยังยืนยันไม่ได้ว่าระยะวันที่ 25 เหมาะกับการขี่ซ้อนสอง เพราะหมุดที่พัก ร้านเช่า และระยะถนนยังไม่ครบ แผนใหม่เผื่อเวลาเพิ่ม ใช้คาเฟ่ใน Hinoki Land และตั้งเป้ากลับที่พัก 17:30',
    alternative:'หากถึง Hinoki Land หลัง 13:30 ให้ตัดคาเฟ่; หากร้านมื้อเย็นยังไม่เปิดหรือทำให้กลับค่ำ ให้ซื้ออาหารกลับที่พัก โดยคงบ้านยางและ Hinoki Land ไว้'
  };
  // ไม่บีบตัวเลขให้ต่ำกว่างบ: ราคาจัดสรรใหม่สะท้อนความเสี่ยงที่พบ
  d.defaultExpenses.forEach(e => {
    e.verificationStatus = 'estimated'; e.priceTHB = null; e.sourceUrl = null;
    e.notes = 'งบจัดสรร ไม่ใช่ราคาที่ยืนยันหรือชำระแล้ว';
    if (e.id === 'bus-out' || e.id === 'bus-back') {e.amount=500;e.sourceUrl='https://vanthailand2015.blogspot.com/2015/09/4.html';e.notes='งบตั้งเผื่อ 250 บาท/คน จากแหล่งรองที่ระบุเม.ย. 2569 ขัดกับราคา 150 บาทในข้อมูลเก่าปี 2021 บริษัทไม่ได้ยืนยันราคาทริป ต้องโทรถาม';}
    if (e.category === 'stay') {e.amount=700;e.sourceUrl=refs.stay;e.notes='อิงรีวิวปี 2025 ที่ 350 บาท/คน/คืน ยังไม่ยืนยันช่วงคริสต์มาส';}
  });
  d.sources = [
    {title:'ผู้ให้บริการรถโดยสาร · ตารางและจุดขึ้น (มีข้อมูลเก่า)',url:refs.bus},
    {title:'ยานยนต์นครเชียงใหม่ · ติดต่อ 053-215604',url:refs.busContact},
    {title:'สส โฮมสเตย์ · รีวิว Travel 101 ปี 2025',url:refs.stay},
    {title:'บ้านยาง · อบต.แม่งอน',url:refs.village},
    ...d.sources
  ];
})();
