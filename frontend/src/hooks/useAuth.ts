'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  phone?: string;
}

interface TeacherProfile {
  id: string;
  userId: string;
  hourlyRate: number;
  bio?: string;
  isApproved: boolean;
  branch?: {
    id: string;
    name: string;
  };
}

interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel?: number;
  schoolName?: string;
  parentName?: string;
  parentEmail?: string;
}

interface AuthState {
  user: User | null;
  teacherProfile: TeacherProfile | null;
  studentProfile: StudentProfile | null;
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
        // Fetch current user
        const userResponse = await api.getCurrentUser();
        const user = userResponse.data || userResponse;

        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));

        // Fetch role-specific profile
        if (user.role === 'TEACHER') {
          try {
            const dashboardResponse = await api.getTeacherDashboard();
            const dashboard = dashboardResponse.data || dashboardResponse;
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
            const dashboardResponse = await api.getStudentDashboard();
            const dashboard = dashboardResponse.data || dashboardResponse;
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
    if (!state.user) return 'Kullanıcı';
    return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || 'Kullanıcı';
  };

  return {
    ...state,
    logout,
    getInitials,
    getFullName,
  };
}

export default useAuth;
