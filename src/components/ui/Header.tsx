import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaSearch,
  FaQuestionCircle,
  FaChevronDown,
  FaUserCircle,
  FaHistory,
  FaUserCog,
  FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout, logActivity } = useAuth();
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logActivity('logout', 'User logged out', 'system');
    logout();
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: {[key: string]: string} = {
      'admin': 'Administrator',
      'warehouse_manager': 'Warehouse Manager',
      'inventory_manager': 'Inventory Manager',
      'viewer': 'Viewer'
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Logo and Search */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/uploads/tawanialogo.jpg" alt="Tawania Logo" className="h-10 w-auto" />
          </Link>

          {/* Search */}
          <div className="lg:w-64 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-secondary-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FaSearch className="absolute left-3 top-2.5 text-secondary-400" />
            </div>
          </div>
        </div>

        {/* Right side - User menu & notifications */}
        <div className="flex items-center ml-auto space-x-4">
          <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-full relative">
            <FaQuestionCircle size={20} />
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-full relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-10 border border-secondary-200">
                <div className="px-4 py-2 border-b border-secondary-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <button className="text-xs text-primary-600 hover:text-primary-800">Mark all as read</button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-primary-50 border-l-4 border-primary-500">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-secondary-500">12 items are below minimum stock level</p>
                    <p className="text-xs text-secondary-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-primary-50">
                    <p className="text-sm font-medium">New shipment received</p>
                    <p className="text-xs text-secondary-500">Shipment #SH-2023-156 has been processed</p>
                    <p className="text-xs text-secondary-400 mt-1">5 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-primary-50">
                    <p className="text-sm font-medium">Purchase order approved</p>
                    <p className="text-xs text-secondary-500">PO-2023-178 has been approved</p>
                    <p className="text-xs text-secondary-400 mt-1">Yesterday</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-secondary-200 text-center">
                  <button className="text-sm text-primary-600 hover:text-primary-800">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-primary-600" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-800">{user?.fullName || 'User'}</p>
                <p className="text-xs text-secondary-500">{user ? getRoleDisplayName(user.role) : 'Guest'}</p>
              </div>
              <FaChevronDown size={12} className="hidden md:block text-secondary-400" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-secondary-200">
                <div className="px-4 py-2 border-b border-secondary-200">
                  <p className="text-sm font-medium text-secondary-800">{user?.fullName}</p>
                  <p className="text-xs text-secondary-500">{user?.email}</p>
                </div>

                <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50">
                  <FaUserCircle className="mr-2 text-primary-500" />
                  My Profile
                </Link>

                <Link to="/activity" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50">
                  <FaHistory className="mr-2 text-primary-500" />
                  My Activity Log
                </Link>

                {user?.role === 'admin' && (
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50">
                    <FaUserCog className="mr-2 text-primary-500" />
                    Account Settings
                  </Link>
                )}

                <div className="border-t border-secondary-200 my-1"></div>

                {user?.role?.toLowerCase() === 'admin' && (
                  <>
                    <div className="px-4 py-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                      Admin Options
                    </div>
                    <Link to="/admin/users" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50">
                      <FaUserShield className="mr-2 text-primary-500" />
                      User Management
                    </Link>
                    <Link to="/admin/permissions" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50">
                      <FaUserCog className="mr-2 text-primary-500" />
                      Permission Templates
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-primary-50"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
