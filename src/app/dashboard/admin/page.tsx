'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, Clock, Plus, Eye, Ticket, Scan, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
            <Link href="/dashboard/admin/users/create">
              <Button className="w-full gap-2" variant="outline">
                <Plus className="w-4 h-4" />
                Create New User
              </Button>
            </Link>
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
    </div>
  );
}