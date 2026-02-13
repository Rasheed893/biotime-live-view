import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLogs } from "@/lib/api";
import { generateNewLog, type AttendanceLog } from "@/data/mockData";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { RefreshCw, Download, Radio } from "lucide-react";
import { format } from "date-fns";

const MAX_ROWS = 500;

export default function RealTimeLog() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [running, setRunning] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }

  useEffect(() => {
    if (!running) return;

    const poll = async () => {
      try {
        const latest = await fetchLogs({ limit: MAX_ROWS });
        const normalized = latest.filter((item) =>
          isValidDate(item.eventDateTime),
        );

        setLogs((previous) => {
          if (normalized.length === 0 && previous.length > 0) {
            return previous;
          }

          const previousIds = new Set(previous.map((item) => item.logID));
          const incoming = normalized
            .filter((item) => !previousIds.has(item.logID))
            .map((item) => item.logID);

          if (incoming.length) {
            setNewIds((prev) => {
              const s = new Set(prev);
              incoming.forEach((id) => s.add(id));
              return s;
            });

            setTimeout(() => {
              setNewIds((prev) => {
                const s = new Set(prev);
                incoming.forEach((id) => s.delete(id));
                return s;
              });
            }, 2000);
          }

          return normalized.slice(0, MAX_ROWS);
        });
      } catch {
        const log = generateNewLog();
        setLogs((prev) => [log, ...prev].slice(0, MAX_ROWS));
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [running]);

  const flatLogs = logs.map((l) => ({
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
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Real-Time Log</h1>
          {running && (
            <Badge
              variant="default"
              className="gap-1 bg-success text-success-foreground"
            >
              <Radio className="h-3 w-3 animate-pulse" /> Live
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRunning(!running)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${running ? "animate-spin" : ""}`}
            />
            {running ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(flatLogs as any, "realtime-log")}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(flatLogs as any, "realtime-log")}
          >
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
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
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Waiting for events…
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow
                  key={log.logID}
                  className={
                    newIds.has(log.logID) ? "animate-row-highlight" : ""
                  }
                >
                  <TableCell className="whitespace-nowrap text-xs">
                    {/* This ignores the browser timezone and shows the "raw" value */}
                    {log.eventDateTime
                      .toISOString()
                      .replace("T", " ")
                      .substring(0, 19)}
                  </TableCell>
                  <TableCell className="text-xs">{log.userID}</TableCell>
                  <TableCell className="text-xs">{log.userName}</TableCell>
                  <TableCell className="text-xs">{log.deviceName}</TableCell>
                  <TableCell className="text-xs font-mono">
                    {log.deviceIP}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.eventType === "Access Denied"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {log.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.eventStatus === "Real-time" ? "default" : "outline"
                      }
                      className="text-[10px]"
                    >
                      {log.eventStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {log.terminalSerial || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {logs.length} events captured
      </p>
    </div>
  );
}
