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
import { useState } from 'react';
import { Eye, MoreHorizontal, Building2 } from 'lucide-react';
import { DonationDetailModal } from '@/components/modals/DonationDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface DonorDonationsTableProps {
  donations: any[];
}

export function DonorDonationsTable({ donations }: DonorDonationsTableProps) {
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (id: string) => {
    setSelectedDonationId(id);
    setIsDetailModalOpen(true);
  };

  const statusVariant: Record<string, string> = {
    pending: 'warning',
    approved: 'info',
    rejected: 'destructive',
    completed: 'success',
    PENDING: 'warning',
    APPROVED: 'info',
    REJECTED: 'destructive',
    COMPLETED: 'success',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TND') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  if (donations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No donations found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Association</TableHead>
            <TableHead className="font-medium">Amount</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id} className="hover:bg-muted/30">
              <TableCell className="text-sm">
                {formatDate(donation.createdAt)}
              </TableCell>
              <TableCell>
                <Link 
                  to={`/associations/${donation.associationId}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {donation.association?.name || 'Unknown Association'}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(donation.amount, donation.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={(statusVariant[donation.status] || 'secondary') as any} className="capitalize">
                  {(donation.status || 'pending').toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(donation.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DonationDetailModal
        donationId={selectedDonationId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
}
