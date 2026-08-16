# Terracotta Coffee Roastery Bandung (terracotta.id)

A modern, responsive multi-page website for **Terracotta Coffee Roastery & Cafe** located in Braga, Bandung. Crafted with precision aesthetic typography, responsive layouts, interactive menus, table reservation engine, and artisanal coffee journal.

## ✨ Fitur Utama
- **Fully Responsive & Mobile-Friendly**: Tampilan optimal di semua perangkat (Desktop, Tablet, Phablet, hingga Smartphone). Dilengkapi mobile drawer navigation.
- **Multi-Page Architecture**:
  - `index.html` — Beranda dengan hero section, brand highlights, menu showcase, dan online booking.
  - `about.html` — Profil artisan roasters, filosofi kopi, dan guestbook ulasan pelanggan.
  - `menu.html` — Menu board interaktif (Espresso Bar, Manual Brew, Bakery & Pastry) dengan live filter kategori.
  - `reservation.html` — Sistem pemesanan meja dan generate e-ticket reservasi instan.
  - `blog.html` — Jurnal edukasi kopi & cerita roastery.
  - `contact.html` — Kontak, jam operasional, peta lokasi Braga Bandung, dan formulir pesan.
  - `admin.html` — Portal admin manajemen reservasi meja dengan Staff Authentication Gate (pembatas akses tamu & staf), KPI stats, validasi status (Terima/Tolak/Selesai), filter, live search, WhatsApp direct contact, dan export CSV.
- **Staff Access Barrier & Authentication**:
  - Tombol Ikon Khusus Staf (`🛡️ Portal Staf`) di navbar & menu drawer seluruh halaman.
  - Auth Guard di `admin.html`: Tamu tanpa login tidak dapat melihat data reservasi.
  - Akun Demo Staf: Username: `admin` | Password: `terracotta` (atau PIN: `1234`).
  - Fitur Logout yang aman dengan penghapusan sesi.
- **Interactive UI & Micro-animations**: Dynamic search bar, interactive shopping bag drawer, smooth scroll reveal, and toast notifications.

## 🚀 Teknologi yang Digunakan
- **HTML5** (Semantic structure & SEO optimized)
- **CSS3** (Custom design tokens, Flexbox, CSS Grid, Glassmorphism, Responsive Media Queries)
- **JavaScript (ES6+)** (Interactive controllers, filter engine, local storage sync, modal tickets)

## 📁 Struktur Folder
```text
project-3/
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── main.js
│   └── admin.js
├── images/
│   └── logo.svg
├── index.html
├── about.html
├── menu.html
├── reservation.html
├── blog.html
├── contact.html
├── admin.html
└── README.md
```

## 🛠️ Cara Menjalankan
Buka file `index.html` langsung di browser atau gunakan ekstensi seperti **Live Server** di IDE pilihan Anda.
