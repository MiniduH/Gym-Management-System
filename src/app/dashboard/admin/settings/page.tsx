'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Users,
  Settings,
  Key,
  Database,
  Mail,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const settingsSections = [
  {
    title: 'Admin Management',
    description: 'Manage system administrators and their access',
    icon: Shield,
    href: '/dashboard/admin/admins',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
  {
    title: 'Roles Management',
    description: 'Manage system roles and permissions',
    icon: Shield,
    href: '/dashboard/users',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
//   {
//     title: 'System Configuration',
//     description: 'General system settings and preferences',
//     icon: Settings,
//     href: '/dashboard/admin/settings/system',
//     color: 'text-purple-600',
//     bgColor: 'bg-purple-50 dark:bg-purple-950',
//   },
//   {
//     title: 'Database Management',
//     description: 'Database backup, restore, and maintenance',
//     icon: Database,
//     href: '/dashboard/admin/settings/database',
//     color: 'text-orange-600',
//     bgColor: 'bg-orange-50 dark:bg-orange-950',
//   },
//   {
//     title: 'Email Configuration',
//     description: 'SMTP settings and email templates',
//     icon: Mail,
//     href: '/dashboard/admin/settings/email',
//     color: 'text-red-600',
//     bgColor: 'bg-red-50 dark:bg-red-950',
//   },
//   {
//     title: 'Notifications',
//     description: 'System notifications and alerts settings',
//     icon: Bell,
//     href: '/dashboard/admin/settings/notifications',
//     color: 'text-indigo-600',
//     bgColor: 'bg-indigo-50 dark:bg-indigo-950',
//   },

];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Admin Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Configure system settings and manage permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats or System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">All systems operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-slate-600 dark:text-slate-400">12 active users</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}