import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

import Login from './pages/Login'
import AgentDashboard from './pages/AgentDashboard'
import BatchCollect from './pages/BatchCollect'
import CustomerList from './pages/CustomerList'
import CreateCustomerLoan from './pages/CreateCustomerLoan'
import LoanQualification from './pages/LoanQualification'
import LoanOffer from './pages/LoanOffer'
import CustomerHistory from './pages/CustomerHistory'
import LoanCalculator from './pages/LoanCalculator'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminAgents from './pages/admin/AdminAgents'
import AdminFinance from './pages/admin/AdminFinance'
import AgentDetail from './pages/admin/AgentDetail'

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.is_staff ? '/admin/dashboard' : '/dashboard'} />} />

        {/* Agent routes */}
        <Route path="/dashboard" element={<PrivateRoute><AgentDashboard /></PrivateRoute>} />
        <Route path="/batch-collect" element={<PrivateRoute><BatchCollect /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomerList /></PrivateRoute>} />
        <Route path="/customers/new" element={<PrivateRoute><CreateCustomerLoan /></PrivateRoute>} />
        <Route path="/customers/:customerId/qualification" element={<PrivateRoute><LoanQualification /></PrivateRoute>} />
        <Route path="/customers/:customerId/offer" element={<PrivateRoute><LoanOffer /></PrivateRoute>} />
        <Route path="/customers/:customerId/history" element={<PrivateRoute><CustomerHistory /></PrivateRoute>} />
        <Route path="/loan-calculator" element={<PrivateRoute><LoanCalculator /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute adminOnly><AdminCustomers /></PrivateRoute>} />
        <Route path="/admin/agents" element={<PrivateRoute adminOnly><AdminAgents /></PrivateRoute>} />
        <Route path="/admin/agents/:agentId" element={<PrivateRoute adminOnly><AgentDetail /></PrivateRoute>} />
        <Route path="/admin/finance" element={<PrivateRoute adminOnly><AdminFinance /></PrivateRoute>} />

        <Route path="/" element={<Navigate to={user ? (user.is_staff ? '/admin/dashboard' : '/dashboard') : '/login'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
