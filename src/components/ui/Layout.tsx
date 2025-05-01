import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Map path segments to readable names
  const getPathName = (path: string) => {
    const pathMap: {[key: string]: string} = {
      'warehouse': 'Warehouse',
      'inventory': 'Inventory',
      'suppliers': 'Suppliers',
      'audit': 'Audit',
      'items': 'Items',
      'overview': 'Overview',
      'transfer': 'Transfer',
      'shipments': 'Shipments',
    };

    return pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="flex py-3 px-6 text-secondary-500 text-sm border-b border-secondary-200 bg-white">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a href="/" className="hover:text-primary-600">Home</a>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="inline-flex items-center">
              <span className="mx-2 text-secondary-400">/</span>
              {isLast ? (
                <span className="text-primary-600 font-medium">{getPathName(value)}</span>
              ) : (
                <a href={to} className="hover:text-primary-600">{getPathName(value)}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const Layout = () => {
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      // Close dropdowns logic would go here
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        <Header />
        <Breadcrumb />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
        <footer className="py-4 px-6 border-t border-secondary-200 text-center">
          <div className="flex justify-center mb-2">
            <img src="/uploads/tawanialogo.jpg" alt="Tawania Logo" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-secondary-500">
            © 2023 Tawania - Advanced Warehouse Management System
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
