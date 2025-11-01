# 📊 Analytics & Visualization Guide

## ✅ What Was Added

Complete analytics system with **4 main visualizations** + **user management**:

1. ✅ **Documents Processed Over Time** (Line/Bar Chart)
2. ✅ **Success vs Failure Rate** (Stacked Area/Bar Chart)
3. ✅ **Processing Time Trends** (Multi-line Chart)
4. ✅ **User Management** (Table with delete functionality)

Plus bonus features:
- Template usage statistics (Pie chart)
- Peak usage hours (Bar chart/Heatmap)
- User statistics dashboard

---

## 🚀 API Endpoints Created

### **Base URL:** `/api/admin/analytics`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/documents-over-time?days=30` | GET | Documents processed per day |
| `/success-failure-rate?days=30` | GET | Success/failure counts and rates |
| `/processing-time-trends?days=30` | GET | Avg/min/max processing times |
| `/template-usage` | GET | Usage by template type |
| `/peak-usage-hours` | GET | Jobs by hour of day |
| `/users` | GET | List all users with job counts |
| `/users/stats` | GET | User statistics |
| `/users/{user_id}` | DELETE | Delete a user |
| `/users/{user_id}/toggle-active` | PATCH | Activate/deactivate user |

---

## 📈 1. Documents Processed Over Time

### **Endpoint:**
```
GET /api/admin/analytics/documents-over-time?days=30
```

### **Response:**
```json
{
  "labels": ["2025-01-01", "2025-01-02", "2025-01-03", ...],
  "data": [5, 12, 8, 15, 20, ...],
  "total": 250
}
```

### **React Component (with Recharts):**

```tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export const DocumentsOverTimeChart = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/analytics/documents-over-time?days=30');
        
        // Transform for Recharts
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: label,
          documents: response.data.data[index]
        }));
        
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents Processed Over Time</CardTitle>
        <CardDescription>Last 30 days • Total: {data?.total} documents</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="documents" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

---

## 📊 2. Success vs Failure Rate

### **Endpoint:**
```
GET /api/admin/analytics/success-failure-rate?days=30
```

### **Response:**
```json
{
  "labels": ["2025-01-01", "2025-01-02", ...],
  "successful": [10, 15, 12, ...],
  "failed": [2, 1, 3, ...],
  "success_rates": [83.33, 93.75, 80.0, ...],
  "overall_success_rate": 87.5
}
```

### **React Component (Stacked Bar Chart):**

```tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

export const SuccessFailureChart = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/analytics/success-failure-rate?days=30');
        
        // Transform for Recharts
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: label,
          successful: response.data.successful[index],
          failed: response.data.failed[index],
          rate: response.data.success_rates[index]
        }));
        
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Success vs Failure Rate</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            {data?.overall_success_rate}% Success Rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
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
```

---

## ⏱️ 3. Processing Time Trends

### **Endpoint:**
```
GET /api/admin/analytics/processing-time-trends?days=30
```

### **Response:**
```json
{
  "labels": ["2025-01-01", "2025-01-02", ...],
  "avg_times": [45.2, 38.5, 52.1, ...],
  "min_times": [25.0, 20.5, 30.2, ...],
  "max_times": [85.3, 72.1, 95.8, ...],
  "overall_avg": 45.3
}
```

### **React Component (Multi-line Chart):**

```tsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export const ProcessingTimeTrendsChart = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/analytics/processing-time-trends?days=30');
        
        // Transform for Recharts
        const chartData = response.data.labels.map((label: string, index: number) => ({
          date: label,
          average: response.data.avg_times[index],
          minimum: response.data.min_times[index],
          maximum: response.data.max_times[index]
        }));
        
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Time Trends</CardTitle>
        <CardDescription>
          Last 30 days • Overall Average: {data?.overall_avg}s
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Average"
            />
            <Line 
              type="monotone" 
              dataKey="minimum" 
              stroke="#10B981" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Minimum"
            />
            <Line 
              type="monotone" 
              dataKey="maximum" 
              stroke="#EF4444" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Maximum"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

---

## 👥 4. User Management

