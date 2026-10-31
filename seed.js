const Database = require("better-sqlite3");
const db = new Database("databse.db");

// Buat Tabel Utama
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    registered_device_id TEXT
  );

  CREATE TABLE IF NOT EXISTS kelas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kelas TEXT,
    dosen_pengampu TEXT
  );

  CREATE TABLE IF NOT EXISTS nilai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nim TEXT,
    kode_kelas INTEGER,
    nilai TEXT,
    is_final INTEGER DEFAULT 0
  );
`);

// Masukkan Data Awal (Seed Data minimal sesuai Ketentuan Poin 5)
const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (username, password, role, registered_device_id) VALUES (?, ?, ?, ?)",
);
insertUser.run("admin1", "password123", "Admin", "device-admin-1");
insertUser.run("dosen1", "password123", "Dosen", "device-dosen-1");
insertUser.run("dosen2", "password123", "Dosen", "device-dosen-2");
insertUser.run("mhs1", "password123", "Mahasiswa", "device-mhs-1");
insertUser.run("mhs2", "password123", "Mahasiswa", "device-mhs-2");
insertUser.run("mhs3", "password123", "Mahasiswa", "device-mhs-3");

const insertKelas = db.prepare(
  "INSERT OR IGNORE INTO kelas (nama_kelas, dosen_pengampu) VALUES (?, ?)",
);
insertKelas.run("Informatika A", "dosen1");
insertKelas.run("Informatika B", "dosen2");

console.log("Database dan data awal sukses dibuat!");
db.close();
