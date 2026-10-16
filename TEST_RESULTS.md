# ผลทดสอบ V5 · 16 ตุลาคม 2026

รันทดสอบจริงบน Windows / Edge headless รวม 177 checks ผ่านทั้งหมด

| ชุดทดสอบ | จำนวน | ผล |
|---|---:|---|
| python tests/browser_check.py | 98 | ผ่าน |
| python tests/browser_v5_features.py | 49 | ผ่าน |
| node tests/verify-travel-data.mjs | 23 | ผ่าน |
| python tests/http_smoke.py | 7 | ผ่าน |

เปิด file:// ออฟไลน์, HTTP subpath, หน้าจอ 360/390/768/1024/1440/1920, ครบ 17 Route บน desktop/mobile emulation, ภาพจริง decode สำเร็จ, gallery/thumbnails/lightbox/keyboard, ราคาตรงทุกมุมมอง, fuel ไม่คิดซ้ำ, LocalStorage V1/V2/V4 ไม่สูญ, dark mode, fullscreen, swipe และสร้าง PDF จริง ไม่มี runtime exception

รายละเอียด/ข้อจำกัด: [รายงาน V5](travel_research/WEBSITE_UPDATE_REPORT_V5.md) · [ผลดิบ](tests/results-v5.json)

ไม่อ้างว่าทดสอบ iPhone/iPad จริงหรือ Safari ไม่ยืนยันบริการ/ราคา/ถนนในวันเดินทาง
