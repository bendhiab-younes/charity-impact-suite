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
import { Loader2, Users, MapPin, Calendar, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface FamilyDetailModalProps {
  familyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
  onSuccess?: () => void;
}

export function FamilyDetailModal({ 
  familyId, 
  open, 
  onOpenChange, 
  mode,
  onSuccess 
}: FamilyDetailModalProps) {
  const [family, setFamily] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    address: '',
    memberCount: '',
  });

  useEffect(() => {
    const fetchFamily = async () => {
      if (!familyId || !open) return;
      
      setIsLoading(true);
      try {
        const data = await api.getFamily(familyId);
        setFamily(data);
        setEditData({
          name: data.name || '',
          address: data.address || '',
          memberCount: data.memberCount?.toString() || '1',
        });
      } catch (err: any) {
        toast.error('Failed to load family details');
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamily();
  }, [familyId, open]);

  const handleSave = async () => {
    if (!familyId) return;
    
    setIsSaving(true);
    try {
      await api.updateFamily(familyId, {
        name: editData.name,
        address: editData.address || undefined,
        memberCount: parseInt(editData.memberCount) || 1,
      });
      toast.success('Family updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update family');
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!family) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'Family Details' : 'Edit Family'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'View family information and donation history'
              : 'Update family information'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{family.name}</h3>
                <Badge variant={family.status === 'ELIGIBLE' ? 'success' : 'secondary'}>
                  {family.status?.toLowerCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{family.memberCount || 1} members</span>
              </div>
              {family.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{family.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Wallet className="h-4 w-4" />
                  Total Received
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(family.totalReceived || 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Last Donation
                </div>
                <p className="text-lg font-semibold">
                  {formatDate(family.lastDonationDate)}
                </p>
              </div>
            </div>

            {family.beneficiaries?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Beneficiaries ({family.beneficiaries.length})
                </h4>
                <div className="space-y-1">
                  {family.beneficiaries.map((b: any) => (
                    <div key={b.id} className="text-sm p-2 bg-muted/30 rounded">
                      {b.firstName} {b.lastName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Family Name *</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberCount">Number of Members</Label>
              <Input
                id="memberCount"
                type="number"
                min="1"
                value={editData.memberCount}
                onChange={(e) => setEditData(prev => ({ ...prev, memberCount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editData.address}
                onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={isSaving || !editData.name}>
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
