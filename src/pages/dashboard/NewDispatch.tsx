import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package, Loader2, Wallet, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EligibleBeneficiary {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  totalReceived: number;
  family: {
    id: string;
    name: string;
    memberCount: number;
  };
}

const NewDispatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eligibleBeneficiaries, setEligibleBeneficiaries] = useState<EligibleBeneficiary[]>([]);
  const [budget, setBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    amount: '',
    aidType: 'CASH',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.associationId) return;
      setIsLoading(true);
      try {
        const [eligibleData, statsData] = await Promise.all([
          api.getEligibleBeneficiaries(user.associationId),
          api.getDispatchStats(user.associationId),
        ]);
        setEligibleBeneficiaries(Array.isArray(eligibleData) ? eligibleData : []);
        setBudget(statsData?.budget || 0);
      } catch (err) {
        console.error('Failed to load data', err);
        toast.error('Failed to load dispatch data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.associationId]);

  const selectedBeneficiary = eligibleBeneficiaries.find(b => b.id === formData.beneficiaryId);
  const requestedAmount = parseFloat(formData.amount) || 0;
  const isOverBudget = requestedAmount > budget;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.associationId) {
      toast.error('No association linked to your account');
      return;
    }

    if (!formData.beneficiaryId) {
      toast.error('Please select a beneficiary');
      return;
    }

    if (requestedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (isOverBudget) {
      toast.error(`Insufficient budget. Available: ${budget.toLocaleString()} TND`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.createDispatch({
        associationId: user.associationId,
        beneficiaryId: formData.beneficiaryId,
        familyId: selectedBeneficiary?.family?.id,
        amount: requestedAmount,
        aidType: formData.aidType,
        notes: formData.notes || undefined,
      });
      toast.success('Aid dispatched successfully');
      navigate('/dashboard/donations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch aid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Link to="/dashboard/donations" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Funds Management
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Dispatch Aid</h1>
          <p className="text-muted-foreground">Distribute aid from your budget to eligible beneficiaries</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Budget Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Budget</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${budget > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {budget.toLocaleString()} TND
              </div>
              <p className="text-xs text-muted-foreground">From approved contributions</p>
            </CardContent>
          </Card>

          {budget <= 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Budget Available</AlertTitle>
              <AlertDescription>
                You need approved contributions before you can dispatch aid to beneficiaries.
              </AlertDescription>
            </Alert>
          )}

          {/* Dispatch Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Dispatch Details
              </CardTitle>
              <CardDescription>Select a beneficiary and specify the aid amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Beneficiary Selection */}
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiary *</Label>
                  <Select 
                    value={formData.beneficiaryId} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, beneficiaryId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleBeneficiaries.length === 0 ? (
                        <SelectItem value="" disabled>No eligible beneficiaries</SelectItem>
                      ) : (
                        eligibleBeneficiaries.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <div className="flex flex-col">
                              <span>{b.firstName} {b.lastName}</span>
                              <span className="text-xs text-muted-foreground">
                                {b.family.name} • {b.family.memberCount} members • Received: {b.totalReceived.toLocaleString()} TND
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedBeneficiary && (
                    <p className="text-sm text-muted-foreground">
                      Family: {selectedBeneficiary.family.name} ({selectedBeneficiary.family.memberCount} members)
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TND) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    max={budget}
                    placeholder="Enter amount to dispatch"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                  {isOverBudget && (
                    <p className="text-sm text-red-500">
                      Amount exceeds available budget ({budget.toLocaleString()} TND)
                    </p>
                  )}
                  {requestedAmount > 0 && !isOverBudget && (
                    <p className="text-sm text-muted-foreground">
                      Remaining after dispatch: {(budget - requestedAmount).toLocaleString()} TND
                    </p>
                  )}
                </div>

                {/* Aid Type */}
                <div className="space-y-2">
                  <Label htmlFor="aidType">Aid Type</Label>
                  <Select 
                    value={formData.aidType} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, aidType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="FOOD">Food</SelectItem>
                      <SelectItem value="CLOTHING">Clothing</SelectItem>
                      <SelectItem value="MEDICAL">Medical</SelectItem>
                      <SelectItem value="EDUCATION">Education</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" asChild className="flex-1">
                    <Link to="/dashboard/donations">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1" 
                    disabled={isSubmitting || isOverBudget || budget <= 0 || !formData.beneficiaryId}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-2" />
                        Dispatch Aid
                      </>
                    )}
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

export default NewDispatch;
