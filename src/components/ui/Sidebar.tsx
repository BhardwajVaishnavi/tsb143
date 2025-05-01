import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHome,
  FaWarehouse,
  FaBoxes,
  FaUsers,
  FaClipboardList,
  FaChevronDown,
  FaChevronRight,
  FaChartPie,
  FaShippingFast,
  FaFileInvoiceDollar,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaBars,
  FaTimes,
  FaTag,
  FaUserShield
} from 'react-icons/fa';

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  to?: string;
  children?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  active?: boolean;
};

const SidebarItem = ({ icon, title, to, children, badge, badgeColor = 'bg-primary-500', active = false }: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if this item or any of its children are active
  useEffect(() => {
    if (children) {
      // Check if the current path starts with the parent path
      const childrenArray = React.Children.toArray(children);
      const isChildActive = childrenArray.some((child: any) => {
        if (child.props && child.props.to) {
          return location.pathname.startsWith(child.props.to);
        }
        return false;
      });

      if (isChildActive) {
        setIsOpen(true);
      }
    }
  }, [location.pathname, children]);

  if (children) {
    const isActive = active || (to ? location.pathname.startsWith(to) : false);

    return (
      <div className="mb-1">
        <button
          className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-600 hover:bg-primary-50'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`mr-3 text-lg ${isActive ? 'text-primary-600' : 'text-secondary-500'}`}>{icon}</span>
          <span className="flex-1">{title}</span>
          {badge && (
            <span className={`${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2`}>
              {badge}
            </span>
          )}
          <span className="text-secondary-400">
            {isOpen ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
          </span>
        </button>
        {isOpen && (
          <div className="pl-11 mt-1 space-y-1">
            {children}
          </div>
        )}
      </div>
    );
  }

  const isActive = active || (to ? location.pathname === to : false);

  return (
    <Link
      to={to || '#'}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors mb-1 ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-600 hover:bg-primary-50'}`}
    >
      <span className={`mr-3 text-lg ${isActive ? 'text-primary-600' : 'text-secondary-500'}`}>{icon}</span>
      <span>{title}</span>
      {badge && (
        <span className={`ml-auto ${badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const { user } = useAuth();

  // Fetch categories for the sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Import axios for API calls
        const axios = await import('axios');

        // Fetch categories from API
        const response = await axios.default.get('/api/categories');
        const categoriesData = response.data || [];

        // Set all categories
        setCategories(categoriesData);

        // Filter parent categories (those with no parent)
        const parents = categoriesData.filter((cat: any) => cat.parent_id === null);
        setParentCategories(parents);
      } catch (error) {
        console.error('Error fetching categories for sidebar:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-secondary-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-30 lg:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-30 transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            {!collapsed && (
              <div className="flex items-center">
                <img src="/uploads/tawanialogo.jpg" alt="Tawania Logo" className="h-10 w-auto mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-primary-700">Tawania</h1>
                  <p className="text-xs text-secondary-500">Warehouse Management</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="mx-auto">
                <img src="/uploads/tawanialogo.jpg" alt="Tawania Logo" className="h-10 w-auto" />
              </div>
            )}
            <button
              className="lg:flex hidden items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-secondary-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FaSearch className="absolute left-3 top-2.5 text-secondary-400" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={"flex-1 overflow-y-auto px-3 py-4 " + (collapsed ? "px-2" : "")}>
            {collapsed ? (
              // Collapsed menu
              <div className="flex flex-col items-center space-y-4">
                <Link to="/" className="p-2 rounded-lg hover:bg-primary-50">
                  <FaHome className="text-secondary-500" />
                </Link>
                <div className="relative group">
                  <Link to="/warehouse" className="p-2 rounded-lg hover:bg-primary-50">
                    <FaWarehouse className="text-secondary-500" />
                  </Link>
                  <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg p-2 w-40 hidden group-hover:block z-50">
                    <Link to="/warehouse/inward" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Inward</Link>
                    <Link to="/warehouse/outward" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Outward</Link>
                    <Link to="/warehouse/damage" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Damage</Link>
                    <Link to="/warehouse/closing-stock" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Closing Stock</Link>

                  </div>
                </div>
                <div className="relative group">
                  <Link to="/inventory" className="p-2 rounded-lg hover:bg-primary-50">
                    <FaBoxes className="text-secondary-500" />
                  </Link>
                  <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg p-2 w-40 hidden group-hover:block z-50">
                    <Link to="/inventory" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Overview</Link>
                    <Link to="/inventory/items" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Items</Link>
                    <Link to="/inventory/transfer" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Transfer</Link>
                    <Link to="/inventory/audit" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Audit</Link>
                    <Link to="/inventory/reports" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Reports</Link>
                  </div>
                </div>
                <div className="relative group">
                  <Link to="/categories" className="p-2 rounded-lg hover:bg-primary-50">
                    <FaTag className="text-secondary-500" />
                  </Link>
                  <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg p-2 w-48 hidden group-hover:block z-50">
                    <Link to="/categories" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">All Categories</Link>
                    <Link to="/categories/new?type=parent" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Add Parent Category</Link>

                    {/* Parent Categories */}
                    {parentCategories.length > 0 && (
                      <>
                        <div className="mt-2 mb-1 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Parent Categories
                        </div>
                        {parentCategories.map((parent) => (
                          <div key={parent.id}>
                            <Link
                              to={`/categories?parent=${parent.id}`}
                              className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded"
                            >
                              {parent.name}
                            </Link>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <Link to="/suppliers" className="p-2 rounded-lg hover:bg-primary-50">
                  <FaUsers className="text-secondary-500" />
                </Link>
                <div className="relative group">
                  <Link to="/reports" className="p-2 rounded-lg hover:bg-primary-50">
                    <FaChartPie className="text-secondary-500" />
                  </Link>
                  <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg p-2 w-40 hidden group-hover:block z-50">
                    <Link to="/reports" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">All Reports</Link>
                    <Link to="/reports" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Employee Activity</Link>
                    <Link to="/reports/inventory" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Inventory</Link>
                    <Link to="/reports/suppliers" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Suppliers</Link>
                  </div>
                </div>
                <Link to="/audit" className="p-2 rounded-lg hover:bg-primary-50">
                  <FaClipboardList className="text-secondary-500" />
                </Link>
                {user?.role?.toLowerCase() === 'admin' && (
                  <div className="relative group">
                    <button className="p-2 rounded-lg hover:bg-primary-50">
                      <FaUserShield className="text-secondary-500" />
                    </button>
                    <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg p-2 w-48 hidden group-hover:block z-50">
                      <Link to="/admin/users" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">User Management</Link>
                      <Link to="/admin/permissions" className="block py-1 px-2 text-sm text-secondary-700 hover:bg-primary-50 rounded">Permission Templates</Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Expanded menu
              <div className="space-y-1">
                <SidebarItem icon={<FaHome />} title="Dashboard" to="/" />

                <SidebarItem icon={<FaWarehouse />} title="Warehouse" badge="3" badgeColor="bg-red-500">
                  <Link to="/warehouse" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link to="/warehouse/overview" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Overview
                  </Link>
                  <Link to="/warehouse/items" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Items
                  </Link>
                  <Link to="/warehouse/inward" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Inward
                  </Link>
                  <Link to="/warehouse/outward" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Outward
                  </Link>
                  <Link to="/warehouse/damage" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Damage
                  </Link>
                  <Link to="/warehouse/closing-stock" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Closing Stock
                  </Link>
                </SidebarItem>

                <SidebarItem icon={<FaBoxes />} title="Inventory">
                  <Link to="/inventory" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Overview
                  </Link>
                  <Link to="/inventory/items" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Items
                  </Link>
                  <Link to="/inventory/transfer" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Transfer
                  </Link>
                  <Link to="/inventory/audit" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Audit
                  </Link>
                  <Link to="/inventory/reports" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Reports
                  </Link>
                </SidebarItem>

                <SidebarItem icon={<FaTag />} title="Categories">
                  <Link to="/categories" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    All Categories
                  </Link>
                  <Link to="/categories/new?type=parent" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Add Parent Category
                  </Link>

                  {/* Parent Categories Section */}
                  {parentCategories.length > 0 && (
                    <div className="mt-3 mb-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 mb-2">
                        Parent Categories
                      </div>
                      {parentCategories.map((parent) => (
                        <div key={parent.id} className="mb-1">
                          <Link
                            to={`/categories?parent=${parent.id}`}
                            className="flex items-center py-1.5 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600"
                          >
                            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                            <span className="truncate">{parent.name}</span>
                          </Link>

                          {/* Subcategories for this parent */}
                          {categories.filter((cat) => cat.parent_id === parent.id).length > 0 && (
                            <div className="pl-7 mt-1 space-y-1">
                              {categories
                                .filter((cat) => cat.parent_id === parent.id)
                                .map((subcat) => (
                                  <Link
                                    key={subcat.id}
                                    to={`/categories?id=${subcat.id}`}
                                    className="block py-1 text-xs rounded-md text-secondary-500 hover:text-primary-600"
                                  >
                                    {subcat.name}
                                  </Link>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </SidebarItem>

                <SidebarItem icon={<FaUsers />} title="Suppliers" to="/suppliers" />

                <SidebarItem icon={<FaShippingFast />} title="Shipments" to="/shipments" badge="5" badgeColor="bg-green-500" />

                <SidebarItem icon={<FaFileInvoiceDollar />} title="Purchase Orders" to="/purchase-orders" />

                <SidebarItem icon={<FaChartPie />} title="Reports">
                  <Link to="/reports" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    All Reports
                  </Link>
                  <Link to="/reports" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Employee Activity
                  </Link>
                  <Link to="/reports/inventory" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Inventory
                  </Link>
                  <Link to="/reports/suppliers" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Suppliers
                  </Link>
                  <Link to="/reports/performance" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                    Performance
                  </Link>
                </SidebarItem>

                <SidebarItem icon={<FaClipboardList />} title="Audit" to="/audit" />

                {user?.role?.toLowerCase() === 'admin' && (
                  <SidebarItem icon={<FaUserShield />} title="Admin">
                    <Link to="/admin/users" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                      User Management
                    </Link>
                    <Link to="/admin/permissions" className="block py-2 pl-3 pr-4 text-sm rounded-md text-secondary-600 hover:bg-primary-50 hover:text-primary-600">
                      Permission Templates
                    </Link>
                  </SidebarItem>
                )}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className={"border-t border-secondary-200 p-4 " + (collapsed ? "flex justify-center" : "")}>
            {collapsed ? (
              <Link to="/settings" className="p-2 text-secondary-500 hover:text-primary-600">
                <FaCog />
              </Link>
            ) : (
              <div className="flex items-center justify-between">
                <Link to="/settings" className="flex items-center text-secondary-600 hover:text-primary-600">
                  <FaCog className="mr-2 text-primary-500" />
                  <span>Settings</span>
                </Link>
                <button className="flex items-center text-secondary-600 hover:text-primary-600">
                  <FaSignOutAlt className="mr-2 text-primary-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Missing FaChevronLeft component
const FaChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-3 h-3 fill-current">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
  </svg>
);

export default Sidebar;
