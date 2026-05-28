# DOKUMEN MIGRASI, CUTOVER, UPDATE, DAN IMPACT ANALYSIS SMARTSTOCK PRO

## 1. Pendahuluan

Dokumen ini menjelaskan simulasi migrasi dari sistem lama berbasis spreadsheet/manual ke SmartStock Pro. Dokumen mencakup strategi migrasi data, mapping field, validasi data, rollback plan, cutover plan, skenario pembaharuan software, penggunaan Git, dan analisis dampak perubahan terhadap modul lain.

SmartStock Pro adalah sistem inventaris multi gudang yang sudah functional untuk login/logout, role access, CRUD master data, transaksi stok masuk/keluar, stok per gudang, transfer stok antar gudang, import CSV via queue, background report generation, audit log, error log, dashboard, dan laporan.

## 2. Kondisi Sistem Lama

Pada skenario migrasi, sistem lama diasumsikan menggunakan spreadsheet untuk pencatatan inventaris. Kondisi yang umum ditemukan:

- Data produk dicatat di spreadsheet terpisah.
- Data stok tersebar antar file atau antar gudang.
- Nama produk, kategori, supplier, dan gudang berpotensi tidak konsisten.
- SKU dapat duplikat atau kosong.
- Audit perubahan sulit dilacak.
- Tidak ada role access.
- Laporan dibuat manual.
- Risiko kesalahan input tinggi.
- Tidak ada validasi stok keluar terhadap stok tersedia.
- Tidak ada notifikasi stok kritis otomatis.

SmartStock Pro menggantikan proses tersebut dengan database terpusat, role access, validasi input, audit log, transaksi stok, dan dashboard.

## 3. Strategi Migrasi Data

Tahapan migrasi data:

1. Inventarisasi semua spreadsheet produk, stok, gudang, supplier, dan transaksi awal.
2. Data cleansing untuk menghapus duplikasi, memperbaiki format SKU, dan menyeragamkan nama gudang/kategori.
3. Mapping field spreadsheet ke struktur SmartStock Pro.
4. Validasi format CSV sesuai template import.
5. Backup spreadsheet asli.
6. Backup database SmartStock Pro sebelum import.
7. Import CSV produk melalui modul Import Data.
8. Jalankan queue worker agar import diproses.
9. Pantau status import job.
10. Validasi data pasca-migrasi.
11. Serahkan akses user sesuai role.

Import yang functional saat ini adalah CSV. Import Excel `.xlsx/.xls` belum tersedia dan masuk pengembangan lanjutan.

## 4. Mapping Field Spreadsheet ke Database

| Field Spreadsheet | Tabel SmartStock Pro | Kolom Database | Catatan Validasi |
|---|---|---|---|
| Product Name | `products` | `name` | Wajib diisi, tidak boleh kosong. |
| SKU | `products` | `sku` | Disarankan unik dan konsisten. |
| Category | `product_categories` | `name` | Dibuat atau dicocokkan saat import. |
| Warehouse | `warehouses` | `name` | Dibuat atau dicocokkan saat import. |
| Supplier | `suppliers` | `name` | Opsional sesuai data, dibuat/dicocokkan saat import. |
| Stock | `warehouse_stocks`, `products` | `quantity`, `current_stock` | Harus numerik dan tidak negatif. |
| Minimum Stock | `products`, `warehouse_stocks` | `minimum_stock` | Harus numerik dan tidak negatif. |
| Unit Price | `products` | `unit_price` | Harus numerik dan tidak negatif. |

Format CSV yang digunakan:

```csv
sku,name,category,warehouse,supplier,current_stock,minimum_stock,unit_price
SKU-001,Kabel LAN,Elektronik,Gudang Jakarta,PT Sumber Jaya,50,10,25000
```

## 5. Validasi Data Pra-Migrasi

Validasi sebelum import:

- SKU tidak boleh duplikat untuk produk berbeda.
- Nama produk wajib diisi.
- Stok harus numerik dan tidak negatif.
- Kategori harus jelas dan konsisten.
- Gudang harus jelas dan konsisten.
- Supplier harus jelas jika tersedia.
- Harga satuan harus numerik dan tidak negatif.
- Minimum stock harus numerik dan tidak negatif.
- File harus dalam format CSV.
- Header CSV harus sesuai template.

