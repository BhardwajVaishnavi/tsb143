import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UuidDebug: React.FC = () => {
  const [uuid, setUuid] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!uuid) {
      setError('Please enter a UUID to search');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check localStorage for any items containing this UUID
      const localStorageItems: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            if (value && value.includes(uuid)) {
              try {
                localStorageItems[key] = JSON.parse(value);
              } catch {
                localStorageItems[key] = value;
              }
            }
          } catch (e) {
            console.error(`Error processing localStorage item ${key}:`, e);
          }
        }
      }

      // Check sessionStorage for any items containing this UUID
      const sessionStorageItems: Record<string, any> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          try {
            const value = sessionStorage.getItem(key);
            if (value && value.includes(uuid)) {
              try {
                sessionStorageItems[key] = JSON.parse(value);
              } catch {
                sessionStorageItems[key] = value;
              }
            }
          } catch (e) {
            console.error(`Error processing sessionStorage item ${key}:`, e);
          }
        }
      }

      setResult({
        localStorage: localStorageItems,
        sessionStorage: sessionStorageItems
      });
    } catch (e) {
      console.error('Error searching for UUID:', e);
      setError(`Error searching for UUID: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    if (window.confirm('Are you sure you want to clear all storage? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            UUID Debug Tool
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Search for a UUID in localStorage and sessionStorage
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Search for UUID
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="uuid" className="block text-sm font-medium text-gray-700">
                  UUID
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="uuid"
                    id="uuid"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 p-2 border"
                    placeholder="Enter UUID to search"
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={clearStorage}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear All Storage
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Results</h4>
                
                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-1">localStorage</h5>
                  {Object.keys(result.localStorage).length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-xs">{JSON.stringify(result.localStorage, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No matches found in localStorage</p>
                  )}
                </div>
                
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-1">sessionStorage</h5>
                  {Object.keys(result.sessionStorage).length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-xs">{JSON.stringify(result.sessionStorage, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No matches found in sessionStorage</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/auth/debug"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Auth Debug
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UuidDebug;
