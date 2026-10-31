const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

const GATEWAY_SECRET = "RahasiaSuperGateway123";
const JWT_SECRET = "RahasiaTokenJWT123";

// Middleware Validasi Ulang (Never Trust, Always Verify)
app.use((req, res, next) => {
  const gatewaySecret = req.headers["x-gateway-secret"];
  const authHeader = req.headers["authorization"];

  if (!gatewaySecret || gatewaySecret !== GATEWAY_SECRET) {
    return res.status(401).json({
      message: "Direct access prohibited. Must go through API Gateway.",
    });
  }

  if (!authHeader) return res.status(401).json({ message: "Missing token" });
  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token verified by Service" });
  }
});

// Endpoint Mengubah Nilai (PUT /nilai/:id -> masuk ke service sebagai PUT /:id)
app.put("/:id", (req, res) => {
  res.json({ message: "Nilai berhasil diubah secara aman" });
});

// Alur Finalisasi Nilai yang Memicu Panggilan Antar-Service
app.post("/kelas/:id/finalisasi", async (req, res) => {
  try {
    // Terbitkan Token Service
    const serviceToken = jwt.sign(
      { sub: "service-nilai", role: "service" },
      JWT_SECRET,
      { expiresIn: "5m" },
    );

    console.log(
      `[SERVICE CALL] Menembak Service Transkrip lewat Gateway menggunakan Token Service.`,
    );

    // Melakukan panggilan antar-layanan (Meneruskan sinkronisasi nilai ke port 3002 lewat Gateway)
    const response = await fetch("http://localhost:3000/transkrip/sinkron", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ nim: "mhs1", kode_mk: "INF-01", nilai: "A" }),
    });

    const result = await response.json();
    res.json({
      message: "Kelas berhasil difinalisasi dan terkirim ke transkrip",
      detail: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log("Service Nilai berjalan di port 3001"));
