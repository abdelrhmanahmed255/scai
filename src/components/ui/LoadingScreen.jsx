// components/ui/LoadingScreen.jsx
import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('جاري التحميل');

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(current => {
        if (current === 'جاري التحميل...') return 'جاري التحميل';
        return current + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-transparent border-b-orange-500 rounded-full animate-spin absolute top-0 -rotate-45"></div>
      </div>
      <p className="mt-4 text-lg text-orange-600 font-medium">{loadingText}</p>
    </div>
  );
};

export default LoadingScreen;