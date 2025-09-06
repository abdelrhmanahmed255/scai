import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Settings, LogOut, Menu, X, Bell,
  User, Search, BarChart2, Home, BookOpen,
  ChevronRight, ChevronLeft,ChevronDown , HelpCircle, FileText,
  Star // Added Star import here
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
      title: "الحث الكهرومغناطيسي",
      lessons: {
        "1-1": "التيار الكهربائي الناتج عن تغير المجالات المغناطيسية",
        "1-2": "تغير المجالات المغناطيسية يولد قوة دافعة كهربائية حثية"
      }
    },
    2: {
      title: "الكهرومغناطيسية",
      lessons: {
        "2-1": "تفاعلات المجالات الكهربائية والمغناطيسية والمادة",
        "2-2": "المجالات الكهربائية والمغناطيسية في الفضاء"
      }
    },
    3: {
      title: "نظرية الكم",
      lessons: {
        "3-1": "النموذج الجسيمي للموجات",
        "3-2": "موجات المادة"
      }
    },
    4: {
      title: "الذرة",
      lessons: {
        "4-1": "نموذج بور الذري",
        "4-2": "النموذج الكمي للذرة"
      }
    },
    5: {
      title: "إلكترونيات الحالة الصلبة",
      lessons: {
        "5-1": "التوصيل الكهربائي في المواد الصلبة",
        "5-2": "الأدوات الإلكترونية"
      }
    },
    6: {
      title: "الفيزياء النووية",
      lessons: {
        "6-1": "النواة",
        "6-2": "الاضمحلال النووي والتفاعلات النووية",
        "6-3": "وحدات بناء المادة"
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
            }}
            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-6 w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">{student.username}</h3>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-semibold">{student.questions_created || 0}</span>
                <span className="text-gray-600">الأسئلة المنشأة</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-600 font-semibold">{student.questions_answered || 0}</span>
                <span className="text-gray-600">الأسئلة المجاب عليها</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">{student.correct_answers || 0}</span>
                <span className="text-gray-600">الإجابات الصحيحة</span>
              </div>
              <div className="relative pt-2">
                <div className="text-xs text-gray-500 mb-1 text-right">نسبة التقدم الإجمالية</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(student.questions_answered ? (student.correct_answers / student.questions_answered * 100) : 0)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center justify-between">
              <span className="text-gray-500 text-sm pe-1">تقرير الطالب</span>
              <span className="text-xl">{student.username}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            <div className="flex justify-end gap-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                نظرة عامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'report' 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                التقرير التفصيلي
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 w-5 text-orange-600" />
                      <h4 className="text-orange-600 font-semibold">معدل الإنجاز</h4>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                      {Math.round((student.questions_answered ? (student.correct_answers / student.questions_answered * 100) : 0))}%
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 w-5 text-purple-600" />
                      <h4 className="text-purple-600 font-semibold">متوسط التقييم</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {student.average_rating || 0}/5
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart2 className="h-5 w-5 text-green-600" />
                      <h4 className="text-green-600 font-semibold">مجموع النقاط</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {(student.correct_answers || 0) * 10}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-800 text-right leading-relaxed whitespace-pre-wrap">
                  {student.student_report}
                </p>
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
      className={`w-full flex items-center justify-end gap-3 px-4 py-3 rounded-lg transition-all
        ${active 
          ? 'bg-orange-50 text-orange-600' 
          : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      {count !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          active ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      )}
      <span className="flex-1 text-right">{label}</span>
      <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : 'text-gray-500'}`} />
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
  
            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentsData.length > 0 ? (
                filteredStudents.map((student) => (
                  <StudentReportCard 
                    key={student.username} 
                    student={student}
                  />
                ))
              ) : (
                // Show skeleton loaders for student cards
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-6 w-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-20 bg-gray-200 rounded"></div>
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-8 bg-gray-200 rounded"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-8 bg-gray-200 rounded"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-8 bg-gray-200 rounded"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="relative pt-2">
                        <div className="h-3 w-full bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
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
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-right">قائمة الطلاب</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 w-screen h-screen"
        onClick={() => setIsSidebarOpen(false)}
        style={{ width: '100vw', height: '100vh' }}
      />
      )}


      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ maxWidth: '100vw' }}
      >
        <div className="h-full flex flex-col bg-white w-full">
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Profile Section */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 text-right">
                <h2 className="text-xl font-semibold text-gray-800">
                  مرحباً، {user?.username}
                </h2>
                <p className="text-sm text-gray-500">مدرس</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavItem key={item.id} {...item} />
            ))}

            {/* Added Teacher Report Nav Item */}
            <button 
              onClick={() => setReportDialogOpen(true)}
              className="w-full flex items-center justify-end gap-3 px-4 py-3 rounded-lg transition-all text-gray-600 hover:bg-gray-50"
            >
              <span className="flex-1 text-right">تقرير المعلم</span>
              <FileText className="h-5 w-5 text-gray-500" />
            </button>
          </nav>

          {/* Help & Logout */}
          <div className="p-4 border-t space-y-2">
            <button className="w-full flex items-center justify-end gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <span>المساعدة</span>
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-end gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <main className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-72' : 'lg:mr-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Left side: Toggle button and search */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {isSidebarOpen ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>
                
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-2 pl-10 pr-4 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              
              {/* Right side: Mobile menu & notification */}
              <div className="flex items-center gap-4">
                {/* <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>
                </button> */}
                
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {activeSection === 'home' && (
                <button
                  onClick={() => setReportDialogOpen(true)}
                  className="flex items-center gap-2 py-2 px-4 bg-white border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                >
                  <span>عرض تقرير المعلم</span>
                  <FileText className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-right">
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h1>
              {menuItems.find(item => item.id === activeSection)?.icon && (
                React.createElement(
                  menuItems.find(item => item.id === activeSection).icon,
                  { className: "h-6 w-6 text-orange-500" }
                )
              )}
            </div>
          </div>

          {/* Mobile search */}
          <div className="mb-6 block md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
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