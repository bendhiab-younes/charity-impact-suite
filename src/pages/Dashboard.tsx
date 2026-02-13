import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { DonorDonationsTable } from '@/components/donations/DonorDonationsTable';
import { AssociationCard } from '@/components/associations/AssociationCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDonorDashboardData } from '@/hooks/useDonorDashboardData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  Users, 
  HandHeart, 
  TrendingUp, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Heart,
  Gift
} from 'lucide-react';

// Donor Dashboard Component
function DonorDashboard() {
  const { associations, myDonations, stats, isLoading, error } = useDonorDashboardData();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Donor Dashboard</h1>
          <p className="text-muted-foreground">
            Make a difference by supporting local associations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Donated"
          value={stats.totalDonated}
          format="currency"
          changeLabel="all time"
          icon={Wallet}
        />
        <StatCard
          title="This Month"
          value={stats.donationsThisMonth}
          format="currency"
          changeLabel="current month"
          icon={TrendingUp}
        />
        <StatCard
          title="Donations Made"
          value={stats.donationsCount}
          changeLabel="total"
          icon={Gift}
        />
        <StatCard
          title="Associations Supported"
          value={stats.associationsSupported}
          changeLabel="organizations"
          icon={Building2}
        />
      </div>

      {/* Associations List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Browse Associations</h2>
            <p className="text-sm text-muted-foreground">Choose an association to support with your donation</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/associations">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
        
        {associations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Associations Available</h3>
              <p className="text-muted-foreground">
                There are no active associations at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {associations.slice(0, 6).map((association) => (
              <AssociationCard key={association.id} association={association} />
            ))}
          </div>
        )}
      </div>

      {/* My Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Donations</CardTitle>
            <CardDescription>Track your donation history and impact</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {myDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Donations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start making a difference by donating to an association above.
              </p>
            </div>
          ) : (
            <DonorDonationsTable donations={myDonations.slice(0, 5)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Super Admin Dashboard Component
function SuperAdminDashboard() {
  const { associations, myDonations, stats, isLoading } = useDonorDashboardData();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Calculate super admin stats
  const totalAssociations = associations.length;
  const activeAssociations = associations.filter(a => a.status === 'ACTIVE').length;
  const pendingAssociations = associations.filter(a => a.status === 'PENDING').length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all associations and monitor platform activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard/associations">Manage Associations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/users">Manage Users</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Associations"
          value={totalAssociations}
          changeLabel="registered"
          icon={Building2}
        />
        <StatCard
          title="Active Associations"
          value={activeAssociations}
          changeLabel="operating"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Approval"
          value={pendingAssociations}
          changeLabel="awaiting review"
          icon={Clock}
        />
        <StatCard
          title="Platform Users"
          value={0}
          changeLabel="total"
          icon={Users}
        />
      </div>

      {/* Pending Associations Alert */}
      {pendingAssociations > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{pendingAssociations} Associations Pending Approval</p>
              <p className="text-sm text-muted-foreground">Review and approve new associations</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/associations?status=pending">Review</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Associations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Associations</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage platform associations</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/dashboard/associations">
              Manage All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
        
        {associations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Associations Yet</h3>
              <p className="text-muted-foreground">
                No associations have been registered on the platform.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {associations.slice(0, 6).map((association) => (
              <AssociationCard key={association.id} association={association} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Association Admin/Member Dashboard Component
function AssociationDashboard() {
  const { user } = useAuth();
  const { association, donations, pendingDonations, pendingBeneficiaries, stats, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !association) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Association Linked</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              Your account is not linked to any association. Contact your association admin to be added as a member.
            </p>
            <Button variant="outline" asChild>
              <Link to="/associations">Browse Associations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{association ? ` to ${association.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard/reports">View Reports</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/dashboard/donations/new">Record Contribution</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Donations"
          value={stats.totalDonations}
          format="currency"
          changeLabel="all time"
          icon={Wallet}
        />
        <StatCard
          title="This Month"
          value={stats.donationsThisMonth}
          format="currency"
          changeLabel="current month"
          icon={TrendingUp}
        />
        <StatCard
          title="Beneficiaries"
          value={stats.totalBeneficiaries}
          changeLabel="registered"
          icon={HandHeart}
        />
        <StatCard
          title="Families Helped"
          value={stats.familiesHelped}
          changeLabel="total"
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
              <p className="font-medium">{stats.successRate}% Success Rate</p>
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
          <DonationsTable donations={donations.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Component - Routes based on user role
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Route to the appropriate dashboard based on user role
  const userRole = user?.role?.toUpperCase() || 'DONOR';

  return (
    <DashboardLayout>
      {userRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {userRole === 'DONOR' && <DonorDashboard />}
      {(userRole === 'ASSOCIATION_ADMIN' || userRole === 'ASSOCIATION_MEMBER') && <AssociationDashboard />}
    </DashboardLayout>
  );
}
