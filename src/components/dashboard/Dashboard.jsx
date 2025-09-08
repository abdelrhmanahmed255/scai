import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Settings, LogOut, Menu, X, Bell,
  User, Search, BarChart2, Home, BookOpen,
  ChevronRight, ChevronLeft,ChevronDown , HelpCircle, FileText,
  Star,TrendingUp // Added Star import here
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  
} from "../../components/ui/dialog";
import LessonsTable from './LessonsTable';
import StudentLessonPerformance from './StudentLessonPerformance';
import { useQuery } from 'react-query';
import { debounce } from 'lodash';

// Lazy load heavy components
const ChartComponents = lazy(() => import('./ChartComponents'));
const LessonSummary = lazy(() => import('./LessonSummary'));
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentsData, setStudentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fix sidebar default state for mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacherReport, setTeacherReport] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  // Add state for the active section
  const [activeSection, setActiveSection] = useState('home');
  const [selectedChapter, setSelectedChapter] = useState("1");
  const [selectedLesson, setSelectedLesson] = useState("1-1");
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
const chaptersData = {
    1: {
      title: "حالات المادة",
      lessons: {
        "1-1": "خصائص الموائع",
        "1-2": "القوى داخل السوائل",
        "1-3": "الموائع الساكنة والمتحركة",
        "1-4": "المواد الصلبة"
      }
    },
    2: {
      title: "الاهتزازات والموجات",
      lessons: {
        "2-1": "الحركه الدورية",
        "2-2": "خصائص الموجات",
        "2-3": "سلوك الموجات"
      }
    },
    3: {
      title: "الصوت وأساسيات الضوء",
      lessons: {
        "3-1": "خصائص الصوت والكشف عنه",
        "3-2": "الرنين في الأعمدة الهوائية والأوتار",
      }
    },
    4: {
      title: "أساسيات الضوء ",
      lessons: {
        "4-1": "الاستضاءة",
        "4-2": "الطبيعية الموجية للضوء"
      }
    }
  };
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && isSidebarOpen) setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    // Set isLoading to false immediately to show the UI
    setIsLoading(false);
    
    // Use AbortController for fetchable requests
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchData = async () => {
      try {
        // Fetch and process students data
        const studentsResponse = await fetch('https://scaiapipost.replit.app/users-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          signal
        });
        
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch student data');
        }
        
        const studentsData = await studentsResponse.json();
        setStudentsData(studentsData.users || []);
        console.log('Students data fetched:', studentsData);
        
        // Fetch teacher report in the background
        const teacherResponse = await fetch('https://scaiapipost.replit.app/teacher-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          signal
        });
        
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          setTeacherReport(teacherData.message);
              

        }
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
          setError('Failed to load data. Please try again later.');
        }
      }
    };
    
    fetchData();

    return () => controller.abort();
  }, []);
  

  
  // Memoized filtered students to prevent unnecessary re-rendering
  const filteredStudents = useMemo(() => 
    studentsData.filter(student =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [studentsData, searchTerm]
  );
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Memoized stats calculation
  const overallStats = useMemo(() => {
    if (studentsData.length === 0) return [];
    
    const totalStudents = studentsData.length;
    const avgQuestionsCreated = studentsData.reduce((acc, curr) => acc + curr.questions_created, 0) / totalStudents;
    const avgQuestionsAnswered = studentsData.reduce((acc, curr) => acc + curr.questions_answered, 0) / totalStudents;
    const avgCorrect = studentsData.reduce((acc, curr) => acc + curr.correct_answers, 0) / totalStudents;
    const avgRating = studentsData.reduce((acc, curr) => acc + curr.average_rating, 0) / totalStudents;

    return [
      { name: 'عدد الأسئلة المنشأة', value: Math.round(avgQuestionsCreated * 10) / 10 },
      { name: 'عدد الأسئلة المجاب عليها', value: Math.round(avgQuestionsAnswered * 10) / 10 },
      { name: 'عدد الإجابات الصحيحة', value: Math.round(avgCorrect * 10) / 10 },
      { name: 'متوسط التقييم', value: Math.round(avgRating * 10) / 10 }
    ];
  }, [studentsData]);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  const StudentReportCard = ({ student }) => {
    // Calculate success rate
    const successRate = student.questions_answered > 0 
      ? Math.round((student.correct_answers / student.questions_answered) * 100) 
      : 0;

    return (
      <Dialog 
        open={dialogOpen && selectedStudent?.username === student.username} 
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setSelectedStudent(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <button 
            onClick={() => {
              setSelectedStudent(student);
              setDialogOpen(true);
              console.log('Student data:', student); // Debug log
            }}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 w-full text-left border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1"
          >
            {/* Header with avatar and name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <User className="h-7 w-7 text-orange-600" />
                </div>
                <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  successRate >= 70 ? 'bg-green-500' : 
                  successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-right truncate text-lg">
                  {student.display_name || student.username || 'غير محدد'}
                </h3>
                <p className="text-sm text-gray-500 text-right mt-1">طالب</p>
              </div>
            </div>
            
            {/* Success rate - prominent display */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold text-white mb-2 shadow-lg ${
                successRate >= 70 ? 'bg-green-500' : 
                successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {successRate}%
              </div>
              <p className="text-sm text-gray-600 font-medium">معدل النجاح</p>
            </div>
            
            {/* Stats grid - responsive 2x2 layout */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-700 mb-1">
                  {student.questions_answered || 0}
                </div>
                <div className="text-xs text-blue-600 font-medium leading-tight">أسئلة مجابة</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-700 mb-1">
                  {student.correct_answers || 0}
                </div>
                <div className="text-xs text-green-600 font-medium leading-tight">إجابات صحيحة</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-700 mb-1">
                  {student.questions_created || 0}
                </div>
                <div className="text-xs text-orange-600 font-medium leading-tight">أسئلة منشأة</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-700 mb-1">
                  {student.average_rating ? student.average_rating.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-purple-600 font-medium leading-tight">متوسط التقييم</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 font-medium">{successRate}%</span>
                <span className="text-sm text-gray-500 font-medium">التقدم الإجمالي</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 rounded-full ${
                    successRate >= 70 ? 'bg-green-500' : 
                    successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
            
            {/* Action indicator */}
            <div className="flex items-center justify-center gap-2 text-orange-600 font-medium text-sm">
              <span>عرض التفاصيل</span>
              <TrendingUp className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </DialogTrigger>
        
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-gray-500 text-sm">تقرير مفصل</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{student.display_name || student.username}</span>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {/* Tab navigation - improved mobile design */}
            <div className="flex justify-end gap-2 mb-6 bg-gray-50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 rounded-md transition-all text-sm font-medium flex-1 sm:flex-none ${
                  activeTab === 'overview' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                نظرة عامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-4 py-3 rounded-md transition-all text-sm font-medium flex-1 sm:flex-none ${
                  activeTab === 'report' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                التقرير التفصيلي
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Main stats grid - improved responsive layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <BarChart2 className="h-6 w-6 text-orange-600" />
                      <h4 className="text-orange-700 font-semibold">معدل النجاح</h4>
                    </div>
                    <p className="text-3xl font-bold text-orange-800 mb-2">
                      {Math.round((student.questions_answered > 0 ? (student.correct_answers / student.questions_answered * 100) : 0))}%
                    </p>
                    <p className="text-xs text-orange-600">من إجمالي الأسئلة</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <Star className="h-6 w-6 text-purple-600" />
                      <h4 className="text-purple-700 font-semibold">متوسط التقييم</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-800 mb-2">
                      {student.average_rating ? student.average_rating.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-xs text-purple-600">من 5 نجوم</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="h-6 w-6 text-green-600" />
                      <h4 className="text-green-700 font-semibold">الأسئلة المنشأة</h4>
                    </div>
                    <p className="text-3xl font-bold text-green-800 mb-2">
                      {student.questions_created || 0}
                    </p>
                    <p className="text-xs text-green-600">سؤال تم إنشاؤه</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <User className="h-6 w-6 text-blue-600" />
                      <h4 className="text-blue-700 font-semibold">الأسئلة المجابة</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-800 mb-2">
                      {student.questions_answered || 0}
                    </p>
                    <p className="text-xs text-blue-600">سؤال تم الإجابة عليه</p>
                  </div>
                </div>
                
                {/* Additional stats row - improved design */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <h4 className="text-gray-700 font-semibold">الإجابات الصحيحة</h4>
                    </div>
                    <p dir='rtl' className="text-2xl font-bold text-gray-800 mb-2">
                      {student.correct_answers || 0} من {student.questions_answered || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${student.questions_answered > 0 ? (student.correct_answers / student.questions_answered * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h4 className="text-indigo-700 font-semibold">مجموع النقاط</h4>
                    </div>
                    <p dir='rtl' className="text-2xl font-bold text-indigo-800 mb-2">
                      {(student.correct_answers || 0)} نقطة
                    </p>
                    <p className="text-sm text-indigo-600">بناءً على الإجابات الصحيحة</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">التقرير التفصيلي للطالب</h4>
                </div>
                {student.student_report ? (
                  <div className="max-h-80 overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-right">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {student.student_report}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">لا يوجد تقرير متاح</p>
                    <p className="text-gray-400 text-sm mt-1">سيتم إنشاء التقرير تلقائياً عند توفر بيانات كافية</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Updated menu items with unique ids and onClick handlers
  const menuItems = [
    { id: 'home', icon: Home, label: 'الرئيسية', active: activeSection === 'home' },
    { id: 'students', icon: Users, label: 'الطلاب', count: studentsData.length, active: activeSection === 'students' },
    { id: 'lessons', icon: BookOpen, label: 'الدروس', active: activeSection === 'lessons' },
    { id: 'analytics', icon: BarChart2, label: 'التحليلات', active: activeSection === 'analytics' },
    { id: 'settings', icon: Settings, label: 'الإعدادات', active: activeSection === 'settings' },
  ];


  const NavItem = ({ id, icon: Icon, label, active, count }) => (
    <button 
      onClick={() => {
        setActiveSection(id);
        if (isMobile) setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center justify-end gap-4 px-5 py-4 rounded-xl transition-all group ${
        active 
          ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-200' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {count !== undefined && (
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          active ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          {count}
        </span>
      )}
      <span className="flex-1 text-right font-medium">{label}</span>
      <div className={`p-2 rounded-lg transition-all ${
        active ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-gray-200'
      }`}>
        <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-700'}`} />
      </div>
    </button>
  );
  const StudentPerformanceSelector = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div dir='rtl' className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 text-right">أداء الطلاب في الدروس</h2>
      </div>
      
      <div dir="rtl" className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Chapter dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-48 text-gray-700 hover:border-orange-400 transition-all shadow-sm hover:shadow"
            onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
          >
            <ChevronDown 
              className={`h-4 w-4 text-orange-500 transition-transform duration-200 ${isChapterDropdownOpen ? 'rotate-180' : ''}`} 
            />
            <span className="font-medium truncate">{chaptersData[selectedChapter]?.title || 'اختر الفصل'}</span>
          </button>
          
          {isChapterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {Object.keys(chaptersData).map((chapter) => (
                  <button
                    key={chapter}
                    className={`block w-full text-right px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors ${selectedChapter === chapter ? 'bg-orange-100 text-orange-700 font-medium' : ''}`}
                    onClick={() => {
                      setSelectedChapter(chapter);
                      // Reset to first lesson of the chapter
                      const firstLessonKey = Object.keys(chaptersData[chapter].lessons)[0];
                      setSelectedLesson(firstLessonKey);
                      setIsChapterDropdownOpen(false);
                    }}
                  >
                    {chaptersData[chapter].title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Lesson dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-72 text-gray-700 hover:border-orange-400 transition-all shadow-sm hover:shadow"
            onClick={() => setIsLessonDropdownOpen(!isLessonDropdownOpen)}
          >
            <ChevronDown 
              className={`h-4 w-4 text-orange-500 transition-transform duration-200 ${isLessonDropdownOpen ? 'rotate-180' : ''}`} 
            />
            <span className="font-medium truncate">{chaptersData[selectedChapter]?.lessons[selectedLesson] || 'اختر الدرس'}</span>
          </button>
          
          {isLessonDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {Object.entries(chaptersData[selectedChapter]?.lessons || {}).map(([id, title]) => (
                  <button
                    key={id}
                    className={`block w-full text-right px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors ${selectedLesson === id ? 'bg-orange-100 text-orange-700 font-medium' : ''}`}
                    onClick={() => {
                      setSelectedLesson(id);
                      setIsLessonDropdownOpen(false);
                    }}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-60">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <StudentLessonPerformance 
          selectedChapter={selectedChapter}
          selectedLesson={selectedLesson}
        />
      </Suspense>
    </div>
    );
  };
  // Render specific section content based on activeSection
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {studentsData.length > 0 ? (
                overallStats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm text-gray-600 mb-2 text-right">{stat.name}</h3>
                    <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                  </div>
                ))
              ) : (
                // Show skeleton loaders for stats
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 ml-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))
              )}
            </div>
  
            {/* Charts */}
            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center justify-center h-80">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {studentsData.length > 0 ? (
                <ChartComponents overallStats={overallStats} colors={COLORS} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center justify-center h-80">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </Suspense>
  
            {/* Students Grid - Enhanced responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {studentsData.length > 0 ? (
                filteredStudents.map((student) => (
                  <StudentReportCard 
                    key={student.username} 
                    student={student}
                  />
                ))
              ) : (
                // Show skeleton loaders for student cards - improved design
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg p-3">
                          <div className="h-5 w-8 bg-gray-200 rounded mb-1 mx-auto"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded-full mb-6"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))
              )}
            </div>
          </>
        );
        case 'lessons':
          return (
            <div className="space-y-6">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center justify-center h-60">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <LessonSummary />
              </Suspense>
              
              <LessonsTable />
            </div>
          );
      
        
            case 'students':
              return (
                <div className="space-y-6">
                  {/* Students list */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-right flex items-center gap-2">
                      <Users className="h-6 w-6 text-orange-500" />
                      قائمة الطلاب
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {filteredStudents.map((student) => (
                        <StudentReportCard key={student.username} student={student} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Student performance section with selectors */}
                  <StudentPerformanceSelector />
                </div>
              );
          
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-right">تحليلات الأداء</h2>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {overallStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-sm text-gray-600 mb-2 text-right">{stat.name}</h3>
                  <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Lazy-loaded Charts */}
            <Suspense fallback={
              <div className="bg-white border rounded-lg shadow-sm p-6 mb-8 flex items-center justify-center h-80">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <ChartComponents overallStats={overallStats} colors={COLORS} />
            </Suspense>
          </div>
        );
      
        case 'lessons':
          return (
            <div className="space-y-6">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center justify-center h-60">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <LessonSummary />
              </Suspense>
              
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-60">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <LessonsTable />
              </Suspense>
            </div>
          );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-right">إعدادات النظام</h2>
            <div className="space-y-6">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-6 relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      id="notifications"
                    />
                    <label 
                      htmlFor="notifications"
                      className="bg-gray-300 w-12 h-6 block rounded-full cursor-pointer transition-colors before:absolute before:left-1 before:top-1 before:bg-white before:w-4 before:h-4 before:rounded-full before:transition-transform"
                    ></label>
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-medium text-gray-800">الإشعارات</h3>
                    <p className="text-sm text-gray-500">تفعيل الإشعارات للطلاب الجدد والتقارير</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <select className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>العربية</option>
                    <option>English</option>
                  </select>
                  <div className="flex-1 text-right">
                    <h3 className="font-medium text-gray-800">اللغة</h3>
                    <p className="text-sm text-gray-500">تغيير لغة واجهة التطبيق</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-6 relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      id="darkmode"
                    />
                    <label 
                      htmlFor="darkmode"
                      className="bg-gray-300 w-12 h-6 block rounded-full cursor-pointer transition-colors before:absolute before:left-1 before:top-1 before:bg-white before:w-4 before:h-4 before:rounded-full before:transition-transform"
                    ></label>
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-medium text-gray-800">الوضع الليلي</h3>
                    <p className="text-sm text-gray-500">تفعيل الوضع الليلي للواجهة</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md mx-4">
          <div className="mb-4 text-red-500">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Teacher Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-orange-500" />
              <span>تقرير المعلم الشامل</span>
            </DialogTitle>
          </DialogHeader>
          
          {teacherReport ? (
            <div className="mt-4" >
              <div className="p-2 bg-orange-50 border-r-4 border-orange-500 mb-4 rounded-md" dir='rtl'>
                <p className="text-gray-700 text-sm px-4 py-2">
                  هذا التقرير يعكس تحليلاً شاملاً لأداء الطلاب وتفاعلهم مع المنصة. يتم تحديثه بشكل دوري.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">{new Date().toLocaleDateString('AR-SA')}</span>
                    <h3 className="font-semibold text-orange-600">ملخص الأداء</h3>
                  </div>
                  <div className="text-gray-800 text-right leading-relaxed whitespace-pre-wrap">
                    {teacherReport}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setReportDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  >
                    إغلاق
                  </button>
                
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg mt-4 border border-gray-200">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 mb-2">جاري تحميل التقرير...</p>
              <p className="text-gray-400 text-sm">قد يستغرق التحميل بضع ثوانٍ</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Overlay for mobile - improved touch experience */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
          style={{ width: '100vw', height: '100vh' }}
        />
      )}

      {/* Sidebar - Enhanced design and responsiveness */}
      <aside 
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxWidth: '100vw' }}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50 w-full">
          {/* Close button for mobile - improved positioning */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-6 left-6 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Profile Section - Enhanced design */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 text-right">
                <h2 className="text-2xl font-bold text-gray-900">
                  مرحباً، {user?.username}
                </h2>
                <p className="text-orange-600 font-medium">مدرس فيزياء</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Navigation - Improved spacing and design */}
          <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
            {menuItems.map((item) => (
              <NavItem key={item.id} {...item} />
            ))}

            {/* Teacher Report Nav Item - Enhanced design */}
            <button 
              onClick={() => setReportDialogOpen(true)}
              className="w-full flex items-center justify-end gap-4 px-5 py-4 rounded-xl transition-all text-gray-600 hover:bg-orange-50 hover:text-orange-600 group"
            >
              <span className="flex-1 text-right font-medium">تقرير المعلم</span>
              <div className="p-2 bg-gray-100 group-hover:bg-orange-100 rounded-lg transition-all">
                <FileText className="h-5 w-5 text-gray-500 group-hover:text-orange-500" />
              </div>
            </button>
          </nav>

          {/* Help & Logout - Enhanced design */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50">
            <button className="w-full flex items-center justify-end gap-4 px-5 py-4 text-gray-600 hover:bg-white hover:text-gray-900 rounded-xl transition-all group">
              <span className="font-medium">المساعدة</span>
              <div className="p-2 bg-gray-200 group-hover:bg-blue-100 rounded-lg transition-all">
                <HelpCircle className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-end gap-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-all group"
            >
              <span className="font-medium">تسجيل الخروج</span>
              <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-all">
                <LogOut className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </aside>


      {/* Main Content - Enhanced responsive layout */}
      <main className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-80' : 'lg:mr-0'}`}>
        {/* Header - Improved design */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Left side: Toggle button and search */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-all"
                >
                  {isSidebarOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>
                
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="بحث عن طالب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-2.5 pl-12 pr-4 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right transition-all"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-4 top-3" />
                </div>
              </div>
              
              {/* Right side: Mobile menu */}
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Enhanced spacing and layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {activeSection === 'home' && (
                <button
                  onClick={() => setReportDialogOpen(true)}
                  className="flex items-center gap-2 py-3 px-6 bg-white border border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-all text-sm font-medium shadow-sm hover:shadow"
                >
                  <span>عرض تقرير المعلم</span>
                  <FileText className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h1>
              {menuItems.find(item => item.id === activeSection)?.icon && (
                React.createElement(
                  menuItems.find(item => item.id === activeSection).icon,
                  { className: "h-8 w-8 text-orange-500" }
                )
              )}
            </div>
          </div>

          {/* Mobile search - Enhanced design */}
          <div className="mb-8 block md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-right shadow-sm"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Render section content based on active section */}
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;