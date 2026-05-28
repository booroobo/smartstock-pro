# SmartStock Pro

**SmartStock Pro** adalah website Sistem Manajemen Inventaris Multi Gudang berbasis web yang dibuat sebagai MVP/demo untuk studi kasus BNSP. Sistem ini digunakan untuk mengelola data produk, kategori produk, gudang, supplier, transaksi stok masuk/keluar, dashboard inventaris, audit log, laporan, dan status sistem.

Project ini sebelumnya berasal dari project finance tracker, kemudian dimigrasikan menjadi sistem inventaris dengan pendekatan tanpa rewrite total. Struktur besar frontend React dan backend Laravel tetap dipertahankan, sementara domain bisnisnya disesuaikan menjadi SmartStock Pro.

## Tujuan Project

Tujuan utama SmartStock Pro adalah menyediakan aplikasi inventaris internal perusahaan yang:

- Mendukung login akun internal perusahaan.
- Menerapkan akses multi-role: Admin, Manajer Gudang, Staf Gudang, dan Viewer.
- Mengelola data master inventaris secara company-wide/global.
- Mencatat transaksi stok masuk dan stok keluar.
- Mengubah stok produk secara otomatis berdasarkan transaksi.
- Menampilkan dashboard inventaris dan produk stok kritis.
- Menyediakan audit log untuk aktivitas penting.
- Menyediakan laporan dalam bentuk CSV dan PDF sederhana via print browser.

Sistem ini adalah **MVP**, sehingga beberapa fitur advanced masih berupa simulasi MVP atau rancangan pengembangan lanjutan.

## Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | React.js + Vite | SPA untuk halaman login, dashboard, CRUD, laporan, dan status sistem. |
| Routing Frontend | React Router DOM | Routing halaman dan protected route. |
| HTTP Client | Axios | Komunikasi frontend ke Laravel REST API menggunakan Bearer Token. |
| Chart | Recharts | Visualisasi chart stok pada dashboard. |
| Map | Leaflet + React Leaflet | Peta lokasi gudang interaktif berdasarkan koordinat database. |
| Backend | Laravel 10 REST API | API, validation, controller, middleware, Eloquent ORM. |
| Authentication | Laravel Sanctum | Token-based authentication. |
| Database | PostgreSQL | Penyimpanan data inventaris dan audit log. |
| File Storage | Laravel public storage | Penyimpanan gambar produk. |
| Version Control | Git | Tracking perubahan dan rollback. |

## Fitur Utama

- Login/logout menggunakan Laravel Sanctum.
- Register publik dinonaktifkan karena akun bersifat internal perusahaan.
- Multi-role access dengan middleware role.
- Role Access UI Management untuk admin mengubah role user internal.
- Session timeout otomatis pada frontend.
- Password hashing menggunakan Laravel `Hash::make`.
- CRUD produk.
- CRUD kategori produk.
- CRUD gudang.
- CRUD supplier.
- Search, filtering, sorting, dan pagination produk.
- Search, filtering, sorting, dan pagination transaksi stok.
- Transaksi stok masuk (`stock_in`).
- Transaksi stok keluar (`stock_out`).
- Update stok otomatis.
- Edit dan delete transaksi stok dengan penyesuaian ulang stok.
- Stok per gudang menggunakan tabel `warehouse_stocks`.
- Transfer stok antar gudang menggunakan database transaction.
- Dashboard inventaris.
- Chart stok masuk/keluar per kategori.
- Nilai inventaris berdasarkan `current_stock x unit_price`.
- Critical stock alert berdasarkan minimum stock.
- In-app notification stok kritis dari backend.
- Peta gudang interaktif menggunakan Leaflet dan data koordinat gudang dari API.
- Upload dan preview gambar produk.
- Audit log aktivitas create/update/delete.
- Error log dengan severity dan chart ringkasan severity.
- Import CSV produk menggunakan Laravel Queue database.
- Queue job status untuk import dan report job.
- Status import job dan report job dapat dipantau dari frontend.
- Background report generation untuk laporan stok besar.
- Export CSV.
- Export PDF visual menggunakan browser print.
- Health check API dan database dengan response time, memory usage, memory peak, PHP version, server time, dan uptime status.
- Data master bersifat company-wide/global.
- Frontend menampilkan menu dan tombol sesuai role pengguna.

