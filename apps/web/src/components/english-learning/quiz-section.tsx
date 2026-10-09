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
      <div className="bg-card rounded-xl p-8 shadow-sm border border-border text-center">
        <h3 className="text-2xl font-bold mb-4 text-foreground">Quiz Completed!</h3>
        <p className="text-lg mb-6 text-muted-foreground">
          You scored <span className="font-bold text-primary-500">{score}</span> out of <span className="font-bold">{quizzes.length}</span>
        </p>
        <button
          onClick={restartQuiz}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Quiz</h3>
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentIndex + 1} of {quizzes.length}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-foreground mb-4">{currentQuiz.question}</p>
        <div className="space-y-3">
          {currentQuiz.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = option.isCorrect;
            
            let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center group ";
            
            if (isSubmitted) {
                if (isCorrect) {
                    buttonClass += "bg-success/10 border-success/30";
                } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-danger/10 border-danger/30";
                } else {
                    buttonClass += "bg-card border-border opacity-60";
                }
            } else {
                if (isSelected) {
                    buttonClass += "bg-primary/10 border-primary shadow-sm";
                } else {
                    buttonClass += "bg-card border-border hover:border-primary/30 hover:bg-muted";
                }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isSubmitted}
                className={buttonClass}
              >
                <span className={`text-base ${isSubmitted && isCorrect ? 'font-medium text-success' : 'text-foreground'}`}>
                    {option.answer}
                </span>
                {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-danger" />}
              </button>
            );
          })}
        </div>
      </div>

      {isSubmitted && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {currentQuiz.explanation && (
                <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold block mb-1">Explanation:</span>
                        {currentQuiz.explanation}
                    </p>
                </div>
            )}
            <div className="flex justify-end">
                <button
                onClick={nextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-sm hover:shadow"
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
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
                Check Answer
            </button>
        </div>
      )}
    </div>
  );
}
