import { useState, useMemo } from 'react';
import { Header, Footer } from '@/components/layout/PublicLayout';
import { AssociationCard } from '@/components/associations/AssociationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssociations } from '@/hooks/useAssociations';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Categories', keywords: [] },
  { id: 'food', label: 'Food Security', keywords: ['food', 'alimentaire', 'faim', 'hunger', 'meal', 'repas'] },
  { id: 'education', label: 'Education', keywords: ['education', 'école', 'school', 'éducatif', 'learning', 'scolaire'] },
  { id: 'housing', label: 'Housing', keywords: ['housing', 'logement', 'home', 'shelter', 'maison', 'hébergement'] },
  { id: 'healthcare', label: 'Healthcare', keywords: ['health', 'santé', 'medical', 'médical', 'hospital', 'clinic'] },
  { id: 'emergency', label: 'Emergency Relief', keywords: ['emergency', 'urgence', 'relief', 'disaster', 'crisis', 'aide'] },
];

export default function AssociationsPage() {
  const { associations, isLoading } = useAssociations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter associations based on search and category
  const filteredAssociations = useMemo(() => {
    return associations.filter((assoc) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        assoc.name?.toLowerCase().includes(searchLower) ||
        assoc.description?.toLowerCase().includes(searchLower) ||
        assoc.address?.toLowerCase().includes(searchLower);

      // Category filter
      const category = categories.find(c => c.id === selectedCategory);
      const matchesCategory = selectedCategory === 'all' || 
        category?.keywords.some(keyword => 
          assoc.name?.toLowerCase().includes(keyword) ||
          assoc.description?.toLowerCase().includes(keyword)
        );

      return matchesSearch && matchesCategory;
    });
  }, [associations, searchQuery, selectedCategory]);

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
                placeholder="Search by name, description, or location..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <Badge 
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Badge>
            ))}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAssociations.length} of {associations.length} associations
              {selectedCategory !== 'all' && ` in "${categories.find(c => c.id === selectedCategory)?.label}"`}
              {searchQuery && ` matching "${searchQuery}"`}
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
            ) : filteredAssociations.length > 0 ? (
              filteredAssociations.map((association) => (
                <AssociationCard key={association.id} association={association} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {associations.length === 0 
                    ? "No associations found" 
                    : "No associations match your filters"}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
