import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AuthState, AuthAction, LoginCredentials } from '../types/auth';
import { API } from '../utils/api';
import { isVercelDeployment, handleVercelLogin, handleVercelLogout } from '../utils/vercel-auth-helper';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Mock users for demo
const mockUsers = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, passwords would be hashed
    fullName: 'Admin User',
    role: 'ADMIN', // Ensure role is uppercase for consistency
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    permissions: [{ module: '*', action: '*', resource: '*' }]
  },
  {
    id: 'user-2',
    username: 'warehouse',
    email: 'warehouse@example.com',
    password: 'warehouse123',
    fullName: 'Warehouse Manager',
    role: 'warehouse_manager',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    permissions: [
      { module: 'warehouse', action: '*', resource: '*' },
      { module: 'inventory', action: 'view', resource: '*' },
      { module: 'suppliers', action: '*', resource: '*' },
      { module: 'categories', action: '*', resource: '*' },
      { module: 'dashboard', action: 'view', resource: '*' },
      { module: 'reports', action: 'view', resource: 'warehouse' },
      { module: 'reports', action: 'export', resource: 'warehouse' }
    ]
  },
  {
    id: 'user-3',
    username: 'inventory',
    email: 'inventory@example.com',
    password: 'inventory123',
    fullName: 'Inventory Manager',
    role: 'inventory_manager',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    permissions: [
      { module: 'inventory', action: '*', resource: '*' },
      { module: 'warehouse', action: 'view', resource: '*' },
      { module: 'categories', action: 'view', resource: '*' },
      { module: 'dashboard', action: 'view', resource: '*' },
      { module: 'reports', action: 'view', resource: 'inventory' },
      { module: 'reports', action: 'export', resource: 'inventory' }
    ]
  }
];

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  logActivity: (action: string, details: string, entityType: string, entityId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        console.log('Checking authentication state...');

        if (storedUser) {
          console.log('Found stored user data');
          const user = JSON.parse(storedUser);

          if (!user.token) {
            console.error('No token found in stored user data');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
            return;
          }

          // Check if we're in a Vercel deployment
          if (isVercelDeployment()) {
            console.log('Vercel deployment detected, using stored user data');
            // In Vercel deployment, we trust the stored user data
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            return;
          }

          console.log('Verifying token with server...');
          // Verify token with server
          try {
            // Try to validate with server
            const userData = await API.auth.me();
            console.log('Server response:', userData);

            // Handle different response formats
            let userInfo: { [key: string]: any } = {};
            if (userData && typeof userData === 'object') {
              // If the response has a user property
              if ('user' in userData && userData.user) {
                userInfo = userData.user;
              } else {
                // If the response is the user object directly
                userInfo = userData;
              }
            } else {
              throw new Error('Invalid user data format');
            }

            console.log('Token validated successfully, user:', userInfo.fullName || userInfo.username || 'Unknown');

            // Token is valid - update with latest user data from server
            // Normalize the role to ensure it's properly formatted
            let normalizedRole = userInfo.role || 'user';
            // If role is not a string, convert it to a string
            if (typeof normalizedRole !== 'string') {
              normalizedRole = String(normalizedRole);
            }
            // Ensure role is uppercase for consistency
            normalizedRole = normalizedRole.toUpperCase();

            console.log('Normalized role:', normalizedRole);

            const formattedUser = {
              ...user,
              ...userInfo,
              role: normalizedRole,
              lastLogin: new Date().toISOString()
            };

            dispatch({ type: 'LOGIN_SUCCESS', payload: formattedUser });
            localStorage.setItem('user', JSON.stringify(formattedUser));
          } catch (error) {
            console.error('Session validation error:', error);
            console.log('Using offline mode with stored user data');

            // If server is not available, use the stored user data
            // This allows the app to work offline
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          }
        } else {
          console.log('No stored user data found');
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    console.log('Attempting login for:', credentials.email);

    try {
      // Check if we're in a Vercel deployment
      if (isVercelDeployment()) {
        console.log('Vercel deployment detected, using Vercel login handler');
        try {
          // Use the Vercel login handler
          const response = await handleVercelLogin(credentials.email, credentials.password);

          if (response && response.user) {
            console.log('Vercel login successful');
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });

            // Log activity
            logActivity(
              'login',
              `User ${response.user.fullName} logged in (Vercel)`,
              'system'
            );

            return;
          }
        } catch (vercelError) {
          console.error('Vercel login error:', vercelError);
          throw vercelError;
        }
      }

      // If not in Vercel deployment or Vercel login failed, try regular login
      try {
        const userData = await API.auth.login({
          email: credentials.email,
          password: credentials.password
        });

        console.log('Login response:', userData);

        // Handle different response formats
        let userInfo: { [key: string]: any } = {};
        let token = '';

        if (userData && typeof userData === 'object') {
          // If the response has a user property
          if ('user' in userData && userData.user) {
            userInfo = userData.user;
            token = 'token' in userData ? String(userData.token || '') : '';
          } else if ('token' in userData) {
            // If the response has user data directly with a token
            userInfo = userData;
            token = String(userData.token || '');
          } else {
            // If the response is just the user object
            userInfo = userData;
            token = 'mock-token-' + Date.now(); // Generate a mock token
          }
        } else {
          throw new Error('Invalid response format');
        }

        console.log('Login successful for:', userInfo.fullName || userInfo.username || 'Unknown');

        if (!token) {
          console.error('No token received from server');
          throw new Error('Authentication failed: No token received');
        }

        // Normalize the role to ensure it's properly formatted
        let normalizedRole = userInfo.role || 'user';
        // If role is not a string, convert it to a string
        if (typeof normalizedRole !== 'string') {
          normalizedRole = String(normalizedRole);
        }
        // Ensure role is uppercase for consistency
        normalizedRole = normalizedRole.toUpperCase();

        console.log('API login - Normalized role:', normalizedRole);

        // Ensure role is properly formatted
        const formattedUserData = {
          ...userInfo,
          token: token,
          role: normalizedRole
        };

        console.log('Storing user data in localStorage with token');
        // Store user data with token in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));

        dispatch({ type: 'LOGIN_SUCCESS', payload: formattedUserData });

        // Log activity
        let userName = 'Unknown';
        try {
          if (formattedUserData && typeof formattedUserData === 'object') {
            // Try to get the user name from various possible properties using type-safe approach
            const userData = formattedUserData as Record<string, any>;
            userName = String(
              userData['fullName'] ||
              userData['username'] ||
              userData['name'] ||
              userData['email'] ||
              'Unknown'
            );
          }
        } catch (e) {
          console.error('Error getting user name:', e);
        }

        logActivity(
          'login',
          `User ${userName} logged in`,
          'system'
        );
      } catch (apiError) {
        console.error('API error during login:', apiError);
        console.log('Falling back to mock login for development');

        // If API is not available, check against mock users
        const mockUser = mockUsers.find(
          user => user.email === credentials.email && user.password === credentials.password
        );

        if (mockUser) {
          // Create a token for the mock user
          const mockToken = 'mock-token-' + Date.now();

          // Normalize the role to ensure it's properly formatted
          let normalizedRole = mockUser.role || 'user';
          // If role is not a string, convert it to a string
          if (typeof normalizedRole !== 'string') {
            normalizedRole = String(normalizedRole);
          }
          // Ensure role is uppercase for consistency
          normalizedRole = normalizedRole.toUpperCase();

          console.log('Mock login - Normalized role:', normalizedRole);

          // Format the user data
          const formattedUserData = {
            ...mockUser,
            token: mockToken,
            role: normalizedRole
          };

          console.log('Mock login successful for:', formattedUserData.fullName);
          console.log('Storing mock user data in localStorage');

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(formattedUserData));

          dispatch({ type: 'LOGIN_SUCCESS', payload: formattedUserData });

          // Log activity
          logActivity(
            'login',
            `User ${formattedUserData.fullName} logged in (mock)`,
            'system'
          );
        } else {
          throw new Error('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'An error occurred during login'
      });
      throw error; // Re-throw the error so the login component can handle it
    }
  };

  // Logout function
  const logout = async () => {
    // Log activity before removing user data
    if (state.user) {
      logActivity(
        'logout',
        `User ${state.user.fullName} logged out`,
        'system'
      );
    }

    // Check if we're in a Vercel deployment
    if (isVercelDeployment()) {
      console.log('Vercel deployment detected, using Vercel logout handler');
      try {
        await handleVercelLogout();
      } catch (vercelError) {
        console.error('Error during Vercel logout:', vercelError);
      }
    } else {
      try {
        // Try to call the API to logout
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
          console.log('Logout API call successful');
        } catch (apiError) {
          console.error('Error calling logout API:', apiError);
          console.log('Continuing with local logout');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    // Remove from localStorage
    localStorage.removeItem('user');

    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Log user activity
  const logActivity = (
    action: string,
    details: string,
    entityType: string,
    entityId?: string
  ) => {
    if (!state.user) return;

    const activityLog = {
      id: `local-${Date.now()}`,
      userId: state.user.id,
      userName: state.user.fullName,
      action,
      details,
      entity: entityType,
      entityId: entityId || undefined,
      timestamp: new Date().toISOString()
    };

    // Store activity locally first
    const localActivities = JSON.parse(localStorage.getItem('localActivities') || '[]');
    localActivities.push(activityLog);
    localStorage.setItem('localActivities', JSON.stringify(localActivities));

    // Try to send to server if online
    if (!isOfflineMode) {
      API.auditLogs.create(activityLog).catch(error => {
        console.error('Error logging activity to server:', error);
        console.log('Activity logged locally only');
        setIsOfflineMode(true);
      });
    } else {
      console.log('Offline mode: Activity logged locally only');
    }

    console.log('Activity logged:', activityLog);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
        logActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
