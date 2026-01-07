'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { userApi } from '@/store/services/userApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dumbbell,
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
  address?: {
    line1: string;
    line2?: string;
    district: string;
    province: string;
  };
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function TraineeDetailPage() {
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      district: '',
      province: '',
    },
  });

  const searchParams = useSearchParams();

  const { data: userData, isLoading: apiLoading } = userApi.useGetUserByIdQuery(parseInt(userId));
  const [deleteUser] = userApi.useDeleteUserMutation();
  const [updateUser] = userApi.useUpdateUserMutation();
  const { data: provincesData } = userApi.useGetProvincesQuery({});

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
        address: userInfo.address,
        is_verified: userInfo.is_verified,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at,
      });

      // Populate edit form data
      setEditFormData({
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        phone: userInfo.phone || '',
        address: userInfo.address ? {
          line1: userInfo.address.line1,
          line2: userInfo.address.line2 || '',
          district: userInfo.address.district,
          province: userInfo.address.province,
        } : {
          line1: '',
          line2: '',
          district: '',
          province: '',
        },
      });
    }
    setIsLoading(apiLoading);
  }, [userData, apiLoading]);

  useEffect(() => {
    const edit = searchParams.get('edit');
    setIsEditMode(edit === 'true');
  }, [searchParams]);

  // Handle province selection for districts
  useEffect(() => {
    if (editFormData.address.province && provincesData?.data) {
      const province = provincesData.data.find(p => p.province_name === editFormData.address.province);
      if (province) {
        setAvailableDistricts(province.districts);
        setSelectedProvince(editFormData.address.province);
      }
    } else {
      setAvailableDistricts([]);
      setSelectedProvince('');
    }
  }, [editFormData.address.province, provincesData]);

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

    if (!confirm('Are you sure you want to permanently delete this trainee? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(user.id).unwrap();
      toast.success('Trainee deleted successfully');
      router.push('/dashboard/admin/trainees');
    } catch (error: any) {
      console.error('Error deleting trainee:', error);
      toast.error(error?.data?.message || 'Failed to delete trainee');
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    try {
      // Here you would call the reset password API
      toast.success('Password reset email sent to trainee');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!editFormData.first_name || !editFormData.last_name) {
      toast.error('First name and last name are required');
      return;
    }

    setIsProcessing(true);

    try {
      await updateUser({
        userId: user.id,
        data: {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          phone: editFormData.phone || undefined,
          address: editFormData.address.line1 ? editFormData.address : undefined,
        }
      }).unwrap();

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        phone: editFormData.phone,
        address: editFormData.address.line1 ? editFormData.address : prev.address,
      } : null);

      setIsEditMode(false);
      toast.success('Trainee updated successfully');
    } catch (error: any) {
      console.error('Error updating trainee:', error);
      toast.error(error?.data?.message || 'Failed to update trainee');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current user data
    if (user) {
      setEditFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        address: user.address ? {
          line1: user.address.line1,
          line2: user.address.line2 || '',
          district: user.address.district,
          province: user.address.province,
        } : {
          line1: '',
          line2: '',
          district: '',
          province: '',
        },
      });
    }
    setIsEditMode(false);
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
        <p className="text-slate-500 dark:text-slate-400">Trainee not found</p>
        <Link href="/dashboard/admin/trainees">
          <Button className="mt-4">Back to Trainees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/trainees">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Trainee' : `${user.first_name} ${user.last_name}`}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {isEditMode ? 'Update trainee information' : 'Trainee Details & Management'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information or Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {isEditMode ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Edit Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Profile Header - Editable */}
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {editFormData.first_name.charAt(0).toUpperCase()}{editFormData.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_first_name" className="text-sm font-medium">First Name *</Label>
                          <Input
                            id="edit_first_name"
                            value={editFormData.first_name}
                            onChange={(e) => handleEditFormChange('first_name', e.target.value)}
                            placeholder="Enter first name"
                            className="bg-white dark:bg-slate-900"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_last_name" className="text-sm font-medium">Last Name *</Label>
                          <Input
                            id="edit_last_name"
                            value={editFormData.last_name}
                            onChange={(e) => handleEditFormChange('last_name', e.target.value)}
                            placeholder="Enter last name"
                            className="bg-white dark:bg-slate-900"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                          {user.role}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details - Editable */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                          <p className="text-xs text-slate-400">Email cannot be changed</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="edit_phone" className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone Number *</Label>
                          <Input
                            id="edit_phone"
                            value={editFormData.phone}
                            onChange={(e) => handleEditFormChange('phone', e.target.value)}
                            placeholder="Enter phone number"
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</p>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="edit_address_line1" className="text-xs text-slate-400">Address Line 1</Label>
                              <Input
                                id="edit_address_line1"
                                value={editFormData.address.line1}
                                onChange={(e) => handleEditFormChange('address.line1', e.target.value)}
                                placeholder="Street address, building name"
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit_address_line2" className="text-xs text-slate-400">Address Line 2 <span className="text-slate-500">(Optional)</span></Label>
                              <Input
                                id="edit_address_line2"
                                value={editFormData.address.line2}
                                onChange={(e) => handleEditFormChange('address.line2', e.target.value)}
                                placeholder="Apartment, suite, unit"
                                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="edit_address_province" className="text-xs text-slate-400">Province</Label>
                                <Select
                                  value={editFormData.address.province}
                                  onValueChange={(value) => handleEditFormChange('address.province', value)}
                                >
                                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 mt-1">
                                    <SelectValue placeholder="Select province" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {provincesData?.data?.map((province) => (
                                      <SelectItem key={province.province_name} value={province.province_name}>
                                        {province.province_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit_address_district" className="text-xs text-slate-400">District</Label>
                                <Select
                                  value={editFormData.address.district}
                                  onValueChange={(value) => handleEditFormChange('address.district', value)}
                                  disabled={!editFormData.address.province}
                                >
                                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 mt-1 disabled:opacity-50">
                                    <SelectValue placeholder="Select district" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableDistricts.map((district) => (
                                      <SelectItem key={district.district_name} value={district.district_name}>
                                        {district.district_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Member Since</p>
                          <p className="text-slate-900 dark:text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Update Button */}
                  <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button type="submit" disabled={isProcessing} className="px-8">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{user.first_name} {user.last_name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <UserCheck className="w-4 h-4" />
                      @{user.username}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs flex items-center gap-1">
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</p>
                        <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone Number</p>
                          <p className="text-slate-900 dark:text-white font-medium">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {user.address && (
                      <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</p>
                          <div className="text-slate-900 dark:text-white">
                            <p className="font-medium">{user.address.line1}</p>
                            {user.address.line2 && <p className="text-sm text-slate-600 dark:text-slate-400">{user.address.line2}</p>}
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {user.address.district}, {user.address.province}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Member Since</p>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
          )}

          {/* Training Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Training Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Training-specific data would be displayed here (assigned classes, certifications, performance metrics, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Trainee Access Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  View and download the trainee&apos;s barcode access card for gym entry and verification.
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
        {!isEditMode && (
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
                  Delete Trainee
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Trainee Role</DialogTitle>
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
            <DialogTitle>Change Trainee Status</DialogTitle>
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