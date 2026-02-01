import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Filter, Loader2 } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { toast } from "sonner";

const getActionType = (action: string): string => {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes('create') || lowerAction.includes('add') || lowerAction.includes('register')) return 'create';
  if (lowerAction.includes('update') || lowerAction.includes('edit') || lowerAction.includes('change')) return 'update';
  if (lowerAction.includes('approve') || lowerAction.includes('accept')) return 'approve';
  if (lowerAction.includes('reject') || lowerAction.includes('delete') || lowerAction.includes('remove')) return 'reject';
  return 'default';
};

const typeColors: Record<string, string> = {
  create: "default",
  update: "secondary",
  approve: "default",
  reject: "destructive",
  default: "secondary",
};

const AuditLog = () => {
  const { logs, isLoading, error } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    
    const headers = ['Date', 'Action', 'User', 'Details'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.user?.name || 'Unknown User',
      log.details || '',
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Audit log exported to CSV');
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-muted-foreground">Complete activity history for transparency and compliance</p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search actions, users, or details..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>Error loading audit logs: {error}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs
                  .filter(log => 
                    searchTerm === "" ||
                    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((log) => {
                    const actionType = getActionType(log.action);
                    return (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            <Badge variant={typeColors[actionType] as "default" | "secondary" | "destructive"}>
                              {actionType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground">{log.user?.name || 'Unknown User'}</span>
                            {log.details && ` → ${log.details}`}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLog;
