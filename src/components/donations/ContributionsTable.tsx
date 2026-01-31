import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, User, Banknote, CreditCard, Building } from 'lucide-react';

interface Contribution {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  method: string;
  notes?: string;
  donorName?: string;
  donorEmail?: string;
  approvedAt?: string;
  createdAt: string;
  donor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ContributionsTableProps {
  contributions: Contribution[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'muted'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  COMPLETED: 'success',
};

const methodIcons: Record<string, typeof CreditCard> = {
  CARD: CreditCard,
  BANK_TRANSFER: Building,
  CASH: Banknote,
  CHECK: Banknote,
};

export function ContributionsTable({ 
  contributions, 
  onApprove, 
  onReject,
  showActions = true 
}: ContributionsTableProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
        <p className="text-muted-foreground">
          When donors contribute to your association, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Donor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map((contribution) => {
          const MethodIcon = methodIcons[contribution.method] || Banknote;
          const donorDisplayName = contribution.donor?.name || contribution.donorName || 'Anonymous';
          const donorEmail = contribution.donor?.email || contribution.donorEmail;
          
          return (
            <TableRow key={contribution.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{donorDisplayName}</p>
                    {donorEmail && (
                      <p className="text-xs text-muted-foreground">{donorEmail}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-emerald-600">
                  {contribution.amount.toLocaleString()} {contribution.currency}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MethodIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{contribution.method.toLowerCase().replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {contribution.type.toLowerCase().replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[contribution.status] || 'default'}>
                  {contribution.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  {contribution.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2">
                      {onApprove && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => onApprove(contribution.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onReject(contribution.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
