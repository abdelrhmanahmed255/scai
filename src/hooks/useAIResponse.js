import { useState } from 'react';

const useAIResponse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAIResponse = async (text) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate AI response - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock responses based on keywords
      let response;
      if (text.includes('تعريف علم النفس')) {
        response = 'علم النفس هو دراسة السلوك والعمليات العقلية للإنسان، ويهدف إلى فهم وتفسير السلوك البشري.';
      } else if (text.includes('علم الاجتماع')) {
        response = 'علم الاجتماع هو دراسة المجتمع والتفاعلات الاجتماعية والظواهر الاجتماعية.';
      } else {
        response = 'عذراً، هل يمكنك إعادة صياغة سؤالك بطريقة مختلفة؟';
      }

      setIsLoading(false);
      return response;
    } catch (err) {
      setError('Error getting AI response: ' + err.message);
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    getAIResponse
  };
};

export default useAIResponse;