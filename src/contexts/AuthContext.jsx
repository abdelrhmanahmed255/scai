import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const LOCAL_STORAGE_KEY = 'authUser';

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const dataWithRole = {
        ...userData,
        role: "student"
      };
      
      const response = await fetch('https://scaiapipost.replit.app/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithRole),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في التسجيل');
      }

      setUser(data);
      return { success: true, data };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'حدث خطأ في التسجيل');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://scaiapipost.replit.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
  
      if (!response.ok || data.message === "Invalid username or password") {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // Store the complete user data including token and role
      const userData = {
        token: data.token,
        role: data.role,
        ...credentials  // Optional: include user details if needed
      };
      
      setUser(userData);
      return { success: true, data };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'فشل تسجيل الدخول');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

// In AuthContext.js
    const logout = () => {
      setUser(null);
      localStorage.clear(); 
    };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};