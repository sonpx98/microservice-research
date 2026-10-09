'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Callout, Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <Panel title="Quiz complete">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-lg text-muted-foreground">
            You scored <span className="font-mono font-semibold text-primary">{score}</span> out of{' '}
            <span className="font-mono font-semibold text-foreground">{quizzes.length}</span>
          </p>
          <Button onClick={restartQuiz}>
            <RotateCcw />
            Try again
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Quiz" description={`Question ${currentIndex + 1} of ${quizzes.length}`}>
      <p className="mb-4 text-lg font-medium text-foreground">{currentQuiz.question}</p>
      <div className="flex flex-col gap-3">
        {currentQuiz.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = option.isCorrect;
          return (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleOptionClick(idx)}
              disabled={isSubmitted}
              aria-pressed={isSelected}
              className={cn(
                'h-auto w-full justify-between p-4 text-left text-base font-normal whitespace-normal disabled:opacity-100',
                isSubmitted
                  ? isCorrect
                    ? 'border-success/40 bg-success/10 text-success'
                    : isSelected
                      ? 'border-danger/40 bg-danger/10'
                      : 'opacity-60'
                  : isSelected && 'border-primary bg-primary/10',
              )}
            >
              {option.answer}
              {isSubmitted && isCorrect && <CheckCircle className="text-success" />}
              {isSubmitted && isSelected && !isCorrect && <XCircle className="text-danger" />}
            </Button>
          );
        })}
      </div>

      {isSubmitted ? (
        <div className="mt-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {currentQuiz.explanation && (
            <Callout tone="info" title="Explanation">
              {currentQuiz.explanation}
            </Callout>
          )}
          <div className="flex justify-end">
            <Button onClick={nextQuestion}>
              {isLastQuestion ? 'Finish quiz' : 'Next question'}
              <ArrowRight />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <Button onClick={checkAnswer} disabled={selectedOption === null}>
            Check answer
          </Button>
        </div>
      )}
    </Panel>
  );
}
