import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { DonorDonationsTable } from '@/components/donations/DonorDonationsTable';
import { ContributionsTable } from '@/components/donations/ContributionsTable';
import { DispatchesTable } from '@/components/donations/DispatchesTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDonations } from '@/hooks/useDonations';
import { useContributions } from '@/hooks/useContributions';
import { useDispatches } from '@/hooks/useDispatches';
import { exportDonations } from '@/lib/export';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Plus, Search, Filter, Download, Loader2, Heart, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Donor Donations Page Component
function DonorDonationsPage() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await api.getMyContributions();
        setContributions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load contributions', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContributions();
  }, []);

  const filteredContributions = contributions.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesAssociation = c.association?.name?.toLowerCase().includes(query);
      const matchesAmount = c.amount?.toString().includes(query);
      const matchesStatus = c.status?.toLowerCase().includes(query);
      return matchesAssociation || matchesAmount || matchesStatus;
    }
    return true;
  });

  const pendingCount = contributions.filter(c => c.status === 'PENDING').length;
  const approvedCount = contributions.filter(c => c.status === 'APPROVED').length;
  const totalDonated = contributions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.amount, 0);

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
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Contributions</h1>
            <p className="text-muted-foreground">
              Track your donation history and impact
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                exportDonations(filteredContributions);
                toast.success('Contributions exported to CSV');
              }}
              disabled={filteredContributions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="hero" asChild>
              <Link to="/associations">
                <Heart className="h-4 w-4 mr-2" />
                Make a Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{totalDonated.toLocaleString()} TND</div>
              <p className="text-xs text-muted-foreground">{approvedCount} approved contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contributions.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contributions..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="muted" className="ml-2">{filteredContributions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="warning" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="success" className="ml-2">{approvedCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                {filteredContributions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start making a difference by donating to an association.
                    </p>
                    <Button variant="hero" asChild>
                      <Link to="/associations">Browse Associations</Link>
                    </Button>
                  </div>
                ) : (
                  <DonorContributionsTable contributions={filteredContributions} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <DonorContributionsTable 
                  contributions={filteredContributions.filter(c => c.status === 'PENDING')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-0">
                <DonorContributionsTable 
                  contributions={filteredContributions.filter(c => c.status === 'APPROVED')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Donor Contributions Table
function DonorContributionsTable({ contributions }: { contributions: any[] }) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Contributions</h3>
        <p className="text-muted-foreground">
          No contributions match your search.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Association</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map((contribution) => (
          <TableRow key={contribution.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{contribution.association?.name || 'Association'}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-semibold text-emerald-600">
                {contribution.amount.toLocaleString()} {contribution.currency}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm capitalize">
                {contribution.method?.toLowerCase().replace('_', ' ')}
              </span>
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  contribution.status === 'APPROVED' ? 'success' :
                  contribution.status === 'PENDING' ? 'warning' :
                  contribution.status === 'REJECTED' ? 'destructive' : 'default'
                }
              >
                {contribution.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(contribution.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Association Staff Donations Page Component
function AssociationDonationsPage() {
  const { user } = useAuth();
  const { contributions, isLoading: contributionsLoading, pendingCount: pendingContributions, approvedCount, approveContribution, rejectContribution, totalAmount, refetch: refetchContributions } = useContributions();
  const { dispatches, isLoading: dispatchesLoading, budget, pendingCount: pendingDispatches, completedCount: completedDispatches, totalDispatched, refetch: refetchDispatches } = useDispatches();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('contributions');

  const userRole = user?.role?.toUpperCase();
  const canApprove = userRole === 'ASSOCIATION_ADMIN' || userRole === 'SUPER_ADMIN';

  // Wrapper to approve and refresh budget
  const handleApprove = async (id: string) => {
    await approveContribution(id);
    // Refetch both to ensure budget is in sync
    refetchDispatches();
  };

  // Wrapper to reject
  const handleReject = async (id: string) => {
    await rejectContribution(id);
  };
  
  const filteredContributions = contributions.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDonor = c.donor?.name?.toLowerCase().includes(query) ||
        c.donorName?.toLowerCase().includes(query);
      const matchesAmount = c.amount?.toString().includes(query);
      const matchesStatus = c.status?.toLowerCase().includes(query);
      return matchesDonor || matchesAmount || matchesStatus;
    }
    return true;
  });

  const filteredDispatches = dispatches.filter(d => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesBeneficiary = d.beneficiary?.firstName?.toLowerCase().includes(query) ||
        d.beneficiary?.lastName?.toLowerCase().includes(query);
      const matchesFamily = d.family?.name?.toLowerCase().includes(query);
      const matchesAmount = d.amount?.toString().includes(query);
      const matchesStatus = d.status?.toLowerCase().includes(query);
      return matchesBeneficiary || matchesFamily || matchesAmount || matchesStatus;
    }
    return true;
  });

  const isLoading = contributionsLoading || dispatchesLoading;

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
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Funds Management</h1>
            <p className="text-muted-foreground">
              Manage contributions from donors and dispatch aid to beneficiaries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="hero" asChild>
              <Link to="/dashboard/dispatch/new">
                <Plus className="h-4 w-4 mr-2" />
                Dispatch Aid
              </Link>
            </Button>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{budget.toLocaleString()} TND</div>
              <p className="text-xs text-muted-foreground">Ready to dispatch</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAmount.toLocaleString()} TND</div>
              <p className="text-xs text-muted-foreground">{approvedCount} approved contributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dispatched</CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDispatched.toLocaleString()} TND</div>
              <p className="text-xs text-muted-foreground">{completedDispatches} completed dispatches</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Main Tabs - Contributions vs Dispatches */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="contributions" className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Contributions
              {pendingContributions > 0 && (
                <Badge variant="warning" className="ml-1">{pendingContributions}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dispatches" className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Dispatches
              <Badge variant="muted" className="ml-1">{filteredDispatches.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="muted" className="ml-2">{filteredContributions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  {pendingContributions > 0 && (
                    <Badge variant="warning" className="ml-2">{pendingContributions}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="success" className="ml-2">{approvedCount}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardContent className="p-0">
                    <ContributionsTable 
                      contributions={filteredContributions}
                      onApprove={canApprove ? handleApprove : undefined}
                      onReject={canApprove ? handleReject : undefined}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending">
                <Card>
                  <CardContent className="p-0">
                    <ContributionsTable 
                      contributions={filteredContributions.filter(c => c.status === 'PENDING')}
                      onApprove={canApprove ? handleApprove : undefined}
                      onReject={canApprove ? handleReject : undefined}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approved">
                <Card>
                  <CardContent className="p-0">
                    <ContributionsTable 
                      contributions={filteredContributions.filter(c => c.status === 'APPROVED')}
                      showActions={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Dispatches Tab */}
          <TabsContent value="dispatches">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="muted" className="ml-2">{filteredDispatches.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  {pendingDispatches > 0 && (
                    <Badge variant="warning" className="ml-2">{pendingDispatches}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <Badge variant="success" className="ml-2">{completedDispatches}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardContent className="p-0">
                    <DispatchesTable dispatches={filteredDispatches} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending">
                <Card>
                  <CardContent className="p-0">
                    <DispatchesTable 
                      dispatches={filteredDispatches.filter(d => d.status === 'PENDING')} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed">
                <Card>
                  <CardContent className="p-0">
                    <DispatchesTable 
                      dispatches={filteredDispatches.filter(d => d.status === 'COMPLETED')} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Main Donations Page - Routes based on user role
export default function DonationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.role?.toUpperCase();

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  // Donors see their own donations page
  if (userRole === 'DONOR') {
    return <DonorDonationsPage />;
  }
  
  // Association staff and super admin see the full donations management
  return <AssociationDonationsPage />;
}
