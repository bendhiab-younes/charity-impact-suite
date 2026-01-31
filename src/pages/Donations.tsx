import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { DonorDonationsTable } from '@/components/donations/DonorDonationsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDonations } from '@/hooks/useDonations';
import { exportDonations } from '@/lib/export';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Plus, Search, Filter, Download, Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Donor Donations Page Component
function DonorDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await api.getMyDonations();
        setDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load donations', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const filteredDonations = donations.filter(d => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesAssociation = d.association?.name?.toLowerCase().includes(query);
      const matchesAmount = d.amount?.toString().includes(query);
      const matchesStatus = d.status?.toLowerCase().includes(query);
      return matchesAssociation || matchesAmount || matchesStatus;
    }
    return true;
  });

  const pendingCount = donations.filter(d => d.status === 'PENDING').length;
  const completedCount = donations.filter(d => d.status === 'COMPLETED' || d.status === 'APPROVED').length;

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
            <h1 className="text-2xl font-bold">My Donations</h1>
            <p className="text-muted-foreground">
              Track your donation history and impact
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                exportDonations(filteredDonations);
                toast.success('Donations exported to CSV');
              }}
              disabled={filteredDonations.length === 0}
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

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search donations..." 
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
              <Badge variant="muted" className="ml-2">{filteredDonations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="warning" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="success" className="ml-2">{completedCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                {filteredDonations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Donations Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start making a difference by donating to an association.
                    </p>
                    <Button variant="hero" asChild>
                      <Link to="/associations">Browse Associations</Link>
                    </Button>
                  </div>
                ) : (
                  <DonorDonationsTable donations={filteredDonations} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <DonorDonationsTable 
                  donations={filteredDonations.filter(d => d.status === 'PENDING')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <DonorDonationsTable 
                  donations={filteredDonations.filter(d => d.status === 'COMPLETED' || d.status === 'APPROVED')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Association Staff Donations Page Component
function AssociationDonationsPage() {
  const { donations, isLoading, pendingCount, completedCount, approveDonation, rejectDonation } = useDonations();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = user?.role?.toUpperCase();
  const canApprove = userRole === 'ASSOCIATION_ADMIN' || userRole === 'SUPER_ADMIN';
  
  const filteredDonations = donations.filter(d => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesBeneficiary = d.beneficiary?.firstName?.toLowerCase().includes(query) ||
        d.beneficiary?.lastName?.toLowerCase().includes(query);
      const matchesDonor = d.donor?.name?.toLowerCase().includes(query);
      const matchesAmount = d.amount?.toString().includes(query);
      const matchesStatus = d.status?.toLowerCase().includes(query);
      return matchesBeneficiary || matchesDonor || matchesAmount || matchesStatus;
    }
    return true;
  });

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
            <h1 className="text-2xl font-bold">Donations</h1>
            <p className="text-muted-foreground">
              Manage and track all donation activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                exportDonations(filteredDonations);
                toast.success('Donations exported to CSV');
              }}
              disabled={filteredDonations.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="hero" asChild>
              <Link to="/dashboard/donations/new">
                <Plus className="h-4 w-4 mr-2" />
                Record Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search donations..." 
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

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="muted" className="ml-2">{filteredDonations.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="warning" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="success" className="ml-2">{completedCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <DonationsTable 
                  donations={filteredDonations}
                  onApprove={canApprove ? approveDonation : undefined}
                  onReject={canApprove ? rejectDonation : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <DonationsTable 
                  donations={filteredDonations.filter(d => d.status === 'PENDING')}
                  onApprove={canApprove ? approveDonation : undefined}
                  onReject={canApprove ? rejectDonation : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <DonationsTable 
                  donations={filteredDonations.filter(d => d.status === 'COMPLETED')}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Main Donations Page - Routes based on user role
export default function DonationsPage() {
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase();
  
  // Donors see their own donations page
  if (userRole === 'DONOR') {
    return <DonorDonationsPage />;
  }
  
  // Association staff and super admin see the full donations management
  return <AssociationDonationsPage />;
}
