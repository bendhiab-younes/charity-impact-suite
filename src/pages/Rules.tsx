import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useRules } from '@/hooks/useRules';
import { AddRuleModal } from '@/components/modals/AddRuleModal';
import { Plus, Edit, Trash2, Clock, DollarSign, Users, Loader2 } from 'lucide-react';

export default function RulesPage() {
  const { rules, isLoading, toggleRule, refetch } = useRules();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'frequency':
        return Clock;
      case 'amount':
        return DollarSign;
      case 'eligibility':
        return Users;
      default:
        return Clock;
    }
  };

  const formatValue = (rule: any) => {
    if (rule.unit === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rule.value);
    }
    return `${rule.value} ${rule.unit || ''}`;
  };

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
            <h1 className="text-2xl font-bold">Donation Rules</h1>
            <p className="text-muted-foreground">
              Configure eligibility constraints and donation limits
            </p>
          </div>
          <Button variant="hero" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="bg-accent/50 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Rules are automatically applied during donation processing to ensure fair distribution 
              and prevent fraud. Active rules are enforced in real-time.
            </p>
          </CardContent>
        </Card>

        {/* Rules Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => {
            const Icon = getRuleIcon(rule.type);
            return (
              <Card key={rule.id} className={!rule.isActive ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        rule.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <Badge variant={rule.isActive ? 'success' : 'muted'} className="mt-1">
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <Switch 
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    {rule.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Limit:</span>
                    <span className="font-semibold">{formatValue(rule)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 w-full">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}

          {/* Add New Rule Card */}
          <Card 
            className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-medium">Add New Rule</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a custom eligibility rule
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddRuleModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
}
