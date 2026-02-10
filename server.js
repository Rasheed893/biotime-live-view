import "dotenv/config";
import express from "express";
import cors from "cors";
import sql from "mssql";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log("Connected to SQL Server");
        return pool;
      })
      .catch((error) => {
        poolPromise = undefined;
        throw error;
      });
  }
  return poolPromise;
}

function toIsoDateInput(value, endOfDay = false) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d;
}

app.get("/api/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 as ok");
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        CAST(UserID as varchar(100)) AS userID,
        UserName AS userName,
        Department AS department,
        JobTitle AS jobTitle,
        CASE WHEN IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS status
      FROM dbo.Users
      ORDER BY UserName ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/devices", async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        CAST(DeviceID as varchar(100)) AS deviceID,
        DeviceName AS deviceName,
        IPAddress AS ipAddress,
        SerialNumber AS serialNumber,
        LastSeen AS lastSeen,
        CASE WHEN IsOnline = 1 THEN 'Online' ELSE 'Offline' END AS status
      FROM dbo.Devices
      ORDER BY DeviceName ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 500), 2000);
    const fromDate = toIsoDateInput(req.query.from);
    const toDate = toIsoDateInput(req.query.to, true);

    const pool = await getPool();
    const request = pool.request();
    request.input("limit", sql.Int, limit);

    let where = "WHERE 1=1";
    if (fromDate) {
      where += " AND l.EventDateTime >= @fromDate";
      request.input("fromDate", sql.DateTime2, fromDate);
    }
    if (toDate) {
      where += " AND l.EventDateTime <= @toDate";
      request.input("toDate", sql.DateTime2, toDate);
    }
    if (req.query.userId && req.query.userId !== "all") {
      where += " AND CAST(l.UserID as varchar(100)) = @userId";
      request.input("userId", sql.VarChar(100), String(req.query.userId));
    }
    if (req.query.deviceId && req.query.deviceId !== "all") {
      where += " AND CAST(l.DeviceID as varchar(100)) = @deviceId";
      request.input("deviceId", sql.VarChar(100), String(req.query.deviceId));
    }
    if (req.query.eventType && req.query.eventType !== "all") {
      where += " AND l.EventType = @eventType";
      request.input("eventType", sql.VarChar(50), String(req.query.eventType));
    }

    const result = await request.query(`
      SELECT TOP (@limit)
        CAST(l.LogID as varchar(100)) AS logID,
        CAST(l.UserID as varchar(100)) AS userID,
        u.UserName AS userName,
        CAST(l.DeviceID as varchar(100)) AS deviceID,
        d.DeviceName AS deviceName,
        d.IPAddress AS deviceIP,
        l.EventType AS eventType,
        l.EventDateTime AS eventDateTime,
        CASE WHEN l.IsRealtime = 1 THEN 'Real-time' ELSE 'Offline' END AS eventStatus,
        d.SerialNumber AS terminalSerial,
        l.ReceivedAt AS receivedAt
      FROM dbo.AttendanceLogs l
      LEFT JOIN dbo.Users u ON u.UserID = l.UserID
      LEFT JOIN dbo.Devices d ON d.DeviceID = l.DeviceID
      ${where}
      ORDER BY l.EventDateTime DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
