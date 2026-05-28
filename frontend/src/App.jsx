import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import WarehousesPage from "./pages/WarehousesPage";
import StockTransactionsPage from "./pages/StockTransactionsPage";
import StockTransfersPage from "./pages/StockTransfersPage";
import ReportsPage from "./pages/ReportsPage";
import SystemStatusPage from "./pages/SystemStatusPage";
import SuppliersPage from "./pages/SuppliersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import ImportDataPage from "./pages/ImportDataPage";
import QueueJobsPage from "./pages/QueueJobsPage";
import RoleAccessPage from "./pages/RoleAccessPage";
import SessionTimeout from "./components/SessionTimeout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
                <ProtectedRoute>
                <CategoriesPage />
                </ProtectedRoute>
            }
            />

            <Route
            path="/transactions"
            element={
                <ProtectedRoute>
                <StockTransactionsPage />
                </ProtectedRoute>
            }
            />
            <Route
              path="/stock-transactions"
              element={
                <ProtectedRoute>
                  <StockTransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-transfers"
              element={
                <ProtectedRoute>
                  <StockTransfersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouses"
              element={
                <ProtectedRoute>
                  <WarehousesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-status"
              element={
                <ProtectedRoute>
                  <SystemStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import-data"
              element={
                <ProtectedRoute>
                  <ImportDataPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/queue-jobs"
              element={
                <ProtectedRoute>
                  <QueueJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/role-access"
              element={
                <ProtectedRoute>
                  <RoleAccessPage />
                </ProtectedRoute>
              }
            />
        </Routes>
        <SessionTimeout />
      </BrowserRouter>
    </AuthProvider>
  );
}
