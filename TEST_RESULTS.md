# ผลทดสอบ V3

รันทดสอบใหม่หลังแก้ไข 15 ตุลาคม 2026 ด้วย Microsoft Edge แบบ headless เปิด `index.html` ผ่าน `file://` โดยตรง ใช้โปรไฟล์ทดสอบแยก ไม่แตะข้อมูลเบราว์เซอร์ผู้ใช้ และบล็อก HTTP/HTTPS ทั้งหมดระหว่างทดสอบ

ผ่าน **85/85 รายการ** ด้านล่าง รวมการย้ายงบ V1 โดยไม่เปลี่ยนข้อมูลเดิม การคำนวณน้ำมันเฉพาะมอเตอร์ไซค์ หน้าจอ 360/390/768/1024/1440/1920 พิกเซล การปัด/คีย์บอร์ด/เต็มจอ และการสร้าง PDF จริง

ตรวจ `node --check` ครบ JavaScript ของแอป 7 ไฟล์และข้อมูลแผนที่ 2 ไฟล์ ตรวจ ID ไม่ซ้ำ ลิงก์ภายในและไฟล์อ้างอิงใน HTML มีอยู่จริง ตรวจภาพหน้าจอมือถือและสไลด์จอใหญ่เพิ่มเติม

แผนที่ภาพวาดตกแต่งถูกแทนด้วยภาพถนนจริงที่เก็บในเครื่อง มีแนวเส้นตามถนน 8 ช่วง ส่วนอีก 9 ช่วงแสดงพื้นที่จริงโดยไม่สร้างเส้นถึงร้านที่ยังไม่ทราบหมุด ทดสอบว่าภาพอ่างไม่ถูกใช้แทนทุกปลายทางและป้ายสถานะถูกนำออก ส่วนสถานะงบเดิมยังคงในข้อมูลเพื่อรักษาการย้ายข้อมูล แต่ตัวเลือกยืนยันราคาไม่แสดงบนหน้าเว็บแล้ว จำนวนเส้นทางยังเป็น 17 และสไลด์ 22

ผลดิบ `.qa/results-v3.json` และสคริปต์ `.qa/browser_check_v3.py` ภาพหลักฐานอยู่ใน `.qa` พร้อม `itinerary-v3.pdf` ผู้เปิดเว็บไม่ต้องรันเครื่องมือเหล่านี้

ข้อจำกัด: จำลองขนาดหน้าจอบน Edge ไม่ได้ทดสอบบนโทรศัพท์จริงหรือทุกเบราว์เซอร์ การตรวจ PDF ยืนยันว่าระบบพิมพ์สร้างไฟล์ได้ ไม่ยืนยันการจัดหน้าของเครื่องพิมพ์ทุกชนิด การทดสอบเว็บไม่ยืนยันรอบรถ ราคาปัจจุบัน การจองหรือสภาพถนน ดูข้อมูลที่ยังขาดใน TRAVEL_DATA_VERIFICATION.md

## รายการที่รันทดสอบ

