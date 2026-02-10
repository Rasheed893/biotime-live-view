# BioTime Live View

React + Vite dashboard for attendance monitoring.

## Run the frontend

```sh
npm install
npm run dev
```

The frontend runs on `http://localhost:8080` and calls API routes under `/api`.

## SQL Server integration

The UI now loads users/devices/logs from HTTP API endpoints.

### 1) Frontend env

Create `.env`:

```env
VITE_API_BASE_URL=/api
```

> In local dev, Vite proxies `/api` to `http://localhost:4000`.

### 2) API env

Create `.env` for the API server:

```env
API_PORT=4000
DB_SERVER=YOUR_SQL_HOST
DB_DATABASE=DummyRemoteMessages
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### 3) Run API

```sh
node server.js
```

## Expected SQL tables (adapted to your schema)

The included `server.js` now matches these tables:

- `dbo.Users`
  - `UserID`, `UserName`, `Department`, `JobTitle`, `Status`
- `dbo.Devices`
  - `DeviceID`, `DeviceName`, `IPAddress`, `SerialNumber`, `LastSeen`, `Status`
- `dbo.AttendanceLogs`
  - `LogID`, `UserID`, `UserName`, `DeviceID`, `DeviceName`, `DeviceIP`, `EventType`, `EventDateTime`, `EventStatus`, `TerminalSerial`, `ReceivedAt`
- `dbo.RemoteMessages` (optional endpoint)
  - `MessageID`, `ReceivedAtUtc`, `SourceIP`, `SourcePort`, `Protocol`, `Identifier`, `RawLength`, `RawData`, `TerminalSerial`, `EventDateTime`, `EventStatus`, `UserID`, `AttendanceStatus`, `Notes`

## API routes used by UI

- `GET /api/users`
- `GET /api/devices`
- `GET /api/logs?limit=500&from=...&to=...&userId=...&deviceId=...&eventType=...`
- `GET /api/health`

Extra route (for diagnostics/raw data):

- `GET /api/remote-messages?limit=200`

## Notes

- If API is unavailable, UI pages still gracefully fall back to mock data.
- Real-time screen polls `/api/logs` periodically.
