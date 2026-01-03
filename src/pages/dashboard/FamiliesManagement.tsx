import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Plus, MoreHorizontal, Users, Loader2, Download, Search, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFamilies } from "@/hooks/useFamilies";
import { AddFamilyModal } from "@/components/modals/AddFamilyModal";
import { FamilyDetailModal } from "@/components/modals/FamilyDetailModal";
import { exportFamilies } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FamiliesManagement = () => {
  const { families, isLoading, eligibleCount, cooldownCount, totalMembers, refetch, deleteFamily } = useFamilies();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const userRole = user?.role?.toUpperCase();
  const canEdit = userRole === 'ASSOCIATION_ADMIN' || userRole === 'SUPER_ADMIN';

  const handleView = (id: string) => {
    setSelectedFamilyId(id);
    setDetailModalMode('view');
    setIsDetailModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedFamilyId(id);
    setDetailModalMode('edit');
    setIsDetailModalOpen(true);
  };

  // Filter families by search and status
  const filteredFamilies = families.filter(family => {
    const matchesSearch = family.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      family.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || family.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteFamily(id);
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
            <h1 className="text-2xl font-bold text-foreground">Families</h1>
            <p className="text-muted-foreground">Manage beneficiary households and track donation eligibility</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                exportFamilies(families);
                toast.success('Families exported to CSV');
              }}
              disabled={families.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {canEdit && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Register Family
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search families..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'ELIGIBLE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ELIGIBLE')}
            >
              Eligible
            </Button>
            <Button
              variant={statusFilter === 'COOLDOWN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('COOLDOWN')}
            >
              Cooldown
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{families.length}</p>
                  <p className="text-sm text-muted-foreground">Total Families</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{eligibleCount}</p>
              <p className="text-sm text-muted-foreground">Eligible Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{cooldownCount}</p>
              <p className="text-sm text-muted-foreground">In Cooldown</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Families</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {families.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No families registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFamilies.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.name}</TableCell>
                      <TableCell>{family.memberCount || 0}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">{family.address || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {family.lastDonationDate ? new Date(family.lastDonationDate).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={family.status === "ELIGIBLE" ? "default" : "secondary"}>
                          {(family.status || 'unknown').toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(family.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canEdit && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(family.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Family
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(family.id, family.name)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddFamilyModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
      />

      <FamilyDetailModal
        familyId={selectedFamilyId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        mode={detailModalMode}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
};

export default FamiliesManagement;
