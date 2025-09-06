// NavigationComponents.jsx
import React, { memo } from 'react';
import { ArrowLeft, GraduationCap, Calendar, BookOpen, PlusCircle, LogOut } from 'lucide-react';
import { chaptersData } from './ChatData';

export const Navigation = memo(({ chapter, lesson, onBack, onNewChat, onLogout }) => (
  <div className="bg-white border-b px-4 py-2 flex items-center justify-between font-arabic">
    <div className="flex items-center gap-2">
      <button 
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="text-gray-600" size={20} />
      </button>
      <button
        onClick={onNewChat}
        className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-500 flex items-center gap-1"
      >
        <PlusCircle size={20} />
        <span className="text-sm hidden sm:inline">محادثة جديدة</span>
      </button>
    </div>
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-500 flex items-center gap-2 select-none">
        {chapter && (
          <>
            <span>{chaptersData[chapter].title}</span>
            {lesson && (
              <>
                <span className="text-gray-300">/</span>
                <span>{chaptersData[chapter].lessons[lesson]}</span>
              </>
            )}
          </>
        )}
      </div>
      <button
        onClick={onLogout}
        className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500 flex items-center gap-1"
      >
        <LogOut size={20} />
        <span className="text-sm hidden sm:inline">تسجيل الخروج</span>
      </button>
    </div>
  </div>
));

export const Header = memo(({ studentInfo }) => (
  <div className="bg-white border-b font-arabic">
    <div className="px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-orange-100 p-2 rounded-full">
          <GraduationCap className="text-orange-500" size={20} />
        </div>
        <div className="text-right">
          <h2 className="font-semibold text-gray-800">{studentInfo.year}</h2>
          <p className="text-sm text-gray-500">{studentInfo.term}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
        <span className="text-sm text-blue-600">{studentInfo.academicYear}</span>
        <Calendar className="text-blue-600" size={16} />
      </div>
    </div>
  </div>
));