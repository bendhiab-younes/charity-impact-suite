import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  associationId: string | null;
  createdAt: string;
}

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Super admins see all users, association admins see only their association's users
      const userRole = user.role?.toUpperCase();
      const associationId = userRole === 'SUPER_ADMIN' ? undefined : user.associationId;
      const data = await api.getUsers(associationId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.id, user?.role, user?.associationId]);

  const deleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  // Calculate stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ASSOCIATION_ADMIN' || u.role === 'SUPER_ADMIN').length,
    members: users.filter(u => u.role === 'ASSOCIATION_MEMBER').length,
    donors: users.filter(u => u.role === 'DONOR').length,
  };

  return {
    users,
    isLoading,
    error,
    stats,
    deleteUser,
    refetch: fetchUsers,
  };
}
