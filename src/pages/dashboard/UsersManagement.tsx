import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, MoreHorizontal, Shield } from "lucide-react";

const users = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com", role: "association_admin", status: "active", lastActive: "2 hours ago" },
  { id: "2", name: "Michael Chen", email: "michael@example.com", role: "association_member", status: "active", lastActive: "1 day ago" },
  { id: "3", name: "Emily Davis", email: "emily@example.com", role: "donor", status: "active", lastActive: "3 hours ago" },
  { id: "4", name: "James Wilson", email: "james@example.com", role: "association_member", status: "inactive", lastActive: "2 weeks ago" },
  { id: "5", name: "Maria Garcia", email: "maria@example.com", role: "association_admin", status: "active", lastActive: "5 mins ago" },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  association_admin: "Admin",
  association_member: "Member",
  donor: "Donor",
};

const UsersManagement = () => {
  return (
    <DashboardLayout userRole="association_admin">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage team members and their access</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">48</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">25</p>
              <p className="text-sm text-muted-foreground">Donors</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{roleLabels[user.role]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UsersManagement;
