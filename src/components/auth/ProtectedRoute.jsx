// components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Simulate a brief loading period for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!user) {
        toast.error('يرجى تسجيل الدخول للمتابعة');
      }
      setIsVerifying(false);
    };

    verifyAuth();
  }, [user]);

  if (loading || isVerifying) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User exists, check if they're accessing the correct route
  const currentPath = location.pathname;
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  if (currentPath.startsWith('/dashboard') && !isTeacher) {
    toast.error('غير مصرح بالوصول');
    return <Navigate to="/chat" replace />;
  }

  if (currentPath.startsWith('/chat') && !isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;