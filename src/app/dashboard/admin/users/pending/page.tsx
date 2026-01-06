'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/store/services/userApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PendingUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  phone?: string;
  department?: string;
}

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: usersData, isLoading } = userApi.useGetUsersQuery({
    limit: 100,
    offset: 0,
  });

  // Filter pending users
  useEffect(() => {
    if (usersData?.data) {
      const pending = usersData.data
        .filter((user) => user.status === 'pending' || user.status === 'PENDING')
        .map((user) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role === 'user' ? 'USER' : user.role === 'admin' ? 'ADMIN' : user.role === 'trainer' ? 'TRAINEE' : String(user.role).toUpperCase(),
          status: user.status.toUpperCase(),
          created_at: user.created_at,
          phone: user.phone,
          department: user.department,
        }));
      setPendingUsers(pending);
    }
  }, [usersData]);

  const handleAction = (user: PendingUser, actionType: 'approve' | 'reject') => {
    setSelectedUser(user);
    setAction(actionType);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !action) return;

    setIsProcessing(true);

    try {
      // Here you would call the appropriate API endpoint
      // For now, we'll simulate the action
      if (action === 'approve') {
        // PUT /api/admin/users/:id/approve
        toast.success(`${selectedUser.first_name} ${selectedUser.last_name} has been approved!`);
      } else {
        // PUT /api/admin/users/:id/reject
        toast.success(`${selectedUser.first_name} ${selectedUser.last_name} has been rejected.`);
      }

      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setAction(null);
    } catch (error) {
      toast.error('Failed to process user action');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'TRAINEE':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Pending User Approvals
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Review and approve new user registrations
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              There are no pending user approvals at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        Applied {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/dashboard/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(user, 'approve')}
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAction(user, 'reject')}
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve User' : 'Reject User'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? `Are you sure you want to approve ${selectedUser?.first_name} ${selectedUser?.last_name}? They will gain full access to the system.`
                : `Are you sure you want to reject ${selectedUser?.first_name} ${selectedUser?.last_name}? They will be blocked from accessing the system.`
              }
            </DialogDescription>
          </DialogHeader>

          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isProcessing}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : action === 'approve' ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Approve User
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Reject User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}