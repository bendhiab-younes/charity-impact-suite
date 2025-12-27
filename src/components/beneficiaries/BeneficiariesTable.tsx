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
import { Eye, Edit, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { Beneficiary } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function BeneficiariesTable({ beneficiaries, onView, onEdit }: BeneficiariesTableProps) {
  const statusVariant = {
    eligible: 'success',
    ineligible: 'destructive',
    pending_review: 'warning',
  } as const;

  const statusLabel = {
    eligible: 'Eligible',
    ineligible: 'Ineligible',
    pending_review: 'Pending Review',
  } as const;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Contact</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Last Donation</TableHead>
            <TableHead className="font-medium">Total Received</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beneficiaries.map((beneficiary) => (
            <TableRow key={beneficiary.id} className="hover:bg-muted/30">
              <TableCell>
                <div>
                  <p className="font-medium">{beneficiary.firstName} {beneficiary.lastName}</p>
                  <p className="text-xs text-muted-foreground">ID: {beneficiary.id.slice(0, 8)}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div>
                  {beneficiary.email && <p>{beneficiary.email}</p>}
                  {beneficiary.phone && <p>{beneficiary.phone}</p>}
                  {!beneficiary.email && !beneficiary.phone && <p>—</p>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[beneficiary.status]}>
                  {statusLabel[beneficiary.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(beneficiary.lastDonationDate)}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(beneficiary.totalReceived)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(beneficiary.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(beneficiary.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {beneficiary.status === 'pending_review' && (
                      <>
                        <DropdownMenuItem className="text-success">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Mark Eligible
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserX className="h-4 w-4 mr-2" />
                          Mark Ineligible
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
