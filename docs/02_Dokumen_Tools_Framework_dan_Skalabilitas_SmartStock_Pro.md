# DOKUMEN TOOLS, FRAMEWORK, LIBRARY, DAN SKALABILITAS SMARTSTOCK PRO

## 1. Pendahuluan

Dokumen ini menjelaskan pemilihan tools, framework, library, dan komponen pihak ketiga yang digunakan pada SmartStock Pro. Dokumen juga menganalisis skalabilitas sistem terhadap peningkatan jumlah pengguna, volume data, file, transaksi, queue job, dan kebutuhan maintenance.

SmartStock Pro adalah Website Sistem Manajemen Inventaris Multi Gudang berbasis React.js + Vite pada frontend, Laravel REST API pada backend, PostgreSQL pada database, dan Laravel Sanctum untuk autentikasi Bearer Token. Sistem ini merupakan MVP fungsional untuk studi kasus BNSP Web Developer.

## 2. Ringkasan Teknologi

| Layer/Komponen | Teknologi | Fungsi | Alasan Pemilihan |
|---|---|---|---|
| Frontend | React.js | Membangun SPA dashboard dan CRUD. | Komponen reusable, cocok untuk UI dinamis, dan ekosistem luas. |
| Build Tool | Vite | Development server dan build frontend. | Cepat, konfigurasi ringan, cocok untuk React modern. |
| Backend | Laravel REST API | API, routing, validation, middleware, queue, ORM. | Produktif untuk CRUD, autentikasi, role access, dan workflow inventaris. |
| Database | PostgreSQL | Penyimpanan data relasional. | Kuat untuk integritas data, relasi, transaksi, dan query agregasi. |
| Authentication | Laravel Sanctum | Token API berbasis Bearer Token. | Cocok untuk SPA yang berkomunikasi dengan REST API. |
| Chart | Recharts | Grafik stok dan error severity. | Mudah digunakan di React dan cukup untuk dashboard MVP. |
| HTTP Client | Axios | Komunikasi frontend ke backend. | Mendukung interceptor, header token, dan error handling. |
| Routing Frontend | React Router DOM | Routing halaman dan navigasi SPA. | Standar umum untuk aplikasi React. |
| Map | Leaflet + React Leaflet | Peta lokasi gudang interaktif. | Open-source, ringan, dan mudah diintegrasikan dengan React. |
| Version Control | Git/GitHub | Tracking perubahan dan rollback. | Mendukung branch, review, dan manajemen versi. |
| Dependency Backend | Composer | Manajemen package PHP. | Standar ekosistem PHP/Laravel. |
| Dependency Frontend | NPM | Manajemen package JavaScript. | Standar ekosistem Node.js dan Vite. |
| Queue | Laravel Queue database driver | Memproses import CSV dan background report. | Cukup untuk MVP tanpa membutuhkan Redis atau broker tambahan. |

## 3. Analisis Pemilihan Frontend

Frontend menggunakan React.js dan Vite karena kebutuhan aplikasi bersifat interaktif dan berbasis dashboard. React mendukung pembuatan komponen reusable seperti DataTable, Modal, Alert, SummaryCard, Navbar, Sidebar, ProductForm, WarehouseForm, dan komponen peta.

Alasan pemilihan React + Vite:

- Mendukung Single Page Application.
- Komponen UI dapat digunakan ulang di banyak modul.
- Vite mempercepat development server dan proses build.
- Cocok untuk dashboard dengan chart, modal, notifikasi, tabel, pagination, dan filter.
- Mudah berintegrasi dengan REST API menggunakan Axios.
- Mendukung tampilan dinamis berdasarkan role user.
- Mendukung peta interaktif melalui React Leaflet.

Fitur frontend yang sudah functional meliputi login, session timeout, dashboard, chart stok, CRUD produk, kategori, gudang, supplier, transaksi stok, transfer stok, import CSV, queue job status, laporan, export PDF via browser print, status sistem, audit log, error log, notifikasi stok kritis, dan role access management untuk admin.

## 4. Analisis Pemilihan Backend

Backend menggunakan Laravel karena framework ini menyediakan fitur yang sesuai untuk aplikasi inventaris internal:

- Struktur MVC yang jelas.
- Routing REST API.
- Middleware untuk autentikasi dan role access.
- Eloquent ORM dan Query Builder untuk mengurangi risiko SQL Injection.
- Request validation untuk menjaga kualitas input.
- Laravel Sanctum untuk autentikasi API token.
- Queue job untuk proses berat seperti import CSV dan report generation.
- Migration dan seeder untuk pengelolaan struktur database dan akun internal.
- Storage API untuk upload gambar produk dan file laporan.

