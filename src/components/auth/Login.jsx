import { useState, useEffect } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/SCAILogo';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'student') {
        navigate('/chat');
      } else if (user.role === 'teacher') {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    const result = await login(formData);
    
    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      // Redirect based on role
      if (result.data.role === 'student') {
        navigate('/chat');
      } else if (result.data.role === 'teacher') {
        navigate('/dashboard');
      }
    } else {
      // Show error toast instead of success
      toast.error(result.error || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="mb-8 text-center">
          <Link to="/">
            <Logo />
          </Link>
          <div className="text-2xl font-semibold text-gray-800 mt-6 mb-2">تسجيل الدخول</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <AlertCircle className="h-5 w-5" />
              <p className="text-right">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="أدخل اسم المستخدم"
                className={`w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-right ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                dir="rtl"
                disabled={loading}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1 text-right">{validationErrors.username}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="كلمة المرور"
                className={`w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-right ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                dir="rtl"
                disabled={loading}
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1 text-right">{validationErrors.password}</p>
              )}
            </div>

            <Link 
              to="/resetPassword"
              className="block text-sm text-orange-600 hover:text-orange-700 text-right"
            >
              نسيت كلمة المرور؟
            </Link>

            <button
              type="submit"
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium">
              تسجيل جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;