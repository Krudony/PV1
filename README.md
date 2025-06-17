# 💰 ระบบออมทรัพย์นักเรียน (Student Savings System)

ระบบเว็บแอปพลิเคชันสำหรับจัดการการออมทรัพย์ของนักเรียน พัฒนาด้วย Google Apps Script และใช้ Google Sheet เป็นฐานข้อมูล

## ✨ คุณสมบัติหลัก

-   **Responsive Design**: แสดงผลสวยงามทั้งบนเดสก์ท็อปและมือถือ
-   **แดชบอร์ด**: ภาพรวมข้อมูลสรุป
-   **ระบบลงทะเบียนนักเรียน**:
    -   เพิ่มข้อมูลนักเรียนใหม่
    -   ตรวจสอบเลขที่ซ้ำในชั้นเรียนเดียวกันแบบ Real-time
    -   แสดงรายการนักเรียนทั้งหมดในรูปแบบตาราง
    -   ค้นหาและกรองข้อมูลนักเรียน
    -   มีระบบแบ่งหน้า (Pagination)
    -   แก้ไขและลบข้อมูลนักเรียน
    -   แจ้งเตือนการทำงานด้วย Modal ที่สวยงาม
-   **ระบบฝากเงิน**: บันทึกรายการฝากเงิน
-   **ระบบรายงาน**: สร้างรายงานการทำรายการและ Export เป็นไฟล์ Google Sheet (Excel) ได้

## 🛠️ เทคโนโลยีที่ใช้

-   **Backend**: Google Apps Script (JavaScript)
-   **Frontend**: HTML, CSS, JavaScript
-   **Database**: Google Sheets
-   **Framework/Library**: Bootstrap 5, Tailwind CSS (via CDN), Bootstrap Icons

## 🚀 การติดตั้งและใช้งาน

1.  **สร้าง Google Sheet**:
    -   สร้าง Google Sheet ใหม่
    -   คัดลอก **Sheet ID** จาก URL ของชีต
    -   **ไม่จำเป็นต้องสร้างชีตย่อยหรือหัวตารางเอง** สคริปต์จะจัดการสร้างให้โดยอัตโนมัติ

2.  **ตั้งค่า Google Apps Script**:
    -   เปิด Apps Script Editor จาก Google Sheet (`Extensions` > `Apps Script`)
    -   สร้างไฟล์ตามรายการ (`Code.gs`, `index.html`, `css.html`, `js.html`, `dashboard.html`, `register.html`, `deposit.html`, `report.html`)
    -   คัดลอกโค้ดที่ให้ไว้ไปวางในแต่ละไฟล์ให้ถูกต้อง
    -   **สำคัญ**: นำ **Sheet ID** ของคุณไปใส่ในตัวแปร `SHEET_ID` ที่ด้านบนสุดของไฟล์ `Code.gs`

3.  **Deploy Web App**:
    -   คลิก `Deploy` > `New deployment`.
    * **Description**: `Student Savings System v2.0`
    * **Execute as**: `Me`
    * **Who has access**: `Anyone with Google account` (หรือตามต้องการ)
    -   กด `Deploy` และทำการ Authorize access
    -   คัดลอก URL ของ Web App (`/exec`) เพื่อนำไปใช้งาน

