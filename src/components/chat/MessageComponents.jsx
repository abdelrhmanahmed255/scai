// MessageComponents.jsx
import React, { memo } from 'react';
import { Sparkles, ChevronLeft, BookOpen } from 'lucide-react';

export const Message = memo(({ text, isAI, isFirstMessage, buttons, isQuestion }) => (
  <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4 animate-in fade-in slide-in-from-bottom-4 ${isFirstMessage ? 'mt-8' : ''}`}>
    <div className={`max-w-[85%] sm:max-w-[75%] 
      ${isAI ? 'bg-white' : 'bg-orange-500 text-white'} 
      ${isQuestion ? 'border-r-4 border-orange-500' : ''}
      rounded-2xl px-4 sm:px-6 py-3 sm:py-4 
      shadow-sm hover:shadow-md transition-shadow
      ${isAI ? 'rounded-tl-sm' : 'rounded-tr-sm'}
      font-arabic
    `}>
      {isAI && (
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="text-orange-500" size={16} />
          <span className="text-sm text-gray-600 font-medium">
            {isQuestion ? "SCAI Assistant" : "SCAI Assistant"}
          </span>
        </div>
      )}
      <p className="text-right text-sm sm:text-base [&_br]:content-[''] [&_br]:block [&_br]:leading-[1]">
        {text.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {isAI && line.trim() && !isQuestion ? (
              <span className="flex items-start gap-2 leading-loose">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mt-[0.9rem]" />
                <span>{line}</span>
              </span>
            ) : (
              <span className={isQuestion ? "font-medium" : ""}>{line}</span>
            )}
          </React.Fragment>
        ))}
      </p>
      {buttons && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex space-x-2">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 transition-colors"
            >
              {button.text}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
));

export const SelectionButton = memo(({ text, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full bg-white hover:bg-gray-50 rounded-xl sm:rounded-full 
      py-3 sm:py-4 px-4 sm:px-6 shadow-sm hover:shadow-md
      flex items-center justify-between group transition-all
      border ${isActive ? 'border-orange-200' : 'border-transparent hover:border-orange-100'}
      font-arabic
    `}
  >
    <ChevronLeft className="text-gray-400 group-hover:text-orange-500 transition-colors" size={20} />
    <span className="text-gray-800 font-medium text-sm sm:text-base flex-1 text-right">{text}</span>
    <BookOpen className="text-orange-500" size={20} />
  </button>
));

export const LoadingMessage = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-white rounded-2xl px-6 py-4 shadow-sm max-w-[75%] rounded-tl-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-orange-500" size={16} />
        <span className="text-sm text-gray-600 font-medium">SCAI Assistant</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// New component specifically for questions
export const QuestionMessage = memo(({ questionText, options }) => (
  <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-4">
    <div className="max-w-[85%] sm:max-w-[75%] bg-orange-50 border-r-4 border-orange-500
      rounded-2xl px-4 sm:px-6 py-3 sm:py-4 
      shadow-sm hover:shadow-md transition-shadow rounded-tl-sm
      font-arabic"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-orange-500" size={16} />
        <span className="text-sm text-orange-600 font-medium">SCAI Assistant</span>
      </div>
      <p className="text-right text-sm sm:text-base font-medium mb-3">
        {questionText}
      </p>
      {options && options.length > 0 && (
        <div className="space-y-2 mt-4 pt-2 border-t border-orange-200">
          {options.map((option, index) => (
            <div key={index} className="text-right text-sm">
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));