- ผ่าน — Direct file open completely offline
- ผ่าน — Seventeen routes, all three days complete
- ผ่าน — Thai interface and local Thai fonts regression
- ผ่าน — Checklist and contact editing persist after reload
- ผ่าน — No embedded maps, community tiles, or routing requests
- ผ่าน — Overview shows three static route lanes
- ผ่าน — Timeline uses shared infographic for every shown route
- ผ่าน — Every route uses an offline georeferenced road basemap
- ผ่าน — Eight sourced road paths replace decorative curves
- ผ่าน — All A/B labels agree with route source data
- ผ่าน — Unknown shop locations never receive a fabricated route line
- ผ่าน — All eight road maps retain sources and matching Web Mercator extents
- ผ่าน — Status badges have been removed from route maps
- ผ่าน — Pending labels are absent from route titles and departure times
- ผ่าน — Photographs follow each route and reservoir is used only at the reservoir
- ผ่าน — Claiming verified without geometry cannot change map status
- ผ่าน — Every road label has a source
- ผ่าน — Every route has seven travel instruction fields and contextual photos
- ผ่าน — No fabricated distances, prices or actual durations
- ผ่าน — Day two includes Yunnan restaurant as a separate route
- ผ่าน — Keyboard day navigation and explicit return-to-station leg
- ผ่าน — Detail modal uses same route component and full travel facts
- ผ่าน — Detail editor is available without overwriting route facts
- ผ่าน — External navigation links encode endpoints
- ผ่าน — Escape closes route detail
- ผ่าน — View A/B map opens static infographic
- ผ่าน — New default allocation is honest about exceeding budget
- ผ่าน — Reserve, operating expenses, unallocated funds are distinct
- ผ่าน — Daily allocation and per-person totals are visible
- ผ่าน — New route-linked fuel shows unknown distance instead of fake total
- ผ่าน — Unknown fuel is a single labelled allowance
- ผ่าน — Manual fuel plus 15 percent detour, without duplicate charge
- ผ่าน — Editing a route updates fuel aggregate and preserves unknown-leg allowance
- ผ่าน — Manual route distance is explicitly an estimate
- ผ่าน — All route distances recompute motorcycle litres and detour
- ผ่าน — Bus kilometres never enter motorcycle fuel
- ผ่าน — Route overrides and V2 budget persist after file reload
- ผ่าน — V1 migration preserves custom expense, total, budget and manual distance
- ผ่าน — V1 original is byte-identical and no V2 write occurs on load
- ผ่าน — Legacy notes, checklist, theme survive
- ผ่าน — Editing migrated data saves V2 without changing V1
- ผ่าน — Confirmed and estimated prices can be separated by user
- ผ่าน — Add expense regression
- ผ่าน — Delete expense regression
- ผ่าน — Reset cancellation preserves user budget
- ผ่าน — Explicit reset affects V2 only
- ผ่าน — Corrupt V2 data is never silently overwritten
- ผ่าน — Dark mode regression
- ผ่าน — Destination gallery details regression
- ผ่าน — All five destination photos remain available
- ผ่าน — Presentation starts with 22 slides
- ผ่าน — Fullscreen enters
- ผ่าน — Fullscreen exits
- ผ่าน — Next button regression
- ผ่าน — Keyboard next reaches route one
- ผ่าน — Previous button regression
- ผ่าน — Exactly one shared route component per route slide
- ผ่าน — Presentation route labels and endpoint data agree
- ผ่าน — Next clamps at final slide
- ผ่าน — Previous clamps at first slide
- ผ่าน — Escape returns from presentation and restores scroll
- ผ่าน — Planner no horizontal overflow 360
- ผ่าน — Presentation map and text fit width 360
- ผ่าน — Mobile swipe also works over static infographic
- ผ่าน — Planner no horizontal overflow 390
- ผ่าน — Presentation map and text fit width 390
- ผ่าน — Planner no horizontal overflow 768
- ผ่าน — Presentation map and text fit width 768
- ผ่าน — Planner no horizontal overflow 1024
- ผ่าน — Presentation map and text fit width 1024
- ผ่าน — Planner no horizontal overflow 1440
- ผ่าน — Presentation map and text fit width 1440
- ผ่าน — Desktop route fits single slide 1440
- ผ่าน — Every desktop route fits its slide 1440
- ผ่าน — Planner no horizontal overflow 1920
- ผ่าน — Presentation map and text fit width 1920
- ผ่าน — Desktop route fits single slide 1920
- ผ่าน — Every desktop route fits its slide 1920
- ผ่าน — CSS chart fallback regression
- ผ่าน — Print contains all 17 route infographics and full budget
- ผ่าน — SVG accessibility IDs remain unique during print
- ผ่าน — Actual browser PDF generated with all routes
- ผ่าน — After printing planner controls are restored
- ผ่าน — Print button invokes browser print regression
- ผ่าน — No application runtime exceptions
