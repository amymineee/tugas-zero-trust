# Tugas Praktikum Individu - Zero Trust Security

**Nama: Aam Aminah**
**Npm: 247006111205**
**Mata Kuliah: Keamanan Informasi**
**Program Studi: Informatika - Universitas Siliwangi**

Proyek ini mengimplementasikan prinsip _Zero Trust Security_ (_Never Trust, Always Verify, Least Privilege, Assume Breach_) di level aplikasi dengan membangun API Gateway sebagai _Policy Enforcement Point_ (PEP) terpisah sesuai standar NIST SP 800-207.

## Cara Menjalankan Aplikasi

### 1. Install Dependencies

Buka terminal utama di folder proyek, lalu jalankan:

```bash
npm install express http-proxy-middleware jsonwebtoken better-sqlite3 dotenv
```

### 2. Inisialisasi Database (Seed Data)

Jalankan skrip berikut untuk membuat database `databse.db` beserta data awal otomatis:

```bash
node seed.js
```

### 3. Jalankan Arsitektur Sistem

Buka 3 tab terminal terpisah di VS Code, lalu jalankan masing-masing perintah berikut:

- **Terminal 1 (API Gateway - Port 3000):** `node gateway/index.js`
- **Terminal 2 (Service Nilai - Port 3001):** `node service-nilai/index.js`
- **Terminal 3 (Service Transkrip - Port 3002):** `node service-transkrip/index.js`

---

## Daftar Akun & Data Awal (Seed Data)

Sesuai dengan ketentuan praktikum, berikut adalah akun dan perangkat (_Device ID_) yang telah terdaftar di dalam sistem:

| Username   | Password    | Role      | Registered Device ID |
| :--------- | :---------- | :-------- | :------------------- |
| **admin1** | password123 | Admin     | `device-admin-1`     |
| **dosen1** | password123 | Dosen     | `device-dosen-1`     |
| **dosen2** | password123 | Dosen     | `device-dosen-2`     |
| **mhs1**   | password123 | Mahasiswa | `device-mhs-1`       |
| **mhs2**   | password123 | Mahasiswa | `device-mhs-2`       |
| **mhs3**   | password123 | Mahasiswa | `device-mhs-3`       |

---

## Perintah Pengujian (PowerShell Windows)

### 1. Login Akun Dosen (Mendapatkan Token JWT)

```CMD
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -H "X-Device-ID: device-dosen-1" -d "{\"username\":\"dosen1\",\"password\":\"password123\"}"
```

### 2. Mengubah Nilai Melalui Gateway (ALLOW)

```CMD
curl -X PUT http://localhost:3000/nilai/1 -H "Authorization: Bearer PASTE_TOKEN_BARU" -H "X-Device-ID: device-dosen-1" -H "Content-Type: application/json" -d "{\"nilai\":\"A\"}"
```

### 3. Uji jalur finalisasi

```CMD
curl -X POST http://localhost:3000/nilai/kelas/1/finalisasi -H "Authorization: Bearer PASTE_TOKEN_BARU" -H "X-Device-ID: device-dosen-1" -H "Content-Type: application/json"
```

### 4. Uji Pertahanan

```CMD
curl -X PUT http://localhost:3000/nilai/1 -H "Authorization: Bearer PASTE_TOKEN_BARU" -H "X-Device-ID: device-hacker-palsu" -H "Content-Type: application/json" -d "{\"nilai\":\"A\"}"
```

### 5. Uji Proteksi Serangan Pintas

```CMD
curl -X PUT http://localhost:3001/1 -H "Content-Type: application/json" -d "{\"nilai\":\"A\"}"
```