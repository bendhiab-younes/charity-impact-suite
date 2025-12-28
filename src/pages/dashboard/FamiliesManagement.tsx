import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Plus, MoreHorizontal, Users } from "lucide-react";

const families = [
  { id: "1", name: "Al-Hassan Family", members: 5, address: "123 Main St, District A", lastDonation: "2024-12-15", status: "eligible" },
  { id: "2", name: "Smith Household", members: 3, address: "456 Oak Ave, District B", lastDonation: "2024-12-20", status: "cooldown" },
  { id: "3", name: "Garcia Family", members: 7, address: "789 Pine Rd, District A", lastDonation: "2024-11-01", status: "eligible" },
  { id: "4", name: "Johnson Household", members: 4, address: "321 Elm St, District C", lastDonation: "2024-12-28", status: "cooldown" },
  { id: "5", name: "Chen Family", members: 6, address: "654 Maple Dr, District B", lastDonation: "2024-10-15", status: "eligible" },
];

const FamiliesManagement = () => {
  return (
    <DashboardLayout userRole="association_admin">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Families</h1>
            <p className="text-muted-foreground">Manage beneficiary households and track donation eligibility</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register Family
          </Button>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
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
                  <p className="text-2xl font-bold">524</p>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">98</p>
              <p className="text-sm text-muted-foreground">Eligible Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">58</p>
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
                {families.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell className="font-medium">{family.name}</TableCell>
                    <TableCell>{family.members}</TableCell>
                    <TableCell className="text-muted-foreground max-w-48 truncate">{family.address}</TableCell>
                    <TableCell className="text-muted-foreground">{family.lastDonation}</TableCell>
                    <TableCell>
                      <Badge variant={family.status === "eligible" ? "default" : "secondary"}>
                        {family.status}
                      </Badge>
                    </TableCell>
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

export default FamiliesManagement;
