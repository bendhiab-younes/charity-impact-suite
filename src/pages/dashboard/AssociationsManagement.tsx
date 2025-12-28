import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";

const associations = [
  { id: "1", name: "Hope Foundation", status: "active", members: 12, beneficiaries: 450, created: "2023-01-15" },
  { id: "2", name: "Care Network", status: "active", members: 8, beneficiaries: 320, created: "2023-03-22" },
  { id: "3", name: "Community Aid", status: "pending", members: 5, beneficiaries: 0, created: "2024-11-01" },
  { id: "4", name: "Unity Relief", status: "active", members: 15, beneficiaries: 680, created: "2022-09-10" },
  { id: "5", name: "Helping Hands", status: "suspended", members: 3, beneficiaries: 120, created: "2023-07-18" },
];

const AssociationsManagement = () => {
  return (
    <DashboardLayout userRole="super_admin">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Associations</h1>
            <p className="text-muted-foreground">Manage all registered associations</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Association
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Total Associations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">21</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Associations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {associations.map((assoc) => (
                  <TableRow key={assoc.id}>
                    <TableCell className="font-medium">{assoc.name}</TableCell>
                    <TableCell>
                      <Badge variant={assoc.status === "active" ? "default" : assoc.status === "pending" ? "secondary" : "destructive"}>
                        {assoc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{assoc.members}</TableCell>
                    <TableCell>{assoc.beneficiaries}</TableCell>
                    <TableCell className="text-muted-foreground">{assoc.created}</TableCell>
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

export default AssociationsManagement;
