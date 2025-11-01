import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, FolderOpen, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface StorageStats {
  total_size_mb: number;
  file_count: number;
  job_count: number;
}

const StorageManager: React.FC = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/storage');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatSize = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>Monitor file storage usage</CardDescription>
            </div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading storage stats...</div>
          ) : (
            <div className="space-y-6">
              {/* Storage Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Storage</span>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {stats ? formatSize(stats.total_size_mb) : '0 MB'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Files</span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.file_count || 0}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Job Directories</span>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.job_count || 0}</p>
                </div>
              </div>

              {/* Storage Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Storage Location</h4>
                <p className="text-sm text-blue-800 font-mono">
                  temp_uploads/
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Each job creates a directory containing the original and formatted documents.
                </p>
              </div>

              {/* Cleanup Info */}
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-semibold mb-2">Automatic Cleanup</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Files are automatically removed when jobs are deleted. 
                  Use the "Cleanup Old" button in the Jobs tab to delete jobs older than 7 days.
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="#jobs">Go to Jobs Management</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageManager;
