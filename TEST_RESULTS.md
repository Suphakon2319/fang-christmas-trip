# ผลทดสอบ V4 · 16 ตุลาคม 2026

รันทดสอบใหม่บน Microsoft Edge แบบ headless เปิดทั้ง file:// และ HTTP ชั่วคราวที่พาธ /fang-christmas-trip/ ไม่มีการใช้ผล V3 แทนการรันใหม่

ผ่านจริง **98 รายการในเบราว์เซอร์ + 15 รายการข้อมูล + 5 รายการ HTTP รวม 118 รายการ** ตรวจ node --check สำหรับ JavaScript และไฟล์ข้อมูลแผนที่ทั้งหมดเพิ่มเติม

## วิธีตรวจและหลักฐาน

- tests/browser_check.py ใช้โปรไฟล์ Edge แยก บล็อก HTTP/HTTPS ระหว่างทดสอบออฟไลน์ ไม่แตะ LocalStorage ผู้ใช้ ตรวจทั้ง 17 ช่วง 22 สไลด์ งบ V1/V2/V4 ราคา 4 ประเภท ค่าน้ำมัน การแก้ข้อมูลกลาง ปุ่มโทร/นำทาง แกลเลอรี ธีม เช็กลิสต์ สมุดติดต่อ เต็มจอ การปัดและคีย์บอร์ด
- tests/verify-travel-data.mjs ตรวจว่าข้อมูล JSON กับ bundle ตรงกัน พิกัดต้น–ปลาย Routing URL ตรงกับสถานที่ ช่วงเดินทางต่อกัน เวลาเผื่อและเวลาออก–ถึงสอดคล้องกัน สิทธิ์ภาพ และยอดงบแยกสำรอง
- tests/http_smoke.py เปิดเซิร์ฟเวอร์ชั่วคราวเฉพาะ 127.0.0.1 และปิดหลังตรวจพาธย่อยแบบ GitHub Pages ไฟล์ CSS/ฟอนต์/JS/รูปโหลดได้และไม่เรียก routing/tile ภายนอก
- ผลดิบที่เก็บใน Git: tests/results-v4.json ผลภาพและ PDF อยู่เฉพาะในเครื่องที่ .qa/presentation-v4-1920.png, .qa/presentation-v4-mobile.png, .qa/itinerary-v4.pdf
- จำลองหน้าจอ 360, 390, 768, 1024, 1540, 1920 พิกเซล ไม่พบแนวนอนล้นหน้า แผนที่และข้อความอยู่ในกรอบ และตรวจครบทุกสไลด์เส้นทางบนเดสก์ท็อป
- พิมพ์ทั้ง 3 วันเป็น PDF จริง ตรวจมี SVG 17 ช่วงและงบครบ แล้วกลับไปยังวันที่เลือกก่อนพิมพ์

## ผลที่มีความสำคัญกับข้อมูล

- Timeline และ Presentation อ้างวัตถุเส้นทางชุดเดียวกัน ทดสอบแก้ระยะในฐานข้อมูลขณะทำงานแล้วทั้งสองมุมมองเปลี่ยนทันที งบรถบัสที่แก้ก็เปลี่ยนทั้งสองมุมมอง
- V1/V2 ที่จำลองมีรายการเพิ่มเองและสมมติฐานน้ำมันเดิม ตรวจ byte-identical ของคีย์ต้นฉบับ ไม่เขียน V4 ตอนเพิ่งโหลด บันทึก V4 เมื่อแก้เท่านั้น รวมเคสข้อมูลเสียและยกเลิกรีเซ็ต
- ค่าระยะผู้ใช้เดิมย้ายเฉพาะต้น–ปลายที่ไม่เปลี่ยน ไม่ใช้ระยะร้านเช่าเก่ากับ JR โดยอัตโนมัติ คีย์เดิมยังอยู่
- ระยะมอเตอร์ไซค์ 98.1 กม. มีข้อมูล 7/11 ช่วง ขาด 4 ช่วง ไม่นำรถบัส เดินและรถรับจ้างมาคิดน้ำมัน ส่วนที่ทราบรวมเผื่ออ้อม 128.93 บาท โดยคงเงินจัดสรร 160 บาทรายการเดียว
- งบเริ่มต้น 6,110 = ค่าใช้จ่าย 5,410 + สำรอง 700 เกินกรอบ 110 ประเภทราคาที่ยืนยันสำหรับทริปเริ่มต้น 0 ราคาเก่า 2,400 ประมาณการ 2,410 และเงินจัดสรรรายการที่ยังไม่มีราคา 600 บาท รายการราคาไม่ทราบเพิ่มเติมยังไม่รวมเป็น 0
- แผนที่ถนน 10 ช่วง อีก 7 ช่วงไม่สร้างเส้นถึงหมุดที่ไม่ทราบ ไม่มี iframe แผนที่ รูปถ่ายที่แสดงมี CC0 และภาพประกอบต้นฉบับ ไม่ใช้รูปคนละร้าน

