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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface EditRuleModalProps {
  ruleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditRuleModal({ 
  ruleId, 
  open, 
  onOpenChange,
  onSuccess 
}: EditRuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FREQUENCY',
    value: '',
    unit: 'days',
    isActive: true,
  });

  useEffect(() => {
    const fetchRule = async () => {
      if (!ruleId || !open) return;
      
      setIsLoading(true);
      try {
        const rule = await api.getRule(ruleId);
        setFormData({
          name: rule.name || '',
          description: rule.description || '',
          type: rule.type || 'FREQUENCY',
          value: rule.value?.toString() || '',
          unit: rule.unit || 'days',
          isActive: rule.isActive ?? true,
        });
      } catch (err: any) {
        toast.error('Failed to load rule details');
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRule();
  }, [ruleId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleId) return;

    if (!formData.name || !formData.value || !formData.description) {
      toast.error('Name, description, and value are required');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateRule(ruleId, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        unit: formData.unit,
        isActive: formData.isActive,
      });
      toast.success('Rule updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rule');
    } finally {
      setIsSaving(false);
    }
  };

  const getUnitOptions = () => {
    switch (formData.type) {
      case 'FREQUENCY':
        return [
          { value: 'days', label: 'Days' },
          { value: 'weeks', label: 'Weeks' },
          { value: 'months', label: 'Months' },
        ];
      case 'AMOUNT':
        return [
          { value: 'currency', label: 'TND (Currency)' },
        ];
      case 'ELIGIBILITY':
        return [
          { value: 'members', label: 'Family Members' },
          { value: 'score', label: 'Eligibility Score' },
        ];
      default:
        return [{ value: 'units', label: 'Units' }];
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Rule</DialogTitle>
          <DialogDescription>
            Update the rule configuration
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
              onValueChange={(v) => setFormData(prev => ({ ...prev, type: v, unit: v === 'AMOUNT' ? 'currency' : 'days' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREQUENCY">Frequency (Time-based)</SelectItem>
                <SelectItem value="AMOUNT">Amount (Value-based)</SelectItem>
                <SelectItem value="ELIGIBILITY">Eligibility (Criteria-based)</SelectItem>
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this rule does..."
              rows={2}
              required
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">Enable this rule</p>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
