import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(() => 
    localStorage.getItem('selectedSubject') || null
  );
  const [currentChapter, setCurrentChapter] = useState(() => 
    localStorage.getItem('selectedChapter') || null
  );
  const [currentLesson, setCurrentLesson] = useState(() => 
    localStorage.getItem('selectedLesson') || null
  );
  const [currentGoal, setCurrentGoal] = useState(() => 
    localStorage.getItem('selectedGoal') || null
  );

  const addMessage = (message) => {
    setMessages(prevMessages => {
      // If the message has an ID, remove any existing message with the same ID
      if (message.id) {
        const filteredMessages = prevMessages.filter(m => m.id !== message.id);
        return [...filteredMessages, message];
      }
      return [...prevMessages, message];
    });
  };

  const updateMessage = ({ id, text, isAI, isTyping, buttons }) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id 
          ? { ...message, text, isAI, isTyping, buttons: buttons || message.buttons }
          : message
      )
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const setCurrentSelection = (subject, chapter, lesson, goal = null) => {
    if (subject !== null) localStorage.setItem('selectedSubject', subject);
    if (chapter !== null) localStorage.setItem('selectedChapter', chapter);
    if (lesson !== null) localStorage.setItem('selectedLesson', lesson);
    if (goal !== null) localStorage.setItem('selectedGoal', goal);
    
    setCurrentSubject(subject);
    setCurrentChapter(chapter);
    setCurrentLesson(lesson);
    setCurrentGoal(goal);
  };

  const clearSelection = () => {
    localStorage.removeItem('selectedSubject');
    localStorage.removeItem('selectedChapter');
    localStorage.removeItem('selectedLesson');
    localStorage.removeItem('selectedGoal');
    
    setCurrentSubject(null);
    setCurrentChapter(null);
    setCurrentLesson(null);
    setCurrentGoal(null);
    clearMessages();
  };

  return (
    <ChatContext.Provider value={{
      messages,
      currentSubject,
      currentChapter,
      currentLesson,
      currentGoal,
      setCurrentSelection,
      clearSelection,
      addMessage,
      updateMessage, // Added updateMessage to the context
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};