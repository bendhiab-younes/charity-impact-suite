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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associationId: string;
  associationName: string;
  onSuccess?: () => void;
}

export function DonateModal({ 
  open, 
  onOpenChange, 
  associationId, 
  associationName,
  onSuccess 
}: DonateModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'CARD',
    type: 'ONE_TIME',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the new contributions API instead of legacy donations
      await api.createContribution({
        associationId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        method: formData.method,
        notes: formData.notes || undefined,
      });
      
      toast.success('Thank you! Your contribution has been submitted and is pending approval.');
      setFormData({ amount: '', method: 'CARD', type: 'ONE_TIME', notes: '' });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Make a Donation
          </DialogTitle>
          <DialogDescription>
            Contribute to {associationName}. Your contribution will add to their budget to help beneficiaries in need.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (TND) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter donation amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          {/* Donation Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Donation Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_TIME">One-time Donation</SelectItem>
                <SelectItem value="RECURRING">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select 
              value={formData.method} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, method: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Message (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a personal message..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Donate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
