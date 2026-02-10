import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { devices } from "@/data/mockData";
import { format } from "date-fns";

export default function DevicesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Devices</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Status</TableHead>
              <TableHead>Device Name</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((d) => (
              <TableRow key={d.deviceID}>
                <TableCell>
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${d.status === "Online" ? "bg-success" : "bg-destructive"}`} />
                </TableCell>
                <TableCell className="text-sm font-medium">{d.deviceName}</TableCell>
                <TableCell className="text-xs font-mono">{d.ipAddress}</TableCell>
                <TableCell className="text-xs font-mono">{d.serialNumber}</TableCell>
                <TableCell className="text-xs">{format(d.lastSeen, "yyyy-MM-dd HH:mm:ss")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
