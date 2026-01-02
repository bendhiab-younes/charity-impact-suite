import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DonationsTable } from '@/components/donations/DonationsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDonations } from '@/hooks/useDonations';
import { Plus, Search, Filter, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DonationsPage() {
  const { donations, isLoading, pendingCount, completedCount, approveDonation, rejectDonation } = useDonations();
  const [searchQuery, setSearchQuery] = useState('');

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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Record Donation
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
              <Badge variant="muted" className="ml-2">{donations.length}</Badge>
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
                  donations={donations}
                  onApprove={approveDonation}
                  onReject={rejectDonation}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <DonationsTable 
                  donations={donations.filter(d => d.status === 'PENDING')}
                  onApprove={approveDonation}
                  onReject={rejectDonation}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-0">
                <DonationsTable 
                  donations={donations.filter(d => d.status === 'COMPLETED')}
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
