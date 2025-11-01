import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Search } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  job_id?: string;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulated log fetching - in production, this would connect to actual logs
  const fetchLogs = () => {
    // For now, we'll show a placeholder since we don't have a real log endpoint
    const sampleLogs: LogEntry[] = [
      { timestamp: new Date().toISOString(), level: 'INFO', message: 'Server started successfully' },
      { timestamp: new Date().toISOString(), level: 'INFO', message: 'Connected to database' },
      { timestamp: new Date().toISOString(), level: 'DEBUG', message: 'Processing job queue', job_id: 'abc123' },
    ];
    setLogs(sampleLogs);
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'destructive';
      case 'WARNING':
        return 'outline';
      case 'INFO':
        return 'default';
      case 'DEBUG':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    return (
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.job_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDownload = () => {
    const logText = logs
      .map(log => `[${log.timestamp}] [${log.level}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View application logs and debugging information</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={fetchLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Controls */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoScroll"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoScroll" className="text-sm">
                Auto-scroll
              </label>
            </div>
          </div>

          {/* Log Display */}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-[600px] overflow-y-auto font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No logs available
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 hover:bg-gray-800 p-2 rounded">
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge variant={getLevelColor(log.level)} className="text-xs">
                      {log.level}
                    </Badge>
                    {log.job_id && (
                      <span className="text-blue-400 text-xs">
                        [{log.job_id.substring(0, 8)}]
                      </span>
                    )}
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a simulated log viewer for demonstration. 
              In production, this would connect to the actual server logs via WebSocket or periodic polling.
              To enable real-time logs, implement a log streaming endpoint in the backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogViewer;
