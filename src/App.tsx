import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext, UNSAFE_NavigationContext, UNSAFE_RouteContext, UNSAFE_useScrollRestoration } from 'react-router-dom';

// Silence React Router deprecation warnings
UNSAFE_DataRouterContext;
UNSAFE_DataRouterStateContext;
UNSAFE_NavigationContext;
UNSAFE_RouteContext;
UNSAFE_useScrollRestoration;

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/auth/LoginPage';
import Unauthorized from './pages/Unauthorized';
import AuthDebug from './pages/AuthDebug';
import UuidDebug from './pages/debug/UuidDebug';
import VercelLogin from './pages/VercelLogin';
import VercelDebug from './pages/VercelDebug';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import Layout from './components/ui/Layout';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';

// Warehouse Components
import WarehouseDashboard from './components/warehouse/WarehouseDashboard';
import WarehouseOverview from './components/warehouse/WarehouseOverview';
import WarehouseItemForm from './components/warehouse/WarehouseItemForm';
import ItemDetail from './pages/warehouse/ItemDetail';
import InwardForm from './components/warehouse/InwardForm';
import OutwardForm from './components/warehouse/OutwardForm';
import DamageForm from './components/warehouse/DamageForm';
import AuditForm from './components/warehouse/AuditForm';
import ClosingStockReport from './components/warehouse/ClosingStockReport';

// Inventory Components
import InventoryOverview from './components/inventory/InventoryOverview';
import InventoryTransferForm from './components/inventory/InventoryTransferForm';
import InventoryItemDetail from './pages/inventory/ItemDetail';
import InventoryItemForm from './components/inventory/InventoryItemForm';
import InventoryReportsPage from './pages/inventory/reports';
import InventoryAuditPage from './pages/inventory/audit';
import AuditDetailPage from './pages/inventory/audit/AuditDetail';

// Category Components
import CategoryList from './components/categories/CategoryList';
import CategoryForm from './components/categories/CategoryForm';

// Supplier Components
import SuppliersList from './components/suppliers/SuppliersList';
import SupplierForm from './components/suppliers/SupplierForm';

// Audit Components
import AuditDashboard from './components/audit/AuditDashboard';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import UserForm from './components/admin/UserForm';
import UserDetail from './components/admin/UserDetail';
import PermissionManagement from './components/admin/PermissionManagement';
import TestPage from './components/TestPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth/login" element={window.location.hostname.includes('vercel.app') ? <VercelLogin /> : <Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/auth/debug" element={<AuthDebug />} />
          <Route path="/debug/uuid" element={<UuidDebug />} />
          <Route path="/vercel/debug" element={<VercelDebug />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="test" element={<TestPage />} />

              {/* Warehouse - restricted to admin and warehouse_manager */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager']} />}>
                <Route path="warehouse" element={<WarehouseDashboard />} />
                <Route path="warehouse/overview" element={<WarehouseOverview />} />
                <Route path="warehouse/items" element={<WarehouseOverview />} />
                <Route path="warehouse/items/new" element={<WarehouseItemForm />} />
                <Route path="warehouse/items/:id" element={<ItemDetail />} />
                <Route path="warehouse/items/:id/edit" element={<WarehouseItemForm />} />
                <Route path="warehouse/inward" element={<InwardForm />} />
                <Route path="warehouse/outward" element={<OutwardForm />} />
                <Route path="warehouse/damage" element={<DamageForm />} />
                <Route path="warehouse/closing-stock" element={<ClosingStockReport />} />
              </Route>

              {/* Warehouse Audit - restricted to admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="warehouse/audit" element={<AuditForm />} />
              </Route>

              {/* Inventory - accessible to all authenticated users */}
              <Route path="inventory" element={<InventoryOverview />} />
              <Route path="inventory/items" element={<InventoryOverview />} />
              <Route path="inventory/items/:id" element={<InventoryItemDetail />} />
              <Route path="inventory/items/:id/edit" element={<InventoryItemForm />} />
              <Route path="inventory/reports" element={<InventoryReportsPage />} />

              {/* Transfers - restricted to admin, warehouse_manager, and inventory_manager */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager', 'inventory_manager']} />}>
                <Route path="inventory/transfer" element={<InventoryTransferForm />} />
                <Route path="inventory/audit" element={<InventoryAuditPage />} />
                <Route path="inventory/audit/:id" element={<AuditDetailPage />} />
              </Route>

              {/* Categories - accessible to all authenticated users */}
              <Route path="categories" element={<CategoryList />} />

              {/* Category management - restricted to admin and warehouse_manager */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager']} />}>
                <Route path="categories/new" element={<CategoryForm />} />
                <Route path="categories/:id/edit" element={<CategoryForm />} />
              </Route>

              {/* Suppliers - restricted to admin and warehouse_manager */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_manager']} />}>
                <Route path="suppliers" element={<SuppliersList />} />
                <Route path="suppliers/new" element={<SupplierForm />} />
                <Route path="suppliers/:id/edit" element={<SupplierForm />} />
              </Route>

              {/* Audit - restricted to admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="audit" element={<AuditDashboard />} />
              </Route>

              {/* User Management - restricted to admin only (super admin) */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/users/new" element={<UserForm />} />
                <Route path="admin/users/:id" element={<UserDetail />} />
                <Route path="admin/users/:id/edit" element={<UserForm />} />
                <Route path="admin/permissions" element={<PermissionManagement />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
