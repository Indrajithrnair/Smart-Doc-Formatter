import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import SystemHealthDashboard from '@/components/admin/SystemHealthDashboard';
import JobsManagement from '@/components/admin/JobsManagement';
import ConfigurationPanel from '@/components/admin/ConfigurationPanel';
import LogViewer from '@/components/admin/LogViewer';
import StorageManager from '@/components/admin/StorageManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-600 p-6 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">Administrator Access</Badge>
              <span className="text-sm text-gray-600">Full system control and monitoring</span>
            </div>
          </div>
        </div>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            <TabsTrigger value="jobs">📋 Jobs</TabsTrigger>
            <TabsTrigger value="config">⚙️ Config</TabsTrigger>
            <TabsTrigger value="storage">📁 Storage</TabsTrigger>
            <TabsTrigger value="logs">📝 Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobsManagement />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <ConfigurationPanel />
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <StorageManager />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogViewer />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default AdminPage;
