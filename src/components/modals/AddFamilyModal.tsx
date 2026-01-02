import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddFamilyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddFamilyModal({ open, onOpenChange, onSuccess }: AddFamilyModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    memberCount: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      memberCount: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }

    if (!formData.name) {
      toast.error('Family name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createFamily({
        associationId: user.associationId,
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        memberCount: formData.memberCount ? parseInt(formData.memberCount) : undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Family registered successfully');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register family');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Register New Family</DialogTitle>
          <DialogDescription>
            Add a new family household to the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Family Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Al-Hassan Family"
              required
            />
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
              <Label htmlFor="memberCount">Members</Label>
              <Input
                id="memberCount"
                type="number"
                min="1"
                value={formData.memberCount}
                onChange={(e) => setFormData(prev => ({ ...prev, memberCount: e.target.value }))}
                placeholder="Number of members"
              />
            </div>
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
              placeholder="Additional notes about the family..."
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
                  Registering...
                </>
              ) : (
                'Register Family'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
