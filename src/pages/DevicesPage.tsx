import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fetchDevices } from "@/lib/api";
import { devices as fallbackDevices, type Device } from "@/data/mockData";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(fallbackDevices);

  useEffect(() => {
    fetchDevices().then(setDevices).catch(() => setDevices(fallbackDevices));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Devices</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((d) => (
          <Card key={d.deviceID}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.deviceName}</p>
                <Badge variant={d.status === "Online" ? "default" : "outline"}>{d.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">ID: {d.deviceID}</p>
              <p className="text-xs font-mono">IP: {d.ipAddress}</p>
              <p className="text-xs font-mono">SN: {d.serialNumber}</p>
              <p className="text-xs text-muted-foreground">Last seen {formatDistanceToNow(d.lastSeen, { addSuffix: true })}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
