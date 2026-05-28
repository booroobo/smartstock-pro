# DOKUMENTASI TEKNIS PELANGGAN SMARTSTOCK PRO

## 1. Pendahuluan

Dokumen ini adalah panduan teknis pelanggan untuk menggunakan SmartStock Pro. Dokumen mencakup panduan modul, role pengguna, API, FAQ, troubleshooting, batasan MVP, dan pengembangan lanjutan.

SmartStock Pro adalah Website Sistem Manajemen Inventaris Multi Gudang berbasis React.js + Vite, Laravel REST API, PostgreSQL, dan Laravel Sanctum. Sistem digunakan oleh akun internal perusahaan dengan role `admin`, `warehouse_manager`, `staff`, dan `viewer`.

## 2. Gambaran Umum Sistem

SmartStock Pro membantu perusahaan mengelola inventaris multi gudang. Sistem menyediakan:

- Login/logout dengan Laravel Sanctum.
- Akun internal melalui seeder.
- Role access.
- CRUD produk, kategori, gudang, dan supplier.
- Transaksi stok masuk dan stok keluar.
- Stok otomatis berubah.
- Stok per gudang.
- Transfer stok antar gudang.
- Import CSV produk via queue.
- Background report generation CSV.
- Dashboard inventaris.
- Chart stok.
- Nilai inventaris.
- Critical stock alert.
- In-app notification stok kritis dari backend.
- Peta gudang interaktif Leaflet.
- Audit log.
- Error log severity.
- Health check API/database.
- Export CSV.
- Export PDF via browser print.

## 3. Role Pengguna

| Role | Hak Akses | Keterangan |
|---|---|---|
| Admin | Akses penuh, termasuk role access management, audit log, error log, import, report job, master data, dan transaksi. | Digunakan untuk administrator sistem. |
| Manajer Gudang | CRUD produk, kategori, gudang, supplier, transaksi, transfer, laporan, audit log, import, dan queue job. | Digunakan oleh pengelola operasional gudang. |
| Staf Gudang | Melihat data master untuk transaksi, membuat/mengelola transaksi stok, transfer stok, melihat dashboard/laporan/status. | Digunakan untuk operasional stok harian. |
| Viewer | Read-only dashboard, laporan, status sistem, transaksi, dan transfer. | Digunakan untuk monitoring tanpa perubahan data. |

## 4. Panduan Login dan Logout

Langkah login:

1. Buka aplikasi SmartStock Pro.
2. Masukkan email dan password.
3. Sistem memvalidasi kredensial melalui Laravel Sanctum.
4. Jika berhasil, sistem menyimpan token dan membaca role user.
5. User diarahkan ke dashboard.
6. Menu yang tampil menyesuaikan role user.

Akun demo dari seeder:

- [admin@smartstock.com](mailto:admin@smartstock.com)
- [manager@smartstock.com](mailto:manager@smartstock.com)
- [staff@smartstock.com](mailto:staff@smartstock.com)
- [viewer@smartstock.com](mailto:viewer@smartstock.com)

Password semua akun demo: `password123`.

Logout dilakukan melalui tombol profil/logout pada sidebar. Sistem juga memiliki session timeout otomatis untuk membantu mengurangi risiko sesi terbuka terlalu lama.

## 5. Panduan Dashboard

Dashboard menampilkan ringkasan inventaris:

- Total produk.
- Total stok masuk.
- Total stok keluar.
- Nilai inventaris.
- Stok kritis.
- Grafik pergerakan stok per kategori.
- Produk stok kritis.
- Stok per gudang.
- Transaksi stok terbaru.
- Notifikasi stok kritis melalui icon notifikasi.

Jika response time API melewati threshold tertentu, status sistem dan error log dapat digunakan untuk pemeriksaan lanjutan.

## 6. Panduan Modul Produk

Modul produk digunakan untuk mengelola master produk.

Fitur utama:

