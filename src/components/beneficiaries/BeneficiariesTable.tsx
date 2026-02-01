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
  onUpdateStatus?: (id: string, status: string) => void;
}

export function BeneficiariesTable({ beneficiaries, onView, onEdit, onUpdateStatus }: BeneficiariesTableProps) {
  const getStatusVariant = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ELIGIBLE') return 'success';
    if (s === 'INELIGIBLE') return 'destructive';
    if (s === 'PENDING_REVIEW') return 'warning';
    return 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ELIGIBLE') return 'Eligible';
    if (s === 'INELIGIBLE') return 'Ineligible';
    if (s === 'PENDING_REVIEW') return 'Pending Review';
    return status;
  };

  const isPendingReview = (status: string) => {
    return status?.toUpperCase() === 'PENDING_REVIEW';
  };

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
            <TableHead className="font-medium">National ID</TableHead>
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
              <TableCell className="text-sm font-mono">
                {beneficiary.nationalId || '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div>
                  {beneficiary.email && <p>{beneficiary.email}</p>}
                  {beneficiary.phone && <p>{beneficiary.phone}</p>}
                  {!beneficiary.email && !beneficiary.phone && <p>—</p>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(beneficiary.status) as any}>
                  {getStatusLabel(beneficiary.status)}
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
                    {isPendingReview(beneficiary.status) && onUpdateStatus && (
                      <>
                        <DropdownMenuItem 
                          className="text-success"
                          onClick={() => onUpdateStatus(beneficiary.id, 'ELIGIBLE')}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Mark Eligible
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onUpdateStatus(beneficiary.id, 'INELIGIBLE')}
                        >
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
