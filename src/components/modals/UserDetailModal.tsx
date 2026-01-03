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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Mail, Shield, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UserDetailModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit';
  onSuccess?: () => void;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ASSOCIATION_ADMIN: 'Admin',
  ASSOCIATION_MEMBER: 'Member',
  DONOR: 'Donor',
};

export function UserDetailModal({ 
  userId, 
  open, 
  onOpenChange, 
  mode,
  onSuccess 
}: UserDetailModalProps) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !open) return;
      
      setIsLoading(true);
      try {
        const data = await api.getUser(userId);
        setUserData(data);
        setEditData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'ASSOCIATION_MEMBER',
        });
      } catch (err: any) {
        toast.error('Failed to load user details');
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await api.updateUser(userId, {
        name: editData.name,
        email: editData.email,
        role: editData.role,
      });
      toast.success('User updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'User Profile' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? 'View user account details'
              : 'Update user information'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xl font-medium">
                {userData.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{userData.name}</h3>
                <Badge variant="default">
                  {roleLabels[userData.role?.toUpperCase()] || userData.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>{roleLabels[userData.role?.toUpperCase()] || userData.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(userData.createdAt)}</span>
              </div>
            </div>

            {userData.association && (
              <div className="p-3 rounded-lg border">
                <h4 className="text-sm font-medium mb-1">Association</h4>
                <p className="text-sm text-muted-foreground">{userData.association.name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editData.role}
                onValueChange={(v) => setEditData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSOCIATION_ADMIN">Admin</SelectItem>
                  <SelectItem value="ASSOCIATION_MEMBER">Member</SelectItem>
                  <SelectItem value="DONOR">Donor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={isSaving || !editData.name || !editData.email}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
