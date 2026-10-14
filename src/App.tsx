/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { AppLayout } from './components/layout/AppLayout';
import { ActivePage } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Leads } from './pages/Leads';
import { Deals } from './pages/Deals';
import { Employees } from './pages/Employees';
import { Tasks } from './pages/Tasks';
import { Interactions } from './pages/Interactions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';

type AuthView = 'login' | 'register' | 'forgot_password';

function MainAppContent() {
  const { user, userProfile, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView | null>(null);

  // Quick Add modal shortcut state
  const [quickAddModal, setQuickAddModal] = useState<'customer' | 'lead' | 'deal' | 'task' | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-2xl animate-bounce">
          A
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Initializing ApexCRM Engine...</p>
      </div>
    );
  }

  // If user explicitly navigated to an auth view
  if (authView === 'login') {
    return (
      <Login
        onNavigateRegister={() => setAuthView('register')}
        onNavigateForgotPassword={() => setAuthView('forgot_password')}
        onSuccess={() => setAuthView(null)}
      />
    );
  }
  if (authView === 'register') {
    return (
      <Register
        onNavigateLogin={() => setAuthView('login')}
        onSuccess={() => setAuthView(null)}
      />
    );
  }
  if (authView === 'forgot_password') {
    return <ForgotPassword onNavigateLogin={() => setAuthView('login')} />;
  }

  return (
    <AppLayout onOpenAuth={(view) => setAuthView(view)}>
      {({ activePage, setActivePage, selectedCustomerId, setSelectedCustomerId }) => {
        switch (activePage) {
          case 'dashboard':
            return (
              <Dashboard
                onNavigate={setActivePage}
                onOpenQuickAdd={(type) => setQuickAddModal(type)}
                onSelectCustomerForDetail={(id) => {
                  setSelectedCustomerId(id);
                  setActivePage('customer-detail');
                }}
              />
            );

          case 'customers':
            return (
              <Customers
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setActivePage('customer-detail');
                }}
              />
            );

          case 'customer-detail':
            return (
              <CustomerDetail
                customerId={selectedCustomerId || 'CUST-1001'}
                onBack={() => setActivePage('customers')}
              />
            );

          case 'leads':
            return <Leads />;

          case 'deals':
            return <Deals />;

          case 'employees':
            return <Employees />;

          case 'tasks':
            return <Tasks />;

          case 'interactions':
            return (
              <Interactions
                onSelectCustomer={(id) => {
                  setSelectedCustomerId(id);
                  setActivePage('customer-detail');
                }}
              />
            );

          case 'reports':
            return <Reports />;

          case 'settings':
            return <Settings />;

          default:
            return (
              <Dashboard
                onNavigate={setActivePage}
                onOpenQuickAdd={(type) => setQuickAddModal(type)}
                onSelectCustomerForDetail={(id) => {
                  setSelectedCustomerId(id);
                  setActivePage('customer-detail');
                }}
              />
            );
        }
      }}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CRMProvider>
          <MainAppContent />
        </CRMProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
