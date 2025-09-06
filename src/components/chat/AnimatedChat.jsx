// AnimatedChat.jsx
import React, { useState, useEffect, useRef, memo ,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import AnswerInput from './AnswerInput';
import { Message, SelectionButton, LoadingMessage } from './MessageComponents';
import { Navigation, Header } from './NavigationComponents';
import { 
  typeMessageWithEffect, 
  askAboutLevel,
  handleLevelSelect,
  generateQuestion, 
  handleAnswerSubmit, 
  handleExplanationRequest,
  askIfChangeLevelOnGoalChange
} from './ChatLogic';
import { chaptersData } from './ChatData';
import { goalTracker } from './ChatGoalTracker';

const HierarchicalChat = () => {
  const { user } = useAuth();
  const { messages, addMessage, updateMessage, currentSubject, currentChapter, currentLesson, setCurrentSelection, clearSelection } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [selectionStage, setSelectionStage] = useState('chapter');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateNextQuestion = useCallback(async () => {
    const result = await generateQuestion(
      currentLesson.split('-')[1],
      currentLevel,
      user,
      currentChapter,
      setIsLoading,
      setCurrentQuestion,
      setCurrentQuestionId,
      addMessage,
      updateMessage,
      typeMessageWithEffect,
      currentGoal,
      setCurrentGoal,
      generateNextQuestion,
      false,
      setCurrentPoint // Pass the setter for currentPoint
    );
    
    // Store any returned data if needed
    if (result && result.currentPoint) {
      setCurrentPoint(result.currentPoint);
    }
  }, [currentLesson, currentLevel, user, currentChapter, currentGoal]);

  const handleChapterSelect = (chapter) => {
    setCurrentSelection(currentSubject, chapter, null);
    setSelectionStage('lesson');
    addMessage({ text: `اخترت ${chaptersData[chapter].title}`, isAI: false });
    addMessage({ 
      text: 'الرجاء اختيار الدرس الذي تريد دراسته',
      isAI: true 
    });
  };

  const handleLessonSelect = async (lessonKey) => {
    try {
      setCurrentSelection(currentSubject, currentChapter, lessonKey);
      setSelectionStage('chat');
      setIsFirstQuestion(true);
  
      const lessonTitle = chaptersData[currentChapter].lessons[lessonKey];
  
      // Initialize the goal tracker
      const lessonNumber = lessonKey.split('-')[1]; // e.g., "1" from "1-1"
      goalTracker.initialize(currentChapter, lessonNumber);
      setCurrentGoal(goalTracker.currentGoal);
  
      // Welcome message
      addMessage({
        text: `مرحباً بك أنا SCAI مساعدك الذكي في تعلم الفيزياء
  اليوم سنتعلم عن ${lessonTitle}`,
        isAI: true
      });
  
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Ask about level at the beginning of a new lesson
      askAboutLevel(
        addMessage,
        updateMessage,
        (params) => typeMessageWithEffect(params, addMessage, updateMessage),
        (level) => handleLevelSelect(
          level,
          lessonKey,
          user,
          currentChapter,
          setIsLoading,
          setCurrentQuestion,
          setCurrentQuestionId,
          addMessage,
          updateMessage,
          (params) => typeMessageWithEffect(params, addMessage, updateMessage),
          setCurrentGoal,
          setCurrentLevel,
          generateNextQuestion
        )
      );
    } catch (error) {
      console.error('Error in lesson selection:', error);
      addMessage({
        text: 'عذراً، حدث خطأ في اختيار الدرس. الرجاء المحاولة مرة أخرى.',
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
      setCurrentGoal,
      currentChapter,
      currentLesson,
      currentLevel,
      setCurrentLevel,
      currentPoint // Pass the current point here
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
    setCurrentGoal(null);
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
      setSelectionStage('subject');
      setCurrentSelection(null, null, null);
      navigate('/subjects', { replace: true });
    } else if (selectionStage === 'lesson') {
      setSelectionStage('chapter');
      setCurrentSelection(currentSubject, null, null);
    } else if (selectionStage === 'chat') {
      setSelectionStage('lesson');
      setCurrentSelection(currentSubject, currentChapter, null);
    } else if (selectionStage === 'answer') {
      setCurrentSelection(null, null, null);
      navigate('/subjects', { replace: true });
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