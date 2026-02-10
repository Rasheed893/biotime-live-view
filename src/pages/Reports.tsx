import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fetchLogs, fetchUsers } from "@/lib/api";
import { generateHistoricalLogs, users as fallbackUsers, type AttendanceLog, type User } from "@/data/mockData";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { Download, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Reports() {
  const [allLogs, setAllLogs] = useState<AttendanceLog[]>(() => generateHistoricalLogs());
  const [users, setUsers] = useState<User[]>(fallbackUsers);

  useEffect(() => {
    fetchLogs({ limit: 2000 }).then(setAllLogs).catch(() => setAllLogs(generateHistoricalLogs()));
    fetchUsers().then(setUsers).catch(() => setUsers(fallbackUsers));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="user">Per-User Report</TabsTrigger>
        </TabsList>
        <TabsContent value="daily"><DailyReport logs={allLogs} /></TabsContent>
        <TabsContent value="user"><UserReport logs={allLogs} users={users} /></TabsContent>
      </Tabs>
    </div>
  );
}

function DailyReport({ logs }: { logs: AttendanceLog[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const report = useMemo(() => {
    if (!date) return [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dayLogs = logs.filter((l) => l.eventDateTime >= dayStart && l.eventDateTime <= dayEnd);

    const grouped = new Map<string, AttendanceLog[]>();
    dayLogs.forEach((l) => {
      const arr = grouped.get(l.userID) || [];
      arr.push(l);
      grouped.set(l.userID, arr);
    });

    return Array.from(grouped.entries()).map(([uid, ul]) => {
      ul.sort((a, b) => a.eventDateTime.getTime() - b.eventDateTime.getTime());
      return {
        UserID: uid,
        UserName: ul[0].userName,
        FirstIn: format(ul[0].eventDateTime, "HH:mm:ss"),
        LastOut: format(ul[ul.length - 1].eventDateTime, "HH:mm:ss"),
        TotalEvents: ul.length,
      };
    });
  }, [logs, date]);

  return (
    <div className="space-y-3 mt-3">
      <div className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-[150px] justify-start text-left text-xs")}>
                <CalendarIcon className="h-3 w-3 mr-1" />
                {date ? format(date, "MMM dd, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(report as any, "daily-report")}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToExcel(report as any, "daily-report")}>
          <Download className="h-4 w-4 mr-1" /> Excel
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>First In</TableHead>
              <TableHead>Last Out</TableHead>
              <TableHead>Events</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No data for selected date</TableCell></TableRow>
            ) : (
              report.map((r) => (
                <TableRow key={r.UserID}>
                  <TableCell className="text-xs font-mono">{r.UserID}</TableCell>
                  <TableCell className="text-sm">{r.UserName}</TableCell>
                  <TableCell className="text-xs">{r.FirstIn}</TableCell>
                  <TableCell className="text-xs">{r.LastOut}</TableCell>
                  <TableCell className="text-xs font-medium">{r.TotalEvents}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function UserReport({ logs, users }: { logs: AttendanceLog[]; users: User[] }) {
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (selectedUser !== "all" && l.userID !== selectedUser) return false;
      if (dateFrom && l.eventDateTime < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (l.eventDateTime > end) return false;
      }
      return true;
    });
  }, [logs, selectedUser, dateFrom, dateTo]);

  const flatForExport = filtered.map((l) => ({
    EventTime: l.eventDateTime,
    UserID: l.userID,
    UserName: l.userName,
    DeviceName: l.deviceName,
    EventType: l.eventType,
  }));

  return (
    <div className="space-y-3 mt-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">User</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => <SelectItem key={u.userID} value={u.userID}>{u.userName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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
        <Button variant="outline" size="sm" onClick={() => exportToCSV(flatForExport as any, "user-report")}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToExcel(flatForExport as any, "user-report")}>
          <Download className="h-4 w-4 mr-1" /> Excel
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Event Time</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>
            ) : (
              filtered.slice(0, 50).map((l) => (
                <TableRow key={l.logID}>
                  <TableCell className="text-xs whitespace-nowrap">{format(l.eventDateTime, "yyyy-MM-dd HH:mm:ss")}</TableCell>
                  <TableCell className="text-xs font-mono">{l.userID}</TableCell>
                  <TableCell className="text-xs">{l.userName}</TableCell>
                  <TableCell className="text-xs">{l.deviceName}</TableCell>
                  <TableCell className="text-xs">{l.eventType}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {filtered.length > 50 && <p className="text-xs text-muted-foreground">Showing 50 of {filtered.length} records. Export for full data.</p>}
    </div>
  );
}
