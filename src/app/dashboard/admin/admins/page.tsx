'use client';

import { useState, useEffect, useMemo } from 'react';
import { userApi, User as ApiUser } from '@/store/services/userApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Mail,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  QrCode,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserQRCard } from '@/components/users/UserQRCard';
import Link from 'next/link';

export interface User {
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

export default function AdminAdminsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mobileDisplayCount, setMobileDisplayCount] = useState(10);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showQRCard, setShowQRCard] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<User | null>(null);
  const [createFormData, setCreateFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    address: {
      line1: '',
      line2: '',
      province: '',
      district: '',
    },
  });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // API hooks
  const { data: usersData, isLoading } = userApi.useGetUsersQuery({
    limit: 100,
    offset: 0,
  });
  const { data: provincesData } = userApi.useGetProvincesQuery({});
  const [createUser] = userApi.useCreateUserMutation();
  const [deleteUser] = userApi.useDeleteUserMutation();

  // Reset form when drawer opens
  useEffect(() => {
    if (isCreateDrawerOpen) {
      setCreateFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        address: {
          line1: '',
          line2: '',
          province: '',
          district: '',
        },
      });
      setAutoGeneratePassword(false);
      setShowPassword(false);
    }
  }, [isCreateDrawerOpen]);

  // Populate users from API
  useEffect(() => {
    if (usersData?.data) {
      const mappedUsers = usersData.data.map((user: any) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role === 'user' ? 'USER' : user.role === 'admin' ? 'ADMIN' : user.role === 'trainer' ? 'TRAINEE' : String(user.role).toUpperCase(),
        status: user.status.toUpperCase(),
        phone: user.phone,
        department: user.department,
        address: user.address,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));
      setUsers(mappedUsers);
    }
  }, [usersData]);

  const filteredUsers = users.filter((user) => {
    // Only show admin users
    if (user.role !== 'ADMIN') return false;

    const matchesSearch =
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address?.district?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Mobile users with "show more"
  const mobileUsers = useMemo(() => {
    return filteredUsers.slice(0, mobileDisplayCount);
  }, [filteredUsers, mobileDisplayCount]);

  const hasMoreMobileUsers = mobileDisplayCount < filteredUsers.length;

  const loadMoreMobile = () => {
    setMobileDisplayCount((prev) => Math.min(prev + 10, filteredUsers.length));
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default'; // green
      case 'PENDING':
        return 'secondary'; // yellow
      case 'REJECTED':
        return 'destructive'; // red
      case 'SUSPENDED':
        return 'outline'; // gray
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <AlertTriangle className="w-3 h-3" />;
      case 'REJECTED':
        return <XCircle className="w-3 h-3" />;
      case 'SUSPENDED':
        return <UserX className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Create user form handlers
  const handleCreateFormChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCreateFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setCreateFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Auto-generate password when checkbox is toggled on
  useEffect(() => {
    if (autoGeneratePassword) {
      const newPassword = generatePassword();
      setCreateFormData(prev => ({ ...prev, password: newPassword }));
    } else {
      setCreateFormData(prev => ({ ...prev, password: '' }));
    }
  }, [autoGeneratePassword]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.first_name || !createFormData.last_name || !createFormData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingUser(true);

    try {
      const password = autoGeneratePassword ? generatePassword() : createFormData.password;
      const username = (createFormData.email || createFormData.first_name.toLowerCase()) + Math.random().toString(36).substring(2, 8);

      const response = await createUser({
        first_name: createFormData.first_name,
        last_name: createFormData.last_name,
        username,
        email: createFormData.email || undefined,
        password,
        phone: createFormData.phone,
        department: createFormData.department || undefined,
        address: createFormData.address.line1 || createFormData.address.line2 || createFormData.address.province || createFormData.address.district ? createFormData.address : undefined,
        type: 'admin',
      }).unwrap();

      // Use the real user data from API response
      const newUserData: User = {
        id: response.data.id,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        username: response.data.username,
        email: response.data.email,
        role: String(response.data.role).toUpperCase(),
        status: response.data.status.toUpperCase(),
        phone: response.data.phone,
        department: response.data.department,
        is_verified: response.data.is_verified,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
      };

      setCreatedUserData(newUserData);
      setShowQRCard(true);

      toast.success('Admin created successfully!');

      // Show generated password if auto-generated
      if (autoGeneratePassword) {
        toast.info(`Generated password: ${password}`, {
          duration: 10000,
        });
      }

      // Reset form and close drawer
      setCreateFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        department: '',
        address: {
          line1: '',
          line2: '',
          province: '',
          district: '',
        },
      });
      setIsCreateDrawerOpen(false);

      // The query will automatically refetch, but we could trigger a manual refetch if needed
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error?.data?.message || 'Failed to create admin');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete admin ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId).unwrap();
      toast.success('Admin deleted successfully');
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error?.data?.message || 'Failed to delete admin');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Manage system administrators
          </p>
        </div>
        <Sheet open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create Admin
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Admin</SheetTitle>
              <SheetDescription>
                Create a new administrator account with full system access
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_first_name">First Name *</Label>
                    <Input
                      id="create_first_name"
                      value={createFormData.first_name}
                      onChange={(e) => handleCreateFormChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_last_name">Last Name *</Label>
                    <Input
                      id="create_last_name"
                      value={createFormData.last_name}
                      onChange={(e) => handleCreateFormChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create_email">Email Address</Label>
                  <Input
                    id="create_email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => handleCreateFormChange('email', e.target.value)}
                    placeholder="Enter email address (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create_phone">Phone Number *</Label>
                  <Input
                    id="create_phone"
                    value={createFormData.phone}
                    onChange={(e) => handleCreateFormChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Address Fields */}
                <div className="space-y-4">
                  <Label>Address</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="create_address_line1">Line 1</Label>
                    <Input
                      id="create_address_line1"
                      value={createFormData.address.line1}
                      onChange={(e) => handleCreateFormChange('address.line1', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create_address_line2">Line 2</Label>
                    <Input
                      id="create_address_line2"
                      value={createFormData.address.line2}
                      onChange={(e) => handleCreateFormChange('address.line2', e.target.value)}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create_province">Province</Label>
                      <Select
                        value={createFormData.address.province}
                        onValueChange={(value) => handleCreateFormChange('address.province', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provincesData?.data?.map((province: any) => (
                            <SelectItem key={province.id} value={province.province_name}>
                              {province.province_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create_district">District</Label>
                      <Select
                        value={createFormData.address.district}
                        onValueChange={(value) => handleCreateFormChange('address.district', value)}
                        disabled={!createFormData.address.province}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {provincesData?.data
                            ?.find((province: any) => province.province_name === createFormData.address.province)
                            ?.districts.map((district: any) => (
                              <SelectItem key={district.id} value={district.district_name}>
                                {district.district_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="create_department">Department</Label>
                  <Input
                    id="create_department"
                    value={createFormData.department}
                    onChange={(e) => handleCreateFormChange('department', e.target.value)}
                    placeholder="Enter department"
                  />
                </div> */}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoGenerate"
                      checked={autoGeneratePassword}
                      onCheckedChange={(checked) => setAutoGeneratePassword(checked as boolean)}
                    />
                    <Label htmlFor="autoGenerate">Auto-generate password</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create_password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="create_password"
                        type={showPassword ? "text" : "password"}
                        value={createFormData.password}
                        onChange={(e) => handleCreateFormChange('password', e.target.value)}
                        placeholder={autoGeneratePassword ? "Auto-generated password" : "Enter password"}
                        required
                        disabled={autoGeneratePassword}
                        className={autoGeneratePassword ? "pr-10 bg-slate-50" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                    {autoGeneratePassword && (
                      <p className="text-xs text-slate-500">
                        Password will be automatically generated and displayed above
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" disabled={isCreatingUser} className="flex-1">
                    {isCreatingUser ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Admin...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Create Admin
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDrawerOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">System Administrators ({filteredUsers.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {mobileUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/admins/${user.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setCreatedUserData(user);
                            setShowQRCard(true);
                          }}>
                            <QrCode className="w-4 h-4 mr-2" />
                            View Barcode
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Admin
                          </DropdownMenuItem>
                          {user.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserX className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {user.status === 'APPROVED' && (
                            <DropdownMenuItem>
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {user.status === 'SUSPENDED' && (
                            <DropdownMenuItem>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/admins/${user.id}?edit=true`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Admin
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs gap-1">
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                      {user.address?.district && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {user.address.district}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {/* Show More Button */}
                {hasMoreMobileUsers && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={loadMoreMobile}
                    >
                      Show More ({filteredUsers.length - mobileDisplayCount} remaining)
                    </Button>
                  </div>
                )}

                {/* Mobile count info */}
                <p className="text-center text-xs text-slate-500 pt-2">
                  Showing {mobileUsers.length} of {filteredUsers.length} admins
                </p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 dark:text-slate-400">
                            {user.address?.district || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)} className="gap-1">
                            {getStatusIcon(user.status)}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/admins/${user.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setCreatedUserData(user);
                                setShowQRCard(true);
                              }}>
                                <QrCode className="w-4 h-4 mr-2" />
                                View Barcode
                              </DropdownMenuItem>
                              {user.status === 'PENDING' && (
                                <>
                                  <DropdownMenuItem>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {user.status === 'APPROVED' && (
                                <DropdownMenuItem>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {user.status === 'SUSPENDED' && (
                                <DropdownMenuItem>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/admins/${user.id}?edit=true`}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit Admin
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                No administrators found.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Add your first administrator to get started with admin management.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Card Modal */}
      {showQRCard && createdUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <UserQRCard
              userData={{
                id: createdUserData.id,
                first_name: createdUserData.first_name,
                last_name: createdUserData.last_name,
                email: createdUserData.email,
                role: createdUserData.role,
                username: createdUserData.username,
              }}
              onClose={() => {
                setShowQRCard(false);
                setCreatedUserData(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}