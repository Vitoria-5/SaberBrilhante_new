import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import Layout from '@/components/Layout';
import { StudentProvider } from '@/lib/StudentContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import TeacherDashboard from '@/pages/TeacherDashboard';
import StudentEntry from '@/pages/StudentEntry';
import AdaptiveTest from '@/pages/AdaptiveTest';
import GamesHub from '@/pages/GamesHub';
import SobreMim from '@/pages/SobreMim';

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* O Layout e a Home (tela dos botões) agora estão livres de travas */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/professora" element={<TeacherDashboard />} />
        <Route path="/aluno" element={<StudentEntry />} />
        <Route path="/teste" element={<AdaptiveTest />} />
        <Route path="/jogos" element={<GamesHub />} />
        <Route path="/sobre-mim" element={<SobreMim />} />
      </Route>
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <StudentProvider>
            <AuthenticatedApp />
          </StudentProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
