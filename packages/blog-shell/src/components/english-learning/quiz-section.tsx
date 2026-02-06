'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizOption {
  answer: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

interface QuizSectionProps {
  quizzes: Quiz[];
}

export function QuizSection({ quizzes }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuiz = quizzes[currentIndex];
  const isLastQuestion = currentIndex === quizzes.length - 1;

  if (!currentQuiz) return null;

  const handleOptionClick = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index);
    }
  };

  const checkAnswer = () => {
    if (selectedOption !== null) {
      if (currentQuiz.options[selectedOption].isCorrect) {
        setScore(score + 1);
      }
      setIsSubmitted(true);
    }
  };

  const nextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setCurrentIndex(currentIndex + 1);
  };

  const restartQuiz = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setCurrentIndex(0);
    setScore(0);
  };

  if (currentIndex >= quizzes.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Quiz Completed!</h3>
        <p className="text-lg mb-6 text-slate-600 dark:text-slate-300">
          You scored <span className="font-bold text-primary-500">{score}</span> out of <span className="font-bold">{quizzes.length}</span>
        </p>
        <button
          onClick={restartQuiz}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quiz</h3>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Question {currentIndex + 1} of {quizzes.length}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">{currentQuiz.question}</p>
        <div className="space-y-3">
          {currentQuiz.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = option.isCorrect;
            
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center group ";
            
            if (isSubmitted) {
                if (isCorrect) {
                    buttonClass += "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
                } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
                } else {
                    buttonClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60";
                }
            } else {
                if (isSelected) {
                    buttonClass += "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm";
                } else {
                    buttonClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-750";
                }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isSubmitted}
                className={buttonClass}
              >
                <span className={`text-base ${isSubmitted && isCorrect ? 'font-medium text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {option.answer}
                </span>
                {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {isSubmitted && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {currentQuiz.explanation && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold block mb-1">Explanation:</span>
                        {currentQuiz.explanation}
                    </p>
                </div>
            )}
            <div className="flex justify-end">
                <button
                onClick={nextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                >
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}

      {!isSubmitted && (
        <div className="flex justify-end mt-6">
            <button
                onClick={checkAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-100"
            >
                Check Answer
            </button>
        </div>
      )}
    </div>
  );
}
