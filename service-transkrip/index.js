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
      .json({ message: "Invalid token verified by Service Transkrip" });
  }
});

// Endpoint Sinkronisasi Nilai Khusus Panggilan Antar-Service
app.post("/sinkron", (req, res) => {
  if (req.user.role !== "service") {
    return res.status(403).json({
      message: "Forbidden: Hanya diizinkan untuk token ber-role service",
    });
  }

  const { nim, kode_mk, nilai } = req.body;
  console.log(
    `[DATA TRANSKRIP SINKRON] Sukses mencatat Nilai ${nilai} untuk NIM ${nim}.`,
  );
  res.json({
    status: "Success",
    message: "Sinkronisasi ke data transkrip mahasiswa berhasil dilakukan",
  });
});

app.listen(3002, () => console.log("Service Transkrip berjalan di port 3002"));
