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
  Users,
  QrCode,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserQRCard } from '@/components/users/UserQRCard';
import Link from 'next/link';
import { CreateUserForm } from '@/components/CreateUserForm';

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

export default function AdminUsersPage() {
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
    // Only show regular users
    if (user.role !== 'USER') return false;

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

  const handleCreateUser = async (e: React.FormEvent, type: 'user' | 'admin' | 'trainer' = 'user') => {
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
        type,
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

      toast.success('User created successfully!');

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

      // Refresh users list
      // The query will automatically refetch, but we could trigger a manual refetch if needed
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error?.data?.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId).unwrap();
      toast.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Manage regular users in the system
          </p>
        </div>
        <Sheet open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create User
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
              <SheetDescription>
                Create a new regular user account
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateUser} className="mt-6 space-y-6">
              <CreateUserForm
                formData={createFormData}
                onFormChange={handleCreateFormChange}
                onSubmit={handleCreateUser}
                isLoading={isCreatingUser}
                provincesData={provincesData}
                autoGeneratePassword={autoGeneratePassword}
                setAutoGeneratePassword={setAutoGeneratePassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onCancel={() => setIsCreateDrawerOpen(false)}
                buttonText="Create User"
                userType="user"
                showDepartment={false}
                includeForm={false}
              />
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">Regular Users ({filteredUsers.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.first_name.charAt(0).toUpperCase()}
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCreatedUserData(user);
                            setShowQRCard(true);
                          }}
                          title="View Barcode"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="View Details">
                          <Link href={`/dashboard/admin/users/${user.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
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
                              <Link href={`/dashboard/admin/users/${user.id}?edit=true`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit User
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                  Showing {mobileUsers.length} of {filteredUsers.length} users
                </p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
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
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.first_name.charAt(0).toUpperCase()}
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
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCreatedUserData(user);
                                setShowQRCard(true);
                              }}
                              title="View Barcode"
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="View Details">
                              <Link href={`/dashboard/admin/users/${user.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
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
                                  <Link href={`/dashboard/admin/users/${user.id}?edit=true`}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit User
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                No users found.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Add your first user to get started with user management.
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