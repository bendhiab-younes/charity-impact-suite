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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddBeneficiaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBeneficiaryModal({ open, onOpenChange, onSuccess }: AddBeneficiaryModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [families, setFamilies] = useState<any[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    familyId: '',
    notes: '',
  });

  useEffect(() => {
    const loadFamilies = async () => {
      if (!user?.associationId || !open) return;
      setIsLoadingFamilies(true);
      try {
        const data = await api.getFamilies(user.associationId);
        setFamilies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load families', err);
      } finally {
        setIsLoadingFamilies(false);
      }
    };
    loadFamilies();
  }, [user?.associationId, open]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      nationalId: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      familyId: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createBeneficiary({
        associationId: user.associationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationalId: formData.nationalId || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        familyId: formData.familyId || undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Beneficiary added successfully');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add beneficiary');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Beneficiary</DialogTitle>
          <DialogDescription>
            Register a new beneficiary in the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                placeholder="e.g., 12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="family">Family</Label>
            <Select
              value={formData.familyId}
              onValueChange={(v) => setFormData(prev => ({ ...prev, familyId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingFamilies ? "Loading..." : "Select a family (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No family</SelectItem>
                {families.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Beneficiary'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
