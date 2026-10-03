import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from '../components/auth/AuthGate';
import { AppShell } from '../components/layout/AppShell';
import { LayoutProvider } from '../components/layout/LayoutProvider';
import { ReceiptHost } from '../components/receipt/ReceiptHost';
import { ActivityPage } from '../pages/ActivityPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ClosePage } from '../pages/ClosePage';
import { CustomersPage } from '../pages/CustomersPage';
import { ExportsPage } from '../pages/ExportsPage';
import { ImportPage } from '../pages/ImportPage';
import { ProductsPage } from '../pages/ProductsPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { StaffPage } from '../pages/StaffPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <LayoutProvider>
          <ReceiptHost />
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<RegisterPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="import" element={<ImportPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="close" element={<ClosePage />} />
              <Route path="exports" element={<ExportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </LayoutProvider>
      </AuthGate>
    </BrowserRouter>
  );
}
