import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import WarehousesPage from "./pages/WarehousesPage";
import StockTransactionsPage from "./pages/StockTransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SystemStatusPage from "./pages/SystemStatusPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
