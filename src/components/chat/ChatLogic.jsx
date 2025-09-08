// ChatLogic.jsx
/**
 * Types a message with a visual typing effect
 * @param {Object} params - Message parameters
 * @param {string} params.text - The message text
 * @param {boolean} params.isAI - Whether message is from AI
 * @param {Array} params.buttons - Action buttons
 * @param {Function} addMessage - Function to add a message
 * @param {Function} updateMessage - Function to update a message
 * @returns {Promise} - Resolves when typing is complete
 */
import { goalTracker } from './ChatGoalTracker';
export const typeMessageWithEffect = async ({ text, isAI, buttons = [], isQuestion = false }, addMessage, updateMessage) => {
    const messageId = Date.now();
    let displayText = '';
    
    const baseTypingSpeed = 15;
    const typingSpeed = Math.max(5, Math.min(baseTypingSpeed, 30 - Math.floor(text.length / 20)));
    
    const containsMath = /[+\-*/=^√∑∫≈<>≤≥±]/.test(text);
    const segments = containsMath ? text.split('') : text.split(' ');
    
    addMessage({
      id: messageId,
      text: '',
      isAI,
      isTyping: true,
      isQuestion: isQuestion // Add the isQuestion flag
    });
  
    return new Promise((resolve) => {
      const typeSegment = (index) => {
        if (index < segments.length) {
          if (containsMath) {
            displayText += segments[index];
          } else {
            displayText += (index === 0 ? '' : ' ') + segments[index];
          }
          
          updateMessage({
            id: messageId,
            text: displayText,
            isAI,
            isTyping: true,
            isQuestion: isQuestion // Add the isQuestion flag
          });
          
          let delay = typingSpeed;
          if (!containsMath && segments[index].match(/[.!?]$/)) {
            delay = typingSpeed * 5;
          } else if (!containsMath && segments[index].match(/[,;:]$/)) {
            delay = typingSpeed * 3;
          }
          
          setTimeout(() => typeSegment(index + 1), delay * (containsMath ? 1 : segments[index].length));
        } else {
          updateMessage({
            id: messageId,
            text: displayText,
            isAI,
            isTyping: false,
            buttons,
            isQuestion: isQuestion // Add the isQuestion flag
          });
          resolve();
        }
      };
  
      typeSegment(0);
    });
  };

/**
 * Prompts the user to select a difficulty level
 * @param {Function} addMessage - Function to add a message
 * @param {Function} updateMessage - Function to update a message
 * @param {Function} typingEffectFn - Function for typing effect
 * @param {Function} onLevelSelect - Callback when level is selected
 */
export const askAboutLevel = (
  addMessage,
  updateMessage,
  typingEffectFn,
  onLevelSelect
) => {
  
  typingEffectFn({
    text: `قبل أن نبدأ، أود أن أعرف مستوى معرفتك بهذا الموضوع لأتمكن من تقديم شرح يناسبك.
1. ليس لدي أي فكرة عن الموضوع
2. لدي بعض المعرفة ولكن أحتاج إلى توضيح أكثر
3. أفهم الموضوع جيداً وأرغب في التطبيق العملي
اختر الرقم الذي يعبر عن مستوي معرفتك لأحدد مستوى الشرح المناسب لك`,
    isAI: true,
    buttons: [
      {
        text: "1",
        onClick: () => onLevelSelect(1)
      },
      {
        text: "2",
        onClick: () => onLevelSelect(2)
      },
      {
        text: "3",
        onClick: () => onLevelSelect(3)
      }
    ]
  }, addMessage, updateMessage);
};

/**
 * When goal changes, ask if the user wants to change level
 * Enhanced with better goal naming
 */
export const askIfChangeLevelOnGoalChange = (
    newGoal,
    currentLevel,
    addMessage,
    updateMessage,
    typingEffectFn,
    onKeepLevel,
    onChangeLevelRequest
  ) => {
   
    
    // Get a friendly display name for the level
    const levelNames = {
      1: "مبتدئ",
      2: "متوسط",
      3: "متقدم"
    };
    
    const levelName = levelNames[currentLevel] || `المستوى ${currentLevel}`;
    
    typingEffectFn({
      text: `أحسنت! لقد أكملت الهدف السابق وسننتقل الآن إلى هدف جديد:
  ${newGoal}
  
  هل ترغب في تغيير مستوى الصعوبة؟ (المستوى الحالي: ${levelName})`,
      isAI: true,
      buttons: [
        {
          text: "الإبقاء على نفس المستوى",
          onClick: () => onKeepLevel()
        },
        {
          text: "تغيير المستوى",
          onClick: () => onChangeLevelRequest()
        }
      ]
    }, addMessage, updateMessage);
  };
/**
 * Handles level selection and generates a question
 */
