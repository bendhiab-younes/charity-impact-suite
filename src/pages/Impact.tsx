import { Header, Footer } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalStats } from "@/hooks/useGlobalStats";
import { TrendingUp, Users, Heart, Building2 } from "lucide-react";


const recentImpact = [
  { association: "Hope Foundation", metric: "Served 450 families during Ramadan food drive", date: "Dec 2024" },
  { association: "Care Network", metric: "Distributed school supplies to 1,200 children", date: "Nov 2024" },
  { association: "Community Aid", metric: "Provided winter clothing to 380 beneficiaries", date: "Nov 2024" },
  { association: "Unity Relief", metric: "Emergency support for 95 displaced families", date: "Oct 2024" },
];

const Impact = () => {
  const { stats, isLoading } = useGlobalStats();

  const displayStats = [
    { 
      icon: Building2, 
      label: "Active Associations", 
      value: stats.activeAssociations.toString(), 
      trend: `${stats.totalAssociations} total` 
    },
    { 
      icon: Users, 
      label: "Beneficiaries Served", 
      value: stats.totalBeneficiaries.toLocaleString(), 
      trend: "Across all associations" 
    },
    { 
      icon: Heart, 
      label: "Total Donations", 
      value: `${(stats.totalDonationAmount / 1000).toFixed(0)}k TND`, 
      trend: `${stats.growthRate}% growth` 
    },
    { 
      icon: TrendingUp, 
      label: "Success Rate", 
      value: `${stats.successRate}%`, 
      trend: "Completed donations" 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Platform Impact</h1>
            <p className="text-lg text-muted-foreground">
              Measurable outcomes and transparent reporting across all registered associations.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                displayStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                      <div className="text-xs text-success">{stat.trend}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recent Impact Stories */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Recent Impact Highlights</h2>
            <div className="space-y-4">
              {recentImpact.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg border">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{item.association}</h3>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.metric}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Distribution Breakdown */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Aid Distribution by Category</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Donation Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.distributionByType.length > 0 ? (
                    stats.distributionByType.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No donation data available</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Association Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.distributionByCategory.length > 0 ? (
                    stats.distributionByCategory.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No category data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Impact;
