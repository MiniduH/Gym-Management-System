'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserQRCard } from '@/components/users/UserQRCard';

interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  department?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showQRCard, setShowQRCard] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: userData, isLoading: apiLoading } = userApi.useGetUserByIdQuery(parseInt(userId));

  useEffect(() => {
    if (userData?.data) {
      const userInfo = userData.data;
      setUser({
        id: userInfo.id,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        username: userInfo.username,
        email: userInfo.email,
        role: String(userInfo.role).toUpperCase(),
        status: userInfo.status.toUpperCase(),
        phone: userInfo.phone,
        department: userInfo.department,
        is_verified: userInfo.is_verified,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at,
      });
    }
    setIsLoading(apiLoading);
  }, [userData, apiLoading]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      case 'SUSPENDED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertTriangle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'SUSPENDED':
        return <UserX className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleRoleChange = async () => {
    if (!user || !newRole) return;

    setIsProcessing(true);
    try {
      // Here you would call the API to update user role
      // For now, simulate the update
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      setShowRoleDialog(false);
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async () => {
    if (!user || !newStatus) return;

    setIsProcessing(true);
    try {
      // Here you would call the appropriate API based on the action
      // PUT /api/admin/users/:id/approve, /suspend, /activate, etc.
      setUser(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusDialog(false);
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Here you would call DELETE /api/admin/users/:id
      toast.success('User deleted successfully');
      router.push('/dashboard/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    try {
      // Here you would call the reset password API
      toast.success('Password reset email sent to user');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">User not found</p>
        <Link href="/dashboard/admin/users">
          <Button className="mt-4">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            User Details & Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {user.first_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
                  <p className="text-slate-500 dark:text-slate-400">@{user.username}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Data */}
          {user.role === 'TRAINEE' && (
            <Card>
              <CardHeader>
                <CardTitle>Training Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Training-specific data would be displayed here (specialization, assigned classes, etc.)
                </p>
              </CardContent>
            </Card>
          )}

          {user.role === 'USER' && (
            <Card>
              <CardHeader>
                <CardTitle>Member Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Member-specific data would be displayed here (bookings, workouts, etc.)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Barcode Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                User Access Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  View and download the user&apos;s barcode access card for gym entry and verification.
                </p>
                <Button
                  onClick={() => setShowQRCard(true)}
                  className="w-full sm:w-auto gap-2"
                >
                  <Key className="w-4 h-4" />
                  View Barcode
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewRole(user.role);
                      setShowRoleDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(user.status)} className="gap-1">
                    {getStatusIcon(user.status)}
                    {user.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewStatus(user.status);
                      setShowStatusDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleResetPassword}
                >
                  <Key className="w-4 h-4" />
                  Reset Password
                </Button>

                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleDeleteUser}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {user.first_name} {user.last_name}. This will affect their permissions in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="TRAINEE">TRAINEE</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Status</DialogTitle>
            <DialogDescription>
              Update the status for {user.first_name} {user.last_name}. This will affect their access to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Card Modal */}
      {showQRCard && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <UserQRCard
              userData={{
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                username: user.username,
              }}
              onClose={() => setShowQRCard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}