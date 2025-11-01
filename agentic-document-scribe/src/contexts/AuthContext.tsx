import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });

      if (response.data.valid) {
        setUser(response.data.user);
        setToken(tokenToVerify);
      } else {
        // Token is invalid, clear auth state
        clearAuthState();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      
      // Store in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, username: string, password: string, confirmPassword: string) => {
    try {
      console.log('Attempting signup with:', { email, username });
      
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        username,
        password,
        confirm_password: confirmPassword
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Signup response:', response.data);

      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      
      // Store in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - please check if the server is running');
      }
      
      if (error.response) {
        const errorMessage = error.response?.data?.detail || `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Cannot connect to server - please check if the backend is running on http://127.0.0.1:8000');
      } else {
        throw new Error('Signup failed: ' + error.message);
      }
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuthState();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};