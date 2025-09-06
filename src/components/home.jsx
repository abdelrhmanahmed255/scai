import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SCAILogo from './ui/SCAILogo';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f8fafc] to-[#eef2f7]">
      {/* Subtle Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200 opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-16 right-16 w-32 h-32 bg-indigo-200 opacity-30 rounded-full blur-3xl"></div>
      </div>

      {/* Logo Section */}
      <Link to="/">
      <div className="mb-10 text-center relative z-10">
        <SCAILogo />
      </div>
      </Link>
      {/* Heading */}
      <div  className="relative  flex  flex-col items-center justify-center  bg-gradient-to-b from-[#f8fafc] to-[#eef2f7]">
      {/* حركة الجملة الترحيبية */}
      <motion.h1 
        initial={{ x: '-100vw', opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: 'spring', stiffness: 50, duration: 1.5 }}
        className="text-4xl font-extrabold text-gray-800 relative z-10  text-center"
        dir='rtl'

      >
        أهلاً وسهلاً بكم في <span className="text-blue-600">SCAI</span> منصة التعليم الذكي 🚀
      </motion.h1>
    </div>

      {/* Buttons Section */}
      <div className="flex flex-col gap-5 w-full max-w-md relative z-10 mt-6">
        <button
          onClick={() => navigate('/login')}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center text-lg font-semibold"
        >
          👨‍🎓 الطالب
        </button>

        <button
          onClick={() => navigate('/login')}
          className="bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center text-lg font-semibold"
        >
          👩‍🏫 المعلم
        </button>
      </div>
    </div>
  );
};

export default Home;
