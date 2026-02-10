import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { generateHistoricalLogs, users, devices, type AttendanceLog, type EventType } from "@/data/mockData";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { Download, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function HistoricalLogs() {
  const [allLogs] = useState<AttendanceLog[]>(() => generateHistoricalLogs());
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [userFilter, setUserFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allLogs.filter((l) => {
      if (dateFrom && l.eventDateTime < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (l.eventDateTime > end) return false;
      }
      if (userFilter !== "all" && l.userID !== userFilter) return false;
      if (deviceFilter !== "all" && l.deviceID !== deviceFilter) return false;
      if (typeFilter !== "all" && l.eventType !== typeFilter) return false;
      return true;
    });
  }, [allLogs, dateFrom, dateTo, userFilter, deviceFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const flatForExport = filtered.map((l) => ({
    LogID: l.logID,
    EventTime: l.eventDateTime,
    UserID: l.userID,
    UserName: l.userName,
    DeviceName: l.deviceName,
    DeviceIP: l.deviceIP,
    EventType: l.eventType,
    EventStatus: l.eventStatus,
    TerminalSerial: l.terminalSerial,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Historical Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(flatForExport as any, "historical-logs")}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(flatForExport as any, "historical-logs")}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-[130px] justify-start text-left text-xs", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="h-3 w-3 mr-1" />
                {dateFrom ? format(dateFrom, "MMM dd") : "Start"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-[130px] justify-start text-left text-xs", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="h-3 w-3 mr-1" />
                {dateTo ? format(dateTo, "MMM dd") : "End"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">User</label>
          <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => <SelectItem key={u.userID} value={u.userID}>{u.userName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Device</label>
          <Select value={deviceFilter} onValueChange={(v) => { setDeviceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              {devices.map((d) => <SelectItem key={d.deviceID} value={d.deviceID}>{d.deviceName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Attendance">Attendance</SelectItem>
              <SelectItem value="Access Granted">Access Granted</SelectItem>
              <SelectItem value="Access Denied">Access Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Event Time</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Device IP</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terminal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((log) => (
              <TableRow key={log.logID}>
                <TableCell className="whitespace-nowrap text-xs">{format(log.eventDateTime, "yyyy-MM-dd HH:mm:ss")}</TableCell>
                <TableCell className="text-xs">{log.userID}</TableCell>
                <TableCell className="text-xs">{log.userName}</TableCell>
                <TableCell className="text-xs">{log.deviceName}</TableCell>
                <TableCell className="text-xs font-mono">{log.deviceIP}</TableCell>
                <TableCell>
                  <Badge variant={log.eventType === "Access Denied" ? "destructive" : "secondary"} className="text-[10px]">{log.eventType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={log.eventStatus === "Real-time" ? "default" : "outline"} className="text-[10px]">{log.eventStatus}</Badge>
                </TableCell>
                <TableCell className="text-xs font-mono">{log.terminalSerial}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} records</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="flex items-center px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