Jika ditemukan data tidak valid, data harus diperbaiki sebelum import agar tidak menghasilkan import job failed.

## 6. Validasi Pasca-Migrasi

Validasi setelah import:

- Bandingkan jumlah baris spreadsheet dengan jumlah produk/stock record yang masuk.
- Sampling beberapa produk untuk memastikan nama, SKU, kategori, supplier, harga, dan minimum stock sesuai.
- Validasi total stok per produk.
- Validasi stok per gudang.
- Cek produk yang masuk kategori stok kritis.
- Cek relasi produk-kategori-gudang-supplier.
- Cek status import job: `completed` atau `failed`.
- Cek error message jika ada import job gagal.
- Cek audit log untuk aktivitas yang relevan.

Jika terdapat perbedaan, lakukan investigasi berdasarkan file CSV, import job status, dan data database.

## 7. Rollback Plan

Rollback diperlukan jika migrasi gagal atau data hasil import tidak valid.

Langkah rollback:

- Siapkan backup database sebelum migrasi.
- Simpan backup spreadsheet asli.
- Jika data import salah, restore database dari backup.
- Rollback kode aplikasi menggunakan Git jika kegagalan disebabkan update aplikasi.
- Nonaktifkan sementara fitur baru jika berdampak ke operasional.
- Jalankan validasi ulang setelah rollback.
- Komunikasikan status rollback kepada user.

Rollback database harus dilakukan hati-hati agar transaksi yang sudah terjadi setelah cutover tidak hilang tanpa keputusan bisnis.

## 8. Cutover Plan

| Waktu | Aktivitas |
|---|---|
| H-3 | Backup spreadsheet, validasi data, cleansing, dan finalisasi mapping field. |
| H-2 | Training user, validasi akun internal, dan simulasi transaksi stok. |
| H-1 | Freeze spreadsheet, backup final, cek server, database, dan queue worker. |
| Hari H | Import data final ke SmartStock Pro, jalankan queue worker, verifikasi data, dan aktifkan penggunaan sistem. |
| H+1 | Monitoring awal login, transaksi, dashboard, import, laporan, error log, dan audit log. |
| H+3 | Evaluasi hasil cutover, perbaiki data minor, dan dokumentasikan temuan. |

## 9. Checklist Pra-Cutover

- [ ] Backup spreadsheet lama.
- [ ] Backup database SmartStock Pro.
- [ ] File CSV final sudah sesuai template.
- [ ] Akun user dibuat melalui seeder atau manajemen user internal.
- [ ] Role user dicek.
- [ ] Server frontend siap.
- [ ] Backend API siap.
- [ ] PostgreSQL siap.
- [ ] Queue worker siap.
- [ ] Testing login/logout berhasil.
- [ ] Testing transaksi stok masuk berhasil.
- [ ] Testing transaksi stok keluar berhasil.
- [ ] Testing transfer stok antar gudang berhasil.
- [ ] Testing import CSV berhasil.
- [ ] Testing export laporan berhasil.
- [ ] Testing role access berhasil.

## 10. Langkah Cutover

1. Hentikan update spreadsheet lama.
2. Export data final dari spreadsheet ke CSV.
3. Backup database SmartStock Pro.
4. Login sebagai admin atau manajer gudang.
5. Upload CSV pada modul Import Data.
6. Jalankan queue worker.
7. Pantau status import job.
8. Validasi record produk, gudang, supplier, stok, dan kategori.
9. Aktifkan user sesuai role.
10. Mulai pencatatan transaksi di SmartStock Pro.
11. Gunakan laporan dan audit log dari sistem baru.

## 11. Verifikasi Pasca-Cutover

Verifikasi yang dilakukan setelah cutover:

- User dapat login.
- Dashboard tampil.
- Total produk sesuai.
- Data gudang sesuai.
- Data supplier sesuai.
- Stok per gudang sesuai.
- Produk kritis sesuai aturan minimum stock.
- Transaksi stok masuk berhasil.
- Transaksi stok keluar menolak jumlah yang melebihi stok tersedia.
- Transfer stok antar gudang berhasil dan stok asal/tujuan berubah sesuai.
- Export CSV berhasil.
- Export PDF via browser print berhasil.
- Audit log tercatat.
- Error log dicek untuk memastikan tidak ada error kritis.
- Queue job tidak tertahan tanpa alasan.

## 12. Skenario Pembaharuan Software

