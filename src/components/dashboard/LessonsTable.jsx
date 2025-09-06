import React, { useState, useEffect } from 'react';
import { BookOpen, Star, ChevronRight } from 'lucide-react';
import { chaptersData } from './chaptersData';

const LessonsTable = () => {
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeParseNumber = (value, type = 'int') => {
    if (value === null || value === undefined) return 0;
    const num = type === 'int' ? parseInt(value, 10) : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchLessonsData = async () => {
      setIsLoading(true);
      try {
        if (!navigator.onLine) {
          throw new Error('لا يوجد اتصال بالإنترنت');
        }

        // Create an array of all chapter-lesson combinations
        const allLessons = [];
        Object.entries(chaptersData).forEach(([chapterNum, chapter]) => {
          Object.entries(chapter.lessons).forEach(([lessonId, lessonName]) => {
            const [_, lessonNumber] = lessonId.split('-');
            allLessons.push({
              chapter: chapterNum,
              lesson: lessonNumber
            });
          });
        });

        // Fetch data for each lesson using the lesson-summary endpoint
        const lessonPromises = allLessons.map(async ({ chapter, lesson }) => {
          try {
            const response = await fetch(
              `https://scaiapipost.replit.app/lesson-summary/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  chapter: chapter,
                  lesson: lesson
                }),
              }
            );

            if (!response.ok) {
              console.warn(`Failed to fetch data for chapter ${chapter}, lesson ${lesson}`);
              return null;
            }

            const data = await response.json();
            return {
              chapter,
              lesson,
              data
            };
          } catch (err) {
            console.warn(`Error fetching data for chapter ${chapter}, lesson ${lesson}:`, err);
            return null;
          }
        });

        // Process all responses
        const results = await Promise.allSettled(lessonPromises);
        const successfulResults = results
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => result.value);

        // Transform the data
        const transformedData = successfulResults.map(({ chapter, lesson, data }) => ({
          id: `${chapter}-${lesson}`,
          chapter: chapter,
          lesson: lesson,
          name: chaptersData[chapter]?.lessons[`${chapter}-${lesson}`] || data.name || `درس ${lesson}`,
          subject: data.subject || "physics",
          questions: safeParseNumber(data.total_questions, 'int'),
          correctAnswers: safeParseNumber(data.total_correct_answers, 'int'),
          rating: safeParseNumber(data.average_rating, 'float')
        }));

        setLessonsData(transformedData);
        setError(null);
      } catch (error) {
        console.error('تفاصيل الخطأ:', error);
        setError(error.message || 'حدث خطأ أثناء جلب بيانات الدروس');
        
        // البيانات الاحتياطية مع التحويل الصحيح
        const fallbackData = Object.entries(chaptersData).flatMap(([chapterNum, chapter]) => 
          Object.entries(chapter.lessons).map(([lessonId, lessonName]) => {
            const [_, lessonNumber] = lessonId.split('-');
            return {
              id: `${chapterNum}-${lessonNumber}`,
              chapter: chapterNum,
              lesson: lessonNumber,
              name: lessonName,
              subject: "physics",
              questions: 0,
              correctAnswers: 0,
              rating: 0
            };
          })
        );
        setLessonsData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonsData();
  }, []);

  // Determine if we're on mobile or desktop based on window width
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Desktop table view
  const DesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
           
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
              متوسط التقييم
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
              عدد الأسئلة
            </th>
            <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">
              اسم الدرس
            </th>
            <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
              المادة / الفصل
            </th>
          </tr>
        </thead>
        <tbody>
          {lessonsData.map((lessonData, index) => (
            <tr 
              key={lessonData.id} 
              className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50 transition-colors`}
            >
            
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {lessonData.rating ? lessonData.rating.toFixed(1) : "-"}
                  </span>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-gray-700">
                  {lessonData.questions}
                </span>
              </td>
              <td dir='rtl' className="py-3 px-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-800">
                  {lessonData.name}
                </span>
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  {`${lessonData.subject} - ${lessonData.chapter}`}
                </span>
              </td>
            </tr>
          ))}
          
          {lessonsData.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                لا توجد دروس متاحة حالياً
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-4">
      {lessonsData.map((lessonData) => (
        <div 
          key={lessonData.id} 
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:border-orange-200 transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
              {`${lessonData.subject} - ${lessonData.chapter}`}
            </span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 ml-1">
                {lessonData.rating ? lessonData.rating.toFixed(1) : "-"}
              </span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-800 mb-3 text-right">
            {lessonData.name}
          </h3>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 text-blue-600 bg-blue-50 rounded-md text-xs font-medium">
                عرض
              </button>
              <button className="px-3 py-1 text-orange-600 bg-orange-50 rounded-md text-xs font-medium">
                تعديل
              </button>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="text-xs ml-1">عدد الأسئلة:</span>
              <span className="text-sm font-medium">{lessonData.questions}</span>
            </div>
          </div>
        </div>
      ))}
      
      {lessonsData.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">لا توجد دروس متاحة حالياً</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
          إضافة درس جديد
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">قائمة الدروس</h2>
          <BookOpen className="h-6 w-6 text-orange-500" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل بيانات الدروس...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-600 text-center">
          <p>{error}</p>
          <p className="mt-2 text-sm">تم عرض البيانات المحلية كحل بديل</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {isMobile ? <MobileView /> : <DesktopTable />}
        </div>
      )}
    </div>
  );
};

export default LessonsTable;