import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const NewDonation = () => {
  return (
    <DashboardLayout userRole="association_member">
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
              {/* Beneficiary Selection */}
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ahmed Hassan (Al-Hassan Family)</SelectItem>
                    <SelectItem value="2">Maria Garcia (Garcia Family)</SelectItem>
                    <SelectItem value="3">John Smith (Smith Household)</SelectItem>
                    <SelectItem value="4">Fatima Ali (Ali Family)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Donation Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Donation Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food Assistance</SelectItem>
                    <SelectItem value="financial">Financial Aid</SelectItem>
                    <SelectItem value="medical">Medical Support</SelectItem>
                    <SelectItem value="education">Education Support</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount / Value */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount / Value ($)</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (if applicable)</Label>
                  <Input id="quantity" type="number" placeholder="1" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Provide details about the donation..." rows={3} />
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Donation Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Donor</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="fund">Association Fund</SelectItem>
                    <SelectItem value="government">Government Grant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Eligibility Check Notice */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> The system will automatically verify beneficiary eligibility based on configured rules before approving this donation.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button className="flex-1">Submit Donation</Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/donations">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewDonation;