export const handleLevelSelect = async (
  level,
  lessonKey,
  user,
  currentChapter,
  setIsLoading,
  setCurrentQuestion,
  setCurrentQuestionId,
  addMessage,
  updateMessage,
  typingEffectFn,
  setCurrentGoal,
  setCurrentLevel,
  generateNextQuestionFn
) => {
  setCurrentLevel(level);
  addMessage({ text: `${level}`, isAI: false });

  const levelMessages = {
    1: "حسناً، سنبدأ من الأساسيات ونتدرج في الشرح خطوة بخطوة.",
    2: "جيد، سنراجع المفاهيم الأساسية ثم نتعمق في التفاصيل.",
    3: "ممتاز، سنركز على التطبيقات المتقدمة والمفاهيم العميقة."
  };

  await typingEffectFn({
    text: levelMessages[level],
    isAI: true
  }, addMessage, updateMessage);

  // Generate the first question
  const lessonNumber = lessonKey.split('-')[1];
  await generateQuestion(
    lessonNumber,
    level,
    user,
    currentChapter,
    setIsLoading,
    setCurrentQuestion,
    setCurrentQuestionId,
    addMessage,
    updateMessage,
    typingEffectFn,
    null, // Initially no goal
    setCurrentGoal,
    generateNextQuestionFn,
    false // Not after goal change
  );
};

/**
 * Generates a question based on lesson and difficulty level
 * Enhanced with proper goal and point tracking
 */
