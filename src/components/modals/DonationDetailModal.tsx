import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Wallet, User, Users, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DonationDetailModalProps {
  donationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationDetailModal({ 
  donationId, 
  open, 
  onOpenChange
}: DonationDetailModalProps) {
  const [donation, setDonation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!donationId || !open) return;
      
      setIsLoading(true);
      try {
        const data = await api.getDonation(donationId);
        setDonation(data);
      } catch (err: any) {
        toast.error('Failed to load donation details');
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonation();
  }, [donationId, open]);

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TND') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return 'success';
    if (s === 'APPROVED') return 'info';
    if (s === 'REJECTED') return 'destructive';
    if (s === 'PENDING') return 'warning';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!donation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
          <DialogDescription>
            View complete donation information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount and Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(donation.amount, donation.currency)}
              </p>
            </div>
            <Badge variant={getStatusVariant(donation.status) as any} className="text-sm">
              {donation.status}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created
              </div>
              <p className="text-sm font-medium">{formatDate(donation.createdAt)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Method
              </div>
              <p className="text-sm font-medium capitalize">
                {(donation.method || 'Cash').toLowerCase().replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Type
              </div>
              <p className="text-sm font-medium capitalize">
                {(donation.type || 'One-time').toLowerCase().replace('_', ' ')}
              </p>
            </div>

            {donation.processedAt && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Processed
                </div>
                <p className="text-sm font-medium">{formatDate(donation.processedAt)}</p>
              </div>
            )}
          </div>

          {/* Donor */}
          {donation.donor && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Donor
              </div>
              <p className="font-medium">{donation.donor.name}</p>
              <p className="text-sm text-muted-foreground">{donation.donor.email}</p>
            </div>
          )}

          {/* Beneficiary */}
          {donation.beneficiary && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Beneficiary
              </div>
              <p className="font-medium">
                {donation.beneficiary.firstName} {donation.beneficiary.lastName}
              </p>
            </div>
          )}

          {/* Family */}
          {donation.family && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Family
              </div>
              <p className="font-medium">{donation.family.name}</p>
              <p className="text-sm text-muted-foreground">
                {donation.family.memberCount} members
              </p>
            </div>
          )}

          {/* Notes */}
          {donation.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{donation.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
