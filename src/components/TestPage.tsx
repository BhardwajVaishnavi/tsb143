import React from 'react';

const TestPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary-600 mb-6">Tailwind CSS Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Regular Card</h2>
          <p className="text-gray-600">This is a regular card with default styling.</p>
        </div>
        
        <div className="bg-primary-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Primary Light Card</h2>
          <p className="text-primary-700">This card uses primary-50 background and primary text colors.</p>
        </div>
        
        <div className="bg-primary-600 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Primary Dark Card</h2>
          <p className="text-primary-100">This card uses primary-600 background and light text.</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Primary Button
        </button>
        
        <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
          Dark Button
        </button>
        
        <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50">
          Outlined Button
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-200 rounded-full">
          <div className="h-4 bg-primary-600 rounded-full" style={{ width: '75%' }}></div>
        </div>
        
        <div className="h-4 w-full bg-gray-200 rounded-full">
          <div className="h-4 bg-green-600 rounded-full" style={{ width: '60%' }}></div>
        </div>
        
        <div className="h-4 w-full bg-gray-200 rounded-full">
          <div className="h-4 bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
