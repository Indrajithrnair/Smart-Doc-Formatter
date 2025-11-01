import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleSuccess = () => {
    onClose();
  };

  const switchToSignup = () => setMode('signup');
  const switchToLogin = () => setMode('login');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
        </DialogHeader>
        
        {mode === 'login' ? (
          <LoginForm 
            onSwitchToSignup={switchToSignup}
            onSuccess={handleSuccess}
          />
        ) : (
          <SignupForm 
            onSwitchToLogin={switchToLogin}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};