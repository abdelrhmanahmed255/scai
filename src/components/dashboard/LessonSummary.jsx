import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, BarChart2, Star, X } from 'lucide-react';
import { chaptersData } from './chaptersData';
import StudentLessonPerformance from './StudentLessonPerformance';
const LessonSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState("1");
  const [selectedLesson, setSelectedLesson] = useState("1-1");
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const [showStudentPerformance, setShowStudentPerformance] = useState(false);
  // For API requests, we need to extract just the numeric part after the dash
  const getNumericLesson = (lessonId) => {
    return lessonId.split('-')[1];
  };

  // Safe parsing function for numeric values
  const safeParseNumber = (value, type = 'int') => {
    if (value === null || value === undefined) return 0;
    const num = type === 'int' 
      ? parseInt(value, 10) 
      : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchLessonSummary = async () => {
      setIsLoading(true);
      try {
        const lessonNumber = getNumericLesson(selectedLesson);
        
        // تحقق من اتصال الشبكة أولاً
        if (!navigator.onLine) {
          throw new Error('لا يوجد اتصال بالإنترنت');
        }

        const response = await fetch(
          `https://scaiapipost.replit.app/lesson-summary/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chapter: selectedChapter,
              lesson: lessonNumber
            }),
          }
        );

        // تحقق من حالة الاستجابة
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || 'فشل في جلب البيانات';
          } catch (e) {
            errorMessage = `فشل في جلب البيانات: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('البيانات المستلمة:', data);

        // تحويل البيانات الرقمية بشكل صحيح
        const processedData = {
          subject: data.subject || "physics",
          chapter: data.chapter || selectedChapter,
          lesson: data.lesson || lessonNumber,
          total_questions: safeParseNumber(data.total_questions, 'int'),
          total_correct_answers: safeParseNumber(data.total_correct_answers, 'int'),
          average_rating: safeParseNumber(data.average_rating, 'float')
        };
    
        setSummaryData(processedData);
        setError(null);
      } catch (error) {
        console.error('تفاصيل الخطأ:', error);
        setError(error.message || 'حدث خطأ أثناء جلب البيانات');
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonSummary();
  }, [selectedChapter, selectedLesson]);
  
  // Define the DropdownSelectors component here
  const DropdownSelectors = () => {
    return (
 <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-4 mb-6">
  <div className="w-full md:w-auto mt-4 md:mt-0">
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full" dir="rtl">
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
  </div>
  
  <div className="flex items-center gap-2">
  </div>
</div>
    );
  };

  // Get current chapter and lesson titles
  const currentChapterTitle = chaptersData[selectedChapter]?.title || '';
  const currentLessonTitle = chaptersData[selectedChapter]?.lessons[selectedLesson] || '';

  // Calculate success percentage safely - make sure both values are treated as numbers
  const calculateSuccessPercentage = () => {
    if (!summaryData) return "0.0";
    
    const totalQuestions = safeParseNumber(summaryData.total_questions, 'int');
    const correctAnswers = safeParseNumber(summaryData.total_correct_answers, 'int');
    
    if (totalQuestions === 0) return "0.0";
    return ((correctAnswers / totalQuestions) * 100).toFixed(1);
  };
  
  const successPercentage = calculateSuccessPercentage();
    
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      {isLoading && (
        <div className="text-center py-6">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل بيانات الدرس...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-600 text-center">
          <X className="h-5 w-5 inline-block mr-2" />
          {error}
        </div>
      )}

    
{!isLoading && !error && summaryData && (
        <>
        
          <div className="flex items-start justify-center mb-2">
         
            <DropdownSelectors />
           
          </div>

          <div className="bg-orange-50 p-4 rounded-lg mb-6 border-r-4 border-orange-500" dir="rtl">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-700">
                {summaryData.subject || currentChapterTitle}
              </h3>
            </div>
            <p className="text-gray-900">{currentLessonTitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* بطاقة عدد الأسئلة */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-purple-600 font-semibold text-right">عدد الأسئلة</h4>
              </div>
              <p className="text-3xl font-bold text-gray-800 text-left">
                {summaryData.total_questions ?? 0}
              </p>
            </div>

            {/* بطاقة الإجابات الصحيحة */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-green-600 font-semibold text-right">الإجابات الصحيحة</h4>
              </div>
              <p className="text-3xl font-bold text-gray-800 text-left">
                {summaryData.total_correct_answers ?? 0}
              </p>
            </div>

            {/* بطاقة متوسط التقييم */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="text-orange-600 font-semibold text-right">متوسط التقييم</h4>
              </div>
              <p className="text-3xl font-bold text-gray-800 text-left">
                {typeof summaryData.average_rating === 'number' ? summaryData.average_rating.toFixed(1) : "0.0"}
              </p>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="relative pt-2">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-500">
                {summaryData.total_correct_answers} / {summaryData.total_questions}
              </span>
              <span className="text-xs text-gray-500">نسبة النجاح</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-500 h-2.5 rounded-full transition-all"
                style={{ width: `${successPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-right">
              <span className="text-sm font-semibold text-orange-600">
                {successPercentage}%
              </span>
            </div>
          </div>
          {showStudentPerformance && (
            <StudentLessonPerformance 
              selectedChapter={selectedChapter} 
              selectedLesson={selectedLesson} 
            />
          )}
        </>
        
      )}
    </div>
    
  );
};

export default LessonSummary;