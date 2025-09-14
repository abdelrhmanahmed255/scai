// ChatData.jsx
// This file contains the data for the chat application

export const chaptersData = {
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

  /**
   * Get available goals for a specific chapter and lesson
   * @param {string} chapter - Chapter number (1, 2, 3, 4)
   * @param {string} lesson - Lesson number (1, 2, 3, 4)
   * @returns {Object} Object with goal keys and their descriptions
   */
  export const getGoalsForLesson = (chapter, lesson) => {
    try {
      const goalData = chaptersGoalData[chapter]?.[lesson];
      if (!goalData) return {};

      const goals = {};
      Object.keys(goalData).forEach(goalKey => {
        if (goalKey.startsWith('goal') && goalData[goalKey]?.length > 0) {
          // Get the first point as the main goal description
          goals[goalKey] = {
            title: goalData[goalKey][0] || `الهدف ${goalKey.replace('goal', '')}`,
            points: goalData[goalKey],
            pointCount: goalData[goalKey].length
          };
        }
      });
      
      return goals;
    } catch (error) {
      console.error('Error getting goals for lesson:', error);
      return {};
    }
  };

  /**
   * Get a formatted goal display name
   * @param {string} goalKey - Goal key (goal1, goal2, etc.)
   * @param {string} chapter - Chapter number
   * @param {string} lesson - Lesson number
   * @returns {string} Formatted goal name
   */
  export const getGoalDisplayName = (goalKey, chapter, lesson) => {
    const goalData = getGoalsForLesson(chapter, lesson);
    const goal = goalData[goalKey];
    
    if (goal) {
      const goalNumber = goalKey.replace('goal', '');
      return `الهدف ${goalNumber}: ${goal.title}`;
    }
    
    return `الهدف ${goalKey.replace('goal', '')}`;
  };

  /**
   * Convert lesson key (like "1-1") to just lesson number for backend
   * @param {string} lessonKey - Lesson key format "chapter-lesson"
   * @returns {string} Just the lesson number
   */
  export const getLessonNumber = (lessonKey) => {
    return lessonKey.split('-')[1] || lessonKey;
  };
  export const chaptersGoalData = {
    "1": {
      "title": "حالات المادة",
      "1": {
        "title": "خصائص الموائع",
        "goal1": [
          "قانون الضغط-باسكال",
          "المواد الصلبة والسوائل والضغط",
          "جزيئات الغاز والضغط",
          "الضغط الجوي"
        ],
        "goal2": [
          "القانون العام للغازات",
          "قانون الغاز المثالي"
        ],
        "goal3": [
          "التمدد الحراري",
          "لماذا يطفو الجليد"
        ],
        "goal4": [
          "البلازما للموائع"
        ]
      },
      "2": {
        "title": "القوى داخل السوائل",
        "goal1": [
          "اللزوجة"
        ],
        "goal2": [
          "قوى التلاصق"
        ],
        "goal3": [
          "التبريد بالتبخر"
        ]
      },
      "3": {
        "title": "الموائع الساكنة والمتحركة",
        "goal1": [
          "مبدأ باسكال"
        ],
        "goal2": [
          "ضغط الماء على الجسم",
          "قوة الطفو",
          "مبدأ ارخميدس"
        ],
        "goal3": [
          "مبدأ برنولي",
          "خطوط الانسياب"
        ]
      },
      "4": {
        "title": "المواد الصلبة",
        "goal1": [
          "الشبكة البلورية",
          "المواد الصلبة غير البلورية",
          "الضغط والتجمد",
          "مرونة المواد الصلبة"
        ],
        "goal2": [
          "معامل التمدد الطولي للمادة",
          "معامل التمدد الحجمي"
        ]
      }
    },
    "2": {
      "title": "الاهتزازات والموجات",
      "1": {
        "title": "الحركه الدورية",
        "goal1": [
          "الحركه الاهتزازية الدورية",
          "حركة توافقية بسيطة",
          "الزمن الدوري",
          "سعة الاهتزاز"
        ],
        "goal2": [
          "قانون هوك",
          "طاقة الوضع",
          "البندول البسيط",
          "الرنين"
        ]
      },
      "2": {
        "title": "خصائص الموجات",
        "goal1": [
          "الموجات المستعرضه",
          "الموجات الطولية",
          "الموجات السطحية"
        ],
        "goal2": [
          "السرعه",
          "السعه",
          "الطول الموجي",
          "الطور",
          "الزمن الدوري والتردد",
          "تردد الموجه",
          "تمثيل الموجات"
        ]
      },
      "3": {
        "title": "سلوك الموجات",
        "goal1": [
          "الموجة الساقطة",
          "الموجة المنعكسة"
        ],
        "goal2": [
          "مبدأ التراكب",
          "تداخل الموجات (العقده،البطن)",
          "الموجات الموقوفة المستقرة"
        ],
        "goal3": [
          "تمثيل الموجات في بعدين",
          "انعكاس الموجات في بعدين",
          "انكسار الموجات في بعدين"
        ]
      }
    },
    "3": {
      "title": "الصوت وأساسيات الضوء",
      "1": {
        "title": "خصائص الصوت والكشف عنه",
        "goal1": [
          "وصف الصوت"
        ],
        "goal2": [
          "الأذن البشرية"
        ],
        "goal3": [
          "حدة الصوت",
          "علو الصوت",
          "تأثير دوبلر"
        ]
      },
      "2": {
        "title": "الرنين في الأعمدة الهوائية والأوتار",
        "goal1": [
          "مصادر الصوت"
        ],
        "goal2": [
          "انبوب الرنين المغلق",
          "موجة الضغط الطولية الموقوفة المستقرة",
          "انبوب الرنين المفتوح",
          "طول عمود هواء الرنين",
          "ترددات الرنين في أنبوب مغلق",
          "ترددات الرنين في أنبوب مفتوح"
        ],
        "goal3": [
          "الرنين في الأوتار"
        ],
        "goal4": [
          "جودة الصوت"
        ]
      }
    },
    "4": {
      "title": "أساسيات الضوء ",
       "1": {
        "title": "الاستضاءة",
        "goal1": [
          "مصادر الضوء",
          "كمية الضوء",
          "علاقة التربيع العكسي",
          "شدة الإضاءة"
        ],
        "goal2": [
          "إضاءة السطوح"
        ],
        "goal3": [
          "قياسات سرعة الضوء"
        ]
      },
      "2": {
        "title": "الطبيعية الموجية للضوء",
        "goal1": [
          "الحيود والنموذج الموجي للضوء"
        ],
        "goal2": [
          "اللون بواسطة مزج أشعة الضوء",
          "اللون بواسطة اختزال أشعة الضوء",
          "استخلاص النتائج من اللون"
        ],
        "goal3": [
          "الاستقطاب بالترشيح (الفلترة)",
          "الاستقطاب بالانعكاس",
          "تحليل الاستقطاب وقانون مالوس"
        ],
        "goal4": [
          "الحركة النسبية والضوء",
          "تأثير دوبلر"
        ]
      }
    }
  }