## Fitur Simulasi MVP / Pengembangan Lanjutan

Fitur berikut belum production-ready dan masih berupa simulasi MVP atau rancangan lanjutan:

- Import Excel.
- Monitoring resource advanced seperti CPU, Disk IOPS, dan network.
- WebSocket/push notification real-time.
- Email notification.
- FIFO/LIFO batch layer.
- Backend PDF generator dengan dependency berat.
- Queue production setup yang lengkap, seperti service manager, retry policy, dan monitoring worker.
- Sinkronisasi otomatis antar gudang secara enterprise.

## Role dan Hak Akses

| Role Backend | Label UI | Hak Akses |
|---|---|---|
| `admin` | Admin | Akses penuh ke semua fitur. |
| `warehouse_manager` | Manajer Gudang | CRUD produk, kategori, gudang, supplier, transaksi stok, laporan, audit log. |
| `staff` | Staf Gudang | Melihat data master untuk transaksi, membuat/mengelola transaksi stok, melihat dashboard/laporan/status. |
| `viewer` | Viewer | Read-only dashboard, laporan, dan status sistem. |

Jika role tidak memiliki izin, backend mengembalikan response 403:

```json
{
  "success": false,
  "message": "Akses ditolak. Role tidak memiliki izin."
}
```

Frontend menampilkan pesan:

```text
Akses ditolak. Role Anda tidak memiliki izin untuk fitur ini.
```

## Struktur Folder Project

```text
finance-tracker/
├── backend/       # Laravel REST API
├── frontend/      # React + Vite frontend
├── docs/          # Dokumentasi non-fungsional Markdown
├── README.md      # Dokumentasi project
└── .gitignore
```

## Struktur Backend

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   └── Models/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── config/
├── storage/
└── composer.json
```

Controller utama:

- `AuthController`
- `DashboardController`
- `CategoryController`
- `ProductController`
- `WarehouseController`
- `SupplierController`
- `TransactionController`
- `ReportController`
- `AuditLogController`
- `HealthCheckController`

Middleware utama:

- `RoleMiddleware`
- `auth:sanctum`

Model utama:

- `User`
- `Product`
- `ProductCategory`
- `Warehouse`
- `Supplier`
- `StockTransaction`
- `AuditLog`

## Struktur Frontend

```text
frontend/
├── src/
│   ├── api/          # Service API Axios
│   ├── components/   # Komponen reusable
│   ├── contexts/     # AuthContext
│   ├── pages/        # Halaman aplikasi
│   ├── utils/        # Helper role dan label
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

API services:

- `axiosClient.js`
- `dashboardApi.js`
- `categoryApi.js`
- `productApi.js`
- `warehouseApi.js`
- `supplierApi.js`
- `transactionApi.js`
- `reportApi.js`
- `auditLogApi.js`
- `systemApi.js`

Halaman utama:

- `LoginPage`
- `DashboardPage`
- `ProductsPage`
- `CategoriesPage`
- `WarehousesPage`
- `SuppliersPage`
- `StockTransactionsPage`
- `ReportsPage`
- `AuditLogsPage`
- `SystemStatusPage`

## Database dan Relasi

Database menggunakan PostgreSQL. Data master sudah dirapikan agar bersifat company-wide/global, bukan personal per user.

Tabel utama:

