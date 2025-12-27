import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDonations, mockAssociations, mockBeneficiaries } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Users, 
  HandHeart, 
  TrendingUp, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const association = mockAssociations[0];
  const pendingDonations = mockDonations.filter(d => d.status === 'pending');
  const pendingBeneficiaries = mockBeneficiaries.filter(b => b.status === 'pending_review');

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to {association.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/dashboard/reports">View Reports</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/dashboard/donations/new">Record Donation</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Donations"
            value={association.totalDonations}
            format="currency"
            change={12.5}
            changeLabel="vs last month"
            icon={Wallet}
          />
          <StatCard
            title="This Month"
            value={association.impactMetrics.donationsThisMonth}
            format="currency"
            change={8.2}
            changeLabel="vs last month"
            icon={TrendingUp}
          />
          <StatCard
            title="Beneficiaries"
            value={association.totalBeneficiaries}
            change={5.3}
            changeLabel="this month"
            icon={HandHeart}
          />
          <StatCard
            title="Families Helped"
            value={association.impactMetrics.familiesHelped}
            change={3.1}
            changeLabel="this month"
            icon={Users}
          />
        </div>

        {/* Alerts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pending Donations Alert */}
          {pendingDonations.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pendingDonations.length} Pending Donations</p>
                  <p className="text-sm text-muted-foreground">Awaiting approval</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/donations?status=pending">Review</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pending Reviews Alert */}
          {pendingBeneficiaries.length > 0 && (
            <Card className="border-info/50 bg-info/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
                  <AlertCircle className="h-5 w-5 text-info" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pendingBeneficiaries.length} Pending Reviews</p>
                  <p className="text-sm text-muted-foreground">Beneficiary eligibility</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/beneficiaries?status=pending">Review</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Success Rate */}
          <Card className="border-success/50 bg-success/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{association.impactMetrics.successRate}% Success Rate</p>
                <p className="text-sm text-muted-foreground">Donations reaching beneficiaries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest donation activity in your association</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/dashboard/donations">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DonationsTable donations={mockDonations.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
