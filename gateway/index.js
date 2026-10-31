const express = require("express");
const httpProxy = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const { evaluatePolicy } = require("./policy");

const app = express();
const db = new Database("databse.db");

const GATEWAY_SECRET = "RahasiaSuperGateway123";
const JWT_SECRET = "RahasiaTokenJWT123";

// Endpoint Login (POST /auth/login)
app.post("/auth/login", express.json(), (req, res) => {
  const { username, password } = req.body;
  const deviceId = req.headers["x-device-id"];

  try {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
      .get(username, password);

    if (!user) {
      return res.status(401).json({ message: "Kredensial salah" });
    }

    if (!deviceId || user.registered_device_id !== deviceId) {
      return res
        .status(403)
        .json({ message: "Device tidak terdaftar untuk user ini" });
    }

    const token = jwt.sign(
      { sub: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.json({ access_token: token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Middleware Pengecekan Zero Trust & Audit Logging
app.use(async (req, res, next) => {
  const deviceId = req.headers["x-device-id"];
  let dbUserContext = { registeredDeviceId: null };

  if (deviceId) {
    const user = db
      .prepare(
        "SELECT registered_device_id FROM users WHERE registered_device_id = ?",
      )
      .get(deviceId);
    if (user) {
      dbUserContext.registeredDeviceId = user.registered_device_id;
    }
  }

  const decision = evaluatePolicy(req, dbUserContext);

  // Poin 4.4: Cetak Audit Log Ke Konsol Terpusat
  console.log(
    `[AUDIT LOG] ${new Date().toISOString()} | Sub: ${decision.user?.sub || "Unknown"} | Endpoint: ${req.path} | Device: ${req.headers["x-device-id"] || "None"} | Hasil: ${decision.allow ? "ALLOW" : "DENY"} | Alasan: ${decision.reason}`,
  );

  if (!decision.allow) {
    return res
      .status(403)
      .json({ message: "Access Denied", reason: decision.reason });
  }

  // Menyuntikkan X-Gateway-Secret secara internal sebelum masuk ke proxy
  req.headers["x-gateway-secret"] = GATEWAY_SECRET;
  next();
});

// Konfigurasi Proxy dengan Meneruskan Header Otorisasi Secara Utuh
const proxyOptions = {
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers["authorization"]) {
      proxyReq.setHeader("Authorization", req.headers["authorization"]);
    }
  },
};

app.use(
  "/nilai",
  httpProxy.createProxyMiddleware({
    target: "http://localhost:3001",
    ...proxyOptions,
  }),
);
app.use(
  "/transkrip",
  httpProxy.createProxyMiddleware({
    target: "http://localhost:3002",
    ...proxyOptions,
  }),
);

app.listen(3000, () => console.log("API Gateway (PEP) berjalan di port 3000"));
