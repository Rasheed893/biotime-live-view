import { type FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createUser, fetchUsers } from "@/lib/api";
import { users as fallbackUsers, type User } from "@/data/mockData";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(fallbackUsers);
  const [form, setForm] = useState({
    userID: "",
    userName: "",
    department: "",
    jobTitle: "",
    status: "Active" as User["status"],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers(fallbackUsers));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.userID.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ userID: "", userName: "", department: "", jobTitle: "", status: "Active" });
    } catch {
      setError("Unable to add user. Please check API/database connection.");
    } finally {
      setIsSaving(false);
    }
  }

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

      <Card>
        <CardContent className="p-4">
          <form className="space-y-3" onSubmit={handleAddUser}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add User</h2>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Adding..." : "Add User"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <Input
                required
                placeholder="User ID"
                value={form.userID}
                onChange={(e) => setForm((prev) => ({ ...prev, userID: e.target.value }))}
              />
              <Input
                required
                placeholder="User Name"
                value={form.userName}
                onChange={(e) => setForm((prev) => ({ ...prev, userName: e.target.value }))}
              />
              <Input
                required
                placeholder="Department"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              />
              <Input
                required
                placeholder="Job Title"
                value={form.jobTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as User["status"] }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>

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
