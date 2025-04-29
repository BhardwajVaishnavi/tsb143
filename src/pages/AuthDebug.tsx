import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBug, FaHome, FaTrash, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { resetAuth } from '../utils/resetAuth';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const handleResetAuth = () => {
    if (window.confirm('Are you sure you want to reset your authentication state? You will be logged out.')) {
      resetAuth();
    }
  };

  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const storedUser = getUserData();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <FaBug className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Debug
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use this page to diagnose and fix authentication issues
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Authentication Status
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Authenticated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isAuthenticated ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      No
                    </span>
                  )}
                </dd>
              </div>

              {user && (
                <>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      User Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.fullName}
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.email}
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Role
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        (Type: {typeof user.role})
                      </span>
                    </dd>
                  </div>
                </>
              )}
            </dl>

            <div className="mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showDetails ? 'Hide' : 'Show'} Raw User Data
              </button>
            </div>

            {showDetails && storedUser && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  localStorage User Data:
                </h4>
                <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(storedUser, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Actions
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <button
                onClick={handleResetAuth}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaTrash className="mr-2 -ml-1 h-4 w-4" />
                Reset Authentication State
              </button>
              <p className="text-xs text-gray-500">
                This will clear all stored authentication data and redirect you to the login page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaHome className="mr-2 -ml-1 h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaUserShield className="mr-2 -ml-1 h-4 w-4" />
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
