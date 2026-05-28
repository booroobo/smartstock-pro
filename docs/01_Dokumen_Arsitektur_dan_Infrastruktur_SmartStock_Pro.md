# DOKUMEN ARSITEKTUR DAN INFRASTRUKTUR SMARTSTOCK PRO

## 1. Pendahuluan

Dokumen ini menjelaskan arsitektur perangkat lunak, topologi infrastruktur, kebutuhan server, keamanan infrastruktur, backup, recovery, dan monitoring untuk SmartStock Pro. Dokumen disusun sebagai bagian dari kebutuhan non-fungsional studi kasus BNSP Web Developer.

SmartStock Pro adalah Website Sistem Manajemen Inventaris Multi Gudang berbasis web. Sistem ini digunakan oleh akun internal perusahaan untuk mengelola produk, kategori produk, gudang, supplier, transaksi stok masuk/keluar, stok per gudang, transfer stok antar gudang, import CSV, laporan, audit log, error log, dan dashboard inventaris.

Project menggunakan arsitektur frontend-backend terpisah:

- Frontend: React.js + Vite.
- Backend: Laravel REST API.
- Database: PostgreSQL.
- Authentication: Laravel Sanctum menggunakan Bearer Token.
- Role: `admin`, `warehouse_manager`, `staff`, dan `viewer`.

Sistem saat ini merupakan MVP fungsional untuk studi kasus BNSP. Beberapa fitur lanjutan seperti WebSocket real-time, email notification, Import Excel, FIFO/LIFO batch layer penuh, backend PDF generator, dan monitoring CPU/disk/network asli masih menjadi pengembangan lanjutan.

## 2. Gambaran Umum Arsitektur Sistem

SmartStock Pro menggunakan arsitektur client-server. Browser user menjalankan aplikasi React sebagai Single Page Application, kemudian berkomunikasi dengan Laravel REST API melalui HTTP request menggunakan Bearer Token dari Laravel Sanctum.

Komponen utama sistem:

- **React frontend**: Menyediakan antarmuka login, dashboard, CRUD data master, transaksi stok, transfer stok, import, laporan, status sistem, notifikasi stok kritis, peta gudang, dan role access management.
- **Laravel REST API**: Menangani autentikasi, validasi request, otorisasi role, proses CRUD, transaksi stok, transfer stok antar gudang, audit log, error log, import CSV, report job, dan health check.
- **PostgreSQL database**: Menyimpan data user, produk, kategori, gudang, supplier, transaksi stok, stok per gudang, transfer stok, audit log, error log, import job, report job, dan tabel queue.
- **File storage**: Menyimpan gambar produk dan file laporan hasil background report generation.
- **Laravel Sanctum**: Menangani autentikasi token untuk API. Frontend mengirim token melalui header Authorization Bearer.
- **Role-based access control**: Backend menggunakan `RoleMiddleware`, sedangkan frontend menampilkan menu dan tombol sesuai role user.
- **Queue worker**: Memproses import CSV produk dan background report generation CSV melalui Laravel Queue database driver.

## 3. Diagram Arsitektur Sistem

```text
User Browser
    |
    v
React Frontend (Vite SPA)
    |
    | REST API + Authorization: Bearer Token
    v
Laravel Backend API
    |
    | Eloquent ORM / Query Builder
    v
PostgreSQL Database
    |
    +--> File Storage (gambar produk dan file laporan)
    +--> Audit Log
    +--> Error Log
    +--> Import Jobs
    +--> Report Jobs
    +--> Queue Jobs
```

Penjelasan komponen:

| Komponen | Fungsi |
|---|---|
| User Browser | Media akses pengguna internal melalui browser modern. |
| React Frontend | Menampilkan UI aplikasi, melakukan validasi dasar, mengirim request ke API, dan menyimpan token sesi pada sisi client. |
| Laravel Backend API | Menyediakan endpoint REST, autentikasi, role access, validasi request, business logic inventaris, audit log, error log, import, dan laporan. |
| PostgreSQL Database | Menyimpan data relasional dan mendukung transaksi database untuk proses stok. |
| File Storage | Menyimpan upload gambar produk dan hasil laporan background job. |
| Queue Jobs | Menunda proses berat seperti import CSV dan generate laporan besar agar tidak membebani request utama. |

