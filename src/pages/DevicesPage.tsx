import { type FormEvent, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { createDevice, fetchDevices } from "@/lib/api";
import { devices as fallbackDevices, type Device } from "@/data/mockData";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(fallbackDevices);
  const [form, setForm] = useState({
    deviceID: "",
    deviceName: "",
    ipAddress: "",
    serialNumber: "",
    status: "Online" as Device["status"],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices()
      .then(setDevices)
      .catch(() => setDevices(fallbackDevices));
  }, []);

  async function handleAddDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const created = await createDevice(form);
      setDevices((prev) => [created, ...prev]);
      setForm({
        deviceID: "",
        deviceName: "",
        ipAddress: "",
        serialNumber: "",
        status: "Online",
      });
    } catch {
      setError("Unable to add device. Please check API/database connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Devices</h1>
      <Card>
        <CardContent className="p-4">
          <form className="space-y-3" onSubmit={handleAddDevice}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Device</h2>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Adding..." : "Add Device"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <Input
                required
                placeholder="Device ID"
                value={form.deviceID}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deviceID: e.target.value }))
                }
              />
              <Input
                required
                placeholder="Device Name"
                value={form.deviceName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deviceName: e.target.value }))
                }
              />
              <Input
                required
                placeholder="IP Address"
                value={form.ipAddress}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ipAddress: e.target.value }))
                }
              />
              <Input
                required
                placeholder="Serial Number"
                value={form.serialNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, serialNumber: e.target.value }))
                }
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as Device["status"],
                  }))
                }
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((d) => (
          <Card key={d.deviceID}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{d.deviceName}</p>
                <Badge variant={d.status === "Online" ? "default" : "outline"}>
                  {d.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">ID: {d.deviceID}</p>
              <p className="text-xs font-mono">IP: {d.ipAddress}</p>
              <p className="text-xs font-mono">SN: {d.serialNumber}</p>
              <p className="text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(d.lastSeen, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