Pembaharuan software dilakukan menggunakan Git agar perubahan dapat dilacak dan dapat di-rollback.

Tahapan update:

1. Buat branch fitur, misalnya `feature/import-csv`.
2. Lakukan development pada branch tersebut.
3. Jalankan testing lokal.
4. Pastikan migration, endpoint, frontend, dan role access sesuai.
5. Commit perubahan dengan pesan jelas.
6. Buat pull request atau merge ke branch utama sesuai prosedur tim.
7. Deploy ke staging.
8. Lakukan UAT.
9. Backup database sebelum deploy production.
10. Deploy production.
11. Monitor error log, response time, queue job, dan audit log.
12. Rollback menggunakan Git jika terjadi gangguan serius.

## 13. Contoh Skenario Update

### Menambahkan Fitur Transfer Stok Antar Gudang

Fitur transfer stok antar gudang saat ini sudah functional. Contoh tahapan pengembangannya:

- Membuat migration `stock_transfers` dan `warehouse_stocks`.
- Menambahkan model terkait.
- Menambahkan endpoint `GET /api/stock-transfers`, `GET /api/stock-transfers/{stockTransfer}`, dan `POST /api/stock-transfers`.
- Menambahkan validasi stok gudang asal.
- Memproses pengurangan stok asal dan penambahan stok tujuan dalam database transaction.
- Menambahkan audit log transfer.
- Menambahkan UI form transfer.
- Menambahkan tabel riwayat transfer.
- Testing transfer berhasil dan transfer gagal karena stok tidak cukup.

### Menambahkan Fitur Import CSV Produk

Fitur import CSV produk juga sudah functional menggunakan queue database:

- Membuat model import job.
- Menambahkan endpoint upload CSV.
- Menyimpan status job.
- Memproses CSV melalui queue.
- Membuat atau mencocokkan kategori, gudang, dan supplier.
- Mengisi produk dan stok per gudang.
- Menampilkan status import job di frontend.
- Testing file valid, file invalid, dan status failed.

## 14. Impact Analysis

| Perubahan | Modul Terdampak | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|
| Perubahan struktur `products` | Dashboard, transaksi, laporan, import, stok per gudang | Data produk dan nilai inventaris berubah. | Query error atau data tidak tampil. | Migration terencana, testing CRUD, testing dashboard, dan backup. |
| Perubahan `warehouse_stocks` | Transfer stok, stok keluar, dashboard, produk | Perhitungan stok per gudang berubah. | Stok tidak konsisten. | Gunakan database transaction dan validasi total stok. |
| Perubahan role access | Menu frontend, endpoint backend, user management | Hak akses user berubah. | User kehilangan akses atau mendapat akses berlebih. | Testing setiap role dan audit log perubahan role. |
| Perubahan laporan | Export CSV, print PDF, background report | Format laporan berubah. | User salah membaca laporan. | UAT format laporan dan dokumentasi perubahan. |
| Perubahan import CSV | Produk, kategori, gudang, supplier, stok | Data hasil import berubah. | Import gagal atau data duplikat. | Validasi header, status import job, dan rollback plan. |
| Perubahan transaksi stok | Produk, warehouse stock, dashboard, audit log | Stok berubah otomatis. | Stok negatif atau tidak sinkron. | Validasi stok keluar dan testing update/delete transaksi. |
| Perubahan health check | Status sistem dan error log | Monitoring berubah. | Alert tidak akurat. | Testing response health dan threshold. |

## 15. Change Management

Change management dibutuhkan agar pembaharuan tidak mengganggu operasional.

- Gunakan versioning kode dengan Git.
- Catat perubahan penting dalam changelog atau README.
- Komunikasikan perubahan kepada user.
- Jadwalkan maintenance di luar jam operasional.
- Lakukan UAT sebelum go-live.
- Backup database dan file storage sebelum deploy.
- Pastikan rollback plan tersedia.
- Monitor sistem setelah deploy.

## 16. Kesimpulan

Migrasi dari spreadsheet ke SmartStock Pro dapat dilakukan secara bertahap melalui cleansing data, mapping field, import CSV, queue processing, dan validasi pasca-migrasi. Cutover perlu didukung backup, checklist, training user, dan monitoring. Pembaharuan software harus menggunakan Git, testing, UAT, dan impact analysis agar perubahan pada satu modul tidak merusak modul lain.