## 4. Topologi Infrastruktur

Topologi infrastruktur SmartStock Pro dapat dijalankan dalam satu server untuk demo/MVP atau dipisahkan menjadi beberapa server untuk production. Pemisahan server direkomendasikan ketika jumlah user dan volume data meningkat.

Komponen topologi:

- **Client/user**: Browser pengguna internal perusahaan.
- **Frontend hosting**: Server static hosting untuk hasil build React.
- **Backend application server**: Server Laravel API, PHP-FPM, dan web server.
- **Database server**: Server PostgreSQL.
- **Queue worker**: Service worker Laravel untuk memproses import CSV dan report generation.
- **File storage**: Storage lokal atau object storage untuk file upload dan laporan.
- **Network/firewall**: Pembatas akses port frontend, backend, database, dan SSH.
- **Backup storage**: Lokasi backup database, file gambar, dan file laporan.

Diagram topologi sederhana:

```text
Internet / LAN Internal
        |
        v
Firewall / Reverse Proxy
        |
        +------------------------+
        |                        |
        v                        v
Frontend Hosting          Backend API Server
(React static build)      (Nginx/Apache + PHP-FPM)
                                 |
                                 +--> Queue Worker Service
                                 |
                                 +--> File Storage
                                 |
                                 v
                          PostgreSQL Database Server
                                 |
                                 v
                           Backup Storage
```

## 5. Spesifikasi Minimum Server

| Komponen | Spesifikasi Minimum | Rekomendasi | Keterangan |
|---|---:|---:|---|
| CPU | 2 core | 4 core atau lebih | Menangani request API, query database, dan proses queue. |
| RAM | 4 GB | 8 GB atau lebih | Dibutuhkan untuk Laravel, PostgreSQL, web server, dan queue worker. |
| Storage | 50 GB SSD | 100 GB SSD atau lebih | Menyimpan database, log, gambar produk, laporan, dan backup lokal sementara. |
| Bandwidth | 10 Mbps | 50 Mbps atau lebih | Mendukung akses multi-user, upload gambar, export laporan, dan komunikasi API. |
| OS | Linux server 64-bit | Ubuntu Server LTS/Debian stable | Lebih stabil untuk deployment Laravel dan PostgreSQL. |
| Web server | Nginx/Apache | Nginx + PHP-FPM | Melayani Laravel API dan static file bila digabung. |
| PHP runtime | PHP 8.1+ | PHP 8.2+ dengan ekstensi Laravel | Mengikuti kebutuhan Laravel 10. |
| Database server | PostgreSQL | PostgreSQL versi stabil terbaru | Menyimpan data relasional inventaris. |
| Queue worker | 1 worker | 2 worker atau lebih sesuai beban | Memproses import CSV dan report job. |
| Backup storage | Backup manual | Backup otomatis harian dan offsite | Menjaga pemulihan data jika terjadi gangguan. |

## 6. Spesifikasi Lingkungan Development

Lingkungan development digunakan untuk pengembangan, pengujian lokal, dan debugging.

| Komponen | Kebutuhan |
|---|---|
| PHP | PHP 8.1 atau lebih baru. |
| Composer | Dependency manager backend Laravel. |
| Node.js | Runtime frontend React + Vite. |
| NPM | Dependency manager frontend. |
| PostgreSQL | Database lokal untuk pengembangan. |
| Git | Version control, branch fitur, dan rollback kode. |
| VS Code | Editor yang direkomendasikan. |
| Browser modern | Chrome, Edge, Firefox, atau browser lain yang mendukung SPA modern. |
| Laravel artisan | Menjalankan migration, seeder, queue worker, dan server lokal. |
| Queue worker | `php artisan queue:work` untuk memproses import dan report job. |

## 7. Spesifikasi Lingkungan Production

Lingkungan production harus lebih ketat dibandingkan development.

