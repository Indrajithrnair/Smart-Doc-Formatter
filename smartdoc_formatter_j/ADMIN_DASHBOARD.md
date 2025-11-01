# Admin Dashboard - Phase 1 Implementation

## Overview

The Admin Dashboard provides comprehensive monitoring and management capabilities for the document formatting service. This is Phase 1 (MVP) implementation with essential features.

## 🎯 Features Implemented

### 1. **System Health Dashboard** (`/admin` - Dashboard Tab)
Monitor real-time system performance and service health.

**Metrics Displayed:**
- **CPU Usage**: Current CPU utilization percentage
- **Memory Usage**: RAM consumption with used/total display
- **Disk Usage**: Storage utilization and free space
- **System Uptime**: How long the service has been running
- **Job Statistics**: 
  - Total jobs processed
  - Active jobs (in progress)
  - Queued jobs (waiting to process)
  - Completed jobs
  - Failed jobs
  - Success rate percentage
  - Average processing time

**Features:**
- Auto-refresh every 5 seconds
- Color-coded status indicators (green/yellow/red)
- Visual progress bars for resource usage

---

### 2. **Jobs Management** (`/admin` - Jobs Tab)
View, filter, search, and manage all document processing jobs.

**Features:**
- **Job List View**: Table display of all jobs with pagination
- **Search**: Filter jobs by user goal text
- **Status Filter**: Filter by job status (completed, failed, queued, uploaded)
- **Job Details**: Click to view full job information including:
  - Job ID
  - Status
  - User goal/prompt
  - Creation timestamp
  - Completion timestamp
  - Processing duration
  - Error messages (for failed jobs)
- **Delete Jobs**: Remove individual jobs and their files
- **Bulk Cleanup**: Delete all jobs older than 7 days
- **Auto-refresh**: Updates list automatically

**API Endpoints Used:**
- `GET /api/admin/jobs` - List jobs with filters
- `GET /api/admin/jobs/stats` - Get aggregate statistics
- `GET /api/admin/jobs/{job_id}` - Get job details
- `DELETE /api/admin/jobs/{job_id}` - Delete a job
- `POST /api/admin/jobs/cleanup?days=7` - Cleanup old jobs

---

### 3. **Configuration Panel** (`/admin` - Config Tab)
Manage LLM settings and service configuration.

**Configurable Settings:**
- **LLM Provider**: Switch between OpenAI, Anthropic, or Groq
- **Model Name**: Specify exact model (e.g., gpt-4, claude-3-opus-20240229)
- **Temperature**: Control randomness (0 = deterministic, 2 = creative)
- **Max Tokens**: Set maximum response length

**Features:**
- Real-time configuration updates
- Reset to previous values
- Save changes with confirmation
- API key information display (keys managed in backend .env)

**API Endpoints Used:**
- `GET /api/admin/config` - Get current configuration
- `PUT /api/admin/config` - Update configuration

---

### 4. **Storage Management** (`/admin` - Storage Tab)
Monitor file storage and disk usage.

**Information Displayed:**
- **Total Storage Used**: Combined size of all uploaded and formatted documents
- **Total Files**: Number of files in the system
- **Job Directories**: Number of job folders
- **Storage Location**: Path to temp_uploads directory

**Features:**
- Storage usage breakdown
- Automatic cleanup information
- Link to Jobs Management for cleanup operations

**API Endpoints Used:**
- `GET /api/admin/storage` - Get storage statistics

---

### 5. **Log Viewer** (`/admin` - Logs Tab)
View system logs and debugging information.

**Features:**
- **Real-time Log Display**: Terminal-style log viewer
- **Search**: Filter logs by content or job ID
- **Auto-scroll**: Automatically scroll to newest logs
- **Log Levels**: Color-coded by severity (ERROR, WARNING, INFO, DEBUG)
- **Download**: Export logs to text file
- **Job ID Tracking**: See which job generated each log entry

**Note**: Currently shows simulated logs. For production, implement:
- WebSocket streaming from backend logs
- Log aggregation service
- Persistent log storage

---

## 🚀 How to Access

### 1. Start the Backend
```bash
cd smartdoc_formatter_j
python -m uvicorn smartdoc_agent.api.main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd agentic-document-scribe
npm run dev
```

### 3. Navigate to Admin Dashboard
Open your browser and go to:
```
http://localhost:5173/admin
```

---

## 📁 File Structure

### Backend
```
smartdoc_formatter_j/
└── smartdoc_agent/
    └── api/
        ├── admin_endpoints.py   # New: Admin API routes
        ├── main.py              # Updated: Includes admin router
        └── endpoints.py         # Updated: Added timestamps to jobs
```

### Frontend
```
agentic-document-scribe/
└── src/
    ├── pages/
    │   └── AdminPage.tsx        # New: Main admin page
    ├── components/
    │   └── admin/
    │       ├── SystemHealthDashboard.tsx
    │       ├── JobsManagement.tsx
    │       ├── ConfigurationPanel.tsx
    │       ├── StorageManager.tsx
    │       └── LogViewer.tsx
    └── App.tsx                  # Updated: Added /admin route
```

---

## 🔌 API Endpoints Reference

### System Health
- `GET /api/admin/health` - Get system health metrics

### Job Management
- `GET /api/admin/jobs?status={status}&limit={limit}&offset={offset}` - List jobs
- `GET /api/admin/jobs/stats` - Get job statistics
- `GET /api/admin/jobs/{job_id}` - Get job details
- `DELETE /api/admin/jobs/{job_id}` - Delete job
- `POST /api/admin/jobs/cleanup?days={days}` - Cleanup old jobs

### Configuration
- `GET /api/admin/config` - Get configuration
- `PUT /api/admin/config` - Update configuration