export const generateQuestion = async (
    lessonNumber,
    level,
    user,
    currentChapter,
    setIsLoading,
    setCurrentQuestion,
    setCurrentQuestionId,
    addMessage,
    updateMessage,
    typingEffectFn,
    currentGoal,
    setCurrentGoal,
    nextQuestionCallback,
    afterGoalChange = false,
    setCurrentPoint // Add this parameter to track the current point
  ) => {
    try {
   
  
      setIsLoading(true);
  
      // Initialize goal tracker if needed
      if (!goalTracker.currentChapter || goalTracker.currentChapter !== currentChapter || 
          !goalTracker.currentLesson || goalTracker.currentLesson !== `${currentChapter}-${lessonNumber}`) {
        const lessonKey = `${currentChapter}-${lessonNumber}`;
        const initialGoal = goalTracker.initialize(currentChapter, lessonKey, currentGoal);
        if (initialGoal && (!currentGoal || currentGoal !== initialGoal)) {
          setCurrentGoal(initialGoal);
          currentGoal = initialGoal;
        }
      }
  
      const requestBody = {
        user_name: user.username,
        subject: "physics",
        chapter: currentChapter,
        lesson: lessonNumber,
        level: level,
        goal: currentGoal || goalTracker.currentGoal
      };
  
  
      const response = await fetch('https://scaiapipost.replit.app/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData.detail));
      }
  
      const data = await response.json();
  
      // Update goal tracker with the goal and point from the API response
      if (data.goal && data.goal !== goalTracker.currentGoal) {
        goalTracker.currentGoal = data.goal;
        setCurrentGoal(data.goal);
      }
  
      // If we have a point from the response, update current point
      if (data.point) {
      
        goalTracker.setCurrentPoint(data.point);
        if (setCurrentPoint) {
          setCurrentPoint(data.point);
        }
        
        // Check if this is the last point in the goal
        const goalPoints = goalTracker.getGoalPoints();
        const pointIndex = goalPoints.indexOf(data.point);
        const isLastPoint = pointIndex === goalPoints.length - 1;
      
     
      }
  
      if (data.status === 'success' && data.question) {
        const questionText = data.question.join("\n\n");
        setCurrentQuestion(questionText);
        setCurrentQuestionId(data.id);
  
      
        // Display the introductory content (if any)
        for (let i = 0; i < data.response?.length || 0; i++) {
          const part = data.response?.[i];
          if (part && part.trim()) {
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            await typingEffectFn({
              text: part,
              isAI: true,
              buttons: i === (data.response?.length || 0) - 1 ? [] : []
            }, addMessage, updateMessage);
          }
        }
  
        // Display the actual question
        if (data.question && data.question.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          for (let i = 0; i < data.question.length; i++) {
            if (data.question[i] && data.question[i].trim()) {
              await typingEffectFn({
                text: data.question[i],
                isAI: true,
                isQuestion: true
              }, addMessage, updateMessage);
              if (i < data.question.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }
        }
        
        // Return information about the current state
        return { 
          goalChanged: false,
          potentialGoalChange: goalTracker.isLastQuestionInGoal(),
          nextGoal: goalTracker.getNextGoal(),
          nextGoalTitle: goalTracker.getGoalPoints()[0] || "الهدف التالي", 
          currentPoint: data.point
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      addMessage({
        text: 'عذراً، حدث خطأ في توليد السؤال. الرجاء المحاولة مرة أخرى.',
        isAI: true
      });
      return { goalChanged: false, error: true };
    } finally {
      setIsLoading(false);
    }
  };
  
/**
 * Handles submission of an answer
 * Enhanced to better handle level changes between goals
 */
export const handleAnswerSubmit = async (
    answer,
    {
      user,
      currentQuestion,
      currentQuestionId,
      setIsLoading,
      addMessage,
      updateMessage,
      handleExplanationRequest,
      generateNextQuestion,
      setCurrentGoal,
      currentChapter,
      currentLesson,
      currentLevel,
      setCurrentLevel,
      currentPoint
    }
  ) => {
    try {
     
      
      setIsLoading(true);
      addMessage({ text: answer, isAI: false });
  
      const response = await fetch('https://scaiapipost.replit.app/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          user_name: user.username,
          question_id: currentQuestionId,
          user_answer: answer
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to check answer');
      }
  
      const result = await response.json();
  
      if (result.explanation) {
        const formattedExplanation = result.explanation
          .map((line, index) => index === 0 ? line : `\n${line}`)
          .join('\n');
  
        // Check if we're on the last point in the goal
        const isLastPointInGoal = goalTracker.isLastQuestionInGoal();
        const nextGoal = goalTracker.getNextGoal();
        const isChangingGoal = isLastPointInGoal && nextGoal !== goalTracker.currentGoal;
        
       
  
        // Show the explanation
        await typeMessageWithEffect({
          text: formattedExplanation,
          isAI: true,
          buttons: [
            {
              text: 'شرح مفصل',
              onClick: () => handleExplanationRequest(answer, currentQuestion  )
            },
            {
              text: 'سؤال جديد',
              onClick: () => {
                // Check if we're on the last point in the goal and moving to a new goal
                if (isChangingGoal) {
                  
                  // Mark question as completed to advance the goal
                  const goalStatus = goalTracker.completeQuestion();
                  
                  // Update the current goal
                  setCurrentGoal(nextGoal);
                  
                  // Ask about changing level when transitioning to a new goal
                  const nextGoalTitle = goalTracker.getGoalPoints()[0] || nextGoal;
                  askIfChangeLevelOnGoalChange(
                    nextGoalTitle,
                    currentLevel,
                    addMessage,
                    updateMessage,
                    typeMessageWithEffect,
                    () => {
                      // User wants to keep the same level
                      addMessage({ text: "الإبقاء على نفس المستوى", isAI: false });
                      // Generate a question with the same level but new goal
                      generateNextQuestion();
                    },
                    () => {
                      // User wants to change the level
                      addMessage({ text: "تغيير المستوى", isAI: false });
                      askAboutLevel(
                        addMessage,
                        updateMessage,
                        typeMessageWithEffect,
                        (newLevel) => {
                          setCurrentLevel(newLevel);
                          addMessage({ text: `${newLevel}`, isAI: false });
                          generateNextQuestion();
                        }
                      );
                    }
                  );
                } else {
                  // Not the last point in the goal or not changing goals
                  // Just complete the question and continue
                  goalTracker.completeQuestion();
                  generateNextQuestion();
                }
              }
            }
          ]
        }, addMessage, updateMessage);
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      addMessage({
        text: 'عذراً، حدث خطأ في تقييم الإجابة. الرجاء المحاولة مرة أخرى.',
        isAI: true
      });
    } finally {
      setIsLoading(false);
    }
  };
/**
 * Gets detailed explanation for an answer
 */
export const handleExplanationRequest = async (
  answer,
  questionText, // Renamed from currentQuestion to avoid conflict
  {
    setIsLoading,
    typeMessageWithEffect,
    addMessage,
    updateMessage,
    generateNextQuestion,
    currentQuestion // This is causing the name clash
  }
) => {
  try {
   
    
    setIsLoading(true);
    const response = await fetch('https://scaiapipost.replit.app/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        question: questionText, // Use the renamed parameter
        answer: answer
      }),
    });

    const data = await response.json();
    
    const explanationText = Array.isArray(data.explain) 
      ? data.explain.join('\n') 
      : data.explain;
    
    await typeMessageWithEffect({
      text: explanationText,
      isAI: true,
      buttons: [
        {
          text: 'سؤال جديد',
          onClick: () => generateNextQuestion()
        }
      ]
    }, addMessage, updateMessage);
  } catch (error) {
    console.error('Error getting explanation:', error);
    addMessage({
      text: 'عذراً، حدث خطأ في طلب الشرح. الرجاء المحاولة مرة أخرى.',
      isAI: true
    });
  } finally {
    setIsLoading(false);
  }
};