import { useParams, Link } from 'react-router-dom';
import { Header, Footer } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAssociations, mockDonations } from '@/data/mockData';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Users, 
  HandHeart,
  Wallet,
  TrendingUp,
  Heart,
  Calendar,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

export default function AssociationDetailPage() {
  const { id } = useParams();
  const association = mockAssociations.find(a => a.id === id) || mockAssociations[0];
  const recentDonations = mockDonations.filter(d => d.associationId === association.id).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back link */}
        <div className="container pt-6">
          <Link 
            to="/associations" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to associations
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-8">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
                    <Building2 className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{association.name}</h1>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {association.description}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {association.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{association.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${association.email}`} className="hover:text-foreground transition-colors">
                      {association.email}
                    </a>
                  </div>
                  {association.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{association.phone}</span>
                    </div>
                  )}
                  {association.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={association.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Donate CTA */}
              <Card className="lg:w-80 shrink-0">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-2xl font-bold">${association.impactMetrics.averageDonation}</p>
                    <p className="text-sm text-muted-foreground">Average donation</p>
                  </div>
                  <Button variant="hero" size="lg" className="w-full mb-3">
                    Donate Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Set Up Monthly Giving
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure & tax-deductible</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 bg-secondary/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="text-center p-6">
                <Wallet className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  ${(association.totalDonations / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </Card>
              <Card className="text-center p-6">
                <HandHeart className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {association.totalBeneficiaries.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Beneficiaries</p>
              </Card>
              <Card className="text-center p-6">
                <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {association.impactMetrics.familiesHelped}
                </p>
                <p className="text-sm text-muted-foreground">Families Helped</p>
              </Card>
              <Card className="text-center p-6">
                <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {association.impactMetrics.successRate}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="about" className="space-y-8">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="transparency">Transparency</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {association.description} We are committed to ensuring every donation reaches those 
                      who need it most through transparent and accountable processes.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>How We Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium">1</div>
                      <div>
                        <p className="font-medium">Beneficiary Registration</p>
                        <p className="text-sm text-muted-foreground">Families apply through our verification process</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium">2</div>
                      <div>
                        <p className="font-medium">Eligibility Review</p>
                        <p className="text-sm text-muted-foreground">Our team verifies need and eligibility criteria</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium">3</div>
                      <div>
                        <p className="font-medium">Donation Distribution</p>
                        <p className="text-sm text-muted-foreground">Funds are allocated fairly based on rules</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium">4</div>
                      <div>
                        <p className="font-medium">Impact Tracking</p>
                        <p className="text-sm text-muted-foreground">Full transparency on how donations are used</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="impact">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Monthly Goal: $25,000</span>
                          <span className="font-medium">{((association.impactMetrics.donationsThisMonth / 25000) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(association.impactMetrics.donationsThisMonth / 25000) * 100} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                          ${association.impactMetrics.donationsThisMonth.toLocaleString()} raised this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 mt-0.5">
                            <Heart className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">Supported {association.impactMetrics.familiesHelped} families in the past year</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 mt-0.5">
                            <Heart className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">Maintained {association.impactMetrics.successRate}% donation success rate</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 mt-0.5">
                            <Heart className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm">{association.totalMembers} active volunteers and staff</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDonations.length > 0 ? recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                              <Heart className="h-4 w-4 text-accent-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Anonymous Donor</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">
                            ${donation.amount}
                          </span>
                        </div>
                      )) : (
                        <p className="text-muted-foreground text-center py-8">No recent donations to display</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transparency">
                <Card>
                  <CardHeader>
                    <CardTitle>Transparency Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-accent/50">
                        <p className="text-sm text-muted-foreground mb-1">Admin Costs</p>
                        <p className="text-2xl font-bold">8%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-accent/50">
                        <p className="text-sm text-muted-foreground mb-1">Direct Aid</p>
                        <p className="text-2xl font-bold">92%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                      <Shield className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Fully Audited</p>
                        <p className="text-sm text-muted-foreground">
                          All transactions are logged and available for review
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
