// AnimatedChat.jsx
import React, { useState, useEffect, useRef, memo ,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import AnswerInput from './AnswerInput';
import { Message, SelectionButton, LoadingMessage } from './MessageComponents';
import { Navigation, Header } from './NavigationComponents';
import GoalSelection from './GoalSelection';
import { 
  typeMessageWithEffect, 
  askAboutLevel,
  handleLevelSelect,
  generateQuestion, 
  handleAnswerSubmit, 
  handleExplanationRequest,
  askIfChangeLevelOnGoalChange
} from './ChatLogic';
import { chaptersData, getGoalsForLesson, getGoalDisplayName, getLessonNumber } from './ChatData';
import { goalTracker } from './ChatGoalTracker';

const HierarchicalChat = () => {
  const { user } = useAuth();
  const { messages, addMessage, updateMessage, currentSubject, currentChapter, currentLesson, currentGoal, setCurrentSelection, clearSelection } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [selectionStage, setSelectionStage] = useState('chapter');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentGoalState, setCurrentGoalState] = useState(null);
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const chatEndRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPoint, setCurrentPoint] = useState(null);

  const [studentInfo] = useState({
    year: 'الثالث ثانوي',
    term: 'الفصل الثالث',
    academicYear: '2025'
  });

  // Initialize selection stage based on current state
  useEffect(() => {
    if (!currentSubject) {
      navigate('/subjects', { replace: true });
      return;
    }

    if (!currentChapter) {
      setSelectionStage('chapter');
      // Add welcome message for chapter selection
      if (messages.length === 0) {
        addMessage({
          text: 'مرحباً بك في منصة SCAI للتعليم الذكي! الرجاء اختيار الفصل الذي تريد دراسته.',
          isAI: true,
          isFirstMessage: true
        });
      }
    } else if (!currentLesson) {
      setSelectionStage('lesson');
    } else if (!currentGoal) {
      setSelectionStage('goal');
    } else {
      setSelectionStage('chat');
    }
  }, [currentSubject, currentChapter, currentLesson, currentGoal, navigate, addMessage, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateNextQuestion = useCallback(async () => {
    const lessonNumber = getLessonNumber(currentLesson);
    const result = await generateQuestion(
      lessonNumber,
      currentLevel,
      user,
      currentChapter,
      setIsLoading,
      setCurrentQuestion,
      setCurrentQuestionId,
      addMessage,
      updateMessage,
      typeMessageWithEffect,
      currentGoal, // Use the goal from context
      setCurrentGoalState,
      generateNextQuestion,
      false,
      setCurrentPoint
    );
    
    if (result && result.currentPoint) {
      setCurrentPoint(result.currentPoint);
    }
  }, [currentLesson, currentLevel, user, currentChapter, currentGoal]);

  const handleChapterSelect = (chapter) => {
    setCurrentSelection(currentSubject, chapter, null, null);
    setSelectionStage('lesson');
    addMessage({ text: `اخترت ${chaptersData[chapter].title}`, isAI: false });
    addMessage({ 
      text: 'ممتاز! الآن الرجاء اختيار الدرس الذي تريد دراسته',
      isAI: true 
    });
  };

  const handleLessonSelect = (lessonKey) => {
    setCurrentSelection(currentSubject, currentChapter, lessonKey, null);
    setSelectionStage('goal');
    
    const lessonTitle = chaptersData[currentChapter].lessons[lessonKey];
    addMessage({ text: `اخترت الدرس: ${lessonTitle}`, isAI: false });
    addMessage({ 
      text: 'رائع! الآن الرجاء اختيار الهدف التعليمي الذي تريد التركيز عليه',
      isAI: true 
    });
  };

  const handleGoalSelect = async (goalKey) => {
    try {
      setCurrentSelection(currentSubject, currentChapter, currentLesson, goalKey);
      setSelectionStage('chat');
      setIsFirstQuestion(true);

      const goalDisplayName = getGoalDisplayName(goalKey, currentChapter, getLessonNumber(currentLesson));
      const lessonTitle = chaptersData[currentChapter].lessons[currentLesson];

      addMessage({ text: `اخترت ${goalDisplayName}`, isAI: false });

      // Initialize the goal tracker
      const lessonNumber = getLessonNumber(currentLesson);
      goalTracker.initialize(currentChapter, lessonNumber, goalKey);
      setCurrentGoalState(goalTracker.currentGoal);

      // Welcome message
      addMessage({
        text: `مرحباً بك! أنا SCAI مساعدك الذكي في تعلم الفيزياء
اليوم سنتعلم عن ${lessonTitle} - ${goalDisplayName}`,
        isAI: true
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ask about level at the beginning
      askAboutLevel(
        addMessage,
        updateMessage,
        (params) => typeMessageWithEffect(params, addMessage, updateMessage),
        (level) => handleLevelSelect(
          level,
          currentLesson,
          user,
          currentChapter,
          setIsLoading,
          setCurrentQuestion,
          setCurrentQuestionId,
          addMessage,
          updateMessage,
          (params) => typeMessageWithEffect(params, addMessage, updateMessage),
          setCurrentGoalState,
          setCurrentLevel,
          generateNextQuestion,
          goalKey // Pass the selected goal
        )
      );
    } catch (error) {
      console.error('Error in goal selection:', error);
      addMessage({
        text: 'عذراً، حدث خطأ في اختيار الهدف. الرجاء المحاولة مرة أخرى.',
        isAI: true
      });
    }
  };
  
  const onAnswerSubmit = useCallback((answer) => {
    handleAnswerSubmit(answer, {
      user,
      currentQuestion,
      currentQuestionId,
      setIsLoading,
      addMessage, 
      updateMessage,
      handleExplanationRequest: (...args) => handleExplanationRequest(...args, {
        setIsLoading,
        typeMessageWithEffect,
        addMessage,
        updateMessage,
        generateNextQuestion
      }),
      generateNextQuestion,
      setCurrentGoal: setCurrentGoalState,
      currentChapter,
      currentLesson,
      currentLevel,
      setCurrentLevel,
      currentPoint
    });
  }, [currentQuestion, currentQuestionId, currentLevel, currentChapter, currentGoal, currentPoint]);

  const onExplanationRequest = (answer, questionId) => {
    handleExplanationRequest(
      answer,
      questionId,
      {
        setIsLoading,
        typeMessageWithEffect: (params) => typeMessageWithEffect(params, addMessage, updateMessage),
        addMessage,
        updateMessage,
        generateNextQuestion
      }
    );
  };

  const handleNewChat = () => {
    clearSelection();
    setCurrentQuestion(null);
    setCurrentLevel(null);
    setCurrentGoalState(null);
    setIsFirstQuestion(true);
    addMessage({
      text: 'مرحباً! الرجاء اختيار الفصل الذي تريد دراسته',
      isAI: true,
      isFirstMessage: true
    });
    setSelectionStage('chapter');
  };

  const handleBack = () => {
    if (selectionStage === 'chapter') {
      clearSelection();
      navigate('/subjects', { replace: true });
    } else if (selectionStage === 'lesson') {
      setCurrentSelection(currentSubject, null, null, null);
      setSelectionStage('chapter');
    } else if (selectionStage === 'goal') {
      setCurrentSelection(currentSubject, currentChapter, null, null);
      setSelectionStage('lesson');
    } else if (selectionStage === 'chat') {
      setCurrentSelection(currentSubject, currentChapter, currentLesson, null);
      setSelectionStage('goal');
    }
  };

  const handleLogout = () => {
    clearSelection();
    logout();
    navigate('/login');
  };

  const renderSelectionStage = () => {
    if (selectionStage === 'chapter') {
      return (
        <div className="space-y-3 mt-6">
          {Object.entries(chaptersData).map(([key, chapter]) => (
            <SelectionButton
              key={key}
              text={`${key}. ${chapter.title}`}
              onClick={() => handleChapterSelect(key)}
              isActive={currentChapter === key}
            />
          ))}
        </div>
      );
    }

    if (selectionStage === 'lesson' && currentChapter) {
      return (
        <div className="space-y-3 mt-6">
          {Object.entries(chaptersData[currentChapter].lessons).map(([key, title]) => (
            <SelectionButton
              key={key}
              text={`${key} ${title}`}
              onClick={() => handleLessonSelect(key)}
              isActive={currentLesson === key}
            />
          ))}
        </div>
      );
    }

    if (selectionStage === 'goal' && currentChapter && currentLesson) {
      const lessonNumber = getLessonNumber(currentLesson);
      return (
        <div className="mt-6">
          <GoalSelection
            chapter={currentChapter}
            lesson={lessonNumber}
            onGoalSelect={handleGoalSelect}
            onBack={handleBack}
            selectedGoal={currentGoal}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-4">
      <div dir="rtl" className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
        <Header studentInfo={studentInfo} />
        <Navigation 
          chapter={currentChapter}
          lesson={currentLesson}
          onBack={handleBack}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth bg-gray-50">
          {messages.map((message, index) => (
            <Message key={index} {...message} />
          ))}
          {isLoading && <LoadingMessage />}
          {renderSelectionStage()}
          <div ref={chatEndRef} />
        </div>

        {selectionStage === 'chat' && !isLoading && (
          <AnswerInput 
            onAnswerSubmit={onAnswerSubmit}
            currentQuestion={currentQuestion}
          />
        )}
      </div>
    </div>
  );
};

export default memo(HierarchicalChat);