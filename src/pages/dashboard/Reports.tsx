import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { exportReportSummary, exportDonations } from "@/lib/export";
import { toast } from "sonner";

const Reports = () => {
  const { donations, beneficiaries, stats, isLoading } = useDashboardData();

  // Calculate monthly breakdown
  const getMonthlyBreakdown = () => {
    const months: Record<string, { donations: number; beneficiaries: number; transactions: number }> = {};
    
    donations.forEach(d => {
      const date = new Date(d.createdAt);
      const key = date.toLocaleDateString('en-US', { month: 'short' });
      if (!months[key]) {
        months[key] = { donations: 0, beneficiaries: 0, transactions: 0 };
      }
      months[key].donations += d.amount || 0;
      months[key].transactions += 1;
    });

    return Object.entries(months).slice(0, 6).map(([month, data]) => ({
      month,
      ...data,
      beneficiaries: Math.floor(data.transactions * 1.5), // Approximation
    }));
  };

  // Get beneficiary status distribution
  const getBeneficiaryDistribution = () => {
    const distribution: Record<string, number> = {};
    beneficiaries.forEach(b => {
      const status = b.status || 'UNKNOWN';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({ status, count }));
  };

  const monthlyData = getMonthlyBreakdown();
  const beneficiaryDistribution = getBeneficiaryDistribution();
  const avgDonation = donations.length > 0 
    ? Math.round(stats.totalDonations / donations.length) 
    : 0;

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
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Analytics and insights for your association</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                exportReportSummary({ donations, beneficiaries, stats });
                toast.success('Report summary exported to CSV');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Summary
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                exportDonations(donations);
                toast.success('Full donations data exported to CSV');
              }}
              disabled={donations.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Donations
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">{stats.totalDonations.toLocaleString()} TND</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {donations.length} total
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiaries Served</p>
                  <p className="text-2xl font-bold">{stats.totalBeneficiaries}</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  registered
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Donation</p>
                  <p className="text-2xl font-bold">{avgDonation} TND</p>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  per transaction
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donations Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="h-64 flex items-end justify-around gap-2 px-4">
                  {(() => {
                    const maxDonation = Math.max(...monthlyData.map(d => d.donations), 1);
                    return monthlyData.map((data, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 max-w-[60px]">
                        <div className="w-full flex flex-col items-center justify-end h-48">
                          <span className="text-xs font-medium mb-1">{data.donations.toLocaleString()}</span>
                          <div 
                            className="w-full bg-primary rounded-t transition-all duration-500"
                            style={{ height: `${(data.donations / maxDonation) * 100}%`, minHeight: '8px' }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No donation data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Beneficiary Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {beneficiaryDistribution.length > 0 ? (
                <div className="h-64 space-y-4 py-4">
                  {(() => {
                    const maxCount = Math.max(...beneficiaryDistribution.map(d => d.count), 1);
                    const statusColors: Record<string, string> = {
                      'ELIGIBLE': 'bg-green-500',
                      'INELIGIBLE': 'bg-red-500',
                      'PENDING_REVIEW': 'bg-yellow-500',
                    };
                    return beneficiaryDistribution.map((data, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{data.status.replace('_', ' ').toLowerCase()}</span>
                          <span className="font-medium">{data.count}</span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${statusColors[data.status] || 'bg-primary'}`}
                            style={{ width: `${(data.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No beneficiary data yet</p>
                  </div>
                </div>
              )}
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
              {monthlyData.length > 0 ? monthlyData.map((data) => (
                <div key={data.month} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">{data.month}</span>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-muted-foreground">Donations: <strong className="text-foreground">{data.donations.toLocaleString()} TND</strong></span>
                    <span className="text-muted-foreground">Beneficiaries: <strong className="text-foreground">{data.beneficiaries}</strong></span>
                    <span className="text-muted-foreground">Transactions: <strong className="text-foreground">{data.transactions}</strong></span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  No donation data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
