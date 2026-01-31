import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, User, Users } from 'lucide-react';

interface Dispatch {
  id: string;
  amount: number;
  currency: string;
  status: string;
  aidType: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
  };
  family?: {
    id: string;
    name: string;
  };
  processedBy?: {
    id: string;
    name: string;
  };
}

interface DispatchesTableProps {
  dispatches: Dispatch[];
}

const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'muted'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const aidTypeColors: Record<string, string> = {
  CASH: 'bg-emerald-100 text-emerald-800',
  FOOD: 'bg-amber-100 text-amber-800',
  CLOTHING: 'bg-blue-100 text-blue-800',
  MEDICAL: 'bg-red-100 text-red-800',
  EDUCATION: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function DispatchesTable({ dispatches }: DispatchesTableProps) {
  if (dispatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Aid Dispatched Yet</h3>
        <p className="text-muted-foreground">
          Dispatched aid to beneficiaries will appear here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beneficiary</TableHead>
          <TableHead>Family</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Aid Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Processed By</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dispatches.map((dispatch) => (
          <TableRow key={dispatch.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {dispatch.beneficiary.firstName} {dispatch.beneficiary.lastName}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {dispatch.family ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{dispatch.family.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              <span className="font-semibold text-primary">
                {dispatch.amount.toLocaleString()} {dispatch.currency}
              </span>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={`${aidTypeColors[dispatch.aidType] || aidTypeColors.OTHER} border-0`}
              >
                {dispatch.aidType}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariants[dispatch.status] || 'default'}>
                {dispatch.status}
              </Badge>
            </TableCell>
            <TableCell>
              {dispatch.processedBy ? (
                <span className="text-sm">{dispatch.processedBy.name}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistanceToNow(new Date(dispatch.createdAt), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
