import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { Toaster } from 'react-hot-toast';

// Components
import Home from './components/home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AnimatedChat from './components/chat/AnimatedChat';
import SubjectSelection from './components/chat/SubjectSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import ResetPassword from './components/auth/PasswordReset';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
const RequireSubject = ({ children }) => {
  const selectedSubject = localStorage.getItem('selectedSubject');
  console.log("RequireSubject - Found:", selectedSubject);

  if (!selectedSubject) {
    console.warn("RequireSubject - Redirecting to /subjects");
    return <Navigate to="/subjects" replace />;
  }

  return children;
};


const App = () => {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            direction: 'rtl'
          }
        }}
      />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resetPassword" element={<ResetPassword />} />

              {/* Subject Selection */}
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <SubjectSelection />
                  </ProtectedRoute>
                }
              />

              {/* Chat Path - Ensures Subject is Selected */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <RequireSubject>
                      <AnimatedChat />
                    </RequireSubject>
                  </ProtectedRoute>
                }
              />

              {/* Dashboard */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all undefined routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  );
};


export default App;
