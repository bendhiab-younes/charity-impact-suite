import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
  associationId: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function useAuditLogs(limit?: number) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user?.associationId && user?.role?.toUpperCase() !== 'SUPER_ADMIN') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getAuditLogs(user?.associationId, limit);
      setLogs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.associationId, user?.role, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  };
}
