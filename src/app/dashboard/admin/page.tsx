'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Users, UserCheck, UserX, Clock, Plus, Eye, Ticket, Scan, TrendingUp, Activity, Loader2, UserPlus, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { userApi } from '@/store/services/userApi';
import { toast } from 'sonner';
import { UserQRCard } from '@/components/users/UserQRCard';
import { CreateUserForm } from '@/components/CreateUserForm';

export default function AdminDashboard() {
  // Mock data - in real app, fetch from API
  const [stats, setStats] = useState({
    totalUsers: 156,
    pendingApprovals: 8,
    activeUsers: 142,
    trainees: 23,
    totalTickets: 1247,
    ticketsToday: 89,
    ocrScans: 2156,
    ocrScansToday: 234,
    successRate: 94.2,
    processingTime: 2.3,
  });

  // Modal states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateTrainerOpen, setIsCreateTrainerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCard, setShowQRCard] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
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
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // API hooks
  const [createUser] = userApi.useCreateUserMutation();
  const { data: provincesData } = userApi.useGetProvincesQuery({});

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent, userType: 'user' | 'trainer') => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const password = autoGeneratePassword ? generatePassword() : formData.password;

      const username = (formData.email || formData.first_name.toLowerCase()) + Math.random().toString(36).substring(2, 8);

      const response = await createUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username,
        email: formData.email || undefined,
        password,
        phone: formData.phone,
        department: formData.department || undefined,
        address: formData.address.line1 || formData.address.line2 || formData.address.province || formData.address.district ? formData.address : undefined,
        type: userType, // 'user' or 'trainer'
        // Admin-created users are auto-approved (handled on backend)
      }).unwrap();

      // Use the real user data from API response
      const newUserData = {
        id: response.data.id,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        username: response.data.username,
        email: response.data.email,
        role: String(response.data.role).toUpperCase(),
      };

      setCreatedUserData(newUserData);
      setShowQRCard(true);

      toast.success(`${userType === 'user' ? 'User' : 'Trainer'} created successfully!`);

      // Show generated password if auto-generated
      if (autoGeneratePassword) {
        toast.info(`Generated password: ${password}`, {
          duration: 10000,
        });
      }

      // Reset form
      setFormData({
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
      setIsCreateUserOpen(false);
      setIsCreateTrainerOpen(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error?.data?.message || `Failed to create ${userType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setAutoGeneratePassword(true);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        ticketsToday: prev.ticketsToday + Math.floor(Math.random() * 3),
        ocrScansToday: prev.ocrScansToday + Math.floor(Math.random() * 5),
        successRate: Math.max(90, Math.min(99, prev.successRate + (Math.random() - 0.5) * 0.5)),
        processingTime: Math.max(1.5, Math.min(3.5, prev.processingTime + (Math.random() - 0.5) * 0.2)),
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 sm:mt-2">
          Real-time system monitoring and administration
        </p>
      </div>

      {/* User Management Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trainees</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trainees}</div>
            <p className="text-xs text-muted-foreground">
              Training staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users/pending">
              <Button className="w-full gap-2" variant="outline">
                <Eye className="w-4 h-4" />
                View Pending Users
              </Button>
            </Link>
            <Dialog open={isCreateUserOpen} onOpenChange={(open) => {
              setIsCreateUserOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2" variant="outline">
                  <Plus className="w-4 h-4" />
                  Create New User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create New User
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e, 'user')} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <Label>Address</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address_line1">Line 1</Label>
                      <Input
                        id="address_line1"
                        value={formData.address.line1}
                        onChange={(e) => handleInputChange('address.line1', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address_line2">Line 2</Label>
                      <Input
                        id="address_line2"
                        value={formData.address.line2}
                        onChange={(e) => handleInputChange('address.line2', e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Select
                          value={formData.address.province}
                          onValueChange={(value) => handleInputChange('address.province', value)}
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
                        <Label htmlFor="district">District</Label>
                        <Select
                          value={formData.address.district}
                          onValueChange={(value) => handleInputChange('address.district', value)}
                          disabled={!formData.address.province}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {provincesData?.data
                              ?.find((province: any) => province.province_name === formData.address.province)
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
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
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
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating User...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create User
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateTrainerOpen} onOpenChange={(open) => {
              setIsCreateTrainerOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2" variant="outline">
                  <Plus className="w-4 h-4" />
                  Create New Trainer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create New Trainer
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e, 'trainer')} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trainer_first_name">First Name *</Label>
                      <Input
                        id="trainer_first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainer_last_name">Last Name *</Label>
                      <Input
                        id="trainer_last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainer_email">Email Address *</Label>
                    <Input
                      id="trainer_email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainer_phone">Phone Number</Label>
                    <Input
                      id="trainer_phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainer_department">Department</Label>
                    <Input
                      id="trainer_department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Enter department"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trainer_autoGenerate"
                        checked={autoGeneratePassword}
                        onCheckedChange={(checked) => setAutoGeneratePassword(checked as boolean)}
                      />
                      <Label htmlFor="trainer_autoGenerate">Auto-generate password</Label>
                    </div>

                    {!autoGeneratePassword && (
                      <div className="space-y-2">
                        <Label htmlFor="trainer_password">Password *</Label>
                        <Input
                          id="trainer_password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                          required={!autoGeneratePassword}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Trainer...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Trainer
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateTrainerOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Link href="/dashboard/admin/users">
              <Button className="w-full gap-2" variant="outline">
                <Users className="w-4 h-4" />
                Manage All Users
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">All systems operational</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* QR Card Modal */}
      {showQRCard && createdUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <UserQRCard
              userData={createdUserData}
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