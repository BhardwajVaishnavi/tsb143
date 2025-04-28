import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-primary-600 mb-4">Test Component</h1>
      <p className="text-gray-700">This is a test component to check if the styling is working correctly.</p>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-4 bg-primary-100 rounded-lg">
          <h2 className="text-primary-800 font-semibold">Primary 100</h2>
          <p className="text-primary-700">This is primary-100 background with primary-700 text.</p>
        </div>
        
        <div className="p-4 bg-primary-200 rounded-lg">
          <h2 className="text-primary-800 font-semibold">Primary 200</h2>
          <p className="text-primary-700">This is primary-200 background with primary-700 text.</p>
        </div>
        
        <div className="p-4 bg-primary-300 rounded-lg">
          <h2 className="text-primary-800 font-semibold">Primary 300</h2>
          <p className="text-primary-700">This is primary-300 background with primary-700 text.</p>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Primary Button
        </button>
        
        <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50">
          Outlined Button
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