- Melihat daftar produk.
- Search berdasarkan nama/SKU.
- Filter kategori, gudang, supplier, dan status.
- Sorting berdasarkan tanggal, nama, SKU, stok, minimum stock, dan harga.
- Pagination.
- Tambah produk.
- Upload gambar produk.
- Preview gambar produk.
- Ubah produk.
- Hapus produk.
- Melihat level stok.
- Melihat stok per gudang.
- Membuka detail stok per gudang melalui tombol "Lihat Detail".

Pada detail stok per gudang, sistem menampilkan nama gudang, jumlah stok, dan total stok produk.

## 7. Panduan Modul Kategori Produk

Modul kategori produk digunakan untuk mengelompokkan produk.

Langkah umum:

1. Buka menu Kategori Produk.
2. Klik tambah kategori.
3. Isi nama dan deskripsi jika tersedia.
4. Simpan data.
5. Gunakan tombol ubah untuk memperbarui kategori.
6. Gunakan tombol hapus jika kategori tidak lagi digunakan.

Kategori digunakan pada produk dan membantu filter serta agregasi dashboard.

## 8. Panduan Modul Gudang

Modul gudang digunakan untuk mengelola lokasi penyimpanan stok.

Fitur:

- Tambah gudang.
- Ubah gudang.
- Hapus gudang.
- Mengisi lokasi.
- Mengisi latitude dan longitude.
- Menampilkan peta gudang interaktif menggunakan Leaflet.

Jika latitude dan longitude tidak diisi, gudang tetap dapat digunakan untuk transaksi, tetapi tidak tampil sebagai marker lengkap pada peta.

## 9. Panduan Modul Supplier

Modul supplier digunakan untuk mengelola data pemasok.

Langkah umum:

1. Buka menu Supplier.
2. Tambah supplier baru.
3. Isi nama, kontak, email, telepon, alamat, atau informasi lain yang tersedia.
4. Simpan data.
5. Gunakan ubah/hapus sesuai kebutuhan.

Supplier dapat dikaitkan dengan produk untuk memudahkan pelacakan sumber barang.

## 10. Panduan Modul Transaksi Stok

Modul transaksi stok digunakan untuk mencatat stok masuk dan stok keluar.

Langkah stok masuk:

1. Pilih tombol Stok Masuk.
2. Pilih produk.
3. Pilih gudang.
4. Isi jumlah.
5. Isi catatan jika diperlukan.
6. Simpan transaksi.
7. Sistem menambah stok produk dan stok gudang.

Langkah stok keluar:

1. Pilih tombol Stok Keluar.
2. Pilih produk.
3. Pilih gudang.
4. Isi jumlah.
5. Sistem memvalidasi stok gudang tersedia.
6. Jika stok cukup, sistem mengurangi stok produk dan stok gudang.
7. Jika stok tidak cukup, sistem menolak transaksi.

Transaksi mendukung search, filtering, sorting, dan pagination.

## 11. Panduan Transfer Antar Gudang

Transfer stok antar gudang sudah functional.

Langkah transfer:

1. Buka menu Transfer Stok.
2. Pilih produk.
3. Pilih gudang asal.
4. Pilih gudang tujuan.
5. Isi jumlah.
6. Isi catatan jika diperlukan.
7. Klik Proses Transfer.

Sistem akan:

- Memvalidasi gudang asal dan tujuan berbeda.
- Memvalidasi stok gudang asal mencukupi.
- Mengurangi stok gudang asal.
- Menambah stok gudang tujuan.
- Menyimpan riwayat transfer.
- Mencatat audit log.

Proses transfer dilakukan menggunakan database transaction agar konsistensi stok terjaga.

## 12. Panduan Import CSV Produk

Import CSV produk sudah functional menggunakan Laravel Queue database.

Format CSV:

```csv
sku,name,category,warehouse,supplier,current_stock,minimum_stock,unit_price
SKU-001,Kabel LAN,Elektronik,Gudang Jakarta,PT Sumber Jaya,50,10,25000
```

Langkah import:

1. Buka menu Impor Data.
2. Pilih file CSV.
3. Klik Upload dan Proses Queue.
4. Jalankan queue worker dari sisi admin teknis.
5. Lihat status import job.

