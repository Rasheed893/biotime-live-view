
# BioTime Attendance — Implementation Plan

## Branding & Theme
- Apply BioTime color palette: **Primary Blue (#2196F3 / Cyan)**, light background, modern flat UI
- Embed the uploaded BioTime logo (with text changed to "BioTime Attendance")
- Tagline: *Real-Time Time & Attendance Monitoring*
- Clean, professional, dashboard-style layout

## Pages & Navigation
Sidebar navigation with the BioTime logo at the top:

### 1. **Dashboard** (Home)
- KPI cards: Total Events Today, Active Devices, Last Event Time, Total Users
- Mini chart showing events over the last 24 hours
- Quick status indicators for device health

### 2. **Real-Time Log Stream** ⭐ Core Feature
- Live-updating table with simulated attendance events appearing every ~1 second
- Fields: Event Time, User ID, User Name, Device Name, Device IP, Event Type, Event Status, Terminal Serial
- New rows highlighted with a brief animation/glow effect
- Manual refresh button + auto-refresh indicator
- Efficient virtualized rendering for large datasets
- Export to CSV/Excel button

### 3. **Historical Logs**
- Full attendance log table with filters:
  - Date range picker
  - User filter (dropdown)
  - Device filter (dropdown)
  - Event type filter
- Pagination
- Export to CSV/Excel

### 4. **Users** (Read-Only Directory)
- Table of users: User ID, Name, Department, Job Title, Status (Active/Inactive)
- Search/filter by name or department
- Status badges (green for Active, gray for Inactive)

### 5. **Devices**
- Table of biometric readers: Device Name, IP Address, Serial Number, Last Seen, Status
- Online/Offline status indicators (green dot / red dot)

### 6. **Reports**
- **Daily Attendance Report**: Filter by date, grouped by user, showing first-in/last-out and total event count
- **Per-User Report**: Select a user, pick date range, see all their events
- Export buttons for both report types

## Mock Data
- All data will be generated with realistic mock/seed data (no backend needed)
- The real-time stream will simulate new events arriving every second using JavaScript intervals
- Data structures will mirror the SQL schema from the PRD for easy future backend integration

## Export
- CSV and Excel (XLSX) export available on log tables and reports
- Uses client-side generation (no server needed)

## Technical Notes
- Frontend-only React app with mock data services separated into their own module for easy future SQL/API swap
- Responsive design (works on desktop and tablet)
- No authentication, no Supabase
