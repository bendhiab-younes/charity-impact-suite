import { Header, Footer } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ClipboardCheck, Heart, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register Your Association",
    description: "Create an account and set up your association profile with mission, goals, and transparency settings."
  },
  {
    icon: ClipboardCheck,
    title: "Configure Eligibility Rules",
    description: "Define donation limits, family constraints, and eligibility criteria to ensure fair distribution."
  },
  {
    icon: Heart,
    title: "Collect & Distribute Donations",
    description: "Receive donations from verified donors and distribute aid to registered beneficiaries transparently."
  },
  {
    icon: BarChart3,
    title: "Track & Report Impact",
    description: "Generate reports, monitor metrics, and share your association's impact with stakeholders."
  }
];

const roles = [
  { role: "Super Admin", description: "Manages all associations, oversees platform integrity, and handles global configurations." },
  { role: "Association Admin", description: "Configures rules, manages members, and generates reports for their association." },
  { role: "Association Member", description: "Registers beneficiaries, validates donations, and handles day-to-day operations." },
  { role: "Donor", description: "Browses associations, makes donations, and tracks contribution history." },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">How It Works</h1>
            <p className="text-lg text-muted-foreground">
              A transparent, auditable platform for managing charitable donations and ensuring aid reaches those who need it most.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Getting Started</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="absolute top-4 right-4 text-3xl font-bold text-muted-foreground/20">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Platform Roles</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((item, index) => (
                <div key={index} className="p-4 bg-background rounded-lg border">
                  <h3 className="font-semibold text-foreground mb-1">{item.role}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold mb-1">Fraud Prevention</h3>
                <p className="text-sm text-muted-foreground">Configurable rules prevent duplicate aid and enforce eligibility limits.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Full Transparency</h3>
                <p className="text-sm text-muted-foreground">Every donation is tracked and auditable with complete activity logs.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold mb-1">Family Management</h3>
                <p className="text-sm text-muted-foreground">Link beneficiaries to households and enforce per-family donation limits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
