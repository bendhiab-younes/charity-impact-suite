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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BeneficiaryDetailModalProps {
  beneficiaryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
  onSuccess?: () => void;
}

export function BeneficiaryDetailModal({ 
  beneficiaryId, 
  open, 
  onOpenChange, 
  mode,
  onSuccess 
}: BeneficiaryDetailModalProps) {
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    eligibilityNotes: '',
  });

  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (!beneficiaryId || !open) return;
      
      setIsLoading(true);
      try {
        const data = await api.getBeneficiary(beneficiaryId);
        setBeneficiary(data);
        setEditData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          eligibilityNotes: data.eligibilityNotes || '',
        });
      } catch (err: any) {
        toast.error('Failed to load beneficiary details');
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeneficiary();
  }, [beneficiaryId, open]);

  const handleSave = async () => {
    if (!beneficiaryId) return;
    
    setIsSaving(true);
    try {
      await api.updateBeneficiary(beneficiaryId, editData);
      toast.success('Beneficiary updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update beneficiary');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ELIGIBLE') return 'success';
    if (s === 'INELIGIBLE') return 'destructive';
    if (s === 'PENDING_REVIEW') return 'warning';
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

  if (!beneficiary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'Beneficiary Profile' : 'Edit Beneficiary'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'View beneficiary details and donation history'
              : 'Update beneficiary information'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {beneficiary.firstName} {beneficiary.lastName}
                </h3>
                <Badge variant={getStatusVariant(beneficiary.status) as any}>
                  {beneficiary.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
              <div className="grid gap-2">
                {beneficiary.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {beneficiary.email}
                  </div>
                )}
                {beneficiary.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {beneficiary.phone}
                  </div>
                )}
                {beneficiary.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {beneficiary.address}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Wallet className="h-4 w-4" />
                  Total Received
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(beneficiary.totalReceived || 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Last Donation
                </div>
                <p className="text-lg font-semibold">
                  {formatDate(beneficiary.lastDonationDate)}
                </p>
              </div>
            </div>

            {/* Family */}
            {beneficiary.family && (
              <div className="p-3 rounded-lg border">
                <h4 className="text-sm font-medium mb-1">Family</h4>
                <p className="text-sm text-muted-foreground">
                  {beneficiary.family.name} ({beneficiary.family.memberCount} members)
                </p>
              </div>
            )}

            {/* Notes */}
            {beneficiary.eligibilityNotes && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm">{beneficiary.eligibilityNotes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editData.firstName}
                  onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editData.lastName}
                  onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editData.address}
                onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eligibilityNotes">Eligibility Notes</Label>
              <Textarea
                id="eligibilityNotes"
                value={editData.eligibilityNotes}
                onChange={(e) => setEditData(prev => ({ ...prev, eligibilityNotes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
