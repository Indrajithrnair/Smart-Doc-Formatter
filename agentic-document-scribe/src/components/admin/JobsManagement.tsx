import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Eye, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';

interface Job {
  job_id: string;
  status: string;
  user_goal: string | null;
  created_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  error_message: string | null;
}

const JobsManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/api/admin/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/jobs/${jobId}`);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Delete all jobs older than 7 days?')) return;

    try {
      await axios.post('http://127.0.0.1:8000/api/admin/jobs/cleanup', null, {
        params: { days: 7 }
      });
      fetchJobs();
      alert('Cleanup completed successfully');
    } catch (error) {
      console.error('Failed to cleanup jobs:', error);
      alert('Failed to cleanup jobs');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      error: 'destructive',
      queued: 'secondary',
      uploaded: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const filteredJobs = jobs.filter(job => {
    if (searchTerm && job.user_goal) {
      return job.user_goal.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>View and manage all document processing jobs</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={fetchJobs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleCleanup} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup Old
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user goal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs Table */}
          {loading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No jobs found</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User Goal</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.job_id}>
                      <TableCell className="font-mono text-sm">
                        {job.job_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {job.user_goal || 'No goal specified'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(job.created_at)}
                      </TableCell>
                      <TableCell>
                        {job.duration_seconds 
                          ? `${job.duration_seconds.toFixed(1)}s`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(job.job_id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details Modal (simplified) */}
      {selectedJob && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Job ID</dt>
                <dd className="mt-1 text-sm font-mono">{selectedJob.job_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">{getStatusBadge(selectedJob.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User Goal</dt>
                <dd className="mt-1 text-sm">{selectedJob.user_goal || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm">{formatDate(selectedJob.created_at)}</dd>
              </div>
              {selectedJob.completed_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                  <dd className="mt-1 text-sm">{formatDate(selectedJob.completed_at)}</dd>
                </div>
              )}
              {selectedJob.error_message && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                  <dd className="mt-1 text-sm text-red-600">{selectedJob.error_message}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobsManagement;
