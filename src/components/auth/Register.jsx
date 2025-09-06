import { useState } from 'react';
import { User, Lock, Mail ,AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/SCAILogo';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      errors.username = 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      errors.password = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.username,
      password: formData.password,
      email: formData.email
    };

    const result = await register(userData);
    
    if (result.success) {
      toast.success('تم التسجيل بنجاح!');
      navigate('/login');
    } else {
      toast.error(result.error || 'فشل التسجيل');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="mb-8 text-center">
          <Link to="/">
            <Logo />
          </Link>
          <div className="text-2xl font-semibold text-gray-800 mt-6 mb-2">تسجيل جديد</div>
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
                placeholder="اسم المستخدم المعطي لك"
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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className={`w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-right ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                dir="rtl"
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1 text-right">{validationErrors.email}</p>
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
  
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                className={`w-full h-12 pl-12 pr-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-right ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                }`}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                dir="rtl"
                disabled={loading}
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 text-right">{validationErrors.confirmPassword}</p>
              )}
            </div>
  
            <button
              type="submit"
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>جاري التسجيل...</span>
                </div>
              ) : (
                'تسجيل'
              )}
            </button>
          </form>
  
          <div className="mt-6 text-center text-sm">
            <Link 
              to="/login" 
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              لديك حساب بالفعل؟ تسجيل دخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;