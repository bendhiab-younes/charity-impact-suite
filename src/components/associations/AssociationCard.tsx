import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, HandHeart, Wallet, ChevronRight, Building2 } from 'lucide-react';

interface AssociationCardProps {
  association: any;
  showActions?: boolean;
}

export function AssociationCard({ association, showActions = true }: AssociationCardProps) {
  const status = (association.status || 'pending').toLowerCase();
  const statusVariant = {
    active: 'success',
    pending: 'warning',
    suspended: 'destructive',
  } as const;
  
  const totalDonations = association.totalDonations || association.donations?.length || 0;
  const totalBeneficiaries = association.totalBeneficiaries || association.beneficiaries?.length || 0;
  const totalMembers = association.totalMembers || association.users?.length || 0;
  const successRate = association.impactMetrics?.successRate || 95;

  return (
    <Card variant="interactive" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Building2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">{association.name}</h3>
              <Badge variant={statusVariant[status as keyof typeof statusVariant] || 'secondary'} className="mt-1">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {association.description}
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-semibold">
              ${totalDonations > 1000 ? (totalDonations / 1000).toFixed(0) + 'k' : totalDonations}
            </p>
            <p className="text-xs text-muted-foreground">Raised</p>
          </div>
          <div className="text-center border-x border-border">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <HandHeart className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-semibold">
              {totalBeneficiaries}
            </p>
            <p className="text-xs text-muted-foreground">Beneficiaries</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-semibold">
              {totalMembers}
            </p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-medium">{successRate}%</span>
          </div>
          <Progress value={successRate} className="h-1.5" />
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-between" asChild>
            <Link to={`/associations/${association.id}`}>
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
