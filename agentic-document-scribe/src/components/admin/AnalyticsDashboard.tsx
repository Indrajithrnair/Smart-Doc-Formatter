import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, UserCheck, UserX, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8000/api/admin/analytics';

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
  total_jobs: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'charts' | 'users'>('charts');
  
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'charts' ? 'default' : 'outline'}
          onClick={() => setActiveView('charts')}
        >
          📊 Analytics Charts
        </Button>
        <Button
          variant={activeView === 'users' ? 'default' : 'outline'}
          onClick={() => setActiveView('users')}
        >
          👥 User Management
        </Button>
      </div>

      {activeView === 'charts' ? <ChartsView /> : <UsersView />}
    </div>
  );
};

// ==================== Charts View ====================

const ChartsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <DocumentsOverTimeChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuccessFailureChart />
        <ProcessingTimeTrendsChart />
      </div>
    </div>
  );
};

// ==================== Documents Over Time Chart ====================

const DocumentsOverTimeChart: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/documents-over-time?days=${days}`);
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          documents: response.data.data[index]
        }));
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching documents over time:', error);
        toast.error('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Documents Processed Over Time
            </CardTitle>
            <CardDescription>Total: {data?.total} documents</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={days === 7 ? 'default' : 'outline'} onClick={() => setDays(7)}>7D</Button>
            <Button size="sm" variant={days === 30 ? 'default' : 'outline'} onClick={() => setDays(30)}>30D</Button>
            <Button size="sm" variant={days === 90 ? 'default' : 'outline'} onClick={() => setDays(90)}>90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="documents" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ==================== Success vs Failure Chart ====================

const SuccessFailureChart: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/success-failure-rate?days=30`);
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          successful: response.data.successful[index],
          failed: response.data.failed[index]
        }));
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching success/failure rate:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Success vs Failure Rate</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            {data?.overall_success_rate}% Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="successful" stackId="a" fill="#10B981" name="Successful" />
            <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ==================== Processing Time Trends Chart ====================

const ProcessingTimeTrendsChart: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/processing-time-trends?days=30`);
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          average: response.data.avg_times[index],
          min: response.data.min_times[index],
          max: response.data.max_times[index]
        }));
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching processing time trends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  const trend = data?.overall_avg > 50 ? 'up' : 'down';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Processing Time Trends</CardTitle>
            <CardDescription>Average: {data?.overall_avg}s</CardDescription>
          </div>
          {trend === 'down' ? (
            <TrendingDown className="w-6 h-6 text-green-600" />
          ) : (
            <TrendingUp className="w-6 h-6 text-orange-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#8B5CF6" strokeWidth={2} name="Avg" />
            <Line type="monotone" dataKey="min" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" name="Min" />
            <Line type="monotone" dataKey="max" stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" name="Max" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ==================== Users View ====================

const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/users/stats`)
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_BASE}/users/${userToDelete.id}`);
      toast.success(`User ${userToDelete.email} deleted`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await axios.patch(`${API_BASE}/users/${user.id}/toggle-active`);
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user');
    }
  };

  if (loading) return <Card><CardContent className="p-6">Loading...</CardContent></Card>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Total: {stats?.total_users} • Active: {stats?.active_users}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">New this week: {stats?.new_users_this_week}</Badge>
              <Badge variant="outline">New this month: {stats?.new_users_this_month}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'} className={user.is_active ? 'bg-green-100 text-green-800' : ''}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline">{user.total_jobs}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(user)}>
                        {user.is_active ? <UserX className="h-4 w-4 text-orange-600" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{userToDelete?.email}</strong>? This will also delete {userToDelete?.total_jobs} jobs. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AnalyticsDashboard;
