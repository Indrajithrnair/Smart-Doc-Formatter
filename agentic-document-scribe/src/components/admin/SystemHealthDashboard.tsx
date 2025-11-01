import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, HardDrive, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface SystemHealth {
  cpu_percent: number;
  memory_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  disk_usage_percent: number;
  disk_free_gb: number;
  uptime_seconds: number;
  active_jobs: number;
  total_jobs: number;
}

interface JobsStats {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
  queued: number;
  success_rate: number;
  avg_duration_seconds: number | null;
}

const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<JobsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [healthRes, statsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/health'),
        axios.get('http://127.0.0.1:8000/api/admin/jobs/stats')
      ]);
      
      setHealth(healthRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (percent: number) => {
    if (percent < 70) return 'text-green-600';
    if (percent < 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="text-center py-8">Loading system health...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(health?.cpu_percent || 0)}`}>
              {health?.cpu_percent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.cpu_percent < 70 ? 'Normal' : health?.cpu_percent < 85 ? 'High' : 'Critical'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(health?.memory_percent || 0)}`}>
              {health?.memory_percent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.memory_used_mb.toFixed(0)} MB / {health?.memory_total_mb.toFixed(0)} MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(health?.disk_usage_percent || 0)}`}>
              {health?.disk_usage_percent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.disk_free_gb.toFixed(1)} GB free
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {health && formatUptime(health.uptime_seconds)}
            </div>
            <p className="text-xs text-muted-foreground">System running</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Job Statistics</CardTitle>
          <CardDescription>Overview of document processing jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-blue-600">{health?.active_jobs || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Queued</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.queued || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {stats?.success_rate ? stats.success_rate.toFixed(1) : '0'}%
              </p>
            </div>
          </div>

          {stats?.avg_duration_seconds && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Processing Time</span>
                <Badge variant="outline">
                  {stats.avg_duration_seconds.toFixed(1)}s
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold">System Operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