## ยังไม่ได้ทดสอบหรือรับรอง

- ไม่ได้ทดสอบบน iPhone/iPad จริงหรือ Safari การจำลองขนาดจอไม่ได้แทนการทดสอบอุปกรณ์จริง
- ไม่ได้โทรตรวจเบอร์ JR/โกดัง จองบริการ รับใบเสนอราคา หรือรับรองเปิดบริการ 24–26 ธ.ค. 2026
- ไม่ได้ขี่เส้นทางจริง ตรวจถนนปิด พื้นผิว ความชัน ความปลอดภัยซ้อนสอง หรือการอนุญาตมอเตอร์ไซค์ตามแนว OSRM driving
- ตรวจ URL นำทางและพิกัด แต่ไม่ได้เปิดแอป Google Maps บนอุปกรณ์จริงเพื่อขี่ตามทาง
- HTTP พาธย่อยเป็นการจำลองในเครื่อง ไม่ได้ยืนยันบัญชี GitHub หรือผล workflow เผยแพร่ด้วยชุดทดสอบนี้
- ไม่ได้รับรองการจัดหน้าของเครื่องพิมพ์ทุกชนิด หรือการซิงก์ LocalStorage ข้ามอุปกรณ์

รายละเอียดที่ต้องโทรยืนยัน: [pending_confirmation.md](travel_research/pending_confirmation.md) · หลักฐานข้อมูล: [verification_report.md](travel_research/verification_report.md)

## รายการที่รันผ่านจริง


browser

