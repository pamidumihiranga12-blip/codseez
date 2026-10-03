# 📦 SmartZone Courier OMS (100% Pure HTML/CSS/JS)

> **Codseez OMS වැනි සම්පූර්ණ E-Commerce Order Management System එකක් කිසිදු PHP හෝ Server එකක් අවශ්‍ය නොවී (No Server / No PHP), ඕනෑම Browser එකකින් කෙලින්ම විවෘත කළ හැකි Pure HTML5 / JavaScript තාක්ෂණයෙන් සකසන ලද පද්ධතිය.**

---

## 🌟 ප්‍රධාන විශේෂාංග 5 (5 Core Features)

1. **🚚 Courier Service Integration (Fardar Express & Trans Express):**
   - **Fardar Express** (Client ID: `5980`, API Key: `2c25c0244f8d688eb9ff`)
   - **Trans Express** (Client ID: `4792`, API Key: `olvsGUXYUzvDkKg19fx18VR5voxFurxikakIs0cZsKvyan4gbaRf7lg8WZbyA5RIjZUZFRgq2HnVx931`)
   - 1-Click Waybill generation (`IND111xxxx` හෝ `BE454xxxx`).
   - Live Parcel Tracking timeline.

2. **🛡️ Detect Fake Customers (Fraud Risk Scanner):**
   - ලංකාවේ Dialog, Mobitel, Airtel, Hutch අංක වලංගුභාවය (07X validation).
   - Repeating / Fake dummy අංක හඳුනා ගැනීම.
   - Address completeness check.
   - Local Blacklist පරීක්ෂාව හා Quick Add to Blacklist.
   - 0-100% Trust Gauge Meter (Safe / Caution / High Risk Fake).

3. **🖨️ Easy Label Printing (Thermal 4x6" & A4):**
   - **Xprinter, Phomemo, Zebra, HPRT** ආදී සියලුම Thermal Label Printers සඳහා නිශ්චිත **100mm x 150mm (4x6")** sticker layout.
   - **JsBarcode Code 128** සජීවී Barcode generation.
   - **QRCode.js** සජීවී Tracking QR Code.
   - Cash on Delivery (COD) කැපී පෙනෙන badge එක සහ මුදල් එකතු කිරීමේ උපදෙස්.
   - Merchant විස්තර: **Pamidu Mihiranga / SmartZone LK, Padaviya, 0786800086**.

4. **📊 Reports & Analytics:**
   - සජීවී Delivery Success Rate %, Return (RTO) Rate %, In-Transit සහ Total Orders ගණනය.
   - Total COD මුදල සහ එකතු වූ (Collected) මුදල් වාර්තා.

5. **💰 Manage Expenses & True Net Profit Calculator:**
   - Selling Price, Product Cost, Courier Fee, Packaging, Marketing (Ad spend).
   - Return (RTO) වූ විට සිදුවන 1.5x Courier ගාස්තු පාඩුව සහිතව සැබෑ Net Profit එක ගණනය කිරීම.

---

## 📁 ගොනු සැකැස්ම (Pure HTML Files)

```
smartzone-oms/
├── index.html            # සම්පූර්ණ OMS Master Dashboard එක (Zero PHP - Double-click to open!)
├── label-print.html      # Standalone 4x6" Thermal Shipping Sticker Printer
│
├── css/
│   └── oms.css           # Modern Dark UI Theme & Thermal Print CSS (@media print)
│
├── js/
│   └── oms.js            # Courier logic, Fake Detector, LocalStorage DB, Calculator
│
└── assets/
    ├── fed-logo.webp     # Official Fardar Express Domestic Logo
    ├── transex-logo.webp # Official Trans Express Logo
    └── cod-badge.webp    # Official COD Badge
```

---

## 🚀 පාවිච්චි කරන ආකාරය (How to Use)

1. කිසිදු XAMPP හෝ PHP Server එකක් අවශ්‍ය නැත.
2. [`index.html`](file:///c:/Users/Smart%20zone/Desktop/smartzone%20e%20commerce-website%20LAST/smartzone-oms/index.html) ගොනුව මත **Double-Click** කර Chrome හෝ Edge browser එකෙන් open කරන්න.
3. Order එකක් ඇතුළත් කර **"Dispatch Order"** ක්ලික් කළ විට 4x6" Thermal Sticker එක ක්ෂණිකව Screen එක මත දිස්වන අතර **"Print"** ක්ලික් කර ඕනෑම Thermal Printer එකකින් print කරගත හැක!