Status job:

- `pending`: job menunggu diproses.
- `processing`: job sedang diproses.
- `completed`: job selesai.
- `failed`: job gagal dan perlu dicek pesan error.

Import Excel `.xlsx/.xls` belum tersedia dan menjadi pengembangan lanjutan.

## 13. Panduan Queue Jobs

Queue jobs digunakan untuk proses yang tidak perlu selesai langsung pada request utama.

Jenis job:

- Import CSV produk.
- Background report generation CSV.

Status umum:

- `pending`.
- `processing`.
- `completed`.
- `failed`.

Admin teknis dapat menjalankan worker:

```bash
php artisan queue:work
```

Untuk production, worker sebaiknya dijalankan sebagai service menggunakan Supervisor atau systemd, disertai retry policy dan monitoring.

## 14. Panduan Laporan

Modul laporan menyediakan:

- Filter berdasarkan tanggal dan tipe transaksi.
- Export CSV.
- Generate laporan besar melalui background job.
- Download report job setelah selesai.
- Export PDF via browser print.

PDF saat ini dibuat melalui fitur print browser dengan layout print, bukan backend PDF generator. Backend PDF generator seperti DomPDF/Snappy belum tersedia dan menjadi pengembangan lanjutan.

## 15. Panduan Log Aktivitas

Audit log mencatat aktivitas penting user, seperti:

- Create/update/delete data master.
- Transaksi stok.
- Transfer stok.
- Perubahan role user.

Audit log membantu pelacakan perubahan dan investigasi jika terjadi kesalahan operasional.

## 16. Panduan Error Log dan Status Sistem

Status sistem menampilkan:

- API status.
- Database status.
- Response time.
- Uptime status.
- Memory usage.
- Memory peak usage.
- PHP version.
- Server time.

Error log memiliki severity:

- `critical`: gangguan serius.
- `warning`: kondisi perlu perhatian.
- `info`: informasi sistem.

Dashboard/section error severity membantu melihat ringkasan jumlah error berdasarkan tingkat severity.

## 17. Panduan Hak Akses

Role Access UI Management hanya dapat diakses oleh admin.

Fitur:

- Melihat daftar user internal.
- Mengubah role user.
- Role tersedia: `admin`, `warehouse_manager`, `staff`, `viewer`.
- Perubahan role dicatat pada audit log.

User yang tidak memiliki hak akses akan menerima pesan akses ditolak.

