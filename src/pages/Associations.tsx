import { Header, Footer } from '@/components/layout/PublicLayout';
import { AssociationCard } from '@/components/associations/AssociationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssociations } from '@/hooks/useAssociations';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';

export default function AssociationsPage() {
  const { associations, isLoading } = useAssociations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Associations</h1>
            <p className="text-muted-foreground">
              Discover verified charity organizations and their impact
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or cause..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="default">All Categories</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">Food Security</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">Education</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">Housing</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">Healthcare</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">Emergency Relief</Badge>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {associations.length} associations
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
              </>
            ) : associations.length > 0 ? (
              associations.map((association) => (
                <AssociationCard key={association.id} association={association} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No associations found
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