Laravel juga memudahkan pencatatan audit log dan error log. Pada SmartStock Pro, backend bertanggung jawab terhadap business logic stok, termasuk update stok otomatis, validasi stok keluar, stok per gudang, dan transfer stok antar gudang menggunakan database transaction.

## 5. Analisis Pemilihan Database

Database menggunakan PostgreSQL karena sistem inventaris membutuhkan konsistensi data dan relasi yang kuat. Data utama yang dikelola meliputi user, produk, kategori, gudang, supplier, transaksi stok, warehouse stocks, stock transfers, audit logs, error logs, import jobs, report jobs, dan queue jobs.

Keunggulan PostgreSQL untuk SmartStock Pro:

- Cocok untuk relational database.
- Mendukung relasi produk, gudang, supplier, transaksi, dan user.
- Mendukung constraint dan foreign key.
- Mendukung transaksi database untuk update stok dan transfer gudang.
- Mendukung query agregasi untuk dashboard inventaris.
- Cocok untuk laporan dan analisis stok.

Pada proses stok, konsistensi sangat penting. Contohnya, transfer stok antar gudang harus mengurangi stok gudang asal dan menambah stok gudang tujuan dalam satu database transaction agar tidak terjadi data setengah jalan.

## 6. Dokumentasi Library Pihak Ketiga

| Library/Package | Versi | Lisensi | Fungsi | Alasan Penggunaan |
|---|---:|---|---|---|
| React | ^19.2.6 | MIT | Membangun UI frontend. | Komponen reusable dan cocok untuk SPA. |
| React DOM | ^19.2.6 | MIT | Rendering React ke browser. | Dependency inti React web. |
| Vite | ^8.0.12 | MIT | Development server dan build frontend. | Build cepat dan konfigurasi sederhana. |
| Axios | ^1.16.1 | MIT | HTTP client REST API. | Mudah mengatur Bearer Token dan error response. |
| React Router DOM | ^7.15.1 | MIT | Routing frontend. | Mendukung navigasi SPA dan protected page. |
| Recharts | ^3.6.0 | MIT | Chart dashboard. | Integrasi mudah dengan React. |
| Leaflet | ^1.9.4 | BSD-2-Clause | Peta interaktif. | Open-source dan ringan. |
| React Leaflet | ^5.0.0 | MIT | Integrasi Leaflet dengan React. | Mempermudah komponen peta dalam React. |
| Laravel Framework | ^10.0 | MIT | Backend REST API. | Routing, controller, validation, ORM, queue, storage. |
| Laravel Sanctum | ^3.3 | MIT | Autentikasi API token. | Cocok untuk SPA dan Bearer Token. |
| Guzzle | ^7.2 | MIT | HTTP client PHP. | Dependency umum Laravel untuk integrasi HTTP. |
| Laravel Tinker | ^2.8 | MIT | Debugging/REPL Laravel. | Membantu pemeriksaan data development. |
| PostgreSQL driver | Mengikuti ekstensi PHP/konfigurasi environment | PostgreSQL License | Koneksi Laravel ke PostgreSQL. | Mendukung database relasional utama. |

Package development seperti ESLint, PHPUnit, Laravel Pint, Mockery, dan Faker digunakan untuk linting, testing, formatting, dan kebutuhan development.

## 7. Analisis Skalabilitas Sistem

Skalabilitas SmartStock Pro didukung oleh beberapa keputusan arsitektur:

- Frontend dan backend dipisahkan sehingga dapat ditempatkan pada server berbeda.
- REST API dapat di-scale secara horizontal di belakang load balancer sebagai pengembangan lanjutan.
- PostgreSQL dapat dioptimalkan dengan index pada kolom pencarian, foreign key, tanggal transaksi, dan status job.
- Produk dan transaksi stok sudah mendukung search, filtering, sorting, dan pagination.
- Proses berat seperti import CSV dan generate laporan besar dipindahkan ke queue.
- File storage dapat dipindahkan ke object storage jika jumlah gambar dan laporan meningkat.
- Caching dapat ditambahkan untuk dashboard dan data referensi sebagai pengembangan lanjutan.
- Load balancer dapat digunakan ketika jumlah user dan request meningkat.

Queue sudah functional untuk import CSV dan background report generation. Untuk production, queue masih perlu service manager, retry policy, monitoring worker, dan deployment worker yang stabil.

## 8. Analisis Peningkatan Jumlah Pengguna

