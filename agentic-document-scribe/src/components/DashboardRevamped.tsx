import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, TrendingUp, Sparkles, BookOpen, Zap, Wand2, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNewDocument: () => void;
  onBusinessTemplate?: () => void;
  onCoursePlanTemplate?: () => void;
  onCustomFormatting?: () => void;
}

export const DashboardRevamped: React.FC<DashboardProps> = ({ 
  onNewDocument, 
  onBusinessTemplate, 
  onCoursePlanTemplate,
  onCustomFormatting
}) => {
  const stats = [
    { label: 'Documents Processed', value: '24', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Time Saved', value: '8.5h', icon: Clock, color: 'from-green-500 to-green-600' },
    { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Active Today', value: '2', icon: Sparkles, color: 'from-orange-500 to-orange-600' }
  ];

  const recentDocuments = [
    { 
      id: '1', 
      name: 'Business_Proposal_Q4.docx', 
      status: 'completed', 
      createdAt: '2 hours ago',
      type: 'Business Proposal'
    },
    { 
      id: '2', 
      name: 'Course_Plan_Java.docx', 
      status: 'completed', 
      createdAt: '1 day ago',
      type: 'Course Plan'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-purple-100">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Document Formatting
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome Back! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose how you'd like to format your documents today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Formatting Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Formatting</h2>
            <p className="text-sm text-gray-600">Convert your content into professional templates</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Business Proposal Card */}
          <Card className="group bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-transparent rounded-bl-full transition-all duration-300 group-hover:scale-150"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Business Proposal</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">AI Template</Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Transform raw ideas into professional business proposals with structured sections and polished formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Auto-generate executive summaries</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Professional problem-solution structure</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Budget and timeline planning</span>
                </div>
              </div>
              <Button 
                onClick={onBusinessTemplate}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Academic Course Plan Card */}
          <Card className="group bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-300 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-transparent rounded-bl-full transition-all duration-300 group-hover:scale-150"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Academic Course Plan</span>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">AI Template</Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Convert syllabi into comprehensive course plans with learning outcomes, module mapping, and assessment schemes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Generate 15 micro-outcomes automatically</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Intelligent module-to-outcome mapping</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete assessment scheme creation</span>
                </div>
              </div>
              <Button 
                onClick={onCoursePlanTemplate}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Agent Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Agent</h2>
            <p className="text-sm text-gray-600">AI-powered formatting with your own rules</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Simple & Clean Card */}
          <Card className="group bg-gradient-to-br from-green-50 to-white border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-full transition-all duration-300 group-hover:scale-150"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Simple & Clean</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">Quick Fix</Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Instantly clean up your document with professional fonts, spacing, and basic formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Professional fonts and spacing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Consistent heading hierarchy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Quick 1-click formatting</span>
                </div>
              </div>
              <Button 
                onClick={onNewDocument}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Custom Formatting Card */}
          <Card className="group bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-full transition-all duration-300 group-hover:scale-150"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Custom Formatting</span>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">Advanced</Badge>
              </CardTitle>
              <CardDescription className="text-base">
                Tell our AI exactly what you want - from font sizes to table styles, we'll make it happen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Natural language instructions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Advanced style customization</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>AI-powered intelligent formatting</span>
                </div>
              </div>
              <Button 
                onClick={onCustomFormatting}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Documents */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>Recent Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{doc.type}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{doc.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(doc.status)}
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
