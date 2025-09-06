import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const useSpeechToText = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognition = useRef(null);
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    recognition.current = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'ar-SA';

    recognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setText(transcript);
    };

    recognition.current.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };
  }, []);

  const startListening = async () => {
    try {
      setText('');
      setError(null);
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      recognition.current.start();
    } catch (err) {
      setError('Failed to access microphone');
      console.error('Microphone error:', err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  const resetRecording = () => {
    setText('');
    setError(null);
  };

  return {
    text,
    isListening,
    error,
    startListening,
    stopListening,
    resetRecording
  };
};

const AnswerInput = ({ onAnswerSubmit, currentQuestion }) => {
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'
  const [feedback, setFeedback] = useState(null);
  const { user } = useAuth();
  const {
    text: speechText,
    isListening,
    startListening,
    stopListening,
    resetRecording
  } = useSpeechToText();

  const handleSubmit = () => {
    const answerText = inputMode === 'voice' ? speechText : textInput;
    if (!answerText) return;

    // Call parent's onAnswerSubmit and reset inputs
    onAnswerSubmit(answerText);
    setTextInput('');
    resetRecording();
  };
  
  return (
    <div className="bg-white border-t p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Input Mode Toggle */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg ${
              inputMode === 'text' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
          >
            إدخال نصي
          </button>
          <button
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-lg ${
              inputMode === 'voice' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
          >
            إدخال صوتي
          </button>
        </div>

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className="flex-1 border rounded-lg px-4 py-2 text-right"
              dir="rtl"
            />
            <button
              onClick={handleSubmit}
              disabled={!textInput || isSubmitting}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        )}

        {/* Voice Input Mode */}
        {inputMode === 'voice' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-4 rounded-full shadow-md transition-all ${
                  isListening ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
              >
                {isListening ? <Mic size={24} /> :  <MicOff size={24} />}
              </button>
            </div>

            {speechText && (
              <div className="p-3 border rounded-lg text-center bg-gray-50">
                <p className="text-lg">{speechText}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!speechText || isSubmitting}
              className="w-full bg-orange-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>ارسال الاجابة</span>
              <Send size={20} />
            </button>
          </div>
        )}

        {/* Feedback Display */}
        {/* {feedback && (
          <div className={`p-4 rounded-lg ${feedback.error ? 'bg-red-50' : 'bg-green-50'}`}>
            {feedback.error ? (
              <p className="text-red-600">{feedback.error}</p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium">rating: {feedback.score}</p>
                <p>Submitted answer: {feedback.submitted_answer}</p>
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AnswerInput;