| Tabel | Fungsi |
|---|---|
| `users` | Menyimpan akun internal dan role pengguna. |
| `product_categories` | Menyimpan kategori produk. |
| `products` | Menyimpan data produk, stok saat ini, stok minimum, dan gambar. |
| `products.unit_price` | Harga satuan produk untuk menghitung nilai inventaris. |
| `warehouses` | Menyimpan data gudang, lokasi, latitude, dan longitude. |
| `suppliers` | Menyimpan data supplier. |
| `stock_transactions` | Menyimpan transaksi stok masuk dan stok keluar. |
| `warehouse_stocks` | Menyimpan quantity produk per gudang. |
| `stock_transfers` | Menyimpan riwayat transfer stok antar gudang. |
| `audit_logs` | Mencatat aktivitas pengguna. |
| `error_logs` | Mencatat error/warning/info aplikasi beserta severity. |
| `jobs` | Antrian Laravel Queue database. |
| `failed_jobs` | Catatan job queue yang gagal. |
| `import_jobs` | Status proses import CSV produk. |
| `report_jobs` | Status proses generate laporan background. |
| `personal_access_tokens` | Token Laravel Sanctum. |

Relasi utama:

- `products.product_category_id` → `product_categories.id`
- `stock_transactions.product_id` → `products.id`
- `stock_transactions.warehouse_id` → `warehouses.id`
- `warehouse_stocks.product_id` → `products.id`
- `warehouse_stocks.warehouse_id` → `warehouses.id`
- `stock_transfers.product_id` → `products.id`
- `stock_transfers.from_warehouse_id` → `warehouses.id`
- `stock_transfers.to_warehouse_id` → `warehouses.id`
- `stock_transactions.user_id` → `users.id` sebagai pencatat pembuat transaksi
- `audit_logs.user_id` → `users.id` sebagai pencatat pelaku aktivitas

Catatan:

- Kolom `user_id` pada master data tetap dapat digunakan sebagai `created_by`, tetapi tidak dipakai untuk membatasi visibility data.
- Produk, kategori, gudang, dan supplier dapat dilihat oleh role yang diizinkan secara role middleware.

## Endpoint API

Base URL development:

```text
http://127.0.0.1:8000/api
```

