# BioTime Live View

React + Vite dashboard for BioTime attendance monitoring.

## Run the frontend

```sh
npm install
npm run dev
```

The frontend runs on `http://localhost:8080` and calls API routes under `/api`.

## SQL Server integration

This app now reads data from HTTP endpoints instead of only dummy generators.

### 1) Configure API URL (frontend)

Create `.env`:

```env
VITE_API_BASE_URL=/api
```

> During local development, Vite proxies `/api` to `http://localhost:4000`.

### 2) Start an API service connected to SQL Server

A starter API is included in `server.js` (Express + `mssql`).

Create `.env` for the API:

```env
API_PORT=4000
DB_SERVER=YOUR_SQL_HOST
DB_DATABASE=YOUR_DB_NAME
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

Run the API (install dependencies first in your environment):

```sh
node server.js
```

### 3) Required SQL tables/columns (default mapping)

The starter API expects:

- `dbo.Users`:
  - `UserID`, `UserName`, `Department`, `JobTitle`, `IsActive`
- `dbo.Devices`:
  - `DeviceID`, `DeviceName`, `IPAddress`, `SerialNumber`, `LastSeen`, `IsOnline`
- `dbo.AttendanceLogs`:
  - `LogID`, `UserID`, `DeviceID`, `EventType`, `EventDateTime`, `IsRealtime`, `ReceivedAt`

If your schema differs, update the SQL queries in `server.js`.

## API routes used by UI

- `GET /api/users`
- `GET /api/devices`
- `GET /api/logs?limit=500&from=...&to=...&userId=...&deviceId=...&eventType=...`
- `GET /api/health`

## Notes

- The UI keeps mock-data fallback behavior if API calls fail, so screens stay usable during setup.
- Real-time log now polls API logs periodically instead of generating only random records.
