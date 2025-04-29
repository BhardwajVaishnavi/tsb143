import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {user ? (
            <>
              Sorry, <span className="font-medium">{user.fullName}</span>, you don't have permission to access this page.
              <br />
              Your role ({user.role}) doesn't have the required permissions.
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Debug info: Role type: {typeof user.role}, Role value: "{user.role}"
              </span>
            </>
          ) : (
            'You need to be logged in with appropriate permissions to access this page.'
          )}
        </p>
        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaHome className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
