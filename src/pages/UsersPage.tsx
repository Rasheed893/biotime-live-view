import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchUsers } from "@/lib/api";
import { users as fallbackUsers, type User } from "@/data/mockData";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(fallbackUsers);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers(fallbackUsers));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.userID.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Users</h1>
        <Input
          placeholder="Search users..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u) => (
          <Card key={u.userID}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{u.userName}</p>
                <Badge variant={u.status === "Active" ? "default" : "outline"}>{u.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">ID: {u.userID}</p>
              <p className="text-sm">{u.jobTitle}</p>
              <p className="text-xs text-muted-foreground">{u.department}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
