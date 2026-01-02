import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BeneficiariesTable } from '@/components/beneficiaries/BeneficiariesTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { AddBeneficiaryModal } from '@/components/modals/AddBeneficiaryModal';
import { Plus, Search, Filter, Download, UserPlus, Loader2 } from 'lucide-react';

export default function BeneficiariesPage() {
  const { beneficiaries, isLoading, eligibleCount, pendingCount, refetch } = useBeneficiaries();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <h1 className="text-2xl font-bold">Beneficiaries</h1>
            <p className="text-muted-foreground">
              Manage beneficiary registrations and eligibility
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="hero" onClick={() => setIsModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search beneficiaries..." 
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
              <Badge variant="muted" className="ml-2">{beneficiaries.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="eligible">
              Eligible
              <Badge variant="success" className="ml-2">{eligibleCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Review
              {pendingCount > 0 && (
                <Badge variant="warning" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <BeneficiariesTable beneficiaries={beneficiaries} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligible">
            <Card>
              <CardContent className="p-0">
                <BeneficiariesTable 
                  beneficiaries={beneficiaries.filter(b => b.status === 'ELIGIBLE')} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0">
                <BeneficiariesTable 
                  beneficiaries={beneficiaries.filter(b => b.status === 'PENDING_REVIEW')} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddBeneficiaryModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
}