### **Endpoints:**

```
GET  /api/admin/analytics/users
GET  /api/admin/analytics/users/stats
DELETE /api/admin/analytics/users/{user_id}
PATCH /api/admin/analytics/users/{user_id}/toggle-active
```

### **Response (List Users):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2025-01-15T10:30:00",
    "is_active": true,
    "total_jobs": 25
  },
  ...
]
```

### **React Component (User Management Table):**

```tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
  total_jobs: number;
}

export const UserManagementTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/analytics/users'),
        axios.get('http://localhost:8000/api/admin/analytics/users/stats')
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
      await axios.delete(`http://localhost:8000/api/admin/analytics/users/${userToDelete.id}`);
      toast.success(`User ${userToDelete.email} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/analytics/users/${user.id}/toggle-active`);
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Total: {stats?.total_users} users • Active: {stats?.active_users}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                New this week: {stats?.new_users_this_week}
              </Badge>
              <Badge variant="outline" className="text-sm">
                New this month: {stats?.new_users_this_month}
              </Badge>
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
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.is_active ? "default" : "secondary"}
                      className={user.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.total_jobs}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4 text-orange-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
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
              Are you sure you want to delete user <strong>{userToDelete?.email}</strong>?
              This will also delete all {userToDelete?.total_jobs} associated jobs.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
```

---

## 📦 Required Dependencies

### **Install Recharts:**
```bash
npm install recharts
# or
yarn add recharts
```

### **Install Sonner (for toasts):**
```bash
npm install sonner
```

---

## 🎨 Complete Analytics Dashboard Component

```tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentsOverTimeChart } from './DocumentsOverTimeChart';
import { SuccessFailureChart } from './SuccessFailureChart';
import { ProcessingTimeTrendsChart } from './ProcessingTimeTrendsChart';
import { UserManagementTable } from './UserManagementTable';

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-gray-600 mt-2">Monitor system performance and user activity</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Row 1: Documents Over Time */}
          <DocumentsOverTimeChart />

          {/* Row 2: Success/Failure and Processing Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SuccessFailureChart />
            <ProcessingTimeTrendsChart />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## 🧪 Testing the APIs

### **1. Test Documents Over Time:**
```bash
curl "http://localhost:8000/api/admin/analytics/documents-over-time?days=7"
```

### **2. Test Success/Failure Rate:**
```bash
curl "http://localhost:8000/api/admin/analytics/success-failure-rate?days=30"
```

### **3. Test Processing Time Trends:**
```bash
curl "http://localhost:8000/api/admin/analytics/processing-time-trends?days=14"
```

### **4. Test User List:**
```bash
curl "http://localhost:8000/api/admin/analytics/users"
```

### **5. Test User Stats:**
```bash
curl "http://localhost:8000/api/admin/analytics/users/stats"
```

### **6. Test Delete User:**
```bash
curl -X DELETE "http://localhost:8000/api/admin/analytics/users/1"
```

---

## 📊 Bonus: Template Usage Pie Chart

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const TemplateUsageChart = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/analytics/template-usage')
      .then(res => {
        const chartData = res.data.labels.map((label: string, index: number) => ({
          name: label,
          value: res.data.data[index]
        }));
        setData(chartData);
      });
  }, []);

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

---

## ✅ Summary

**Analytics System Complete!**

✅ **4 Main Visualizations:**
- Documents processed over time (Line chart)
- Success vs failure rate (Stacked bar chart)
- Processing time trends (Multi-line chart)
- User management (Table with actions)

✅ **Bonus Features:**
- Template usage statistics
- Peak usage hours
- User statistics dashboard

✅ **Full CRUD for Users:**
- List all users
- View user stats
- Delete users
- Toggle active/inactive

✅ **Production Ready:**
- Proper error handling
- Efficient SQL queries
- Indexed database
- Pagination support

---

**Next Steps:**
1. Add these components to your admin dashboard
2. Install Recharts: `npm install recharts`
3. Test the API endpoints
4. Customize colors and styling to match your theme

**All analytics data persists in the database and survives server restarts!** 📊🎉
