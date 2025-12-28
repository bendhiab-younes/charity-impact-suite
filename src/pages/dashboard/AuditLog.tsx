import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Filter } from "lucide-react";

const auditLogs = [
  { id: "1", action: "Donation Created", user: "Sarah Johnson", target: "Donation #1234", timestamp: "2024-12-28 14:32:15", type: "create" },
  { id: "2", action: "Beneficiary Updated", user: "Michael Chen", target: "Ahmed Hassan", timestamp: "2024-12-28 13:45:00", type: "update" },
  { id: "3", action: "Rule Modified", user: "Sarah Johnson", target: "Food Aid Rule", timestamp: "2024-12-28 11:20:33", type: "update" },
  { id: "4", action: "User Invited", user: "Sarah Johnson", target: "emily@example.com", timestamp: "2024-12-27 16:55:00", type: "create" },
  { id: "5", action: "Donation Approved", user: "Michael Chen", target: "Donation #1233", timestamp: "2024-12-27 15:30:22", type: "approve" },
  { id: "6", action: "Family Registered", user: "Michael Chen", target: "Garcia Family", timestamp: "2024-12-27 14:10:00", type: "create" },
  { id: "7", action: "Donation Rejected", user: "Sarah Johnson", target: "Donation #1232", timestamp: "2024-12-27 10:45:18", type: "reject" },
  { id: "8", action: "Settings Changed", user: "Sarah Johnson", target: "Association Settings", timestamp: "2024-12-26 09:00:00", type: "update" },
];

const typeColors: Record<string, string> = {
  create: "default",
  update: "secondary",
  approve: "default",
  reject: "destructive",
};

const AuditLog = () => {
  return (
    <DashboardLayout userRole="association_admin">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-muted-foreground">Complete activity history for transparency and compliance</p>
          </div>
          <Button variant="outline">
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
                <Input placeholder="Search actions, users, or targets..." className="pl-10" />
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
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.action}</span>
                      <Badge variant={typeColors[log.type] as "default" | "secondary" | "destructive"}>
                        {log.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground">{log.user}</span> → {log.target}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline">Load More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLog;
