import { Header, Footer, FeatureCard } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssociationCard } from '@/components/associations/AssociationCard';
import { useAssociations } from '@/hooks/useAssociations';
import { usePublicStats } from '@/hooks/usePublicStats';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  Heart,
  Lock,
  FileCheck,
  TrendingUp,
  Building2,
  Loader2
} from 'lucide-react';

const Index = () => {
  const { associations, isLoading: isLoadingAssociations } = useAssociations();
  const { stats, isLoading: isLoadingStats } = usePublicStats();
  
  const isLoading = isLoadingAssociations || isLoadingStats;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Trusted by {stats.totalAssociations > 0 ? stats.totalAssociations : '2+'} organizations
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
                Transparent Donation Management for{' '}
                <span className="text-primary">Charity Associations</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Ensure accountability, prevent fraud, and maximize impact with our comprehensive 
                platform for managing beneficiaries, donations, and eligibility rules.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=signup">
                    Start Your Association
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/associations">
                    Browse Associations
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Card className="text-center p-6">
                {isLoadingStats ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {stats.totalRaised >= 1000000 
                      ? `${(stats.totalRaised / 1000000).toFixed(1)}M` 
                      : stats.totalRaised >= 1000
                      ? `${(stats.totalRaised / 1000).toFixed(0)}k`
                      : stats.totalRaised.toLocaleString()} TND
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Total Raised</p>
              </Card>
              <Card className="text-center p-6">
                {isLoadingStats ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {stats.totalBeneficiaries >= 1000
                      ? `${(stats.totalBeneficiaries / 1000).toFixed(1)}k`
                      : stats.totalBeneficiaries}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Beneficiaries</p>
              </Card>
              <Card className="text-center p-6">
                {isLoadingStats ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {stats.totalAssociations}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Associations</p>
              </Card>
              <Card className="text-center p-6">
                {isLoadingStats ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {stats.successRate}%
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Transparency & Trust
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every feature designed to ensure accountability and prevent fraud while 
                maximizing the impact of charitable giving.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Lock}
                title="Role-Based Access"
                description="Granular permissions for admins, members, and donors. Each role sees only what they need."
              />
              <FeatureCard
                icon={FileCheck}
                title="Eligibility Rules"
                description="Configure custom rules to prevent duplicate donations and enforce fair distribution."
              />
              <FeatureCard
                icon={Users}
                title="Family Management"
                description="Track beneficiaries by family unit with cooldown periods and donation limits."
              />
              <FeatureCard
                icon={BarChart3}
                title="Impact Analytics"
                description="Real-time dashboards showing donation flows, success rates, and community impact."
              />
              <FeatureCard
                icon={Shield}
                title="Audit Trails"
                description="Complete activity logs for every action. Full transparency for stakeholders."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Fraud Prevention"
                description="Automated checks and balances to ensure donations reach those who need them most."
              />
            </div>
          </div>
        </section>

        {/* Featured Associations */}
        <section className="py-20">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Associations</h2>
                <p className="text-muted-foreground">
                  Discover verified organizations making a difference
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/associations">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingAssociations ? (
                <>
                  <Skeleton className="h-64 rounded-lg" />
                  <Skeleton className="h-64 rounded-lg" />
                  <Skeleton className="h-64 rounded-lg" />
                </>
              ) : associations.length > 0 ? (
                associations.slice(0, 3).map((association) => (
                  <AssociationCard key={association.id} association={association} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  No associations found. Be the first to register!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <Heart className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of associations using CharityHub to manage donations 
              transparently and reach more beneficiaries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" variant="secondary" asChild>
                <Link to="/auth?mode=signup">
                  Register Your Association
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/associations">
                  Browse & Donate
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
