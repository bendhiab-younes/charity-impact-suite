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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddRuleModal({ open, onOpenChange, onSuccess }: AddRuleModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'frequency',
    value: '',
    unit: 'days',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'frequency',
      value: '',
      unit: 'days',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }

    if (!formData.name || !formData.value) {
      toast.error('Name and value are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createRule({
        associationId: user.associationId,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        unit: formData.unit,
        isActive: formData.isActive,
      });
      toast.success('Rule created successfully');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnitOptions = () => {
    switch (formData.type) {
      case 'frequency':
        return [
          { value: 'days', label: 'Days' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'months', label: 'Months' },
        ];
      case 'amount':
        return [
          { value: 'currency', label: 'TND (Currency)' },
        ];
      case 'eligibility':
        return [
          { value: 'members', label: 'Family Members' },
          { value: 'score', label: 'Eligibility Score' },
        ];
      default:
        return [{ value: 'units', label: 'Units' }];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Donation Rule</DialogTitle>
          <DialogDescription>
            Configure a new eligibility or distribution rule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Monthly Donation Limit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Rule Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData(prev => ({ ...prev, type: v, unit: v === 'amount' ? 'currency' : 'days' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frequency">Frequency (Time-based)</SelectItem>
                <SelectItem value="amount">Amount (Value-based)</SelectItem>
                <SelectItem value="eligibility">Eligibility (Criteria-based)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="any"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter value"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUnitOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this rule does..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">Enable this rule immediately</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
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
                  Creating...
                </>
              ) : (
                'Create Rule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
