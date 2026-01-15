'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  phone?: string;
}

interface AuthState {
  user: User | null;
  teacherProfile: any;
  studentProfile: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    teacherProfile: null,
    studentProfile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        return;
      }

      try {
        const user = await api.getCurrentUser();

        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));

        if (user.role === 'TEACHER') {
          try {
            const dashboard = await api.getTeacherDashboard();
            setState(prev => ({
              ...prev,
              teacherProfile: dashboard.profile,
              isLoading: false,
            }));
          } catch (error) {
            console.error('Failed to fetch teacher profile:', error);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else if (user.role === 'STUDENT') {
          try {
            const dashboard = await api.getStudentDashboard();
            setState(prev => ({
              ...prev,
              studentProfile: dashboard.profile,
              isLoading: false,
            }));
          } catch (error) {
            console.error('Failed to fetch student profile:', error);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setState({
          user: null,
          teacherProfile: null,
          studentProfile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({
      user: null,
      teacherProfile: null,
      studentProfile: null,
      isLoading: false,
      isAuthenticated: false,
    });
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (!state.user) return '??';
    const first = state.user.firstName?.charAt(0) || '';
    const last = state.user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '??';
  };

  const getFullName = () => {
    if (!state.user) return 'Kullanici';
    const fn = state.user.firstName || '';
    const ln = state.user.lastName || '';
    return (fn + ' ' + ln).trim() || 'Kullanici';
  };

  return {
    ...state,
    logout,
    getInitials,
    getFullName,
  };
}

export default useAuth;