## 18. Dokumentasi API

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| GET | `/api/health` | Tidak | Public | Health check API dan database. |
| POST | `/api/login` | Tidak | Public | Login dan mendapatkan Bearer Token. |
| GET | `/api/me` | Ya | Semua role login | Mengambil data user aktif. |
| POST | `/api/logout` | Ya | Semua role login | Logout dan mencabut token. |
| GET | `/api/dashboard` | Ya | admin, warehouse_manager, staff, viewer | Ringkasan dashboard inventaris. |
| GET | `/api/notifications/critical-stock` | Ya | admin, warehouse_manager, staff, viewer | Notifikasi stok kritis. |
| GET | `/api/products` | Ya | admin, warehouse_manager, staff | Daftar produk. |
| GET | `/api/products/{product}` | Ya | admin, warehouse_manager, staff | Detail produk. |
| POST | `/api/products` | Ya | admin, warehouse_manager | Tambah produk. |
| PUT/PATCH | `/api/products/{product}` | Ya | admin, warehouse_manager | Ubah produk. |
| DELETE | `/api/products/{product}` | Ya | admin, warehouse_manager | Hapus produk. |
| GET | `/api/categories` | Ya | admin, warehouse_manager, staff | Daftar kategori. |
| POST | `/api/categories` | Ya | admin, warehouse_manager | Tambah kategori. |
| PUT/PATCH | `/api/categories/{category}` | Ya | admin, warehouse_manager | Ubah kategori. |
| DELETE | `/api/categories/{category}` | Ya | admin, warehouse_manager | Hapus kategori. |
| GET | `/api/product-categories` | Ya | admin, warehouse_manager, staff | Alias daftar kategori produk. |
| GET | `/api/warehouses` | Ya | admin, warehouse_manager, staff | Daftar gudang. |
| POST | `/api/warehouses` | Ya | admin, warehouse_manager | Tambah gudang. |
| PUT/PATCH | `/api/warehouses/{warehouse}` | Ya | admin, warehouse_manager | Ubah gudang. |
| DELETE | `/api/warehouses/{warehouse}` | Ya | admin, warehouse_manager | Hapus gudang. |
| GET | `/api/suppliers` | Ya | admin, warehouse_manager, staff | Daftar supplier. |
| POST | `/api/suppliers` | Ya | admin, warehouse_manager | Tambah supplier. |
| PUT/PATCH | `/api/suppliers/{supplier}` | Ya | admin, warehouse_manager | Ubah supplier. |
| DELETE | `/api/suppliers/{supplier}` | Ya | admin, warehouse_manager | Hapus supplier. |
| GET | `/api/stock-transactions` | Ya | admin, warehouse_manager, staff, viewer | Daftar transaksi stok. |
| POST | `/api/stock-transactions` | Ya | admin, warehouse_manager, staff | Tambah transaksi stok. |
| PUT/PATCH | `/api/stock-transactions/{transaction}` | Ya | admin, warehouse_manager, staff | Ubah transaksi stok. |
| DELETE | `/api/stock-transactions/{transaction}` | Ya | admin, warehouse_manager, staff | Hapus transaksi stok. |
| GET | `/api/stock-transfers` | Ya | admin, warehouse_manager, staff, viewer | Daftar transfer stok. |
| GET | `/api/stock-transfers/{stockTransfer}` | Ya | admin, warehouse_manager, staff, viewer | Detail transfer stok. |
| POST | `/api/stock-transfers` | Ya | admin, warehouse_manager, staff | Membuat transfer stok antar gudang. |
| POST | `/api/import/products` | Ya | admin, warehouse_manager | Upload CSV produk ke queue. |
| GET | `/api/import/jobs` | Ya | admin, warehouse_manager | Daftar status import job. |
| GET | `/api/import/jobs/{importJob}` | Ya | admin, warehouse_manager | Detail import job. |
| GET | `/api/reports/export` | Ya | admin, warehouse_manager, staff, viewer | Export laporan CSV. |
| POST | `/api/reports/generate` | Ya | admin, warehouse_manager | Generate laporan CSV via background job. |
| GET | `/api/reports/jobs` | Ya | admin, warehouse_manager, staff, viewer | Daftar report job. |
| GET | `/api/reports/jobs/{reportJob}` | Ya | admin, warehouse_manager, staff, viewer | Detail report job. |
| GET | `/api/reports/jobs/{reportJob}/download` | Ya | admin, warehouse_manager, staff, viewer | Download file report job. |
| GET | `/api/audit-logs` | Ya | admin, warehouse_manager | Daftar audit log. |
| GET | `/api/error-logs` | Ya | admin, warehouse_manager | Daftar error log. |
| GET | `/api/error-logs/summary` | Ya | admin, warehouse_manager | Ringkasan severity error. |
| GET | `/api/users` | Ya | admin | Daftar user internal. |
| PUT | `/api/users/{user}/role` | Ya | admin | Mengubah role user. |

## 19. FAQ

1. **Bagaimana cara login?**  
   Masukkan email dan password akun internal, lalu klik Masuk.

2. **Mengapa saya tidak bisa menambah produk?**  
   Kemungkinan role Anda tidak memiliki akses. Tambah produk hanya untuk admin dan manajer gudang.

3. **Apa perbedaan Admin, Manajer Gudang, Staf Gudang, dan Viewer?**  
   Admin memiliki akses penuh, manajer gudang mengelola master data dan operasional, staf gudang fokus transaksi, viewer hanya melihat data tertentu.

