const jwt = require("jsonwebtoken");
const JWT_SECRET = "RahasiaTokenJWT123";

function evaluatePolicy(req, dbUserContext) {
  const { method, path, headers } = req;
  const deviceId = headers["x-device-id"];
  const authHeader = headers["authorization"];

  // Bypass untuk endpoint login
  if (path === "/auth/login") {
    return { allow: true, reason: "Public auth endpoint" };
  }

  if (!authHeader)
    return { allow: false, reason: "Missing Authorization header" };
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 1. Validasi Perangkat (Kecuali Panggilan Antar-Service)
    if (decoded.role !== "service") {
      if (!deviceId || dbUserContext.registeredDeviceId !== deviceId) {
        return {
          allow: false,
          reason: "Device ID tidak cocok atau tidak terdaftar",
        };
      }
    }

    // 2. Validasi Jam Akses Konten (Pukul 07.00 - 21.00) untuk Nilai & Finalisasi
    if (path.startsWith("/nilai") || path.includes("/finalisasi")) {
      const currentHour = new Date().getHours();
      if (currentHour < 7 || currentHour >= 21) {
        return {
          allow: false,
          reason: "Akses ditolak di luar jam operasional (07:00-21:00)",
        };
      }
    }

    // 3. Kontrol Akses Berdasarkan Peran & Endpoint (RBAC & Kepemilikan Data)
    if (path.startsWith("/nilai") && method === "PUT") {
      if (decoded.role !== "Dosen")
        return {
          allow: false,
          reason: "Hanya Dosen yang dapat mengubah nilai",
        };
    }

    if (path.includes("/finalisasi")) {
      if (decoded.role !== "Dosen")
        return {
          allow: false,
          reason: "Hanya Dosen yang dapat melakukan finalisasi kelas",
        };
    }

    if (path.startsWith("/transkrip/sinkron")) {
      if (decoded.role !== "service")
        return {
          allow: false,
          reason: "Hanya token service yang diizinkan melakukan sinkronisasi",
        };
    }

    return { allow: true, reason: "Authorized", user: decoded };
  } catch (err) {
    return { allow: false, reason: "Invalid or expired token" };
  }
}

module.exports = { evaluatePolicy };