### Storage
- `GET /api/admin/storage` - Get storage statistics

---

## 🔧 Dependencies

### Backend (Already Installed)
- `psutil` - System monitoring (CPU, memory, disk)
- `FastAPI` - Web framework
- `Pydantic` - Data validation

If not installed:
```bash
pip install psutil
```

### Frontend (Already Available)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- axios for API calls
- lucide-react for icons

---

## ⚙️ Configuration

### Backend Configuration
The admin dashboard uses the existing configuration system. No additional setup required.

### Job Timestamps
Jobs now automatically track:
- `created_at` - When the job was created
- `completed_at` - When the job finished (success or error)

These are ISO 8601 format timestamps for easy parsing.

---

## 📊 Usage Examples

### Monitoring Active Jobs
1. Go to `/admin` (Dashboard tab)
2. View "Job Statistics" card
3. Check "Active" count - shows jobs currently processing
4. Check "Success Rate" - overall system performance

### Finding Failed Jobs
1. Go to "Jobs" tab
2. Select "Failed" from status filter
3. Click eye icon to view error details
4. Review error message and decide on action

### Cleaning Up Old Jobs
1. Go to "Jobs" tab
2. Click "Cleanup Old" button
3. Confirm deletion of jobs older than 7 days
4. Storage space is freed automatically

### Changing LLM Model
1. Go to "Config" tab
2. Select new provider from dropdown
3. Enter model name (e.g., "gpt-4-turbo")
4. Adjust temperature if needed
5. Click "Save Configuration"
6. New settings apply to all future jobs

---

## 🎨 UI Components Used

All components use shadcn/ui for consistency:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` with variants (default, outline, ghost)
- `Badge` for status indicators
- `Input` for text fields
- `Select` for dropdowns
- `Table` for data display
- `Tabs` for navigation

---

## 🔐 Security Considerations

### Current Implementation (Phase 1)
- ⚠️ **No authentication required** - Admin dashboard is publicly accessible
- ⚠️ **No role-based access control** - All admin functions are available to anyone
- ✅ **API keys hidden** - Keys managed in backend .env, not exposed in frontend

### Recommended for Production (Phase 2+)
1. **Add Authentication**
   - Require login to access `/admin` route
   - Use JWT tokens or session-based auth
   
2. **Role-Based Access Control**
   - Create "admin" role in user system
   - Protect admin endpoints with role check
   
3. **Audit Logging**
   - Track who performs admin actions
   - Log configuration changes
   - Monitor job deletions

4. **Rate Limiting**
   - Prevent abuse of cleanup endpoints
   - Limit job deletion requests

---

## 🚀 Future Enhancements (Phase 2)

Features planned for the next phase:

### Advanced Analytics
- Job success rate trends over time
- Peak usage time analysis
- Most common prompts/patterns
- Error pattern analysis

### Testing Tools
- Automated test suite runner
- Run all 9 test prompts from TEST_PLAN.md
- Compare results across model versions
- Regression testing

### Prompt Engineering
- View/edit system prompts
- A/B test different prompts
- Version control for prompts
- Rollback capability

### User Management
- User list with activity
- Usage quotas per user
- Permission management

### Real-time Logs
- WebSocket-based log streaming
- Live agent execution trace
- Filter by log level
- Export and archive

---

## 🐛 Troubleshooting

### Admin Page Not Loading
1. Check backend is running on port 8000
2. Check frontend is running on port 5173
3. Clear browser cache
4. Check browser console for errors

### System Health Shows High CPU/Memory
This is normal during active document processing. If sustained:
1. Check number of active jobs
2. Review recent failed jobs for errors
3. Consider scaling backend resources

### Jobs Not Appearing
1. Click "Refresh" button
2. Check status filter settings
3. Verify backend API is responding: `http://localhost:8000/api/admin/jobs`

### Configuration Changes Not Saving
1. Check browser console for errors
2. Verify backend is running
3. Check for validation errors in config values
4. Temperature must be 0-2
5. Max tokens must be positive integer

---

## 📈 Performance Notes

- **Auto-refresh intervals**:
  - System Health: 5 seconds
  - Jobs List: Manual refresh
  - Logs: 5 seconds (when implemented)

- **Pagination**:
  - Jobs list: 50 per page default
  - Can be increased up to 500

- **Resource Usage**:
  - Minimal impact on backend
  - `psutil` operations are lightweight
  - Job queries use in-memory database

---

## ✅ Testing the Dashboard

1. **Upload a document** via main interface
2. **Go to `/admin`** to see dashboard
3. **Monitor** the job in "Jobs" tab as it processes
4. **Check statistics** in Dashboard tab
5. **View job details** after completion
6. **Try filtering** by status
7. **Test cleanup** with old test jobs
8. **Change configuration** and verify it applies

---

## 📝 Notes

- The admin dashboard is designed for development and monitoring
- All data is stored in-memory and will reset on server restart
- For production use, implement persistent storage (database)
- Consider adding authentication before deploying
- Monitor disk space as document files accumulate

---

## 🎯 Quick Links

- **Main App**: `http://localhost:5173/`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **API Docs**: `http://localhost:8000/docs`
- **Test Plan**: See `TEST_PLAN.md`

---

## 💡 Tips

1. Keep the Dashboard tab open while testing to monitor jobs in real-time
2. Use the Jobs tab to debug failures by viewing error messages
3. Check Storage tab before running bulk operations
4. Adjust LLM temperature in Config if results are too deterministic or too random
5. Use Cleanup regularly to maintain disk space

---

**Phase 1 Implementation Complete! ✅**

For Phase 2 features and advanced capabilities, see the main implementation plan.
