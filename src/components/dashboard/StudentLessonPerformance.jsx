import React, { useState, useEffect, useMemo } from 'react';
import { User, BarChart2, CheckCircle2, Award } from 'lucide-react';

const StudentLessonPerformance = ({ selectedChapter, selectedLesson }) => {
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe parsing function for numeric values
  const safeParseNumber = (value, type = 'int') => {
    if (value === null || value === undefined) return 0;
    const num = type === 'int' 
      ? parseInt(value, 10) 
      : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Function to determine student level based on success rate - defined outside of render
  const getStudentLevel = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return "متقدم";
    if (numRate >= 50) return "متوسط";
    return "مبتدئ";
  };

  // Cache the level colors to avoid recalculating during render
  const levelColors = {
    "متقدم": "bg-green-100 text-green-700",
    "متوسط": "bg-blue-100 text-blue-700",
    "مبتدئ": "bg-purple-100 text-purple-700"
  };

  // Cache the success rate colors
  const successRateColors = useMemo(() => ({
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-red-100 text-red-700'
  }), []);

  // Get color based on success rate - optimized with caching
  const getSuccessRateColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return successRateColors.high;
    if (numRate >= 50) return successRateColors.medium;
    return successRateColors.low;
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchStudentPerformance = async () => {
      setIsLoading(true);
      try {
        // Extract numeric lesson part - only do this once
        const lessonNumber = selectedLesson.split('-')[1];
        
        // Check network connection
        if (!navigator.onLine) {
          throw new Error('لا يوجد اتصال بالإنترنت');
        }

        const response = await fetch(
          `https://scaiapipost.replit.app/lesson-summary-student/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chapter: selectedChapter,
              lesson: lessonNumber
            }),
            signal: signal // Add abort signal to fetch
          }
        );

        // Check response status
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
        
        // Process all students data in a single pass
        const processedStudents = (data.students || []).map(student => {
          // Calculate success rate once
          const totalQuestions = safeParseNumber(student.total_questions, 'int');
          const totalCorrectAnswers = safeParseNumber(student.total_correct_answers, 'int');
          const successRate = totalQuestions > 0 
            ? ((totalCorrectAnswers / totalQuestions) * 100).toFixed(1) 
            : "0.0";
          
          // Calculate level once based on success rate
          const level = getStudentLevel(successRate);
            
          return {
            userName: student.user_name,
            totalQuestions,
            totalAnswers: safeParseNumber(student.total_answers, 'int'),
            totalCorrectAnswers,
            successRate,
            level,
            // Pre-compute the CSS classes for performance
            levelClass: levelColors[level],
            successRateClass: getSuccessRateColor(successRate)
          };
        });

        // Sort students by success rate in descending order - do this once
        processedStudents.sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));

        setStudentsData(processedStudents);
        setError(null);
      } catch (error) {
        // Don't set error if request was aborted
        if (error.name !== 'AbortError') {
          console.error('تفاصيل الخطأ:', error);
          setError(error.message || 'حدث خطأ أثناء جلب البيانات');
          setStudentsData([]);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchStudentPerformance();

    // Cleanup function to abort fetch on unmount or dependency change
    return () => {
      controller.abort();
    };
  }, [selectedChapter, selectedLesson]);

  return (
    <div dir='rtl' className="bg-white rounded-lg shadow-sm p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">أداء الطلاب في الدرس</h3>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-500" />
          <span className="text-sm text-gray-600">{studentsData.length} طالب</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل بيانات الطلاب...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500">اسم الطالب</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500">
                  <div className="flex items-center justify-center">
                    <BarChart2 className="h-4 w-4 ml-1 text-purple-500" />
                    مجموع الأسئلة
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500">
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                    الإجابات الصحيحة
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500">
                  نسبة النجاح
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 ml-1 text-blue-500" />
                    المستوى
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student, index) => (
                <tr 
                  key={student.userName} 
                  className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-orange-50`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-800">{student.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-gray-700">{student.totalQuestions}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-green-600">{student.totalCorrectAnswers}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${student.successRateClass}`}
                    >
                      {student.successRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${student.levelClass}`}
                    >
                      {student.level}
                    </span>
                  </td>
                </tr>
              ))}
              
              {studentsData.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    لا توجد بيانات متاحة للطلاب في هذا الدرس
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentLessonPerformance;