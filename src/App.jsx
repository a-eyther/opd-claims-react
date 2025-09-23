import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/notifications/ToastContext';
import MainLayout from './components/layout/MainLayout';
import ClaimsListPage from './pages/ClaimsListPage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import ClaimEditorPage from './pages/ClaimEditorPage';
import PendingClaimsPage from './pages/PendingClaimsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdjudicationPage from './pages/AdjudicationPage';
import AdjudicationResultPage from './pages/AdjudicationResultPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ClaimsListPage />} />
            {/* Direct route to claim editor (digitization-first workflow) */}
            <Route path="claim/:claimId/edit" element={<ClaimEditorPage />} />
            {/* Keep legacy claim details page for backward compatibility */}
            <Route path="claim/:claimId" element={<ClaimDetailsPage />} />
            <Route path="pending" element={<PendingClaimsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="adjudication/:claimId" element={<AdjudicationPage />} />
            <Route path="adjudication/result/:claimId" element={<AdjudicationResultPage />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App