- Menggunakan Linux server.
- Menggunakan Nginx atau Apache sebagai web server.
- Menggunakan PHP-FPM untuk menjalankan Laravel.
- Menggunakan PostgreSQL sebagai database server.
- Mengaktifkan SSL/HTTPS.
- Menjalankan queue worker sebagai service permanen, misalnya melalui Supervisor/systemd.
- Melakukan backup database dan file storage secara berkala.
- Memantau log Laravel, web server, queue worker, dan database.
- Mengatur permission folder `storage/` dan `bootstrap/cache/` agar aman dan dapat ditulis oleh proses aplikasi.
- Menyimpan konfigurasi rahasia di `.env`, bukan di repository.
- Memastikan frontend build diarahkan ke base URL API yang benar.

## 8. Arsitektur Keamanan Infrastruktur

Keamanan infrastruktur SmartStock Pro meliputi beberapa lapisan:

- **HTTPS**: Wajib untuk production agar Bearer Token tidak dikirim melalui koneksi tidak terenkripsi.
- **Firewall**: Membatasi port yang terbuka hanya untuk HTTP/HTTPS dan akses admin yang diperlukan.
- **Pembatasan database**: PostgreSQL sebaiknya hanya dapat diakses dari backend server, bukan publik.
- **Environment variable**: Kredensial database, app key, konfigurasi mail, dan konfigurasi storage disimpan di `.env`.
- **Proteksi `.env`**: File `.env` tidak boleh dapat diakses publik dan tidak boleh di-commit.
- **Backup database**: Backup harian diperlukan untuk pemulihan jika terjadi kerusakan data.
- **Audit log**: Aktivitas penting user dicatat untuk pelacakan.
- **Role access**: Endpoint dilindungi oleh `RoleMiddleware`.
- **Session timeout**: Frontend menyediakan session timeout otomatis untuk mengurangi risiko sesi terbuka terlalu lama.
- **Error log severity**: Error dicatat dengan severity `critical`, `warning`, dan `info`.
- **Rate limiting**: Direkomendasikan untuk login dan endpoint sensitif. Jika belum dikonfigurasi khusus, perlu ditambahkan sebelum production skala besar.

## 9. Backup dan Recovery

Strategi backup dan recovery:

- Backup database PostgreSQL harian menggunakan `pg_dump` atau mekanisme backup terjadwal.
- Backup file gambar produk dari storage.
- Backup file laporan hasil background report generation jika laporan perlu disimpan jangka panjang.
- Simpan backup di lokasi terpisah dari server utama.
- Uji proses restore database secara berkala.
- Gunakan Git untuk rollback aplikasi ke versi stabil sebelumnya.
- Gunakan export CSV laporan sebagai salah satu media arsip data operasional.
- Jika queue job gagal, cek status job, pesan error, log Laravel, kemudian jalankan ulang job setelah penyebab diperbaiki.

Contoh langkah recovery umum:

1. Hentikan sementara akses user jika diperlukan.
2. Ambil backup database dan file storage terakhir yang valid.
3. Restore database ke server PostgreSQL.
4. Restore file storage.
5. Deploy kode versi stabil dari Git.
6. Jalankan migration bila diperlukan.
7. Jalankan queue worker.
8. Verifikasi login, dashboard, produk, stok, transaksi, laporan, dan status sistem.

## 10. Ketersediaan dan Monitoring

SmartStock Pro memiliki fitur status sistem yang dapat digunakan untuk monitoring dasar:

- Health check API melalui endpoint `/api/health`.
- Status koneksi database.
- Response time monitoring.
- Memory usage dan memory peak usage PHP.
- PHP version.
- Server time.
- Uptime status.
- Error log dengan severity.
- Alert jika response time melewati threshold 1000 ms.

Monitoring yang sudah tersedia cocok untuk MVP dan demo BNSP. Untuk production, monitoring perlu diperluas dengan:

- CPU usage.
- Disk usage dan Disk IOPS.
- Network throughput.
- Queue worker uptime.
- Database slow query monitoring.
- Alert ke email atau kanal operasional lain.

## 11. Kesimpulan

Arsitektur SmartStock Pro sudah memisahkan frontend React, backend Laravel REST API, PostgreSQL, file storage, autentikasi Sanctum, role access, dan queue worker. Struktur ini cukup untuk MVP fungsional studi kasus BNSP serta dapat dikembangkan menuju production dengan pemisahan server, penguatan backup, monitoring lanjutan, HTTPS, service queue yang stabil, dan hardening keamanan infrastruktur.
