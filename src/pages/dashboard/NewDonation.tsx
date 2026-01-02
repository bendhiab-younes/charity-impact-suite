import { useState, useEffect } from "react";
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
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    type: '',
    amount: '',
    method: 'CASH',
    notes: '',
  });

  useEffect(() => {
    const loadBeneficiaries = async () => {
      if (!user?.associationId) return;
      setIsLoading(true);
      try {
        const data = await api.getBeneficiaries(user.associationId);
        setBeneficiaries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load beneficiaries', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBeneficiaries();
  }, [user?.associationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.createDonation({
        associationId: user.associationId,
        beneficiaryId: formData.beneficiaryId || undefined,
        amount: parseFloat(formData.amount),
        currency: 'TND',
        type: formData.type || 'ONE_TIME',
        method: formData.method,
        notes: formData.notes || undefined,
      });
      toast.success('Donation recorded successfully');
      navigate('/dashboard/donations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create donation');
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
          <h1 className="text-2xl font-bold text-foreground">Record New Donation</h1>
          <p className="text-muted-foreground">Register a new donation for a beneficiary</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Donation Details
              </CardTitle>
              <CardDescription>Fill in the donation information below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Beneficiary Selection */}
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiary (Optional)</Label>
                  <Select 
                    value={formData.beneficiaryId} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, beneficiaryId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Loading..." : "Select a beneficiary"} />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.firstName} {b.lastName} {b.family?.name ? `(${b.family.name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/* Eligibility Check Notice */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> The system will automatically verify beneficiary eligibility based on configured rules before approving this donation.
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
                      'Submit Donation'
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
