import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PlatformLayout } from './components/layout';

// Dashboard Page
import DashboardPage from './pages/DashboardPage';

// Affiliate Brain Pages
import AffiliateOverviewPage from './pages/affiliate-brain/AffiliateOverviewPage';
import KOLManagementPage from './pages/affiliate-brain/KOLManagementPage';
import OrderImportPage from './pages/affiliate-brain/OrderImportPage';
import CommissionReportPage from './pages/affiliate-brain/CommissionReportPage';
import KOLPortalPage from './pages/affiliate-brain/KOLPortalPage';

// Invoice Flow Pages
import InvoiceOverviewPage from './pages/invoice-flow/InvoiceOverviewPage';
import InvoiceUploadPage from './pages/invoice-flow/InvoiceUploadPage';
import InvoiceListPage from './pages/invoice-flow/InvoiceListPage';
import MonthlyArchivePage from './pages/invoice-flow/MonthlyArchivePage';
import VendorRulesPage from './pages/invoice-flow/VendorRulesPage';

// Logistics Radar Pages
import LogisticsOverviewPage from './pages/logistics-radar/LogisticsOverviewPage';
import AnomalyMonitorPage from './pages/logistics-radar/AnomalyMonitorPage';
import RuleConfigPage from './pages/logistics-radar/RuleConfigPage';
import NotificationHistoryPage from './pages/logistics-radar/NotificationHistoryPage';

// Image Guardian Pages
import {
  GuardianOverviewPage,
  AssetVaultPage,
  HunterPage,
  WarRoomPage
} from './pages/image-guardian';

// Settings Page
import SettingsPage from './pages/SettingsPage';

export default function EcommercePlatformApp() {
  return (
    <PlatformLayout>
      <Routes>
        {/* Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Affiliate Brain */}
        <Route path="affiliate" element={<Navigate to="/ecommerce/affiliate/overview" replace />} />
        <Route path="affiliate/overview" element={<AffiliateOverviewPage />} />
        <Route path="affiliate/kols" element={<KOLManagementPage />} />
        <Route path="affiliate/import" element={<OrderImportPage />} />
        <Route path="affiliate/commissions" element={<CommissionReportPage />} />
        <Route path="affiliate/portal" element={<KOLPortalPage />} />

        {/* Invoice Flow */}
        <Route path="invoice" element={<Navigate to="/ecommerce/invoice/overview" replace />} />
        <Route path="invoice/overview" element={<InvoiceOverviewPage />} />
        <Route path="invoice/upload" element={<InvoiceUploadPage />} />
        <Route path="invoice/list" element={<InvoiceListPage />} />
        <Route path="invoice/archive" element={<MonthlyArchivePage />} />
        <Route path="invoice/vendor-rules" element={<VendorRulesPage />} />

        {/* Logistics Radar */}
        <Route path="logistics" element={<Navigate to="/ecommerce/logistics/overview" replace />} />
        <Route path="logistics/overview" element={<LogisticsOverviewPage />} />
        <Route path="logistics/monitor" element={<AnomalyMonitorPage />} />
        <Route path="logistics/rules" element={<RuleConfigPage />} />
        <Route path="logistics/notifications" element={<NotificationHistoryPage />} />

        {/* Image Guardian */}
        <Route path="image-guardian" element={<Navigate to="/ecommerce/image-guardian/overview" replace />} />
        <Route path="image-guardian/overview" element={<GuardianOverviewPage />} />
        <Route path="image-guardian/vault" element={<AssetVaultPage />} />
        <Route path="image-guardian/hunter" element={<HunterPage />} />
        <Route path="image-guardian/warroom" element={<WarRoomPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/*" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </PlatformLayout>
  );
}
