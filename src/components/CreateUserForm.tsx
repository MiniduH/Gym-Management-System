'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, EyeOff, Eye, Plus } from 'lucide-react';

interface CreateUserFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    specialization?: string;
    address: {
      line1: string;
      line2: string;
      province: string;
      district: string;
    };
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent, type?: 'user' | 'admin' | 'trainer' | 'trainee') => void;
  isLoading: boolean;
  provincesData: any;
  autoGeneratePassword: boolean;
  setAutoGeneratePassword: (checked: boolean) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onCancel?: () => void;
  buttonText?: string;
  userType?: 'user' | 'admin' | 'trainer' | 'trainee';
  showDepartment?: boolean;
  showSpecialization?: boolean;
  emailRequired?: boolean;
  includeForm?: boolean;
}

export function CreateUserForm({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
  provincesData,
  autoGeneratePassword,
  setAutoGeneratePassword,
  showPassword,
  setShowPassword,
  onCancel,
  buttonText = "Create User",
  userType = "user",
  showDepartment = false,
  showSpecialization = false,
  emailRequired = false,
  includeForm = true,
}: CreateUserFormProps) {
  const fields = (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="create_first_name">First Name *</Label>
          <Input
            id="create_first_name"
            value={formData.first_name}
            onChange={(e) => onFormChange('first_name', e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create_last_name">Last Name *</Label>
          <Input
            id="create_last_name"
            value={formData.last_name}
            onChange={(e) => onFormChange('last_name', e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="create_email">Email Address{emailRequired ? ' *' : ''}</Label>
        <Input
          id="create_email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormChange('email', e.target.value)}
          placeholder={emailRequired ? "Enter email address" : "Enter email address (optional)"}
          required={emailRequired}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="create_phone">Phone Number *</Label>
        <Input
          id="create_phone"
          value={formData.phone}
          onChange={(e) => onFormChange('phone', e.target.value)}
          placeholder="Enter phone number"
          required
        />
      </div>

      {showSpecialization && (
        <div className="space-y-2">
          <Label htmlFor="create_specialization">Specialization</Label>
          <Input
            id="create_specialization"
            value={formData.specialization || ''}
            onChange={(e) => onFormChange('specialization', e.target.value)}
            placeholder="e.g., Personal Training, Nutrition, Yoga"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Address</Label>
        
        <div className="space-y-2">
          <Label htmlFor="create_address_line1">Line 1</Label>
          <Input
            id="create_address_line1"
            value={formData.address.line1}
            onChange={(e) => onFormChange('address.line1', e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create_address_line2">Line 2</Label>
          <Input
            id="create_address_line2"
            value={formData.address.line2}
            onChange={(e) => onFormChange('address.line2', e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="create_province">Province</Label>
            <Select
              value={formData.address.province}
              onValueChange={(value) => onFormChange('address.province', value)}
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
              value={formData.address.district}
              onValueChange={(value) => onFormChange('address.district', value)}
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

      {showDepartment && (
        <div className="space-y-2">
          <Label htmlFor="create_department">Department</Label>
          <Input
            id="create_department"
            value={formData.department}
            onChange={(e) => onFormChange('department', e.target.value)}
            placeholder="Enter department"
          />
        </div>
      )}

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
              value={formData.password}
              onChange={(e) => onFormChange('password', e.target.value)}
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
              {userType === 'trainee' ? 'Creating Trainee...' : userType === 'trainer' ? 'Creating Trainer...' : 'Creating User...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
      </div>
    </>
  );

  if (includeForm) {
    return (
      <form onSubmit={(e) => onSubmit(e, userType)} className="space-y-6">
        {fields}
      </form>
    );
  }

  return <div className="space-y-6">{fields}</div>;
}