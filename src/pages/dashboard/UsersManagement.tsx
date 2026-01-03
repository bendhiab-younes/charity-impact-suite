import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUsers } from "@/hooks/useUsers";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { UserDetailModal } from "@/components/modals/UserDetailModal";
import { Users, Plus, MoreHorizontal, Shield, Loader2, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ASSOCIATION_ADMIN: "Admin",
  ASSOCIATION_MEMBER: "Member",
  DONOR: "Donor",
  super_admin: "Super Admin",
  association_admin: "Admin",
  association_member: "Member",
  donor: "Donor",
};

const UsersManagement = () => {
  const { users, isLoading, stats, refetch, deleteUser } = useUsers();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const userRole = currentUser?.role?.toUpperCase();
  const canEdit = userRole === 'ASSOCIATION_ADMIN' || userRole === 'SUPER_ADMIN';

  const handleView = (id: string) => {
    setSelectedUserId(id);
    setDetailModalMode('view');
    setIsDetailModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedUserId(id);
    setDetailModalMode('edit');
    setIsDetailModalOpen(true);
  };

  // Filter users by search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role?.toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      return; // Can't delete yourself
    }
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteUser(id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage team members and their access</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('all')}
            >
              All
            </Button>
            <Button
              variant={roleFilter === 'ASSOCIATION_ADMIN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ASSOCIATION_ADMIN')}
            >
              Admins
            </Button>
            <Button
              variant={roleFilter === 'ASSOCIATION_MEMBER' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('ASSOCIATION_MEMBER')}
            >
              Members
            </Button>
            <Button
              variant={roleFilter === 'DONOR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('DONOR')}
            >
              Donors
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.members}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stats.donors}</p>
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                          <span>{roleLabels[user.role] || user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(user.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            {canEdit && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.id !== currentUser?.id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(user.id, user.name)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddUserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
      />

      <UserDetailModal
        userId={selectedUserId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        mode={detailModalMode}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
};

export default UsersManagement;