4. **Bagaimana cara menambah stok?**  
   Buka Transaksi Stok, pilih Stok Masuk, pilih produk dan gudang, isi jumlah, lalu simpan.

5. **Bagaimana cara mengurangi stok?**  
   Buka Transaksi Stok, pilih Stok Keluar, pilih produk dan gudang, isi jumlah, lalu simpan. Sistem memvalidasi stok tersedia.

6. **Mengapa produk masuk stok kritis?**  
   Karena stok saat ini berada pada atau di bawah minimum stock.

7. **Bagaimana cara transfer stok antar gudang?**  
   Buka Transfer Stok, pilih produk, gudang asal, gudang tujuan, jumlah, lalu proses transfer.

8. **Bagaimana cara import CSV produk?**  
   Buka Impor Data, upload file CSV sesuai template, jalankan queue worker, lalu cek status import job.

9. **Bagaimana cara export laporan?**  
   Buka Laporan, gunakan filter jika diperlukan, lalu pilih Export CSV atau Export PDF.

10. **Apa fungsi audit log?**  
    Audit log mencatat aktivitas penting user untuk pelacakan dan pemeriksaan.

11. **Mengapa akses saya ditolak?**  
    Endpoint atau halaman tersebut tidak sesuai dengan role Anda.

12. **Apa yang dilakukan jika queue job tidak berjalan?**  
    Pastikan worker `php artisan queue:work` berjalan dan cek status job serta log error.

## 20. Troubleshooting Guide

| Masalah | Penyebab Kemungkinan | Solusi |
|---|---|---|
| Tidak bisa login | Email/password salah atau backend tidak aktif. | Cek kredensial, pastikan API berjalan, cek koneksi database. |
| Akses ditolak | Role tidak memiliki izin. | Hubungi admin untuk verifikasi role. |
| Data tidak muncul | Token expired, API error, atau database kosong. | Login ulang, refresh halaman, cek backend dan database. |
| Frontend tidak terbuka | Dev server/build frontend tidak berjalan. | Jalankan `npm install` dan `npm run dev` atau deploy build. |
| Backend tidak berjalan | Laravel server/PHP error. | Cek `.env`, jalankan migration, cek log Laravel. |
| Queue job pending terus | Queue worker belum berjalan. | Jalankan `php artisan queue:work`. |
| Import CSV gagal | Header salah, format tidak valid, atau data tidak numerik. | Sesuaikan template CSV dan cek pesan error job. |
| Upload gambar gagal | Format/ukuran file tidak valid atau storage permission bermasalah. | Cek validasi file dan permission storage. |
| Export laporan gagal | API error atau data laporan terlalu besar. | Gunakan background report generation dan cek report job. |
| Peta gudang tidak muncul | Latitude/longitude kosong atau invalid. | Isi koordinat gudang dengan benar. |
| Response time tinggi | Beban API/database tinggi. | Cek status sistem, error log, query, dan resource server. |

## 21. Batasan dan Pengembangan Lanjutan

Fitur berikut belum production-ready atau belum tersedia:

- WebSocket/push notification real-time.
- Email notification.
- Import Excel `.xlsx/.xls`.
- FIFO/LIFO batch layer penuh.
- Backend PDF generator.
- Monitoring CPU/disk/network server asli.
- Sinkronisasi otomatis antar gudang secara enterprise.
- Queue production setup masih perlu service manager, retry policy, queue monitoring, dan deployment worker stabil.
- Tombol "Simulasi MVP" atau Bantuan hanya feedback visual untuk pengembangan lanjutan, bukan fitur bisnis utama.

## 22. Kesimpulan

SmartStock Pro menyediakan fitur utama inventaris multi gudang yang sudah functional untuk kebutuhan MVP BNSP, termasuk role access, master data, transaksi stok, transfer antar gudang, import CSV, laporan, audit log, error log, health check, dan dashboard. Untuk production skala besar, sistem masih perlu penguatan pada monitoring server asli, notifikasi real-time, email notification, FIFO/LIFO batch layer, backend PDF generator, dan deployment queue yang lebih matang.
