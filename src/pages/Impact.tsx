import { Header, Footer } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Heart, Building2 } from "lucide-react";

const stats = [
  { icon: Building2, label: "Active Associations", value: "24", trend: "+3 this month" },
  { icon: Users, label: "Beneficiaries Served", value: "12,450", trend: "+892 this quarter" },
  { icon: Heart, label: "Total Donations", value: "$2.4M", trend: "+18% YoY" },
  { icon: TrendingUp, label: "Distribution Rate", value: "94%", trend: "Above target" },
];

const recentImpact = [
  { association: "Hope Foundation", metric: "Served 450 families during Ramadan food drive", date: "Dec 2024" },
  { association: "Care Network", metric: "Distributed school supplies to 1,200 children", date: "Nov 2024" },
  { association: "Community Aid", metric: "Provided winter clothing to 380 beneficiaries", date: "Nov 2024" },
  { association: "Unity Relief", metric: "Emergency support for 95 displaced families", date: "Oct 2024" },
];

const Impact = () => {
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
              {stats.map((stat, index) => (
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
              ))}
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
                  <CardTitle className="text-lg">By Aid Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "Food Assistance", pct: 42 },
                    { type: "Financial Aid", pct: 28 },
                    { type: "Medical Support", pct: 18 },
                    { type: "Education", pct: 12 },
                  ].map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="font-medium">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { region: "Urban Areas", pct: 55 },
                    { region: "Suburban", pct: 25 },
                    { region: "Rural Communities", pct: 20 },
                  ].map((item) => (
                    <div key={item.region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.region}</span>
                        <span className="font-medium">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
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
