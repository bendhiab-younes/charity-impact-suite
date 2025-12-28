import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

const Reports = () => {
  return (
    <DashboardLayout userRole="association_admin">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analytics and insights for your association</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">$124,500</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiaries Served</p>
                  <p className="text-2xl font-bold">892</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Donation</p>
                  <p className="text-2xl font-bold">$285</p>
                </div>
                <div className="flex items-center text-destructive text-sm">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -3%
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Distribution Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donations Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization</p>
                  <p className="text-sm">Monthly donation trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beneficiary Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization</p>
                  <p className="text-sm">Aid distribution by category</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["December 2024", "November 2024", "October 2024"].map((month) => (
                <div key={month} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">{month}</span>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Donations: <strong className="text-foreground">$42,300</strong></span>
                    <span className="text-muted-foreground">Beneficiaries: <strong className="text-foreground">312</strong></span>
                    <span className="text-muted-foreground">Transactions: <strong className="text-foreground">89</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
