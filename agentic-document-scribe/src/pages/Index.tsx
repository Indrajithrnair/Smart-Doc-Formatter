import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from '@/components/DocumentUpload';
import { ProcessingDisplay } from '@/components/ProcessingDisplay';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { DashboardRevamped } from '@/components/DashboardRevamped';
import { CustomInstructionsPage } from '@/components/CustomInstructionsPage';
import { LandingPage } from '@/components/LandingPage';
import AdminPage from '@/pages/AdminPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Brain } from 'lucide-react';
import axios from 'axios';

const Index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'upload' | 'instructions' | 'processing' | 'results' | 'dashboard'>('dashboard');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formattingGoal, setFormattingGoal] = useState<string>('');
  const [processingJobId, setProcessingJobId] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formattingMode, setFormattingMode] = useState<'contextual' | 'template'>('contextual');
  const [templateType, setTemplateType] = useState<string>('business_proposal');
  const [isCustomFormatting, setIsCustomFormatting] = useState(false);

  const handleFileUpload = async (files: File[], jobId?: string) => {
    setUploadedFiles(files);
    if (jobId) {
      setProcessingJobId(jobId);
      
      // If custom formatting, go to instructions page
      if (isCustomFormatting) {
        setCurrentStep('instructions');
        return;
      }
      
      // Otherwise, immediately start processing
      setCurrentStep('processing');
      
      // Auto-generate goal based on formatting mode
      const autoGoal = formattingMode === 'template' 
        ? `Convert to ${templateType === 'course_plan' ? 'academic course plan' : 'business proposal'} template`
        : 'Format document professionally with clean styling';
      
      setFormattingGoal(autoGoal);
      
      // Start processing with backend API
      try {
        await axios.post(`http://127.0.0.1:8000/api/documents/process/${jobId}`, {
          user_goal: autoGoal,
          formatting_mode: formattingMode,
          template_type: templateType
        });
      } catch (error) {
        console.error('Error starting processing:', error);
        // Could show error state here
      }
    }
  };

  const handleBackToDashboard = () => {
    setCurrentStep('dashboard');
    setUploadedFiles([]);
    setFormattingGoal('');
    setProcessingJobId('');
    setFormattingMode('contextual');
    setTemplateType('business_proposal');
    setIsCustomFormatting(false);
  };

  const handleCustomInstructionsSubmit = async (instructions: string) => {
    setFormattingGoal(instructions);
    setCurrentStep('processing');
    
    // Start processing with custom instructions
    try {
      await axios.post(`http://127.0.0.1:8000/api/documents/process/${processingJobId}`, {
        user_goal: instructions,
        formatting_mode: 'contextual',
        template_type: null
      });
    } catch (error) {
      console.error('Error starting processing:', error);
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
  };

  const handleAuthRequired = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleNewDocument = () => {
    if (!isAuthenticated) {
      handleAuthRequired('login');
      return;
    }
    setFormattingMode('contextual');
    setCurrentStep('upload');
  };

  const handleBusinessTemplate = () => {
    if (!isAuthenticated) {
      handleAuthRequired('login');
      return;
    }
    setFormattingMode('template');
    setTemplateType('business_proposal');
    setCurrentStep('upload');
  };

  const handleCoursePlanTemplate = () => {
    if (!isAuthenticated) {
      handleAuthRequired('login');
      return;
    }
    setFormattingMode('template');
    setTemplateType('course_plan');
    setCurrentStep('upload');
  };

  const handleCustomFormatting = () => {
    if (!isAuthenticated) {
      handleAuthRequired('login');
      return;
    }
    setFormattingMode('contextual');
    setIsCustomFormatting(true);
    setCurrentStep('upload');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading DocFormat AI...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage 
          onSignIn={() => handleAuthRequired('login')}
          onSignUp={() => handleAuthRequired('signup')}
        />
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <DocumentUpload onUpload={handleFileUpload} onBack={handleBackToDashboard} />;
      case 'instructions':
        return (
          <CustomInstructionsPage
            fileName={uploadedFiles[0]?.name || 'document.docx'}
            onSubmit={handleCustomInstructionsSubmit}
            onBack={handleBackToUpload}
          />
        );
      case 'processing':
        return (
          <ProcessingDisplay
            jobId={processingJobId}
            onComplete={() => setCurrentStep('results')}
            onBack={handleBackToDashboard}
          />
        );
      case 'results':
        return (
          <ResultsDisplay
            jobId={processingJobId}
            onNewDocument={() => setCurrentStep('upload')}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      default:
        // Check if user is admin
        if (user?.email === 'admin@admin.com') {
          return <AdminPage />;
        }
        
        return (
          <DashboardRevamped
            onNewDocument={handleNewDocument}
            onBusinessTemplate={handleBusinessTemplate}
            onCoursePlanTemplate={handleCoursePlanTemplate}
            onCustomFormatting={handleCustomFormatting}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToDashboard}>
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocFormat AI
                </h1>
                <p className="text-xs text-gray-500">Intelligent Document Formatting</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep !== 'dashboard' && (
                <Button
                  variant="outline"
                  onClick={handleBackToDashboard}
                  className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                >
                  <span>Dashboard</span>
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.username}</span>
                </span>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderCurrentStep()}
        
        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </main>

      {/* Custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Index;