| Method | Endpoint | Auth | Role | Deskripsi |
|---|---|---|---|---|
| POST | `/api/login` | Tidak | Internal user | Login dan mendapatkan token. |
| POST | `/api/logout` | Ya | Semua role login | Logout dan menghapus token aktif. |
| GET | `/api/me` | Ya | Semua role login | Mendapatkan data user login. |
| GET | `/api/dashboard` | Ya | admin, warehouse_manager, staff, viewer | Ringkasan dashboard inventaris. |
| GET | `/api/products` | Ya | admin, warehouse_manager, staff | Daftar produk. |
| POST | `/api/products` | Ya | admin, warehouse_manager | Tambah produk. |
| GET | `/api/products/{product}` | Ya | admin, warehouse_manager, staff | Detail produk. |
| PUT | `/api/products/{product}` | Ya | admin, warehouse_manager | Ubah produk. |
| DELETE | `/api/products/{product}` | Ya | admin, warehouse_manager | Hapus produk. |
| GET | `/api/product-categories` | Ya | admin, warehouse_manager, staff | Daftar kategori produk. |
| POST | `/api/product-categories` | Ya | admin, warehouse_manager | Tambah kategori. |
| PUT | `/api/product-categories/{category}` | Ya | admin, warehouse_manager | Ubah kategori. |
| DELETE | `/api/product-categories/{category}` | Ya | admin, warehouse_manager | Hapus kategori. |
| GET | `/api/warehouses` | Ya | admin, warehouse_manager, staff | Daftar gudang. |
| POST | `/api/warehouses` | Ya | admin, warehouse_manager | Tambah gudang. |
| PUT | `/api/warehouses/{warehouse}` | Ya | admin, warehouse_manager | Ubah gudang. |
| DELETE | `/api/warehouses/{warehouse}` | Ya | admin, warehouse_manager | Hapus gudang. |
| GET | `/api/suppliers` | Ya | admin, warehouse_manager, staff | Daftar supplier. |
| POST | `/api/suppliers` | Ya | admin, warehouse_manager | Tambah supplier. |
| PUT | `/api/suppliers/{supplier}` | Ya | admin, warehouse_manager | Ubah supplier. |
| DELETE | `/api/suppliers/{supplier}` | Ya | admin, warehouse_manager | Hapus supplier. |
| GET | `/api/stock-transactions` | Ya | admin, warehouse_manager, staff, viewer | Daftar transaksi stok. |
| POST | `/api/stock-transactions` | Ya | admin, warehouse_manager, staff | Tambah transaksi stok. |
| PUT | `/api/stock-transactions/{transaction}` | Ya | admin, warehouse_manager, staff | Ubah transaksi stok. |
| DELETE | `/api/stock-transactions/{transaction}` | Ya | admin, warehouse_manager, staff | Hapus transaksi stok. |
| GET | `/api/stock-transfers` | Ya | admin, warehouse_manager, staff, viewer | Daftar transfer stok. |
| POST | `/api/stock-transfers` | Ya | admin, warehouse_manager, staff | Transfer stok antar gudang. |
| GET | `/api/stock-transfers/{id}` | Ya | admin, warehouse_manager, staff, viewer | Detail transfer stok. |
| GET | `/api/reports/export` | Ya | admin, warehouse_manager, staff, viewer | Export laporan CSV. |
| GET | `/api/audit-logs` | Ya | admin, warehouse_manager | Daftar audit log. |
| GET | `/api/health` | Tidak | Public/system check | Status API dan database. |
| GET | `/api/notifications/critical-stock` | Ya | admin, warehouse_manager, staff, viewer | Notifikasi stok kritis dari data produk. |
| GET | `/api/error-logs` | Ya | admin, warehouse_manager | Daftar error log dengan filter severity. |
| GET | `/api/error-logs/summary` | Ya | admin, warehouse_manager | Ringkasan jumlah error berdasarkan severity. |
| GET | `/api/users` | Ya | admin | Daftar user internal untuk manajemen role. |
| PUT | `/api/users/{id}/role` | Ya | admin | Mengubah role user internal. |
| POST | `/api/import/products` | Ya | admin, warehouse_manager | Upload CSV produk dan dispatch queue import. |
| GET | `/api/import/jobs` | Ya | admin, warehouse_manager | Daftar status import job. |
| GET | `/api/import/jobs/{id}` | Ya | admin, warehouse_manager | Detail status import job. |
| POST | `/api/reports/generate` | Ya | admin, warehouse_manager | Generate laporan stok via queue. |
| GET | `/api/reports/jobs` | Ya | admin, warehouse_manager, staff, viewer | Daftar report job. |
| GET | `/api/reports/jobs/{id}` | Ya | admin, warehouse_manager, staff, viewer | Detail report job. |
| GET | `/api/reports/jobs/{id}/download` | Ya | admin, warehouse_manager, staff, viewer | Download file report job yang selesai. |

Catatan:

- `/api/register` dinonaktifkan karena sistem menggunakan akun internal perusahaan.
- Endpoint lama `/api/categories` dan `/api/transactions` masih tersedia sebagai alias kompatibilitas internal.

## Instalasi Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
composer install
```

Copy file environment:

```bash
cp .env.example .env
```

Generate app key:

```bash
php artisan key:generate
```

Konfigurasi database PostgreSQL pada `.env`, lalu jalankan migration dan seeder:

```bash
php artisan migrate
php artisan db:seed
```

Buat storage link agar gambar produk dapat diakses:

```bash
php artisan storage:link
```

Jalankan backend:

```bash
php artisan serve
```

Jalankan queue worker pada terminal terpisah agar import CSV dan generate laporan background diproses:

```bash
php artisan queue:work
```

Default backend berjalan pada:

```text
http://127.0.0.1:8000
```

## Konfigurasi `.env` Backend

Contoh konfigurasi PostgreSQL:

```env
APP_NAME="SmartStock Pro"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smartstock_pro
DB_USERNAME=postgres
DB_PASSWORD=your_password

FILESYSTEM_DISK=local
SESSION_DRIVER=file
SESSION_LIFETIME=120
QUEUE_CONNECTION=database
```

Jika gambar produk tidak tampil, pastikan:

- `APP_URL` mengarah ke URL backend yang benar.
- `php artisan storage:link` sudah dijalankan.
- File gambar berada pada `backend/storage/app/public/products`.

## Instalasi Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Default frontend berjalan pada:

```text
http://127.0.0.1:5173
```

Build production:

```bash
npm run build
```

## Akun Demo

Akun dibuat melalui `backend/database/seeders/UserSeeder.php`.

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartstock.com | password123 |
| Manajer Gudang | manager@smartstock.com | password123 |
| Staf Gudang | staff@smartstock.com | password123 |
| Viewer | viewer@smartstock.com | password123 |

Jalankan seeder:

```bash
php artisan db:seed
```

Atau khusus user:

```bash
php artisan db:seed --class=UserSeeder
```

## Alur Penggunaan

Alur demo utama:

1. Login menggunakan akun demo.
2. Masuk ke Dasbor.
3. Tambah Kategori Produk.
4. Tambah Gudang.
5. Tambah Supplier.
6. Tambah Produk dan upload gambar.
7. Isi Harga Satuan produk agar nilai inventaris terhitung.
8. Tambah Gudang dengan latitude dan longitude untuk menampilkan marker peta.
9. Buat transaksi Stok Masuk ke gudang A.
10. Transfer stok dari gudang A ke gudang B.
11. Buat transaksi Stok Keluar dari gudang B.
12. Edit atau hapus transaksi stok jika diperlukan.
13. Cek perubahan stok produk, stok per gudang, dan nilai inventaris di dashboard/produk.
14. Cek produk stok kritis di dashboard/notifikasi.
15. Cek audit log dan error severity chart.
16. Export laporan CSV.
17. Export PDF melalui print browser.
18. Cek Status Sistem.
19. Logout.

### Alur Import CSV Produk

1. Login sebagai Admin atau Manajer Gudang.
2. Buka menu Impor Data.
3. Siapkan file CSV maksimal 5 MB dengan header:

```csv
sku,name,category,warehouse,supplier,current_stock,minimum_stock,unit_price
SKU-001,Kabel LAN,Elektronik,Gudang Jakarta,PT Sumber Jaya,50,10,25000
```

4. Upload file CSV.
5. Jalankan `php artisan queue:work` pada terminal backend.
6. Klik Muat Ulang untuk melihat status `pending`, `processing`, `completed`, atau `failed`.
7. Jika selesai, produk, kategori, gudang, dan supplier dari CSV masuk ke database.

### Alur Generate Laporan Background

1. Login sebagai Admin atau Manajer Gudang.
2. Buka menu Laporan.
3. Pada bagian Generate Laporan Besar, klik Generate Laporan.
4. Jalankan `php artisan queue:work`.
5. Klik Muat Ulang.
6. Jika status `completed`, klik Download untuk mengambil CSV hasil generate.

## Keamanan Sistem

Keamanan yang sudah diterapkan:

- Password hashing menggunakan Laravel.
- Token authentication menggunakan Laravel Sanctum.
- Bearer Token pada request API.
- Middleware role untuk authorization.
- Route protected menggunakan `auth:sanctum`.
- Frontend protected route.
- Menu dan aksi frontend disesuaikan dengan role.
- Audit log aktivitas create/update/delete.
- Validasi request backend.
- Query menggunakan Eloquent ORM/Query Builder untuk mengurangi risiko SQL Injection.
- Upload gambar dibatasi format dan ukuran.
- Session timeout otomatis saat user idle.
- Error log mencatat kejadian warning seperti stok keluar melebihi stok tersedia.
- Update stok per gudang dan transfer antar gudang dibungkus `DB::transaction` untuk menjaga konsistensi.

Catatan:

- Register publik dinonaktifkan.
- Akun dibuat melalui seeder/database oleh administrator.
- Untuk production, HTTPS wajib digunakan.
- Database tidak boleh dibuka langsung ke publik.

## Dokumentasi Non-Fungsional

Dokumentasi non-fungsional berada pada folder `docs/`:

| File | Isi |
|---|---|
| `docs/01_Dokumen_Arsitektur_dan_Infrastruktur_SmartStock_Pro.md` | Arsitektur, topologi, spesifikasi server, keamanan, backup. |
| `docs/02_Dokumen_Tools_Framework_dan_Skalabilitas_SmartStock_Pro.md` | Tools, framework, library, skalabilitas, maintainability. |
| `docs/03_Dokumen_Migrasi_Cutover_Update_dan_Impact_Analysis_SmartStock_Pro.md` | Migrasi, cutover, rollback, update, impact analysis. |
| `docs/04_Dokumentasi_Teknis_Pelanggan_SmartStock_Pro.md` | Panduan teknis pelanggan, role, API, FAQ, troubleshooting. |

## Testing Singkat

### Backend

Jika PHP tersedia di environment:

```bash
cd backend
php artisan route:list
php artisan test
```

### Frontend

```bash
cd frontend
npm run build
```

Catatan:

- `npm run build` digunakan untuk memastikan tidak ada error import/build frontend.
- `npm run lint` mungkin masih menampilkan issue lama dari `AuthContext.jsx` karena file tersebut sengaja tidak diubah.

### Test Manual Role

- Login sebagai Admin: pastikan semua menu utama dapat diakses.
- Login sebagai Manajer Gudang: pastikan master data dan transaksi dapat diakses.
- Login sebagai Staf Gudang: pastikan transaksi stok dapat dilakukan dan menu manajemen master tidak tampil.
- Login sebagai Viewer: pastikan hanya akses read-only dashboard/laporan/status.

## Batasan MVP

SmartStock Pro saat ini merupakan MVP/demo. Batasan yang masih ada:

- Import Excel belum tersedia; import yang functional saat ini adalah CSV.
- Monitoring resource advanced masih simulasi.
- Notifikasi stok kritis belum WebSocket/push real-time; saat ini masih fetch API/manual refresh.
- Email notification belum aktif.
- FIFO/LIFO batch layer belum tersedia.
- Backend PDF generator belum tersedia.
- Monitoring CPU, disk, dan network server asli belum tersedia.
- Queue sudah functional untuk import CSV dan background report, tetapi setup production masih perlu service manager, retry policy, queue monitoring, dan worker deployment yang stabil.
- Sinkronisasi otomatis antar gudang secara enterprise belum tersedia. Transfer stok manual antar gudang sudah functional.

## Kesimpulan

SmartStock Pro sudah memenuhi kebutuhan inti sistem inventaris berbasis web untuk demo BNSP, yaitu login multi-role, Role Access UI Management, CRUD data master, transaksi stok masuk/keluar, update stok otomatis, stok per gudang, transfer stok antar gudang, dashboard, nilai inventaris, peta gudang interaktif, audit log, error log severity, upload gambar produk, import CSV via queue, background report generation, laporan CSV, export PDF via browser print, dan health check response time/resource PHP. Sistem sudah menggunakan arsitektur frontend-backend terpisah dengan React, Laravel REST API, PostgreSQL, dan Laravel Sanctum.

Beberapa fitur lanjutan masih dicatat sebagai simulasi MVP atau rancangan pengembangan. Dengan struktur yang sudah dipisahkan antara frontend, backend, API services, middleware, dan dokumentasi, project ini dapat dikembangkan lebih lanjut menuju sistem production yang lebih lengkap.
