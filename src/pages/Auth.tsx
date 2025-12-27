import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, ArrowLeft, Building2, User, Users, Shield } from 'lucide-react';
import { UserRole } from '@/types';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');

  const roles = [
    { value: 'donor', label: 'Donor', description: 'Browse and donate to associations', icon: User },
    { value: 'association_admin', label: 'Association Admin', description: 'Manage your charity association', icon: Building2 },
    { value: 'association_member', label: 'Association Member', description: 'Help process donations and beneficiaries', icon: Users },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold">CharityHub</span>
        </div>

        <Card variant="elevated">
          <Tabs defaultValue={defaultTab}>
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="••••••••"
                  />
                </div>
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/dashboard">Sign In</Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input id="signup-firstname" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input id="signup-lastname" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>I want to...</Label>
                  <RadioGroup 
                    value={selectedRole} 
                    onValueChange={(v) => setSelectedRole(v as UserRole)}
                    className="space-y-2"
                  >
                    {roles.map((role) => (
                      <label
                        key={role.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedRole === role.value 
                            ? 'border-primary bg-accent' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={role.value} className="sr-only" />
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          selectedRole === role.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <role.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{role.label}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <Button variant="hero" className="w-full" asChild>
                  <Link to="/dashboard">Create Account</Link>
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Secured with industry-standard encryption</span>
        </div>
      </div>
    </div>
  );
}
