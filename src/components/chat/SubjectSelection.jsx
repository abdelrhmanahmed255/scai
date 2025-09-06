import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronLeft, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useChat } from '../../contexts/ChatContext';

const subjects = [
  {
    id: 'physics',
    name: 'الفيزياء٣',
    icon: '⚡',
    available: true
  },
  {
    id: 'social-studies',
    name: 'الدراسات النفسيه والإجتماعية',
    icon: '🤝',
    available: false
  },
  {
    id: 'english',
    name: 'اللغة الإنجليزية ٣',
    icon: '🌍',
    available: false
  },
  {
    id: 'math',
    name: 'الرياضيات ٣',
    icon: '📐',
    available: false
  },
  {
    id: 'literature',
    name: 'الدراسات الأدبية',
    icon: '📚',
    available: false
  },
  {
    id: 'earth-science',
    name: 'علوم الأرض والفضاء',
    icon: '🌎',
    available: false
  },
  {
    id: 'physical-education',
    name: 'التربية الصحية والبدنيه',
    icon: '🏃',
    available: false
  }
];

const SubjectSelection = () => {
  const navigate = useNavigate();
  const { setCurrentSelection } = useChat();

  const handleSubjectSelect = (subject) => {
    if (!subject.available) {
      toast('سيتم إضافة هذه المادة قريباً', {
        icon: '🚧',
        style: { direction: 'rtl', background: '#333', color: '#fff' }
      });
      return;
    }
  
    console.log("Selected Subject:", subject.id);
      setCurrentSelection(subject.id, null, null);
    
    // // Verify storage before navigating
    // const storedSubject = localStorage.getItem('selectedSubject');
    // console.log("Stored in LocalStorage:", storedSubject);
    navigate('/chat', { replace: true });
    
    
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-4">
      <div dir="rtl" className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b font-arabic">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <GraduationCap className="text-orange-500" size={20} />
              </div>
              <div className="text-right">
                <h2 className="font-semibold text-gray-800">اختيار المادة</h2>
                <p className="text-sm text-gray-500">اختر المادة التي تريد دراستها</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-sm text-blue-600">2025</span>
              <Calendar className="text-blue-600" size={16} />
            </div>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div dir="rtl" className="space-y-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject)}
                className={`w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all
                    border border-transparent hover:border-orange-200
                    flex items-center justify-between group p-4
                    ${subject.available ? 'hover:bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <ChevronLeft 
                  className={`${subject.available ? 'text-gray-400 group-hover:text-orange-500' : 'text-gray-300'} transition-colors`}
                  size={20} 
                />
                <div className="flex-1 text-right flex items-center justify-end gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${subject.available ? 'text-gray-800' : 'text-gray-500'}`}>
                      {subject.name}
                    </span>
                    <span className="text-2xl">{subject.icon}</span>
                  </div>
                  {!subject.available && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      قريباً
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
