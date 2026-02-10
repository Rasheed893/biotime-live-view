import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { users, devices, generateHistoricalLogs, type AttendanceLog } from "@/data/mockData";
import { Activity, HardDrive, Clock, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subHours, isAfter } from "date-fns";

export default function Dashboard() {
  const [logs] = useState<AttendanceLog[]>(() => generateHistoricalLogs());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter((l) => l.eventDateTime >= today);
  const activeDevices = devices.filter((d) => d.status === "Online").length;
  const lastEvent = logs.length > 0 ? logs[0].eventDateTime : null;

  // Chart: events per hour for last 24h
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hour = subHours(new Date(), 23 - i);
    const start = new Date(hour);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      hour: format(start, "HH:mm"),
      events: logs.filter((l) => l.eventDateTime >= start && l.eventDateTime < end).length,
    };
  });

  const kpis = [
    { label: "Events Today", value: todayLogs.length, icon: Activity, color: "text-primary" },
    { label: "Active Devices", value: `${activeDevices}/${devices.length}`, icon: HardDrive, color: "text-success" },
    { label: "Last Event", value: lastEvent ? format(lastEvent, "HH:mm:ss") : "—", icon: Clock, color: "text-accent" },
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events — Last 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="events" fill="hsl(207 90% 54%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {devices.map((d) => (
              <div key={d.deviceID} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <span className={`h-2.5 w-2.5 rounded-full ${d.status === "Online" ? "bg-success" : "bg-destructive"}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{d.deviceName}</p>
                  <p className="text-[10px] text-muted-foreground">{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
