import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NewDonation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    donorName: '',
    type: '',
    amount: '',
    method: 'CASH',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.createContribution({
        associationId: user.associationId,
        amount: parseFloat(formData.amount),
        type: formData.type || 'ONE_TIME',
        method: formData.method,
        donorName: formData.donorName || undefined,
        notes: formData.notes || undefined,
      });
      toast.success('Contribution recorded successfully');
      navigate('/dashboard/donations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Link to="/dashboard/donations" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Donations
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Record New Contribution</h1>
          <p className="text-muted-foreground">Record an incoming donation/contribution to your association</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Contribution Details
              </CardTitle>
              <CardDescription>Fill in the contribution information below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Donor Name (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="donorName">Donor Name (Optional)</Label>
                  <Input
                    id="donorName"
                    placeholder="Enter donor name (leave empty for anonymous)"
                    value={formData.donorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
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
                      <SelectValue placeholder="Select donation type" />
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
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="CHECK">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TND)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Provide details about the donation..." 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                {/* Info Notice */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Contributions will appear as pending until approved by an association administrator.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Contribution'
                    )}
                  </Button>
                  <Button variant="outline" type="button" asChild>
                    <Link to="/dashboard/donations">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewDonation;
