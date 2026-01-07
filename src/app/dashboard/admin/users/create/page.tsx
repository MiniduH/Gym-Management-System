'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/store/services/userApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserQRCard } from '@/components/users/UserQRCard';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCard, setShowQRCard] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
  });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  const [createUser] = userApi.useCreateUserMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const password = autoGeneratePassword ? generatePassword() : formData.password;

      const username = formData.email.split('@')[0] + Math.random().toString(36).substring(2, 8);

      const response = await createUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username,
        email: formData.email,
        password,
        phone: formData.phone,
        department: formData.department || undefined,
        type: 'user', // Changed from role: 1 to type: 'user'
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

      toast.success('User created successfully!');

      // Show generated password if auto-generated
      if (autoGeneratePassword) {
        toast.info(`Generated password: ${password}`, {
          duration: 10000,
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error?.data?.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

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
            Create New User
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Create a new regular user account
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
              />
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

              {!autoGeneratePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
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
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
              <Link href="/dashboard/admin/users">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR Card Modal */}
      {showQRCard && createdUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <UserQRCard
              userData={createdUserData}
              onClose={() => {
                setShowQRCard(false);
                setCreatedUserData(null);
                router.push('/dashboard/admin/users');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}