- PASS Direct file open completely offline
- PASS Seventeen routes, all three days complete
- PASS Thai interface and local Thai fonts regression
- PASS Checklist and contact editing persist after reload
- PASS No embedded maps, community tiles, or routing requests
- PASS Overview shows three static route lanes
- PASS Timeline uses shared infographic for every shown route
- PASS Every route uses an offline georeferenced road basemap
- PASS Ten sourced road paths replace decorative curves
- PASS All A/B labels agree with route source data
- PASS Unknown shop locations never receive a fabricated route line
- PASS All ten road maps retain sources and matching Web Mercator extents
- PASS Status badges have been removed from route maps
- PASS Pending labels are absent from route titles and departure times
- PASS Displayed photographs have established reuse rights
- PASS All 17 logical route endpoints form a continuous chain
- PASS JR is the pickup and return choice without fabricated coordinates
- PASS Restaurant route starts at Laojang, not the museum
- PASS Bus time remains separate from the car routing model
- PASS Unknown current prices remain null and not zero
- PASS Contact section includes callable JR and restaurant contacts
- PASS Claiming verified without geometry cannot change map status
- PASS Every road label has a source
- PASS Every route has seven travel instruction fields and contextual photos
- PASS No fabricated distances, prices or actual durations
- PASS Day two includes Yunnan restaurant as a separate route
- PASS Keyboard day navigation and explicit return-to-station leg
- PASS Detail modal uses same route component and full travel facts
- PASS Detail editor is available without overwriting route facts
- PASS External navigation links encode endpoints
- PASS Escape closes route detail
- PASS View A/B map opens static infographic
- PASS New default allocation is honest about exceeding budget
- PASS Reserve, operating expenses, unallocated funds are distinct
- PASS Daily allocation and per-person totals are visible
- PASS New route-linked fuel shows unknown distance instead of fake total
- PASS Unknown fuel is a single labelled allowance
- PASS Manual fuel plus 15 percent detour, without duplicate charge
- PASS Editing a route updates fuel aggregate and preserves unknown-leg allowance
- PASS Manual route distance is explicitly an estimate
- PASS All route distances recompute motorcycle litres and detour
- PASS Bus kilometres never enter motorcycle fuel
- PASS Route overrides and V4 budget persist after file reload
- PASS V1 migration preserves custom expense, total, budget and manual distance
- PASS V1 original is byte-identical and no V4 write occurs on load
- PASS Legacy notes, checklist, theme survive
- PASS Editing migrated data saves V4 without changing V1
- PASS Confirmed and estimated prices can be separated by user
- PASS Add expense regression
- PASS Delete expense regression
- PASS Reset cancellation preserves user budget
- PASS Explicit reset affects V4 only
- PASS Corrupt V4 data is never silently overwritten
- PASS V2 migration preserves custom item, total and fuel without writing either key
- PASS V2 edit saves V4 and leaves original V2 byte-identical
- PASS Old route distances migrate only for unchanged endpoints
- PASS Dark mode regression
- PASS Destination gallery details regression
- PASS Gallery uses licensed photos and honest placeholders
- PASS Four price categories are selectable in the budget
- PASS Presentation starts with 22 slides
- PASS Fullscreen enters
- PASS Fullscreen exits
- PASS Next button regression
- PASS Keyboard next reaches route one
- PASS Research routes and displayed routes are the same live objects
- PASS A central route edit immediately updates Timeline and Presentation
- PASS Bus allocation uses the same edited budget in both views
- PASS Previous button regression
- PASS Exactly one shared route component per route slide
- PASS Presentation route labels and endpoint data agree
- PASS Next clamps at final slide
- PASS Previous clamps at first slide
- PASS Escape returns from presentation and restores scroll
- PASS Planner no horizontal overflow 360
- PASS Presentation map and text fit width 360
- PASS Mobile swipe also works over static infographic
- PASS Planner no horizontal overflow 390
- PASS Presentation map and text fit width 390
- PASS Planner no horizontal overflow 768
- PASS Presentation map and text fit width 768
- PASS Planner no horizontal overflow 1024
- PASS Presentation map and text fit width 1024
- PASS Planner no horizontal overflow 1440
- PASS Presentation map and text fit width 1440
- PASS Desktop route fits single slide 1440
- PASS Every desktop route fits its slide 1440
- PASS Planner no horizontal overflow 1920
- PASS Presentation map and text fit width 1920
- PASS Desktop route fits single slide 1920
- PASS Every desktop route fits its slide 1920
- PASS CSS chart fallback regression
- PASS Print contains all 17 route infographics and full budget
- PASS SVG accessibility IDs remain unique during print
- PASS Actual browser PDF generated with all routes
- PASS After printing planner controls are restored
- PASS Print button invokes browser print regression
- PASS No application runtime exceptions

data

- PASS All canonical routes connect across the three days
- PASS Coordinates are sourced and unknown pins remain null
- PASS Geometry request endpoints match their actual canonical places
- PASS Planned travel duration agrees with departure and arrival slots
- PASS Bus model times never replace planned bus times
- PASS Unknown prices are not converted into free services
- PASS Three days of meals have explicit allocation references
- PASS Every renderable photo has an established reuse license and a local file
- PASS Photo rights inventory covers every existing image file
- PASS Timeline and presentation share canonical route objects
- PASS Map navigation uses source pins, not snapped proxies
- PASS Fuel excludes buses, transfers and walking
- PASS Default allocation remains 6110 with emergency reserve separate
- PASS Historical, unknown and estimated allocations reconcile without confirmed trip quotes
- PASS Every local file reference in index exists

httpSubpath

- PASS HTTP subpath opens the V4 application
- PASS HTTP relative scripts, fonts and styles load
- PASS HTTP central bundle is served successfully
- PASS HTTP licensed image resolves correctly
- PASS HTTP application does not request external routing or map tiles
