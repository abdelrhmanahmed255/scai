import React from 'react';
import { Target, BookOpen, ChevronLeft, CheckCircle } from 'lucide-react';
import { getGoalsForLesson, getGoalDisplayName } from './ChatData';

const GoalSelection = ({ 
  chapter, 
  lesson, 
  onGoalSelect, 
  onBack,
  selectedGoal = null 
}) => {
  const goals = getGoalsForLesson(chapter, lesson);
  const goalKeys = Object.keys(goals);

  if (goalKeys.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">لا توجد أهداف متاحة لهذا الدرس</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">العودة</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-800">اختيار الهدف التعليمي</h3>
            <p className="text-sm text-gray-500">اختر الهدف الذي تريد تعلمه</p>
          </div>
          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goalKeys.map((goalKey) => {
          const goal = goals[goalKey];
          const goalNumber = goalKey.replace('goal', '');
          const isSelected = selectedGoal === goalKey;
          
          return (
            <button
              key={goalKey}
              onClick={() => onGoalSelect(goalKey)}
              className={`w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all
                border border-transparent hover:border-orange-200
                flex items-center justify-between group p-6
                ${isSelected ? 'border-orange-300 bg-orange-50' : 'hover:bg-orange-50'}`}
            >
              <div className="flex items-center gap-3">
                {isSelected ? (
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                ) : (
                  <ChevronLeft 
                    className="text-gray-400 group-hover:text-orange-500 transition-colors"
                    size={20} 
                  />
                )}
              </div>
              
              <div className="flex-1 text-right flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h4 className={`font-semibold text-lg ${
                      isSelected ? 'text-orange-700' : 'text-gray-800'
                    }`}>
                      الهدف {goalNumber}: {goal.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isSelected ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      يحتوي على {goal.pointCount} نقاط تعليمية
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                    isSelected ? 'bg-orange-500' : 'bg-gray-400 group-hover:bg-orange-500'
                  }`}>
                    {goalNumber}
                  </div>
                </div>

                {/* Show learning points preview */}
                <div className="flex flex-wrap gap-2 justify-end mt-2">
                  {goal.points.slice(0, 3).map((point, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        isSelected 
                          ? 'bg-orange-100 text-orange-700 border-orange-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-orange-100 group-hover:text-orange-700'
                      }`}
                    >
                      {point}
                    </span>
                  ))}
                  {goal.points.length > 3 && (
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      isSelected 
                        ? 'bg-orange-100 text-orange-700 border-orange-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-orange-100 group-hover:text-orange-700'
                    }`}>
                      +{goal.points.length - 3} المزيد
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-right">
            <h4 className="font-medium text-blue-800 mb-1">نصيحة</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              كل هدف يحتوي على عدة نقاط تعليمية. ستتم مراجعة كل نقطة من خلال أسئلة تفاعلية 
              وشروحات مفصلة لضمان فهمك الكامل قبل الانتقال للهدف التالي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;