| Skenario | Dampak | Strategi |
|---|---|---|
| 10 user internal | Beban rendah, satu server aplikasi dan database masih cukup untuk MVP. | Gunakan pagination, backup harian, dan monitoring health check. |
| 50 user gudang | Request API meningkat, transaksi stok dan dashboard lebih sering diakses. | Tambahkan RAM, optimalkan query, jalankan queue worker stabil, dan pantau response time. |
| 100+ user perusahaan | Potensi bottleneck pada database, laporan, dan queue. | Pisahkan frontend/backend/database, tambah worker, gunakan load balancer, indexing, caching, dan monitoring production. |

Dampak terhadap komponen:

- **Server backend**: Meningkat pada login, dashboard, CRUD, dan transaksi.
- **Database**: Meningkat pada query transaksi, stok per gudang, dan audit log.
- **API bandwidth**: Meningkat saat upload gambar dan export laporan.
- **Queue**: Meningkat jika import dan report generation dilakukan bersamaan.

## 9. Analisis Peningkatan Volume Data

Volume data yang berpotensi meningkat:

- Produk bertambah.
- Transaksi stok bertambah setiap hari.
- Stok per gudang bertambah seiring jumlah warehouse.
- Audit log bertambah dari aktivitas create/update/delete dan perubahan role.
- Error log bertambah dari validasi gagal, transfer gagal, dan health warning.
- Laporan semakin besar.
- Import CSV massal menghasilkan import job dan queue job.

Strategi penanganan:

- Gunakan pagination pada produk, transaksi, import job, report job, audit log, dan error log.
- Tambahkan index database pada `sku`, `name`, `created_at`, `transaction_date`, `status`, dan foreign key yang sering difilter.
- Arsipkan audit log dan error log lama.
- Gunakan queue untuk report generation agar request tidak timeout.
- Optimalkan query dashboard dengan agregasi yang efisien.
- Jadwalkan backup berkala.
- Pisahkan storage file jika gambar produk dan laporan semakin besar.

## 10. Maintainability

Maintainability SmartStock Pro didukung oleh pemisahan tanggung jawab:

- Backend berada di folder `backend/`.
- Frontend berada di folder `frontend/`.
- Dokumentasi berada di folder `docs/`.
- Backend menggunakan controller, model, migration, seeder, route API, middleware, dan job.
- Frontend menggunakan reusable components, page components, API service modules, context, dan utility role.
- API services memisahkan pemanggilan endpoint dari komponen UI.
- Role access dipusatkan melalui backend middleware dan helper frontend.
- Git digunakan untuk version control, branch fitur, dan rollback.
- README dan dokumen non-fungsional menjelaskan setup, fitur, endpoint, risiko, dan batasan MVP.

Struktur ini memudahkan penambahan fitur tanpa mengubah seluruh aplikasi.

## 11. Risiko Skalabilitas dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Transaksi stok terlalu banyak | Query transaksi dan laporan menjadi lambat. | Index, pagination, filter tanggal, dan arsip data lama. |
| Dashboard semakin berat | Response time meningkat. | Optimasi query agregasi dan caching sebagai pengembangan lanjutan. |
| Laporan besar timeout | User gagal export laporan. | Gunakan background report generation melalui queue. |
| File gambar produk banyak | Storage penuh dan backup membesar. | Gunakan storage terpisah dan kebijakan kompresi/retensi file. |
| Queue menumpuk | Import dan report terlambat diproses. | Tambah worker, monitoring queue, retry policy, dan service manager. |
| Database menjadi bottleneck | Semua modul melambat. | Index, tuning PostgreSQL, read replica sebagai pengembangan lanjutan. |
| Token disimpan di client | Risiko jika perangkat user tidak aman. | HTTPS, session timeout, kebijakan logout, dan evaluasi cookie HttpOnly untuk production. |
| Monitoring masih dasar | Gangguan server tidak cepat diketahui. | Tambah monitoring CPU, disk, network, dan alert operasional. |

## 12. Kesimpulan

Pemilihan React, Vite, Laravel, PostgreSQL, Sanctum, Axios, Recharts, Leaflet, dan Laravel Queue database driver sesuai untuk MVP fungsional SmartStock Pro. Sistem sudah mendukung modul inventaris inti, transfer stok antar gudang, import CSV via queue, background report generation, audit log, error log, health check, dan role access. Untuk peningkatan skala production, sistem perlu diperkuat dengan monitoring server asli, queue worker production, caching, indexing lanjutan, storage terpisah, dan strategi deployment yang lebih matang.
