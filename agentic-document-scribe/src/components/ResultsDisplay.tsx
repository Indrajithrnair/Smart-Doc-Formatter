import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CheckCircle, RefreshCw, ArrowLeft, Eye } from 'lucide-react';
import axios from 'axios';
import { DocumentPreview } from './DocumentPreview';

interface ResultsDisplayProps {
  jobId: string;
  onNewDocument: () => void;
  onBackToDashboard: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  jobId,
  onNewDocument,
  onBackToDashboard
}) => {
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobStatus = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/documents/${jobId}/status`);
        setJobStatus(response.data);
      } catch (error) {
        console.error('Failed to fetch job status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobStatus();
  }, [jobId]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/documents/${jobId}/download/formatted`, {
        responseType: 'blob',
      });
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // You may want to get the filename from response headers or backend
      link.setAttribute('download', 'formatted_document.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRetry = () => {
    // TODO: Implement retry functionality
    console.log('Retrying formatting...');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Formatting Complete!</h2>
          <p className="text-gray-600">Your document has been successfully formatted</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Original:</span>
                <span>document.docx</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Formatted:</span>
                <span>document_formatted.docx</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Job ID:</span>
                <span className="font-mono text-xs">{jobId}</span>
              </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Formatted Document
              </Button>
              <Button variant="outline" onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry with Different Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Changes Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Changes Applied</span>
            </CardTitle>
            <CardDescription>
              Summary of all formatting improvements made to your document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobStatus?.final_result_data?.formatting_plan_actions_count > 0 ? (
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Badge variant="secondary">Formatting</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Applied formatting plan</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {jobStatus.final_result_data.formatting_plan_actions_count} changes applied
                    </p>
                  </div>
                </div>
              ) : (
                <p>No changes were applied.</p>
              )}
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Validation Passed</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {jobStatus?.final_result_data?.agent_final_answer || 'All formatting changes have been validated for consistency and quality.'}
              </p>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Document Preview</span>
          </CardTitle>
          <CardDescription>
            Before and after comparison of your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <DocumentPreview jobId={jobId} type="original" />
            <DocumentPreview jobId={jobId} type="formatted" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button onClick={onNewDocument} variant="outline" size="lg">
          Format Another Document
        </Button>
        <Button onClick={onBackToDashboard} size="lg">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
