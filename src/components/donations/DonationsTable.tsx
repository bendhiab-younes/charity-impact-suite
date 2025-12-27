import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Check, X, MoreHorizontal } from 'lucide-react';
import { Donation } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DonationsTableProps {
  donations: Donation[];
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function DonationsTable({ donations, showActions = true, onApprove, onReject }: DonationsTableProps) {
  const statusVariant = {
    pending: 'warning',
    approved: 'info',
    rejected: 'destructive',
    completed: 'success',
  } as const;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Type</TableHead>
            <TableHead className="font-medium">Method</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            {showActions && <TableHead className="font-medium text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id} className="hover:bg-muted/30">
              <TableCell className="text-sm">
                {formatDate(donation.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(donation.amount, donation.currency)}
              </TableCell>
              <TableCell>
                <Badge variant="muted" className="capitalize">
                  {donation.type.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="capitalize text-sm text-muted-foreground">
                {donation.method.replace('_', ' ')}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[donation.status]} className="capitalize">
                  {donation.status}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {donation.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-success hover:bg-success/10"
                          onClick={() => onApprove?.(donation.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onReject?.(donation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
