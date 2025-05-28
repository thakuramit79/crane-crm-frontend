import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { AdminDashboard } from './pages/AdminDashboard';
import { SalesAgentDashboard } from './pages/SalesAgentDashboard';
import { OperationsManagerDashboard } from './pages/OperationsManagerDashboard';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { LeadManagement } from './pages/LeadManagement';
import { QuotationManagement } from './pages/QuotationManagement';
import { JobScheduling } from './pages/JobScheduling';
import { SiteAssessment } from './pages/SiteAssessment';
import { JobSummaryFeedback } from './pages/JobSummaryFeedback';
import { EquipmentManagement } from './pages/EquipmentManagement';
import { ServicesManagement } from './pages/ServicesManagement';
import { UserManagement } from './pages/UserManagement';
import { Configuration } from './pages/Configuration';
import { Customers } from './pages/Customers';
import { Deals } from './pages/Deals';
import { useAuthStore } from './store/authStore';

function DashboardRouter() {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'sales_agent':
      return <SalesAgentDashboard />;
    case 'operations_manager':
      return <OperationsManagerDashboard />;
    case 'operator':
      return <OperatorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          
          <Route path="leads" element={<LeadManagement />} />
          <Route path="deals" element={<Deals />} />
          <Route path="quotations" element={<QuotationManagement />} />
          <Route path="customers" element={<Customers />} />
          
          <Route path="jobs" element={<JobScheduling />} />
          <Route path="site-assessment" element={<SiteAssessment />} />
          <Route path="job-summary/:id" element={<JobSummaryFeedback />} />
          
          <Route path="config" element={<Configuration />} />
          <Route path="config/users" element={<UserManagement />} />
          <Route path="config/equipment" element={<EquipmentManagement />} />
          <Route path="config/services" element={<ServicesManagement />} />
          
          <Route path="feedback" element={<JobSummaryFeedback />} />
          <Route path="analytics" element={<div className="p-4">Analytics Page</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;